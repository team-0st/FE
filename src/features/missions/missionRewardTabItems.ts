import type { RewardBundleDto, RewardEntryDto } from '@api/notion/types';
import type { CommunityMissionProgressDto } from '@api/notion/types';
import type { MissionCompletionItem } from '@api/notion/types';
import { getMissionById } from '@api/mock/missions';
import { resolveMissionSlugFromBe } from '@api/missions';
import { communityMissionRouteId } from '@api/communityMissions';
import type { AppUserState } from '../user/types';
import {
    resolveMissionRewardRowMeta,
    rewardImageSource,
} from './missionRewardRowMeta';

/** 보상/완료 탭 공통 행 */
export type MissionRewardTabItem = {
    key: string;
    kind: 'mission' | 'community';
    /** MISSION: completionId / COMMUNITY: communityMissionId */
    rewardId: number;
    sourceId: number;
    sourceTitle: string;
    description: string;
    earnedAt: string;
    claimedAt?: string | null;
    rewards: RewardEntryDto[];
    missionSlug: string;
};

export function missionBundleToTabItem(item: RewardBundleDto): MissionRewardTabItem {
    const meta = resolveMissionRewardRowMeta(item.sourceId, item.sourceTitle);
    return {
        key: `mission-${item.rewardId}`,
        kind: 'mission',
        rewardId: item.rewardId,
        sourceId: item.sourceId,
        sourceTitle: item.sourceTitle,
        description: meta.description,
        earnedAt: item.earnedAt,
        claimedAt: item.claimedAt,
        rewards: item.rewards,
        missionSlug: meta.slug,
    };
}

export function completionToClaimableTabItem(
    c: MissionCompletionItem,
): MissionRewardTabItem {
    const meta = resolveMissionRewardRowMeta(c.missionId, c.missionTitle);
    const ingredient = c.rewardedIngredient;
    return {
        key: `mission-${c.completionId}`,
        kind: 'mission',
        rewardId: c.completionId,
        sourceId: c.missionId,
        sourceTitle: c.missionTitle,
        description: meta.description,
        earnedAt: c.reviewedAt ?? c.submittedAt,
        claimedAt: null,
        rewards: [
            {
                rewardType: 'INGREDIENT',
                ingredientId: ingredient?.id ?? null,
                ingredientName: ingredient?.name ?? null,
                quantity: 1,
                imageUrl: ingredient?.imageUrl ?? null,
            },
        ],
        missionSlug: meta.slug,
    };
}

export function completionToClaimedTabItem(
    c: MissionCompletionItem,
): MissionRewardTabItem {
    const base = completionToClaimableTabItem(c);
    return {
        ...base,
        claimedAt: c.rewardClaimedAt ?? c.reviewedAt ?? c.submittedAt,
    };
}

export function communityToClaimableTabItem(
    dto: CommunityMissionProgressDto,
): MissionRewardTabItem {
    const slug = communityMissionRouteId(dto.id);
    const catalog = getMissionById(slug);
    return {
        key: `community-${dto.id}`,
        kind: 'community',
        rewardId: dto.id,
        sourceId: dto.id,
        sourceTitle: dto.title,
        description: dto.description ?? catalog?.description ?? '',
        earnedAt: new Date().toISOString(),
        claimedAt: null,
        rewards: [
            {
                rewardType: 'INGREDIENT',
                quantity: 1,
                ingredientName: '재료 보상',
            },
        ],
        missionSlug: slug,
    };
}

export function communityToCompletedTabItem(
    dto: CommunityMissionProgressDto,
): MissionRewardTabItem {
    const base = communityToClaimableTabItem(dto);
    return {
        ...base,
        claimedAt: new Date().toISOString(),
        rewards: [
            {
                rewardType: 'INGREDIENT',
                quantity: 1,
                ingredientName: dto.succeeded ? '공동 미션 보상' : '완료',
            },
        ],
    };
}

