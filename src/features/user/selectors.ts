import { getShopById } from '@api/mock';
import type { AppUserState, MissionProgressStatus } from './types';
import { getMissionStatus, isCheckedInToday } from './userStateLogic';

export function resolveShopName(shopId: string | null): string {
    if (shopId == null) {
        return '미선택';
    }
    return getShopById(shopId)?.name ?? '선택한 샵';
}

/** 이름만으로는 어느 지점인지 알 수 없어 지역을 함께 표기한다 (예: "알맹상점 · 마포") */
export function resolveShopNameWithRegion(shopId: string | null): string {
    if (shopId == null) {
        return '미선택';
    }
    const shop = getShopById(shopId);
    if (shop == null) {
        return '선택한 샵';
    }
    return shop.region.length > 0 ? `${shop.name} · ${shop.region}` : shop.name;
}

export function missionStatusFor(state: AppUserState, missionId: string): MissionProgressStatus {
    return getMissionStatus(state, missionId);
}

export function isUserCheckedInToday(state: AppUserState): boolean {
    return isCheckedInToday(state);
}
