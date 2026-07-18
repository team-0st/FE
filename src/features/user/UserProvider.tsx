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
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import { formatPhoneForApi, postOnboardingComplete } from '@api/onboarding';
import { postRegisterUser } from '@api/users';
import { getOrCreateDeviceId } from '../../shared/device/deviceId';
import { postGacha } from '@api/gacha';
import { postMissionVerify } from '@api/missions';
import { shopNumericId } from '@api/notion/idMap';
import type { Recipe } from '@api/mock/recipes';
import {
    findMatchingRecipe,
    findRecipeBySlots,
    getFilledIngredientIds,
    isValidBrewFillCount,
} from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { postSoupCraft } from '@api/soup';
import { GACHA_PULL_COST_ECO_JAM } from '../gacha/gachaConfig';
import { applyGachaReward } from '../gacha/gachaLogic';
import type { GachaPullResult } from '../gacha/gachaTypes';
import { appendEcoJamLedger } from './ecoJamLedger';
import { DEFAULT_USER_STATE } from './defaultState';
import { loadUserState, saveUserState } from './userRepository';
import type { AppUserState, AlmangPayoutConsent, LocationConsent } from './types';
import {
    addEcoJam,
    applyCheckInFromServer,
    applyRegisterUser,
    completeMissionVerify,
    completeRecipe,
    consumeIngredientsForSlots,
    finishOnboarding as finishOnboardingState,
    getMissionTodayStatus,
    resetOnboarding as resetOnboardingState,
    saveOnboardingProfile as saveOnboardingProfileState,
    setShopId,
    setLocationConsent as setLocationConsentState,
    submitMissionPendingReview,
    spendEcoJam,
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
    }) => Promise<void>;
    resetOnboarding: () => Promise<void>;
    selectShop: (shopId: string) => Promise<void>;
    setLocationConsent: (consent: LocationConsent) => Promise<void>;
    verifyMission: (missionId: string) => Promise<
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
        | { ok: false; reason: 'incomplete' | 'no_match' | 'already_done' | 'no_stock' }
    >;
    pullGacha: () => Promise<GachaPullResult>;
    grantTestEcoJam: (amount: number) => Promise<void>;
    claimShareReward: () => Promise<
        | { ok: true; ecoJamGranted: number }
        | { ok: false; reason: 'already_claimed_today' | 'share_cancelled' }
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
            try {
                const today = formatDateKey(new Date());
                const status = await getCheckInStatus(next.lastCheckInDate, today);
                if (status.alreadyChecked && next.lastCheckInDate !== today) {
                    next = { ...next, lastCheckInDate: today };
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
                    }),
                );
            },
            resetOnboarding: async () => {
                const cleared = resetOnboardingState(stateRef.current);
                stateRef.current = cleared;
                setState(cleared);
                await saveUserState(cleared);
                const registered = await ensureRegistered(cleared);
                stateRef.current = registered;
                setState(registered);
                await saveUserState(registered);
            },
            selectShop: async (shopId) => {
                await persist((prev) => setShopId(prev, shopId));
            },
            setLocationConsent: async (consent) => {
                await persist((prev) => setLocationConsentState(prev, consent));
            },
            verifyMission: async (missionId) => {
                try {
                    const current = stateRef.current;
                    const todayStatus = getMissionTodayStatus(current, missionId);
                    const api = await postMissionVerify(missionId, todayStatus);
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
                await persist((prev) => addEcoJam(prev, amount, '테스트 지급'));
            },
            pullGacha: async (): Promise<GachaPullResult> => {
                const current = stateRef.current;
                if (current.ecoJam < GACHA_PULL_COST_ECO_JAM) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                const api = await postGacha(current.ecoJam);
                if (!api.ok) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                const spent = spendEcoJam(current, GACHA_PULL_COST_ECO_JAM, '가챠 뽑기');
                if (spent == null) {
                    return { ok: false, reason: 'insufficient_eco_jam' };
                }
                let next = applyGachaReward(spent, api.reward);
                if (api.reward.type === 'ECO_JAM') {
                    next = appendEcoJamLedger(next, '가챠 보상', api.reward.amount);
                }
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return {
                    ok: true,
                    reward: api.reward,
                    costEcoJam: GACHA_PULL_COST_ECO_JAM,
                };
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
                const consumed = consumeIngredientsForSlots(current, filled);
                if (consumed == null) {
                    return { ok: false, reason: 'no_stock' };
                }
                const craft = await postSoupCraft(recipe, filled);
                const next = completeRecipe(consumed, recipe, craft);
                stateRef.current = next;
                setState(next);
                await saveUserState(next);
                return { ok: true, recipe, craft };
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
