import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from 'react';
import { postCheckIn, getCheckInStatus, type CheckInResult } from '@api/checkIn';
import { isApiEnabled } from '@api/client';
import { postGacha } from '@api/gacha';
import { getEcoJamHistories } from '@api/history';
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import { getMissionCompletions, postMissionVerify } from '@api/missions';
import { DAILY_MISSIONS } from '@api/mock/missions';
import { HIDDEN_RECIPES } from '@api/mock/recipeCatalog';
import type { Recipe } from '@api/mock/recipes';
import {
    findMatchingRecipe,
    findRecipeBySlots,
    getAllRecipes,
    getFilledIngredientIds,
    getRecipeById,
    getTodayRecipe,
    isValidBrewFillCount,
} from '@api/mock/recipes';
import { buildCraftForGrade } from '@api/mock/soupCraftMock';
import {
    ingredientSlugFromNumeric,
    missionSlugFromNumeric,
    recipeSlugFromNumeric,
    shopNumericId,
} from '@api/notion/idMap';
import type { SoupCraftResponse } from '@api/notion/types';
import { formatPhoneForApi, postOnboardingComplete } from '@api/onboarding';
import { getMyPage } from '@api/profile';
import { postUnlockHiddenRecipe } from '@api/recipes';
import { postSoupCraft } from '@api/soup';
import { postRegisterUser } from '@api/users';
import type { MissionVerifyUploadInput } from '@api/files';
import { getOrCreateDeviceId } from '../../shared/device/deviceId';
import { DEV_TEST_TOOLS_ENABLED } from '../../shared/dev/devTestFlags';
import { ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST } from '../../shared/constants/ecoJamPolicy';
import { GACHA_PULL_COST_ECO_JAM } from '../gacha/gachaConfig';
import { applyGachaReward } from '../gacha/gachaLogic';
import type { GachaPullResult } from '../gacha/gachaTypes';
import {
    gradeFromCraft,
    rollRerollGrade,
    soupRerollActionName,
    soupRerollCost,
    soupRerollKindFor,
} from '../soup/soupRewardGrades';
import { appendEcoJamLedger } from './ecoJamLedger';
import { appendAlmangPointsLedger } from './almangPointsLedger';
import { DEFAULT_USER_STATE } from './defaultState';
import { loadUserState, saveUserState } from './userRepository';
import type { AppUserState, AlmangPayoutConsent, CameraConsent, LocationConsent } from './types';
import {
    addEcoJam,
    applyCheckInFromServer,
    applyMissionCompletionsToState,
    syncCheckedInToday,
    applyRegisterUser,
    applySoupRerollDelta,
    completeMissionVerify,
    completeRecipe,
    consumeIngredientsForSlots,
    finishOnboarding as finishOnboardingState,
    getMissionTodayStatus,
    resetOnboarding as resetOnboardingState,
    saveOnboardingProfile as saveOnboardingProfileState,
    setShopId,
    setLocationConsent as setLocationConsentState,
    setCameraConsent as setCameraConsentState,
    submitMissionPendingReview,
    spendEcoJam,
    unlockHiddenRecipe,
    claimShareReward as applyShareRewardState,
    formatDateKey,
} from './userStateLogic';

