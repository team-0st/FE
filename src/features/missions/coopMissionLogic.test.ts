import { COOP_MISSIONS } from '@api/mock/missions';
import type { AppUserState } from '../user/types';
import { isCoopMissionUnlocked } from './coopMissionLogic';

const baseState = {
    missionProgress: {},
} as AppUserState;

describe('coopMissionLogic', () => {
    it('unlocks first coop mission by default', () => {
        const first = COOP_MISSIONS[0];
        expect(first).toBeDefined();
        if (first == null) {
            return;
        }
        expect(isCoopMissionUnlocked(baseState, first)).toBe(true);
    });

    it('locks chained coop mission until previous is completed', () => {
        const second = COOP_MISSIONS[1];
        expect(second).toBeDefined();
        if (second == null) {
            return;
        }
        expect(isCoopMissionUnlocked(baseState, second)).toBe(false);

        const unlockedState: AppUserState = {
            ...baseState,
            missionProgress: {
                'coop-photo-start': { status: 'completed' },
            },
        };
        expect(isCoopMissionUnlocked(unlockedState, second)).toBe(true);
    });
});
