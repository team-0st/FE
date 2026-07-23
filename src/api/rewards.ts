import { ApiClientError, apiRequest, isApiEnabled } from './client';
import type {
    ClaimAllRewardsDto,
    ClaimRewardDto,
    RewardsTabDto,
} from './notion/types';
import { API_PATHS } from './notion/types';

export type RewardsFetchResult =
    | { ok: true; data: RewardsTabDto }
    | { ok: false; code: 'NETWORK_ERROR' };

export type RewardClaimResult =
    | { ok: true; data: ClaimRewardDto }
    | {
          ok: false;
          code:
              | 'REWARD_NOT_FOUND'
              | 'REWARD_NOT_CLAIMABLE'
              | 'REWARD_ALREADY_CLAIMED'
              | 'NETWORK_ERROR';
      };

export type RewardsClaimAllResult =
    | { ok: true; data: ClaimAllRewardsDto }
    | { ok: false; code: 'NETWORK_ERROR' };

export async function getRewards(): Promise<RewardsTabDto | null> {
    if (!isApiEnabled()) {
        return null;
    }
    return apiRequest<RewardsTabDto>(API_PATHS.rewards);
}

export async function fetchRewardsTab(): Promise<RewardsFetchResult> {
    try {
        const data = await getRewards();
        if (data == null) {
            return {
                ok: true,
                data: {
                    summary: {
                        totalPendingRewardCount: 0,
                        pendingEcoJam: 0,
                        pendingPoint: 0,
                        pendingCommonIngredientCount: 0,
                        pendingHiddenIngredientCount: 0,
                    },
                    items: [],
                },
            };
        }
        return { ok: true, data };
    } catch {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}

export async function postRewardClaim(rewardId: number): Promise<RewardClaimResult> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        const data = await apiRequest<ClaimRewardDto>(API_PATHS.rewardClaim(rewardId), {
            method: 'POST',
        });
        return { ok: true, data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            if (error.code === 'REWARD_NOT_FOUND' || error.code === 'MISSION_COMPLETION_NOT_FOUND') {
                return { ok: false, code: 'REWARD_NOT_FOUND' };
            }
            if (
                error.code === 'REWARD_NOT_CLAIMABLE' ||
                error.code === 'MISSION_REWARD_CLAIM_NOT_AVAILABLE'
            ) {
                return { ok: false, code: 'REWARD_NOT_CLAIMABLE' };
            }
            if (
                error.code === 'REWARD_ALREADY_CLAIMED' ||
                error.code === 'MISSION_REWARD_ALREADY_CLAIMED'
            ) {
                return { ok: false, code: 'REWARD_ALREADY_CLAIMED' };
            }
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}

export async function postRewardsClaimAll(): Promise<RewardsClaimAllResult> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        const data = await apiRequest<ClaimAllRewardsDto>(API_PATHS.rewardsClaimAll, {
            method: 'POST',
        });
        return { ok: true, data };
    } catch {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}
