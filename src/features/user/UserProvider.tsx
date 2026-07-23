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
import { postLogin } from '@api/auth';
import { ApiClientError, isApiEnabled } from '@api/client';
import { postGacha } from '@api/gacha';
import { getEcoJamHistories } from '@api/history';
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import {
    getMissionCompletions,
    postMissionRewardClaim,
    postMissionVerify,
    resolveMissionSlugFromBe,
} from '@api/missions';
import {
    completeCommunityMission,
    parseCommunityMissionRouteId,
    submitCommunityMissionPhotoProof,
} from '@api/communityMissions';
import { DAILY_MISSIONS } from '@api/mock/missions';
import { HIDDEN_RECIPES } from '@api/mock/recipeCatalog';
import type { Recipe } from '@api/mock/recipes';
import {
    findMatchingRecipe,
    getFilledIngredientIds,
    getRecipeById,
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
import { maskPhone } from '../onboarding/onboardingProfileLogic';
import { getMyPage } from '@api/profile';
import {
    ensureBrewRecipeCatalog,
    findMatchingBrewRecipe,
    postUnlockHiddenRecipe,
} from '@api/recipes';
import { postSoupCraft, postSoupReroll } from '@api/soup';
import { clearAuthSession } from '@api/authSession';
import type { MissionVerifyUploadInput } from '@api/files';
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
import { ensureRegisteredUser } from './userRegistration';
import {
    applyCheckInFromServer,
    applyMissionCompletionsToState,
    syncCheckedInToday,
    applyLoginUser,
    applySoupRerollDelta,
    applySoupRerollServerSync,
    applyCommunityMissionComplete,
    completeMissionVerify,
    completeRecipe,
    consumeIngredientsForSlots,
    finishOnboarding as finishOnboardingState,
    getMissionTodayStatus,
    markMissionClaimable,
    markMissionCompletedWithoutGrant,
    reconcileOnboardingFromMyPage,
    resetOnboarding as resetOnboardingState,
    saveOnboardingProfile as saveOnboardingProfileState,
    setShopId,
    setLocationConsent as setLocationConsentState,
    setCameraConsent as setCameraConsentState,
    submitMissionPendingReview,
    spendEcoJam,
    unlockHiddenRecipe,
    updateAvatar as updateAvatarState,
    updateNickname as updateNicknameState,
    claimShareReward as applyShareRewardState,
    formatDateKey,
} from './userStateLogic';

type UserContextValue = {
    isReady: boolean;
    state: AppUserState;
    checkInToday: () => Promise<CheckInResult>;
    /** API 활성 시 BE 온보딩 실패하면 ok:false (로컬 완료하지 않음) */
    finishOnboarding: (
        shopId: string,
        password?: string,
    ) => Promise<{ ok: true } | { ok: false; code: 'SYNC_FAILED' | 'NOT_READY' }>;
    login: (
        phoneDigits: string,
        password: string,
    ) => Promise<
        | { ok: true; onboardingCompleted: boolean }
        | { ok: false; code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' }
    >;
    saveOnboardingProfile: (payload: {
        nickname: string;
        phoneMasked: string;
        phoneDigits: string;
        almangPayoutConsent: AlmangPayoutConsent;
        consentAt: string | null;
        privacyConsentAt: string;
    }) => Promise<void>;
    resetOnboarding: () => Promise<void>;
    /** 인증 세션·로컬 유저 상태를 지우고 로그인부터 다시 시작 */
    logout: () => Promise<void>;
    updateNickname: (nickname: string) => Promise<void>;
    updateAvatar: (avatarId: string) => Promise<void>;
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
                  | 'INVALID_FILE_TYPE'
                  | 'INVALID_PHOTO'
                  | 'FILE_TOO_LARGE'
                  | 'NETWORK_ERROR';
          }
    >;
    /** 관리자 승인 후 BE claim → 재료 지급 */
    claimMissionReward: (missionId: string) => Promise<
        | { ok: true; ingredientId: string }
        | {
              ok: false;
              code:
                  | 'NOT_FOUND'
                  | 'MISSION_REWARD_CLAIM_NOT_AVAILABLE'
                  | 'MISSION_REWARD_ALREADY_CLAIMED'
                  | 'NETWORK_ERROR';
          }
    >;
    /** BE completions로 claimable/completed 상태 재동기화 (보상 탭) */
    syncMissionCompletions: () => Promise<void>;
    /** 보상 탭 수령 직후 로컬 completed 반영 (재고는 ingredients sync) */
    markMissionClaimedLocally: (
        missionSlug: string,
        completionId: number,
        bundle?: {
            rewards?: Array<{
                ingredientId?: number | null;
                ingredientName?: string | null;
                imageUrl?: string | null;
            }>;
        },
    ) => Promise<void>;
    /** BE 보유 재료로 인벤토리 덮어쓰기 (보상 수령 후) */
    applyRemoteInventory: (inventory: Record<string, number>) => Promise<void>;
    brewSoup: (slots: (string | null)[]) => Promise<
        | { ok: true; recipe: Recipe; craft: SoupCraftResponse }
        | {
              ok: false;
              reason: 'incomplete' | 'no_match' | 'already_done' | 'no_stock' | 'network';
          }
    >;
    pullGacha: () => Promise<GachaPullResult>;
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
                  | 'insufficient_eco_jam'
                  | 'network';
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
        | { ok: false; reason: 'already_claimed' | 'share_cancelled' | 'verification_unavailable' }
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

    const ensureRegistered = useCallback(
        async (
            base: AppUserState,
            options?: { force?: boolean },
        ): Promise<AppUserState> => ensureRegisteredUser(base, options),
        [],
    );

    const recoverRegistrationIfNeeded = useCallback(
        async (error: unknown): Promise<boolean> => {
            if (
                !(error instanceof ApiClientError) ||
                error.code !== 'USER_NOT_FOUND' ||
                !isApiEnabled()
            ) {
                return false;
            }
            const recovered = await ensureRegistered(
                { ...stateRef.current, userId: null },
                { force: true },
            );
            if (recovered.userId == null) {
                return false;
            }
            stateRef.current = recovered;
            setState(recovered);
            await saveUserState(recovered);
            return true;
        },
        [ensureRegistered],
    );
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
            } catch (error) {
                // 토큰이 가리키는 유저가 없으면 새 임시 계정으로 복구
                if (
                    isApiEnabled() &&
                    error instanceof ApiClientError &&
                    error.code === 'USER_NOT_FOUND'
                ) {
                    await clearAuthSession();
                    next = await ensureRegistered(
                        { ...next, userId: null, onboardingCompleted: false },
                        { force: true },
                    );
                    try {
                        const today = formatDateKey(new Date());
                        const status = await getCheckInStatus(next.lastCheckInDate, today);
                        if (status.alreadyChecked) {
                            next = syncCheckedInToday(next, today);
                        }
                    } catch {
                        // keep local state
                    }
                }
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
                } catch (error) {
                    if (
                        error instanceof ApiClientError &&
                        error.code === 'USER_NOT_FOUND'
                    ) {
                        await clearAuthSession();
                        next = await ensureRegistered(
                            { ...next, userId: null, onboardingCompleted: false },
                            { force: true },
                        );
                    }
                    // keep local inventory
                }
                try {
                    const myPage = await getMyPage();
                    if (myPage != null) {
                        // 로컬 onboardingCompleted 와 BE 불일치 시 BE를 기준으로 맞춤
                        next = reconcileOnboardingFromMyPage(next, myPage);
                    }
                } catch (error) {
                    if (
                        error instanceof ApiClientError &&
                        (error.code === 'USER_NOT_FOUND' ||
                            error.status === 401 ||
                            error.code === 'INVALID_ACCESS_TOKEN' ||
                            error.code === 'ACCESS_TOKEN_REQUIRED')
                    ) {
                        await clearAuthSession();
                        next = await ensureRegistered(
                            {
                                ...next,
                                userId: null,
                                onboardingCompleted: false,
                            },
                            { force: true },
                        );
                    }
                    // keep local assets
                }
                try {
                    const completions = await getMissionCompletions();
                    next = applyMissionCompletionsToState(
                        next,
                        completions,
                        (missionId, missionTitle) => {
                            if (missionTitle != null && missionTitle.length > 0) {
                                return resolveMissionSlugFromBe({
                                    id: missionId,
                                    title: missionTitle,
                                });
                            }
                            return (
                                missionSlugFromNumeric(missionId) ??
                                `be-${missionId}`
                            );
                        },
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
                const today = formatDateKey(new Date());
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    try {
                        const current = stateRef.current;
                        const apiResult = await postCheckIn({
                            lastCheckInDate: current.lastCheckInDate,
                            ingredientInventory: current.ingredientInventory,
                            today,
                        });
                        if (!apiResult.ok) {
                            if (
                                apiResult.code === 'USER_NOT_FOUND' &&
                                attempt === 0 &&
                                isApiEnabled()
                            ) {
                                const recovered = await ensureRegistered(
                                    { ...stateRef.current, userId: null },
                                    { force: true },
                                );
                                if (recovered.userId != null) {
                                    stateRef.current = recovered;
                                    setState(recovered);
                                    await saveUserState(recovered);
                                    continue;
                                }
                            }
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
                }
                return { ok: false, code: 'USER_NOT_FOUND' };
            },
            finishOnboarding: async (shopId, password) => {
                let current = stateRef.current;
                // 배포 빌드에서는 로컬만 완료 금지 — BE 동기화 실패 시 홈 진입 불가
                if (!isApiEnabled()) {
                    if (typeof __DEV__ !== 'undefined' && __DEV__) {
                        await persist((prev) => finishOnboardingState(prev, shopId));
                        return { ok: true };
                    }
                    return { ok: false, code: 'NOT_READY' };
                }

                current = await ensureRegistered(current);
                stateRef.current = current;
                setState(current);
                await saveUserState(current);
                if (current.userId == null || password == null || password.length === 0) {
                    return { ok: false, code: 'NOT_READY' };
                }
                const phoneNumber = current.phoneNumber;
                const numericShopId = shopNumericId(shopId);
                if (
                    phoneNumber == null ||
                    phoneNumber.length === 0 ||
                    numericShopId == null
                ) {
                    return { ok: false, code: 'NOT_READY' };
                }
                try {
                    const completed = await postOnboardingComplete({
                        nickname: current.nickname,
                        phoneNumber,
                        password,
                        shopId: numericShopId,
                    });
                    await persist((prev) => ({
                        ...finishOnboardingState(prev, shopId),
                        userId: completed?.userId ?? prev.userId,
                        nickname: completed?.nickname ?? prev.nickname,
                        phoneNumber: completed?.phoneNumber ?? prev.phoneNumber,
                        onboardingCompleted: true,
                    }));
                    return { ok: true };
                } catch (error) {
                    if (
                        error instanceof ApiClientError &&
                        error.code === 'DUPLICATE_PHONE_NUMBER'
                    ) {
                        try {
                            const loggedIn = await postLogin(phoneNumber, password);
                            if (!loggedIn.onboardingCompleted) {
                                return { ok: false, code: 'SYNC_FAILED' };
                            }
                            await persist((prev) =>
                                finishOnboardingState(
                                    applyLoginUser(prev, {
                                        userId: loggedIn.userId,
                                        nickname: loggedIn.nickname,
                                        phoneNumber: loggedIn.phoneNumber,
                                        phoneMasked: prev.phoneMasked ?? loggedIn.phoneNumber,
                                        onboardingCompleted: true,
                                    }),
                                    shopId,
                                ),
                            );
                            return { ok: true };
                        } catch {
                            return { ok: false, code: 'SYNC_FAILED' };
                        }
                    }
                    return { ok: false, code: 'SYNC_FAILED' };
                }
            },
            login: async (phoneDigits, password) => {
                const phoneNumber = formatPhoneForApi(phoneDigits);
                try {
                    if (!isApiEnabled()) {
                        return { ok: false, code: 'NETWORK_ERROR' };
                    }
                    const loggedIn = await postLogin(phoneNumber, password);
                    const next = applyLoginUser(stateRef.current, {
                        userId: loggedIn.userId,
                        nickname: loggedIn.nickname,
                        phoneNumber: loggedIn.phoneNumber,
                        phoneMasked: maskPhone(phoneDigits),
                        onboardingCompleted: loggedIn.onboardingCompleted,
                    });
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return { ok: true, onboardingCompleted: loggedIn.onboardingCompleted };
                } catch (error) {
                    if (error instanceof ApiClientError && error.status === 0) {
                        return { ok: false, code: 'NETWORK_ERROR' };
                    }
                    return { ok: false, code: 'INVALID_CREDENTIALS' };
                }
            },
            saveOnboardingProfile: async (payload) => {
                const phoneNumber = formatPhoneForApi(payload.phoneDigits);
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
                // 로컬 온보딩만 초기화하고 현재 계정과 인증 세션은 유지한다.
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
            logout: async () => {
                await clearAuthSession();
                const next: AppUserState = {
                    ...DEFAULT_USER_STATE,
                    deviceId: stateRef.current.deviceId,
                };
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
            },
            updateNickname: async (nickname) => {
                await persist((prev) => updateNicknameState(prev, nickname));
            },
            updateAvatar: async (avatarId) => {
                await persist((prev) => updateAvatarState(prev, avatarId));
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
                const communityBeId = parseCommunityMissionRouteId(missionId);
                if (communityBeId != null) {
                    if (photo == null) {
                        return { ok: false, code: 'INVALID_PHOTO' };
                    }
                    const api = await submitCommunityMissionPhotoProof(
                        communityBeId,
                        photo,
                    );
                    if (!api.ok) {
                        if (api.code === 'ALREADY_DONE') {
                            return { ok: false, code: 'MISSION_ALREADY_COMPLETED' };
                        }
                        if (
                            api.code === 'INVALID_PHOTO' ||
                            api.code === 'INVALID_FILE_TYPE' ||
                            api.code === 'FILE_TOO_LARGE'
                        ) {
                            return {
                                ok: false,
                                code: api.code as
                                    | 'INVALID_PHOTO'
                                    | 'INVALID_FILE_TYPE'
                                    | 'FILE_TOO_LARGE',
                            };
                        }
                        if (api.code === 'NOT_FOUND' || api.code === 'LOCKED') {
                            return { ok: false, code: 'NOT_FOUND' };
                        }
                        return { ok: false, code: 'NETWORK_ERROR' };
                    }
                    const current = stateRef.current;
                    const next = submitMissionPendingReview(current, missionId);
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return { ok: true, pending: true };
                }
                for (let attempt = 0; attempt < 2; attempt += 1) {
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
                        // mock(DEV)만 APPROVED 즉시 반환 — API 경로는 claim 전용
                        if (api.ingredientId == null) {
                            return { ok: false, code: 'NOT_FOUND' };
                        }
                        if (isApiEnabled()) {
                            const next = markMissionClaimable(
                                current,
                                missionId,
                                api.data.completionId,
                            );
                            stateRef.current = next;
                            setState(next);
                            await saveUserState(next);
                            return { ok: true, pending: true };
                        }
                        const next = completeMissionVerify(
                            current,
                            missionId,
                            api.ingredientId,
                        );
                        stateRef.current = next;
                        setState(next);
                        await saveUserState(next);
                        return { ok: true, pending: false, ingredientId: api.ingredientId };
                    } catch (error) {
                        if (attempt === 0 && (await recoverRegistrationIfNeeded(error))) {
                            continue;
                        }
                        return { ok: false, code: 'NETWORK_ERROR' };
                    }
                }
                return { ok: false, code: 'NETWORK_ERROR' };
            },
            claimMissionReward: async (missionId) => {
                const communityBeId = parseCommunityMissionRouteId(missionId);
                if (communityBeId != null) {
                    const result = await completeCommunityMission(communityBeId);
                    if (!result.ok) {
                        return { ok: false, code: 'NETWORK_ERROR' };
                    }
                    const first = result.data.rewardedIngredients[0];
                    const rewardIds = result.data.rewardedIngredients.map(
                        (ing) =>
                            ingredientSlugFromNumeric(ing.id) ?? `be-${ing.id}`,
                    );
                    const current = stateRef.current;
                    const next = applyCommunityMissionComplete(current, missionId, {
                        rewardIngredientIds: rewardIds,
                        rewardedEcoJam: result.data.rewardedEcoJam,
                        rewardIngredientName: first?.name,
                        rewardIngredientImageUrl: first?.imageUrl,
                    });
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return {
                        ok: true,
                        ingredientId: rewardIds[0] ?? 'be-0',
                    };
                }
                const current = stateRef.current;
                const progress = current.missionProgress[missionId];
                const completionId = progress?.completionId;
                if (completionId == null) {
                    return { ok: false, code: 'NOT_FOUND' };
                }
                const result = await postMissionRewardClaim(completionId);
                if (!result.ok) {
                    return result;
                }
                const next = completeMissionVerify(
                    current,
                    missionId,
                    result.ingredientId,
                    {
                        name: result.data.rewardedIngredient.name,
                        imageUrl: result.data.rewardedIngredient.imageUrl,
                    },
                );
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return { ok: true, ingredientId: result.ingredientId };
            },
            syncMissionCompletions: async () => {
                if (!isApiEnabled()) {
                    return;
                }
                try {
                    const completions = await getMissionCompletions();
                    const current = stateRef.current;
                    const next = applyMissionCompletionsToState(
                        current,
                        completions,
                        (missionId, missionTitle) => {
                            if (missionTitle != null && missionTitle.length > 0) {
                                return resolveMissionSlugFromBe({
                                    id: missionId,
                                    title: missionTitle,
                                });
                            }
                            return (
                                missionSlugFromNumeric(missionId) ?? `be-${missionId}`
                            );
                        },
                        ingredientSlugFromNumeric,
                    );
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                } catch {
                    // keep local
                }
            },
            markMissionClaimedLocally: async (missionSlug, completionId, bundle) => {
                const entry = bundle?.rewards?.[0];
                const ingredientId =
                    entry?.ingredientId != null
                        ? (ingredientSlugFromNumeric(entry.ingredientId) ??
                          `be-${entry.ingredientId}`)
                        : undefined;
                const current = stateRef.current;
                const next = markMissionCompletedWithoutGrant(current, missionSlug, {
                    ingredientId,
                    name: entry?.ingredientName,
                    imageUrl: entry?.imageUrl,
                    completionId,
                });
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
            },
            applyRemoteInventory: async (inventory) => {
                const current = stateRef.current;
                const next: AppUserState = {
                    ...current,
                    ingredientInventory: inventory,
                };
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
            },
            pullGacha: async (): Promise<GachaPullResult> => {
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    const current = stateRef.current;
                    if (current.ecoJam < GACHA_PULL_COST_ECO_JAM) {
                        return { ok: false, reason: 'insufficient_eco_jam' };
                    }
                    try {
                        const api = await postGacha(current.ecoJam);
                        if (!api.ok) {
                            if (isApiEnabled()) {
                                try {
                                    const myPage = await getMyPage();
                                    if (myPage != null) {
                                        const synced = {
                                            ...stateRef.current,
                                            ecoJam: myPage.ecoJam,
                                        };
                                        stateRef.current = synced;
                                        setState(synced);
                                        await saveUserState(synced);
                                    }
                                } catch {
                                    // keep local
                                }
                            }
                            return { ok: false, reason: 'insufficient_eco_jam' };
                        }
                        const cost = api.response.costEcoJam || GACHA_PULL_COST_ECO_JAM;
                        let next: AppUserState;
                        if (isApiEnabled()) {
                            next = {
                                ...current,
                                ecoJam: api.remainingEcoJam,
                            };
                            next = appendEcoJamLedger(next, '가챠 뽑기', -cost);
                            if (
                                api.reward.type === 'INGREDIENT' ||
                                api.reward.type === 'ALMANG_POINT'
                            ) {
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
                                next = appendAlmangPointsLedger(
                                    next,
                                    '가챠 보상',
                                    api.reward.amount,
                                );
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
                                next = appendAlmangPointsLedger(
                                    next,
                                    '가챠 보상',
                                    api.reward.amount,
                                );
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
                    } catch (error) {
                        if (attempt === 0 && (await recoverRegistrationIfNeeded(error))) {
                            continue;
                        }
                        return { ok: false, reason: 'network_error' };
                    }
                }
                return { ok: false, reason: 'network_error' };
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
                const catalog = await ensureBrewRecipeCatalog();
                const recipe =
                    findMatchingBrewRecipe(slots, catalog) ??
                    findMatchingRecipe(slots, current.completedRecipeIds);
                if (recipe == null) {
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
                } catch (error) {
                    if (await recoverRegistrationIfNeeded(error)) {
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
                            const consumed = consumeIngredientsForSlots(
                                stateRef.current,
                                filled,
                            );
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
                            stateRef.current = next;
                            setState(next);
                            await saveUserState(next);
                            return { ok: true, recipe, craft };
                        } catch {
                            return { ok: false, reason: 'network' };
                        }
                    }
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

                if (isApiEnabled()) {
                    for (let attempt = 0; attempt < 2; attempt += 1) {
                        try {
                            const api = await postSoupReroll(prevCraft.soupId, prevCraft);
                            if (!api.ok) {
                                switch (api.code) {
                                    case 'INSUFFICIENT_ECO_JAM':
                                        return { ok: false, reason: 'insufficient_eco_jam' };
                                    case 'SOUP_REROLL_ALREADY_COMPLETED':
                                        return { ok: false, reason: 'already_used' };
                                    case 'SOUP_NOT_FOUND':
                                    case 'SOUP_REROLL_NOT_AVAILABLE':
                                    case 'SOUP_REROLL_REWARD_RECOVERY_NOT_AVAILABLE':
                                        return { ok: false, reason: 'not_allowed' };
                                    default:
                                        return { ok: false, reason: 'network' };
                                }
                            }
                            const nextCraft = api.craft;
                            const upgraded =
                                gradeFromCraft(nextCraft) !== fromGrade ||
                                (nextCraft.rewardAmount ?? 0) > (prevCraft.rewardAmount ?? 0);
                            const successfulState = applySoupRerollServerSync(
                                stateRef.current,
                                recipe,
                                {
                                    remainingEcoJam: api.remainingEcoJam,
                                    nextCraft,
                                    syncedPoint: null,
                                    syncedInventory: null,
                                },
                            );
                            stateRef.current = successfulState;
                            setState(successfulState);
                            try {
                                await saveUserState(successfulState);
                            } catch {
                                // 리롤은 서버에서 이미 성공했으므로 재호출을 유도하지 않는다.
                            }

                            const [myPageResult, ingredientsResult] =
                                await Promise.allSettled([
                                    getMyPage(),
                                    getUserIngredients(),
                                ]);
                            const syncedPoint =
                                myPageResult.status === 'fulfilled' &&
                                myPageResult.value != null
                                    ? myPageResult.value.point
                                    : null;
                            const syncedInventory =
                                ingredientsResult.status === 'fulfilled' &&
                                ingredientsResult.value != null
                                    ? inventoryFromUserIngredients(ingredientsResult.value)
                                    : null;
                            const next = applySoupRerollServerSync(
                                stateRef.current,
                                recipe,
                                {
                                    remainingEcoJam: api.remainingEcoJam,
                                    nextCraft,
                                    syncedPoint,
                                    syncedInventory,
                                },
                            );
                            stateRef.current = next;
                            setState(next);
                            try {
                                await saveUserState(next);
                            } catch {
                                // 서버 성공 상태를 유지하고 중복 리롤을 막는다.
                            }
                            return {
                                ok: true,
                                craft: nextCraft,
                                actionName: soupRerollActionName(kind),
                                cost: api.rerollCostEcoJam,
                                upgraded,
                            };
                        } catch (error) {
                            if (attempt === 0 && (await recoverRegistrationIfNeeded(error))) {
                                continue;
                            }
                            return { ok: false, reason: 'network' };
                        }
                    }
                    return { ok: false, reason: 'network' };
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
                        '히든 레시피 해금',
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
                    '히든 레시피 해금',
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
        [isReady, state, persist, ensureRegistered, recoverRegistrationIfNeeded],
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
