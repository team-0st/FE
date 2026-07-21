import type { SoupCraftResponse } from '@api/notion/types';
import { useCallback, useLayoutEffect, useReducer, useRef } from 'react';
import type { BrewFailureReason } from '../../shared/feedback/messages';

export type CraftBrewState = 'idle' | 'running';
export type CraftPhase = 'landing' | 'select';

export type PendingCraftOutcome =
    | {
          id: number;
          kind: 'success';
          recipeId: string;
          craft: SoupCraftResponse;
      }
    | {
          id: number;
          kind: 'failure';
          reason: BrewFailureReason;
      };

type CraftTabState = {
    active: boolean;
    phase: CraftPhase;
    brewState: CraftBrewState;
    pendingOutcome: PendingCraftOutcome | null;
    nextOutcomeId: number;
};

type CraftTabEvent =
    | { type: 'TAB_ACTIVE_CHANGED'; active: boolean }
    | { type: 'START_SELECTING' }
    | { type: 'BREW_STARTED' }
    | { type: 'BREW_SUCCEEDED'; recipeId: string; craft: SoupCraftResponse }
    | { type: 'BREW_FAILED'; reason: BrewFailureReason }
    | { type: 'PENDING_DELIVERED'; id: number };

function initialState(active: boolean): CraftTabState {
    return {
        active,
        phase: 'landing',
        brewState: 'idle',
        pendingOutcome: null,
        nextOutcomeId: 1,
    };
}

function reduceCraftTabState(state: CraftTabState, event: CraftTabEvent): CraftTabState {
    switch (event.type) {
        case 'TAB_ACTIVE_CHANGED': {
            if (event.active) {
                return { ...state, active: true };
            }
            const mustKeepSelection =
                state.brewState === 'running' || state.pendingOutcome != null;
            return {
                ...state,
                active: false,
                phase: mustKeepSelection ? state.phase : 'landing',
            };
        }
        case 'START_SELECTING':
            return { ...state, phase: 'select' };
        case 'BREW_STARTED':
            return { ...state, phase: 'select', brewState: 'running' };
        case 'BREW_SUCCEEDED': {
            if (state.pendingOutcome != null) {
                return state;
            }
            return {
                ...state,
                phase: 'select',
                brewState: 'idle',
                pendingOutcome: {
                    id: state.nextOutcomeId,
                    kind: 'success',
                    recipeId: event.recipeId,
                    craft: event.craft,
                },
                nextOutcomeId: state.nextOutcomeId + 1,
            };
        }
        case 'BREW_FAILED': {
            if (state.pendingOutcome != null) {
                return state;
            }
            return {
                ...state,
                phase: 'select',
                brewState: 'idle',
                pendingOutcome: {
                    id: state.nextOutcomeId,
                    kind: 'failure',
                    reason: event.reason,
                },
                nextOutcomeId: state.nextOutcomeId + 1,
            };
        }
        case 'PENDING_DELIVERED':
            if (state.pendingOutcome?.id !== event.id) {
                return state;
            }
            return { ...state, pendingOutcome: null };
    }
}

type UseCraftTabControllerOptions = {
    active: boolean;
    onSoupMade: (recipeId: string, craft: SoupCraftResponse) => void;
    onBrewFailure: (reason: BrewFailureReason) => void;
};

/**
 * 제작 탭 phase·brew·pending outcome을 한 곳에서 관리한다.
 * 탭을 나갈 때(active: true→false) 브루 진행 중이 아니면 즉시 landing으로 초기화하고,
 * 탭으로 돌아올 때(active: false→true)는 phase를 다시 바꾸지 않는다.
 * 비활성 중 결과는 union으로 보관하고, 이탈·복귀 렌더 모두 layout effect 전에 상태를 파생해
 * 한 프레임 지연 없이 반영한다.
 */
export function useCraftTabController({
    active,
    onSoupMade,
    onBrewFailure,
}: UseCraftTabControllerOptions) {
    const [state, dispatch] = useReducer(reduceCraftTabState, active, initialState);
    const onSoupMadeRef = useRef(onSoupMade);
    const onBrewFailureRef = useRef(onBrewFailure);
    const deliveredIdRef = useRef<number | null>(null);
    onSoupMadeRef.current = onSoupMade;
    onBrewFailureRef.current = onBrewFailure;

    const renderState =
        state.active === active
            ? state
            : reduceCraftTabState(state, { type: 'TAB_ACTIVE_CHANGED', active });

    useLayoutEffect(() => {
        if (state.active !== active) {
            dispatch({ type: 'TAB_ACTIVE_CHANGED', active });
        }
    }, [active, state.active]);

    useLayoutEffect(() => {
        const pending = renderState.pendingOutcome;
        if (!active || pending == null || deliveredIdRef.current === pending.id) {
            return;
        }
        deliveredIdRef.current = pending.id;
        dispatch({ type: 'PENDING_DELIVERED', id: pending.id });
        if (pending.kind === 'success') {
            onSoupMadeRef.current(pending.recipeId, pending.craft);
            return;
        }
        onBrewFailureRef.current(pending.reason);
    }, [active, renderState.pendingOutcome]);

    const startSelecting = useCallback(() => {
        dispatch({ type: 'START_SELECTING' });
    }, []);

    const markBrewStarted = useCallback(() => {
        dispatch({ type: 'BREW_STARTED' });
    }, []);

    const completeBrewSuccess = useCallback(
        (recipeId: string, craft: SoupCraftResponse) => {
            dispatch({ type: 'BREW_SUCCEEDED', recipeId, craft });
        },
        [],
    );

    const completeBrewFailure = useCallback((reason: BrewFailureReason) => {
        dispatch({ type: 'BREW_FAILED', reason });
    }, []);

    return {
        phase: renderState.phase,
        brewState: renderState.brewState,
        startSelecting,
        markBrewStarted,
        completeBrewSuccess,
        completeBrewFailure,
    };
}
