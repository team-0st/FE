import type { CoopMission } from '@api/mock/types';
import type { AppUserState } from '../user/types';

export function isCoopMissionCompleted(state: AppUserState, missionId: string): boolean {
    return state.missionProgress[missionId]?.status === 'completed';
}

export function isCoopMissionUnlocked(state: AppUserState, mission: CoopMission): boolean {
    if (mission.unlockAfter == null) {
        return true;
    }
    return isCoopMissionCompleted(state, mission.unlockAfter);
}

export function coopDifficultyLabel(difficulty: 1 | 2 | 3): string {
    return '⭐'.repeat(difficulty);
}

export function coopUnlockHint(mission: CoopMission): string | null {
    if (mission.unlockAfter == null) {
        return null;
    }
    return `이전 공동 미션을 완료하면 열려요`;
}
