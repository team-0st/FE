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

/** BE 오늘 미션 플래그가 있으면 로컬보다 우선 (수령 후에도 «보상 받기» 잔존 방지) */
export function missionStatusFromBeAndLocal(
    state: AppUserState,
    missionId: string,
    be?: {
        rewardClaimable?: boolean;
        rewardClaimed?: boolean;
        todayStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    } | null,
): MissionProgressStatus {
    if (be?.rewardClaimed === true) {
        return 'completed';
    }
    if (be?.rewardClaimable === true) {
        return 'claimable';
    }
    if (be?.todayStatus === 'PENDING') {
        return 'pending_review';
    }
    if (be?.todayStatus === 'REJECTED') {
        return 'rejected';
    }
    return missionStatusFor(state, missionId);
}

export function isUserCheckedInToday(state: AppUserState): boolean {
    return isCheckedInToday(state);
}
