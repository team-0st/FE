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
import { DEFAULT_USER_STATE } from './defaultState';
import { loadUserState, saveUserState } from './userRepository';
import type { AppUserState } from './types';
import {
    approveMission,
    checkIn,
    finishOnboarding as finishOnboardingState,
    setShopId,
    submitMissionReview,
} from './userStateLogic';

type UserContextValue = {
    isReady: boolean;
    state: AppUserState;
    checkInToday: () => Promise<void>;
    finishOnboarding: (shopId: string) => Promise<void>;
    selectShop: (shopId: string) => Promise<void>;
    submitMission: (missionId: string) => Promise<void>;
    approveMissionDemo: (missionId: string, points: number) => Promise<void>;
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
            checkInToday: async () => {
                await persist((prev) => checkIn(prev));
            },
            finishOnboarding: async (shopId) => {
                await persist((prev) => finishOnboardingState(prev, shopId));
            },
            selectShop: async (shopId) => {
                await persist((prev) => setShopId(prev, shopId));
            },
            submitMission: async (missionId) => {
                await persist((prev) => submitMissionReview(prev, missionId));
            },
            approveMissionDemo: async (missionId, points) => {
                await persist((prev) => approveMission(prev, missionId, points));
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
