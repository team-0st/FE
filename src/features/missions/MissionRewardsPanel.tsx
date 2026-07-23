import {
    fetchRewardsTab,
    postRewardClaim,
    postRewardsClaimAll,
} from '@api/rewards';
import { getMissionCompletions, resolveMissionSlugFromBe } from '@api/missions';
import type { RewardBundleDto, RewardsSummaryDto } from '@api/notion/types';
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { CenterLoader } from '../../shared/ui/CenterLoader';
import {
    resolveMissionRewardRowMeta,
    rewardImageSource,
} from './missionRewardRowMeta';

const EMPTY_SUMMARY: RewardsSummaryDto = {
    totalPendingRewardCount: 0,
    pendingEcoJam: 0,
    pendingPoint: 0,
    pendingCommonIngredientCount: 0,
    pendingHiddenIngredientCount: 0,
};

type MissionRewardsPanelProps = {
    /** 탭 뱃지용 — 미수령 개수 변경 시 */
    onPendingCountChange?: (count: number) => void;
};

/**
 * 미수령 보상 (오늘·이전 포함).
 * GET /rewards + completions claimable + 로컬 claimable 병합.
 */
export function MissionRewardsPanel({ onPendingCountChange }: MissionRewardsPanelProps) {
    const { state, syncMissionCompletions, applyRemoteInventory, markMissionClaimedLocally } =
        useUser();
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<number | 'all' | null>(null);
    const [summary, setSummary] = useState<RewardsSummaryDto>(EMPTY_SUMMARY);
    const [items, setItems] = useState<RewardBundleDto[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [result, completions] = await Promise.all([
                fetchRewardsTab(),
                getMissionCompletions().catch(() => []),
            ]);
            if (!result.ok) {
                toast.showError('보상 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요.');
                onPendingCountChange?.(0);
                return;
            }

            const byId = new Map<number, RewardBundleDto>();
            for (const item of result.data.items) {
                if (item.rewardStatus === 'CLAIMED') {
                    continue;
                }
                byId.set(item.rewardId, item);
            }
            for (const c of completions) {
                const claimed = c.rewardClaimed === true || c.rewardClaimedAt != null;
                if (claimed || !c.rewardClaimable) {
                    continue;
                }
                if (byId.has(c.completionId)) {
                    continue;
                }
                const ingredient = c.rewardedIngredient;
                byId.set(c.completionId, {
                    rewardId: c.completionId,
                    rewardSourceType: 'MISSION',
                    sourceId: c.missionId,
                    sourceTitle: c.missionTitle,
                    rewardStatus: 'CLAIMABLE',
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
                });
            }
            for (const [slug, progress] of Object.entries(state.missionProgress)) {
                if (progress.status !== 'claimable' || progress.completionId == null) {
                    continue;
                }
                if (byId.has(progress.completionId)) {
                    continue;
                }
                byId.set(progress.completionId, {
                    rewardId: progress.completionId,
                    rewardSourceType: 'MISSION',
                    sourceId: progress.completionId,
                    sourceTitle: slug,
                    rewardStatus: 'CLAIMABLE',
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
                });
            }

            const merged = Array.from(byId.values()).sort((a, b) => {
                const at = Date.parse(a.earnedAt);
                const bt = Date.parse(b.earnedAt);
                return (Number.isNaN(at) ? 0 : at) - (Number.isNaN(bt) ? 0 : bt);
            });

            const nextSummary: RewardsSummaryDto = {
                ...result.data.summary,
                totalPendingRewardCount: merged.length,
            };
            setSummary(nextSummary);
            setItems(merged);
            onPendingCountChange?.(merged.length);
            await syncMissionCompletions();
        } finally {
            setLoading(false);
        }
    }, [onPendingCountChange, state.missionProgress, syncMissionCompletions, toast]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const refreshInventory = useCallback(async () => {
        try {
            const remote = await getUserIngredients();
            if (remote != null && applyRemoteInventory != null) {
                await applyRemoteInventory(inventoryFromUserIngredients(remote));
            }
        } catch {
            // keep local inventory
        }
    }, [applyRemoteInventory]);

    const onClaim = useCallback(
        (item: RewardBundleDto) => {
            void (async () => {
                setClaimingId(item.rewardId);
                try {
                    const result = await postRewardClaim(item.rewardId);
                    const slug = resolveMissionSlugFromBe({
                        id: item.sourceId,
                        title: item.sourceTitle,
                    });
                    if (!result.ok) {
                        if (result.code === 'REWARD_ALREADY_CLAIMED') {
                            toast.showError('이미 받은 보상이에요.');
                            await markMissionClaimedLocally(slug, item.rewardId, item);
                        } else if (result.code === 'REWARD_NOT_CLAIMABLE') {
                            toast.showError('아직 받을 수 없어요. 검수를 확인해 주세요.');
                        } else {
                            toast.showError('보상 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                        }
                        await refresh();
                        return;
                    }
                    await markMissionClaimedLocally(slug, item.rewardId, item);
                    toast.showSuccess('보상을 받았어요.');
                    await refreshInventory();
                    await refresh();
                } finally {
                    setClaimingId(null);
                }
            })();
        },
        [markMissionClaimedLocally, refresh, refreshInventory, toast],
    );

    const onClaimAll = useCallback(() => {
        void (async () => {
            setClaimingId('all');
            try {
                const result = await postRewardsClaimAll();
                if (!result.ok) {
                    toast.showError('일괄 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                    await refresh();
                    return;
                }
                for (const item of items) {
                    const slug = resolveMissionSlugFromBe({
                        id: item.sourceId,
                        title: item.sourceTitle,
                    });
                    await markMissionClaimedLocally(slug, item.rewardId, item);
                }
                toast.showSuccess(
                    result.data.claimedRewardCount > 0
                        ? `보상 ${result.data.claimedRewardCount}개를 받았어요.`
                        : '받을 보상이 없어요.',
                );
                await refreshInventory();
                await refresh();
            } finally {
                setClaimingId(null);
            }
        })();
    }, [items, markMissionClaimedLocally, refresh, refreshInventory, toast]);

    if (loading && items.length === 0) {
        return (
            <View style={styles.loaderWrap}>
                <CenterLoader />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Txt typography="t6" color="grey600" style={styles.emptyText}>
                    받을 보상이 없어요.{'\n'}미션 검수가 끝나면 여기에 나타나요.
                </Txt>
                <Button
                    size="medium"
                    type="dark"
                    style="weak"
                    display="block"
                    onPress={() => void refresh()}
                >
                    새로고침
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.list} testID="mission-rewards-panel">
            <View style={styles.summary}>
                <Txt typography="t6" fontWeight="bold">
                    {`미수령 ${summary.totalPendingRewardCount}개`}
                </Txt>
                <Txt typography="t7" color="grey600" style={styles.summaryLine}>
                    {formatSummaryLine(summary)}
                </Txt>
            </View>
            <Button
                size="medium"
                type="primary"
                display="block"
                loading={claimingId === 'all'}
                disabled={claimingId != null}
                onPress={onClaimAll}
            >
                전체 수령
            </Button>
            <Txt typography="t7" color="grey600" style={styles.hint}>
                오늘·이전에 확정된 미수령 보상이에요. 미션에서도 받을 수 있어요.
            </Txt>
            {items.map((item) => {
                const busy = claimingId === item.rewardId;
                const meta = resolveMissionRewardRowMeta(item.sourceId, item.sourceTitle);
                const firstReward = item.rewards[0];
                const rewardSrc = rewardImageSource(firstReward?.imageUrl);
                const rewardLabel = formatRewardEntries(item);
                return (
                    <View key={item.rewardId} style={styles.card}>
                        <BrandEmojiImage
                            source={meta.missionImage}
                            size={48}
                            accessibilityLabel={`${meta.title} 아이콘`}
                        />
                        <View style={styles.cardText}>
                            <Txt typography="t6" fontWeight="bold" numberOfLines={1}>
                                {meta.title}
                            </Txt>
                            {meta.description.length > 0 ? (
                                <Txt typography="t7" color="grey600" numberOfLines={2}>
                                    {meta.description}
                                </Txt>
                            ) : (
                                <Txt typography="t7" color="grey500" numberOfLines={1}>
                                    {rewardLabel}
                                </Txt>
                            )}
                            <Txt typography="t7" color="grey500">
                                {formatEarnedAt(item.earnedAt)}
                            </Txt>
                        </View>
                        {rewardSrc != null ? (
                            <BrandEmojiImage
                                source={rewardSrc}
                                size={36}
                                accessibilityLabel={firstReward?.ingredientName ?? '보상'}
                            />
                        ) : null}
                        <Button
                            size="medium"
                            type="primary"
                            loading={busy}
                            disabled={claimingId != null}
                            onPress={() => onClaim(item)}
                        >
                            수령
                        </Button>
                    </View>
                );
            })}
        </View>
    );
}

function formatSummaryLine(summary: RewardsSummaryDto): string {
    const parts: string[] = [];
    if (summary.pendingCommonIngredientCount > 0) {
        parts.push(`일반 재료 ${summary.pendingCommonIngredientCount}`);
    }
    if (summary.pendingHiddenIngredientCount > 0) {
        parts.push(`히든 재료 ${summary.pendingHiddenIngredientCount}`);
    }
    if (summary.pendingEcoJam > 0) {
        parts.push(`에코잼 ${summary.pendingEcoJam}`);
    }
    if (summary.pendingPoint > 0) {
        parts.push(`포인트 ${summary.pendingPoint}`);
    }
    return parts.length > 0 ? parts.join(' · ') : '수령 가능한 보상이 있어요';
}

function formatRewardEntries(item: RewardBundleDto): string {
    return item.rewards
        .map((entry) => {
            if (entry.rewardType === 'INGREDIENT') {
                const name = entry.ingredientName ?? '재료';
                return `${name} ×${entry.quantity}`;
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

function formatEarnedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return iso;
    }
    return `${d.getMonth() + 1}/${d.getDate()} 확정`;
}

const styles = StyleSheet.create({
    loaderWrap: {
        minHeight: 160,
        justifyContent: 'center',
    },
    empty: {
        gap: 16,
        paddingVertical: 24,
        paddingHorizontal: 4,
    },
    emptyText: {
        lineHeight: 22,
        textAlign: 'center',
    },
    list: {
        gap: 12,
        paddingBottom: 24,
    },
    summary: {
        gap: 4,
        marginBottom: 4,
    },
    summaryLine: {
        lineHeight: 20,
    },
    hint: {
        lineHeight: 20,
        marginBottom: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F3F0E8',
    },
    cardText: {
        flex: 1,
        gap: 4,
        minWidth: 0,
    },
});
