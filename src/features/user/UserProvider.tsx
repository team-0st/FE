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
import { postCheckIn, type CheckInResult } from '@api/checkIn';
import { postGacha } from '@api/gacha';
import { postMissionVerify } from '@api/missions';
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
import type { AppUserState, AlmangPayoutConsent } from './types';
import {
    addEcoJam,
    applyCheckInFromServer,
    completeMissionVerify,
    completeRecipe,
    consumeIngredientsForSlots,
    finishOnboarding as finishOnboardingState,
    getMissionStatus,
    resetOnboarding as resetOnboardingState,
    saveOnboardingProfile as saveOnboardingProfileState,
    setShopId,
    spendEcoJam,
    formatDateKey,
} from './userStateLogic';

type UserContextValue = {
    isReady: boolean;
    state: AppUserState;
    checkInToday: () => Promise<CheckInResult>;
    finishOnboarding: (shopId: string) => Promise<void>;
    saveOnboardingProfile: (payload: {
        nickname: string;
        phoneMasked: string | null;
        almangPayoutConsent: AlmangPayoutConsent;
        consentAt: string | null;
    }) => Promise<void>;
    resetOnboarding: () => Promise<void>;
    selectShop: (shopId: string) => Promise<void>;
    verifyMission: (missionId: string) => Promise<
        | { ok: true; ingredientId: string }
        | { ok: false; code: 'NOT_FOUND' | 'MISSION_ALREADY_COMPLETED' | 'NETWORK_ERROR' }
    >;
    brewSoup: (slots: (string | null)[]) => Promise<
        | { ok: true; recipe: Recipe; craft: SoupCraftResponse }
        | { ok: false; reason: 'incomplete' | 'no_match' | 'already_done' | 'no_stock' }
    >;
    pullGacha: () => Promise<GachaPullResult>;
    grantTestEcoJam: (amount: number) => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
    const [isReady, setIsReady] = useState(false);
    const [state, setState] = useState<AppUserState>(DEFAULT_USER_STATE);
    const stateRef = useRef<AppUserState>(DEFAULT_USER_STATE);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        let mounted = true;
        loadUserState().then((loaded) => {
            if (mounted) {
                stateRef.current = loaded;
                setState(loaded);
                setIsReady(true);
            }
        });
        return () => {
            mounted = false;
        };
    }, []);

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
                await persist((prev) => finishOnboardingState(prev, shopId));
            },
            saveOnboardingProfile: async (payload) => {
                await persist((prev) =>
                    saveOnboardingProfileState(prev, {
                        nickname: payload.nickname,
                        phoneMasked: payload.phoneMasked,
                        almangPayoutConsent: payload.almangPayoutConsent,
                        consentAt: payload.consentAt,
                    }),
                );
            },
            resetOnboarding: async () => {
                await persist((prev) => resetOnboardingState(prev));
            },
            selectShop: async (shopId) => {
                await persist((prev) => setShopId(prev, shopId));
            },
            verifyMission: async (missionId) => {
                try {
                    const current = stateRef.current;
                    const isCompleted = getMissionStatus(current, missionId) === 'completed';
                    const api = await postMissionVerify(missionId, isCompleted);
                    if (!api.ok) {
                        return api;
                    }
                    const next = completeMissionVerify(current, missionId, api.ingredientId);
                    stateRef.current = next;
                    setState(next);
                    await saveUserState(next);
                    return { ok: true, ingredientId: api.ingredientId };
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
        [isReady, state, persist],
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
