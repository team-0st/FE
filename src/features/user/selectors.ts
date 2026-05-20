import { getTeamById } from '@api/mock';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import type { AppUserState, MissionProgressStatus } from './types';
import { getMissionStatus, isCheckedInToday } from './userStateLogic';

export function resolveTeamName(teamId: AnimalTeamId | null): string {
    if (teamId == null) {
        return '미선택';
    }
    return getTeamById(teamId)?.name ?? teamId;
}

export function missionStatusFor(state: AppUserState, missionId: string): MissionProgressStatus {
    return getMissionStatus(state, missionId);
}

export function isUserCheckedInToday(state: AppUserState): boolean {
    return isCheckedInToday(state);
}