type UserContextValue = {
    isReady: boolean;
    state: AppUserState;
    checkInToday: () => Promise<CheckInResult>;
    /** API 활성 시 BE 온보딩 실패하면 ok:false (로컬 완료하지 않음) */
    finishOnboarding: (shopId: string) => Promise<{ ok: true } | { ok: false; code: 'SYNC_FAILED' | 'NOT_READY' }>;
    saveOnboardingProfile: (payload: {
        nickname: string;
        phoneMasked: string | null;
        phoneDigits?: string | null;
        almangPayoutConsent: AlmangPayoutConsent;
        consentAt: string | null;
        privacyConsentAt: string;
    }) => Promise<void>;
    resetOnboarding: () => Promise<void>;
    selectShop: (shopId: string) => Promise<void>;
    setLocationConsent: (consent: LocationConsent) => Promise<void>;
    setCameraConsent: (consent: CameraConsent) => Promise<void>;
    verifyMission: (
        missionId: string,
        photo?: MissionVerifyUploadInput | null,
    ) => Promise<
        | { ok: true; pending: boolean; ingredientId?: string }
        | {
              ok: false;
              code:
                  | 'NOT_FOUND'
                  | 'MISSION_ALREADY_COMPLETED'
                  | 'MISSION_UNDER_REVIEW'
                  | 'NETWORK_ERROR';
          }
    >;
    brewSoup: (slots: (string | null)[]) => Promise<
        | { ok: true; recipe: Recipe; craft: SoupCraftResponse }
        | {
              ok: false;
              reason: 'incomplete' | 'no_match' | 'already_done' | 'no_stock' | 'network';
          }
    >;
    pullGacha: () => Promise<GachaPullResult>;
    grantTestEcoJam: (amount: number) => Promise<void>;
    /** DEV only — 모든 레시피 열람 해금 (완성 처리 아님) */
    unlockAllRecipesForTest: () => Promise<void>;
    /** 상단 오늘의 레시피 고정 카드 숨기기 / 다시 보기 */
    hideTodayRecipePin: () => Promise<void>;
    showTodayRecipePin: () => Promise<void>;
    rerollSoupReward: (input?: {
        recipeId: string;
        craft: SoupCraftResponse;
    }) => Promise<
        | { ok: true; craft: SoupCraftResponse; actionName: string; cost: number; upgraded: boolean }
        | {
              ok: false;
              reason:
                  | 'no_session'
                  | 'already_used'
                  | 'not_allowed'
                  | 'insufficient_eco_jam';
          }
    >;
    unlockRandomHiddenRecipe: () => Promise<
        | { ok: true; recipeId: string; recipeName: string; cost: number }
        | {
              ok: false;
              reason: 'insufficient_eco_jam' | 'all_unlocked' | 'none';
          }
    >;
    claimShareReward: () => Promise<
        | { ok: true; ecoJamGranted: number }
        | { ok: false; reason: 'already_claimed' | 'share_cancelled' }
    >;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
    const [isReady, setIsReady] = useState(false);
    const [state, setState] = useState<AppUserState>(DEFAULT_USER_STATE);
    const stateRef = useRef<AppUserState>(DEFAULT_USER_STATE);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const ensureRegistered = useCallback(async (base: AppUserState): Promise<AppUserState> => {
        const deviceId = await getOrCreateDeviceId();
        if (base.userId != null) {
            if (base.deviceId == null) {
                return { ...base, deviceId };
            }
            return base;
        }
        try {
            const registered = await postRegisterUser();
            return applyRegisterUser(base, {
                userId: registered.userId,
                deviceId,
                onboardingCompleted: registered.onboardingCompleted,
            });
        } catch {
            if (isApiEnabled()) {
                // 실서버 모드: 가짜 userId(1001)로 진행하지 않음
                return { ...base, deviceId, userId: null };
            }
            return applyRegisterUser(base, {
                userId: 1001,
                deviceId,
                onboardingCompleted: base.onboardingCompleted,
            });
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const loaded = await loadUserState();
            if (!mounted) {
                return;
            }
            let next = await ensureRegistered(loaded);
            // 이번 주 미션 칸 수 = DAILY_MISSIONS(월~일 7)
            if (next.weeklyMissionTotal !== DAILY_MISSIONS.length) {
                next = {
                    ...next,
                    weeklyMissionTotal: DAILY_MISSIONS.length,
                    weeklyMissionDone: Math.min(next.weeklyMissionDone, DAILY_MISSIONS.length),
                };
            }
            try {
                const today = formatDateKey(new Date());
                const status = await getCheckInStatus(next.lastCheckInDate, today);
                if (status.alreadyChecked) {
                    next = syncCheckedInToday(next, today);
                }
            } catch {
                // keep local state
            }
            if (isApiEnabled() && next.userId != null) {
                try {
                    const remoteIngredients = await getUserIngredients();
                    if (remoteIngredients != null) {
                        next = {
                            ...next,
                            ingredientInventory: inventoryFromUserIngredients(remoteIngredients),
                        };
                    }
                } catch {
                    // keep local inventory
                }
                try {
                    const myPage = await getMyPage();
                    if (myPage != null) {
                        next = {
                            ...next,
                            ecoJam: myPage.ecoJam,
                            totalPoints: myPage.point,
                            nickname: myPage.nickname ?? next.nickname,
                        };
                    }
                } catch {
                    // keep local assets
                }
                try {
                    const completions = await getMissionCompletions();
                    next = applyMissionCompletionsToState(
                        next,
                        completions,
                        missionSlugFromNumeric,
                        ingredientSlugFromNumeric,
                    );
                } catch {
                    // keep local mission progress
                }
                try {
                    const histories = await getEcoJamHistories();
                    if (histories != null && histories.length > 0) {
                        next = {
                            ...next,
                            ecoJamLedger: histories.slice(0, 30).map((item) => ({
                                id: String(item.id),
                                at: item.createdAt,
                                label: item.description,
                                delta: item.amount,
                            })),
                        };
                    }
                } catch {
                    // keep local ledger
                }
            }
            stateRef.current = next;
            setState(next);
            await saveUserState(next);
            if (mounted) {
                setIsReady(true);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [ensureRegistered]);

    const persist = useCallback(async (updater: (prev: AppUserState) => AppUserState) => {
        const next = updater(stateRef.current);
        stateRef.current = next;
        setState(next);
        await saveUserState(next);
    }, []);

    const value = useMemo<UserContextValue>(
        () => ({
            isReady,
            state,
            checkInToday: async (): Promise<CheckInResult> => {
                try {
                    const today = formatDateKey(new Date());
                    const current = stateRef.current;
                    const apiResult = await postCheckIn({
                        lastCheckInDate: current.lastCheckInDate,
                        ingredientInventory: current.ingredientInventory,
                        today,
                    });
                    if (!apiResult.ok) {
                        // 처음부터 다시 시작 등으로 로컬만 지워진 경우 BE와 UI 맞춤
                        if (apiResult.code === 'ALREADY_CHECKED_IN') {
                            const synced = syncCheckedInToday(stateRef.current, today);
                            stateRef.current = synced;
                            setState(synced);
                            await saveUserState(synced);
                        }
                        return apiResult;
                    }
                    const next = applyCheckInFromServer(stateRef.current, apiResult.data);
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return apiResult;
                } catch {
                    return { ok: false, code: 'NETWORK_ERROR' };
                }
            },
            finishOnboarding: async (shopId) => {
                let current = stateRef.current;
                if (isApiEnabled() && current.userId == null) {
                    current = await ensureRegistered(current);
                    stateRef.current = current;
                    setState(current);
                    await saveUserState(current);
                    if (current.userId == null) {
                        return { ok: false, code: 'NOT_READY' };
                    }
                }
                const numericShopId = shopNumericId(shopId);
                if (
                    isApiEnabled() &&
                    current.phoneNumber != null &&
                    current.phoneNumber.length > 0 &&
                    numericShopId != null
                ) {
                    try {
                        await postOnboardingComplete({
                            nickname: current.nickname,
                            phoneNumber: current.phoneNumber,
                            shopId: numericShopId,
                        });
                    } catch {
                        return { ok: false, code: 'SYNC_FAILED' };
                    }
                }
                await persist((prev) => finishOnboardingState(prev, shopId));
                return { ok: true };
            },
            saveOnboardingProfile: async (payload) => {
                const phoneNumber =
                    payload.phoneDigits != null && payload.phoneDigits.length > 0
                        ? formatPhoneForApi(payload.phoneDigits)
                        : null;
                await persist((prev) =>
                    saveOnboardingProfileState(prev, {
                        nickname: payload.nickname,
                        phoneMasked: payload.phoneMasked,
                        phoneNumber,
                        almangPayoutConsent: payload.almangPayoutConsent,
                        consentAt: payload.consentAt,
                        privacyConsentAt: payload.privacyConsentAt,
                    }),
                );
            },
            resetOnboarding: async () => {
                const prev = stateRef.current;
                // 로컬만 초기화. deviceId/userId는 유지해 재등록으로 BE onboardingCompleted=true 가
                // 다시 덮어쓰여 홈으로 튕기는 것(온보딩 진입 불가)을 막는다.
                let next: AppUserState = {
                    ...resetOnboardingState(prev),
                    deviceId: prev.deviceId,
                    userId: prev.userId,
                    onboardingCompleted: false,
                };
                // BE에 오늘 출석이 남아 있으면 로컬도 맞춰 UI·재시도 불일치 방지
                try {
                    const today = formatDateKey(new Date());
                    const status = await getCheckInStatus(null, today);
                    if (status.alreadyChecked) {
                        next = syncCheckedInToday(next, today);
                    }
                } catch {
                    // keep wiped check-in
                }
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                if (next.userId == null) {
                    const registered = await ensureRegistered(next);
                    next = { ...registered, onboardingCompleted: false };
                    try {
                        const today = formatDateKey(new Date());
                        const status = await getCheckInStatus(null, today);
                        if (status.alreadyChecked) {
                            next = syncCheckedInToday(next, today);
                        }
                    } catch {
                        // keep
                    }
                    next = { ...next, onboardingCompleted: false };
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                }
            },
            selectShop: async (shopId) => {
                await persist((prev) => setShopId(prev, shopId));
            },
            setLocationConsent: async (consent) => {
                await persist((prev) => setLocationConsentState(prev, consent));
            },
            setCameraConsent: async (consent) => {
                await persist((prev) => setCameraConsentState(prev, consent));
            },
            verifyMission: async (missionId, photo = null) => {
                try {
                    const current = stateRef.current;
                    const todayStatus = getMissionTodayStatus(current, missionId);
                    const api = await postMissionVerify(missionId, todayStatus, photo);
                    if (!api.ok) {
                        return api;
                    }
                    if (api.data.status === 'PENDING') {
                        const next = submitMissionPendingReview(
                            current,
                            missionId,
                            api.data.completionId,
                        );
                        stateRef.current = next;
                        setState(next);
                        await saveUserState(next);
                        return { ok: true, pending: true };
                    }
                    if (api.ingredientId == null) {
                        return { ok: false, code: 'NOT_FOUND' };
                    }
                    const next = completeMissionVerify(current, missionId, api.ingredientId);
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return { ok: true, pending: false, ingredientId: api.ingredientId };
                } catch {
                    return { ok: false, code: 'NETWORK_ERROR' };
                }
            },
            grantTestEcoJam: async (amount) => {
                if (!DEV_TEST_TOOLS_ENABLED) {
                    return;
                }
                await persist((prev) => addEcoJam(prev, amount, '테스트 지급'));
            },
            unlockAllRecipesForTest: async () => {
                if (!DEV_TEST_TOOLS_ENABLED) {
                    return;
                }
                await persist((prev) => {
                    const ids = getAllRecipes().map((recipe) => recipe.id);
                    const today = getTodayRecipe();
                    if (today != null) {
                        ids.push(today.id);
                    }
                    const merged = new Set([...prev.unlockedRecipeIds, ...ids]);
                    return {
                        ...prev,
                        unlockedRecipeIds: [...merged],
                        // 해금 직후 상단 오늘의 레시피가 보이도록 숨김 해제
                        hiddenTodayRecipePinId: null,
                    };
                });
            },
            hideTodayRecipePin: async () => {
                const recipe = getTodayRecipe();
                if (recipe == null) {
                    return;
                }
                await persist((prev) => ({
                    ...prev,
                    hiddenTodayRecipePinId: recipe.id,
                }));
            },
            showTodayRecipePin: async () => {
                await persist((prev) => ({
                    ...prev,
                    hiddenTodayRecipePinId: null,
                }));
            },
            pullGacha: async (): Promise<GachaPullResult> => {
                const current = stateRef.current;
                if (current.ecoJam < GACHA_PULL_COST_ECO_JAM) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                try {
                    const api = await postGacha(current.ecoJam);
                    if (!api.ok) {
                        return { ok: false, reason: 'insufficient_eco_jam' };
                    }
                    const cost = api.response.costEcoJam || GACHA_PULL_COST_ECO_JAM;
                    let next: AppUserState;
                    if (isApiEnabled()) {
                        // BE remainingEcoJam이 권위 (차감+보상 반영됨)
                        next = {
                            ...current,
                            ecoJam: api.remainingEcoJam,
                        };
                        next = appendEcoJamLedger(next, '가챠 뽑기', -cost);
                        if (api.reward.type === 'INGREDIENT' || api.reward.type === 'ALMANG_POINT') {
                            next = applyGachaReward(next, api.reward);
                        }
                        if (api.reward.type === 'ECO_JAM' && api.reward.amount > 0) {
                            next = appendEcoJamLedger(next, '가챠 보상', api.reward.amount);
                        }
                        if (api.reward.type === 'FAIL' && api.reward.consolationEcoJam > 0) {
                            next = appendEcoJamLedger(
                                next,
                                '가챠 위로 보상',
                                api.reward.consolationEcoJam,
                            );
                        }
                        if (api.reward.type === 'ALMANG_POINT') {
                            next = appendAlmangPointsLedger(next, '가챠 보상', api.reward.amount);
                        }
                    } else {
                        const spent = spendEcoJam(current, cost, '가챠 뽑기');
                        if (spent == null) {
                            return { ok: false, reason: 'insufficient_eco_jam' };
                        }
                        next = applyGachaReward(spent, api.reward);
                        if (api.reward.type === 'ECO_JAM') {
                            next = appendEcoJamLedger(next, '가챠 보상', api.reward.amount);
                        }
                        if (api.reward.type === 'FAIL' && api.reward.consolationEcoJam > 0) {
                            next = appendEcoJamLedger(
                                next,
                                '가챠 위로 보상',
                                api.reward.consolationEcoJam,
                            );
                        }
                        if (api.reward.type === 'ALMANG_POINT') {
                            next = appendAlmangPointsLedger(next, '가챠 보상', api.reward.amount);
                        }
                    }
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return {
                        ok: true,
                        reward: api.reward,
                        costEcoJam: cost,
                    };
                } catch {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
            },
            claimShareReward: async () => {
                const { state: next, result } = applyShareRewardState(stateRef.current);
                if (!result.ok) {
                    return result;
                }
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return result;
            },
            brewSoup: async (slots) => {
                const filled = getFilledIngredientIds(slots);
                if (!isValidBrewFillCount(filled.length)) {
                    return { ok: false, reason: 'incomplete' };
                }
                const current = stateRef.current;
                const recipe = findMatchingRecipe(slots, current.completedRecipeIds);
                if (recipe == null) {
                    const any = findRecipeBySlots(slots);
                    if (any != null && current.completedRecipeIds.includes(any.id)) {
                        return { ok: false, reason: 'already_done' };
                    }
                    return { ok: false, reason: 'no_match' };
                }
                const stockCheck = consumeIngredientsForSlots(current, filled);
                if (stockCheck == null) {
                    return { ok: false, reason: 'no_stock' };
                }
                try {
                    const craft = await postSoupCraft(recipe, filled);
                    if (
                        craft.soupId === 0 &&
                        craft.rewardDescription === '재료가 부족해요'
                    ) {
                        return { ok: false, reason: 'no_stock' };
                    }
                    if (
                        craft.soupId === 0 &&
                        (craft.rewardDescription === '레시피가 없어요' ||
                            craft.rewardDescription === '재료를 다시 확인해 주세요')
                    ) {
                        return { ok: false, reason: 'no_match' };
                    }
                    // BE가 재료를 차감했거나 mock이면 로컬도 동일하게 차감
                    const consumed = consumeIngredientsForSlots(current, filled);
                    if (consumed == null) {
                        return { ok: false, reason: 'no_stock' };
                    }
                    let next = completeRecipe(consumed, recipe, craft);
                    next = {
                        ...next,
                        lastSoupSession: {
                            recipeId: recipe.id,
                            craft,
                            rerollUsed: false,
                        },
                    };
                    if (isApiEnabled()) {
                        try {
                            const [remoteIngredients, myPage] = await Promise.all([
                                getUserIngredients(),
                                getMyPage(),
                            ]);
                            if (remoteIngredients != null) {
                                next = {
                                    ...next,
                                    ingredientInventory:
                                        inventoryFromUserIngredients(remoteIngredients),
                                };
                            }
                            if (myPage != null) {
                                next = {
                                    ...next,
                                    ecoJam: myPage.ecoJam,
                                    totalPoints: myPage.point,
                                };
                            }
                        } catch {
                            // keep local inventory / rewards after brew
                        }
                    }
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return { ok: true, recipe, craft };
                } catch {
                    return { ok: false, reason: 'network' };
                }
            },
            rerollSoupReward: async (input) => {
                const current = stateRef.current;
                // 세션이 비어도 결과 화면에서 넘긴 craft로 리롤 가능
                const session =
                    current.lastSoupSession ??
                    (input != null
                        ? {
                              recipeId: input.recipeId,
                              craft: input.craft,
                              rerollUsed: false,
                          }
                        : null);
                if (session == null) {
                    return { ok: false, reason: 'no_session' };
                }
                if (session.rerollUsed) {
                    return { ok: false, reason: 'already_used' };
                }
                const recipeId = input?.recipeId ?? session.recipeId;
                const prevCraft = input?.craft ?? session.craft;
                const recipe = getRecipeById(recipeId);
                if (recipe == null) {
                    return { ok: false, reason: 'no_session' };
                }
                const kind = soupRerollKindFor(recipe);
                const fromGrade = gradeFromCraft(prevCraft);
                const cost = soupRerollCost(kind, fromGrade);
                if (cost == null) {
                    return { ok: false, reason: 'not_allowed' };
                }
                const spent = spendEcoJam(current, cost, soupRerollActionName(kind));
                if (spent == null) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                const nextGrade = rollRerollGrade(kind, fromGrade);
                const nextCraft = buildCraftForGrade(recipe, nextGrade, prevCraft.soupId);
                const upgraded =
                    gradeFromCraft(nextCraft) !== fromGrade ||
                    (nextCraft.rewardAmount ?? 0) > (prevCraft.rewardAmount ?? 0);
                let next = applySoupRerollDelta(spent, recipe, prevCraft, nextCraft);
                next = {
                    ...next,
                    lastSoupSession: {
                        recipeId: recipe.id,
                        craft: nextCraft,
                        rerollUsed: true,
                    },
                };
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return {
                    ok: true,
                    craft: nextCraft,
                    actionName: soupRerollActionName(kind),
                    cost,
                    upgraded,
                };
            },
            unlockRandomHiddenRecipe: async () => {
                const current = stateRef.current;
                if (isApiEnabled()) {
                    const api = await postUnlockHiddenRecipe();
                    if (api == null) {
                        return { ok: false, reason: 'none' };
                    }
                    if (!api.ok) {
                        if (api.code === 'INSUFFICIENT_ECO_JAM') {
                            return { ok: false, reason: 'insufficient_eco_jam' };
                        }
                        if (api.code === 'NO_HIDDEN_RECIPE') {
                            return { ok: false, reason: 'all_unlocked' };
                        }
                        return { ok: false, reason: 'none' };
                    }
                    const slug =
                        recipeSlugFromNumeric(api.recipeId) ?? `be-${api.recipeId}`;
                    let next: AppUserState = {
                        ...current,
                        ecoJam: api.remainingEcoJam,
                    };
                    next = appendEcoJamLedger(
                        next,
                        '희귀 레시피 해금',
                        -ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
                    );
                    next = unlockHiddenRecipe(next, slug);
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return {
                        ok: true,
                        recipeId: slug,
                        recipeName: api.recipeName,
                        cost: ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
                    };
                }
                const locked = HIDDEN_RECIPES.filter(
                    (recipe) =>
                        !current.completedRecipeIds.includes(recipe.id) &&
                        !current.unlockedRecipeIds.includes(recipe.id),
                );
                if (locked.length === 0) {
                    return { ok: false, reason: 'all_unlocked' };
                }
                const spent = spendEcoJam(
                    current,
                    ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
                    '희귀 레시피 해금',
                );
                if (spent == null) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                const pick = locked[Math.floor(Math.random() * locked.length)];
                if (pick == null) {
                    return { ok: false, reason: 'none' };
                }
                const next = unlockHiddenRecipe(spent, pick.id);
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return {
                    ok: true,
                    recipeId: pick.id,
                    recipeName: pick.name,
                    cost: ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
                };
            },
        }),
        [isReady, state, persist, ensureRegistered],
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (ctx == null) {
        throw new Error('useUser must be used within UserProvider');
    }
    return ctx;
}