export function localClaimableToTabItems(
    state: AppUserState,
    existingKeys: Set<string>,
): MissionRewardTabItem[] {
    const out: MissionRewardTabItem[] = [];
    for (const [slug, progress] of Object.entries(state.missionProgress)) {
        if (progress.status !== 'claimable' || progress.completionId == null) {
            continue;
        }
        const key = `mission-${progress.completionId}`;
        if (existingKeys.has(key)) {
            continue;
        }
        const catalog = getMissionById(slug);
        out.push({
            key,
            kind: 'mission',
            rewardId: progress.completionId,
            sourceId: progress.completionId,
            sourceTitle: catalog?.title ?? slug,
            description: catalog?.description ?? '',
            earnedAt: progress.submittedAt ?? new Date().toISOString(),
            claimedAt: null,
            rewards: [
                {
                    rewardType: 'INGREDIENT',
                    quantity: 1,
                    ingredientName: progress.rewardIngredientName ?? '재료',
                    imageUrl: progress.rewardIngredientImageUrl ?? null,
                },
            ],
            missionSlug: slug,
        });
    }
    return out;
}

export function localCompletedToTabItems(
    state: AppUserState,
    existingKeys: Set<string>,
): MissionRewardTabItem[] {
    const out: MissionRewardTabItem[] = [];
    for (const [slug, progress] of Object.entries(state.missionProgress)) {
        if (progress.status !== 'completed') {
            continue;
        }
        // community는 community API로 따로 합침
        if (slug.startsWith('community-')) {
            continue;
        }
        const key = progress.completionId != null
            ? `mission-${progress.completionId}`
            : `local-${slug}`;
        if (existingKeys.has(key)) {
            continue;
        }
        const catalog = getMissionById(slug);
        out.push({
            key,
            kind: 'mission',
            rewardId: progress.completionId ?? 0,
            sourceId: progress.completionId ?? 0,
            sourceTitle: catalog?.title ?? slug,
            description: catalog?.description ?? '',
            earnedAt: progress.completedAt ?? progress.submittedAt ?? new Date().toISOString(),
            claimedAt: progress.completedAt ?? null,
            rewards: [
                {
                    rewardType: 'INGREDIENT',
                    quantity: 1,
                    ingredientName: progress.rewardIngredientName ?? '재료',
                    imageUrl: progress.rewardIngredientImageUrl ?? null,
                },
            ],
            missionSlug: slug,
        });
    }
    return out;
}

export function sortClaimableAsc(items: MissionRewardTabItem[]): MissionRewardTabItem[] {
    return [...items].sort((a, b) => {
        const at = Date.parse(a.earnedAt);
        const bt = Date.parse(b.earnedAt);
        return (Number.isNaN(at) ? 0 : at) - (Number.isNaN(bt) ? 0 : bt);
    });
}

export function sortClaimedDesc(items: MissionRewardTabItem[]): MissionRewardTabItem[] {
    return [...items].sort((a, b) => {
        const at = Date.parse(a.claimedAt ?? a.earnedAt);
        const bt = Date.parse(b.claimedAt ?? b.earnedAt);
        return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
    });
}

export function formatRewardEntries(item: MissionRewardTabItem): string {
    return item.rewards
        .map((entry) => {
            if (entry.rewardType === 'INGREDIENT') {
                return `${entry.ingredientName ?? '재료'} ×${entry.quantity}`;
            }
            if (entry.rewardType === 'ECO_JAM') {
                return `에코잼 ${entry.quantity}`;
            }
            if (entry.rewardType === 'POINT') {
                return `포인트 ${entry.quantity}`;
            }
            return `${entry.rewardType} ×${entry.quantity}`;
        })
        .join(' · ');
}

export function formatTabDate(iso: string | null | undefined, suffix: string): string {
    if (iso == null || iso.length === 0) {
        return suffix;
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return suffix;
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${suffix}`;
}

export { resolveMissionRewardRowMeta, rewardImageSource, resolveMissionSlugFromBe };
