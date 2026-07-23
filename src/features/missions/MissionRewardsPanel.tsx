import {
    fetchRewardsTab,
    postRewardClaim,
    postRewardsClaimAll,
} from '@api/rewards';
import type { RewardBundleDto, RewardsSummaryDto } from '@api/notion/types';
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { CenterLoader } from '../../shared/ui/CenterLoader';

const EMPTY_SUMMARY: RewardsSummaryDto = {
    totalPendingRewardCount: 0,
    pendingEcoJam: 0,
    pendingPoint: 0,
    pendingCommonIngredientCount: 0,
    pendingHiddenIngredientCount: 0,
};

/**
 * Notion 보상 탭 API (`GET /api/v1/rewards`) 기준 미수령 목록.
 */
export function MissionRewardsPanel() {
    const { syncMissionCompletions, applyRemoteInventory } = useUser();
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<number | 'all' | null>(null);
    const [summary, setSummary] = useState<RewardsSummaryDto>(EMPTY_SUMMARY);
    const [items, setItems] = useState<RewardBundleDto[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchRewardsTab();
            if (!result.ok) {
                toast.showError('보상 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요.');
                return;
            }
            setSummary(result.data.summary);
            setItems(result.data.items);
            await syncMissionCompletions();
        } finally {
            setLoading(false);
        }
    }, [syncMissionCompletions, toast]);

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
        (rewardId: number) => {
            void (async () => {
                setClaimingId(rewardId);
                try {
                    const result = await postRewardClaim(rewardId);
                    if (!result.ok) {
                        if (result.code === 'REWARD_ALREADY_CLAIMED') {
                            toast.showError('이미 받은 보상이에요.');
                        } else if (result.code === 'REWARD_NOT_CLAIMABLE') {
                            toast.showError('아직 받을 수 없어요. 검수를 확인해 주세요.');
                        } else {
                            toast.showError('보상 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                        }
                        await refresh();
                        return;
                    }
                    toast.showSuccess('보상을 받았어요.');
                    await refreshInventory();
                    await refresh();
                } finally {
                    setClaimingId(null);
                }
            })();
        },
        [refresh, refreshInventory, toast],
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
    }, [refresh, refreshInventory, toast]);

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
                검수 완료 후 아직 받지 않은 보상이에요. (오늘·이전 포함)
            </Txt>
            {items.map((item) => {
                const busy = claimingId === item.rewardId;
                return (
                    <View key={item.rewardId} style={styles.card}>
                        <View style={styles.cardText}>
                            <Txt typography="t6" fontWeight="bold">
                                {item.sourceTitle}
                            </Txt>
                            <Txt typography="t7" color="grey500">
                                {formatRewardEntries(item)}
                            </Txt>
                            <Txt typography="t7" color="grey500">
                                {formatEarnedAt(item.earnedAt)}
                            </Txt>
                        </View>
                        <Button
                            size="medium"
                            type="primary"
                            loading={busy}
                            disabled={claimingId != null}
                            onPress={() => onClaim(item.rewardId)}
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
        gap: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F3F0E8',
    },
    cardText: {
        flex: 1,
        gap: 4,
    },
});
