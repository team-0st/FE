import { getShopById } from '@api/mock';
import type { AppUserState, MissionProgressStatus } from './types';
import { getMissionStatus, isCheckedInToday } from './userStateLogic';

export function resolveShopName(shopId: string | null): string {
    if (shopId == null) {
        return '미선택';
    }
    return getShopById(shopId)?.name ?? shopId;
}

export function missionStatusFor(state: AppUserState, missionId: string): MissionProgressStatus {
    return getMissionStatus(state, missionId);
}

export function isUserCheckedInToday(state: AppUserState): boolean {
    return isCheckedInToday(state);
}
