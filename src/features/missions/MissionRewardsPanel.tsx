import {
    fetchRewardsTab,
    postRewardClaim,
    postRewardsClaimAll,
} from '@api/rewards';
import { getMissionCompletions } from '@api/missions';
import {
    completeCommunityMission,
    getCommunityMissions,
} from '@api/communityMissions';
import type { RewardsSummaryDto } from '@api/notion/types';
import { getUserIngredients, inventoryFromUserIngredients } from '@api/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { CenterLoader } from '../../shared/ui/CenterLoader';
import { getMissionImageSource } from '../../shared/constants/missionAssets';
import {
    communityToClaimableTabItem,
    completionToClaimableTabItem,
    formatRewardEntries,
    formatTabDate,
    localClaimableToTabItems,
    missionBundleToTabItem,
    rewardImageSource,
    sortClaimableAsc,
    type MissionRewardTabItem,
} from './missionRewardTabItems';

const EMPTY_SUMMARY: RewardsSummaryDto = {
    totalPendingRewardCount: 0,
    pendingEcoJam: 0,
    pendingPoint: 0,
    pendingCommonIngredientCount: 0,
    pendingHiddenIngredientCount: 0,
};

type MissionRewardsPanelProps = {
    onPendingCountChange?: (count: number) => void;
};

type ClaimingId = string | 'all' | null;

/**
 * 미수령 보상: 일반 미션(GET /rewards·completions) + 공동 미션(readyToComplete).
 */
export function MissionRewardsPanel({ onPendingCountChange }: MissionRewardsPanelProps) {
    const { state, syncMissionCompletions, applyRemoteInventory, markMissionClaimedLocally } =
        useUser();
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<ClaimingId>(null);
    const [summary, setSummary] = useState<RewardsSummaryDto>(EMPTY_SUMMARY);
    const [items, setItems] = useState<MissionRewardTabItem[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [result, completions, community] = await Promise.all([
                fetchRewardsTab(),
                getMissionCompletions().catch(() => []),
                getCommunityMissions().catch(() => null),
            ]);

            const byKey = new Map<string, MissionRewardTabItem>();

            if (result.ok) {
                for (const item of result.data.items) {
                    if (item.rewardStatus === 'CLAIMED') {
                        continue;
                    }
                    const row = missionBundleToTabItem(item);
                    byKey.set(row.key, row);
                }
                setSummary(result.data.summary);
            } else {
                toast.showError('일부 보상 목록을 불러오지 못했어요.');
                setSummary(EMPTY_SUMMARY);
            }

            for (const c of completions) {
                const claimed = c.rewardClaimed === true || c.rewardClaimedAt != null;
                if (claimed || !c.rewardClaimable) {
                    continue;
                }
                const row = completionToClaimableTabItem(c);
                if (!byKey.has(row.key)) {
                    byKey.set(row.key, row);
                }
            }

            if (community != null) {
                for (const dto of community) {
                    if (!dto.readyToComplete || dto.completed) {
                        continue;
                    }
                    const row = communityToClaimableTabItem(dto);
                    byKey.set(row.key, row);
                }
            }

            for (const row of localClaimableToTabItems(state, new Set(byKey.keys()))) {
                byKey.set(row.key, row);
            }

            const merged = sortClaimableAsc(Array.from(byKey.values()));
            setSummary((prev) => ({
                ...prev,
                totalPendingRewardCount: merged.length,
            }));
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
            // keep local
        }
    }, [applyRemoteInventory]);

    const onClaim = useCallback(
        (item: MissionRewardTabItem) => {
            void (async () => {
                setClaimingId(item.key);
                try {
                    if (item.kind === 'community') {
                        const result = await completeCommunityMission(item.rewardId);
                        if (!result.ok) {
                            toast.showError('보상 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                            await refresh();
                            return;
                        }
                        await markMissionClaimedLocally(item.missionSlug, item.rewardId, {
                            rewards: result.data.rewardedIngredients.map((ing) => ({
                                ingredientId: ing.id,
                                ingredientName: ing.name,
                                imageUrl: ing.imageUrl,
                            })),
                        });
                        toast.showSuccess(
                            result.data.rewardGranted
                                ? '보상을 받았어요.'
                                : '미션을 완료했어요.',
                        );
                        await refreshInventory();
                        await refresh();
                        return;
                    }

                    const result = await postRewardClaim(item.rewardId);
                    if (!result.ok) {
                        if (result.code === 'REWARD_ALREADY_CLAIMED') {
                            toast.showError('이미 받은 보상이에요.');
                            await markMissionClaimedLocally(item.missionSlug, item.rewardId, {
                                rewards: item.rewards,
                            });
                        } else if (result.code === 'REWARD_NOT_CLAIMABLE') {
                            toast.showError('아직 받을 수 없어요. 검수를 확인해 주세요.');
                        } else {
                            toast.showError('보상 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                        }
                        await refresh();
                        return;
                    }
                    await markMissionClaimedLocally(item.missionSlug, item.rewardId, {
                        rewards: item.rewards,
                    });
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
                let claimed = 0;
                const missionItems = items.filter((i) => i.kind === 'mission');
                const communityItems = items.filter((i) => i.kind === 'community');

                if (missionItems.length > 0) {
                    const result = await postRewardsClaimAll();
                    if (result.ok) {
                        claimed += result.data.claimedRewardCount;
                        for (const item of missionItems) {
                            await markMissionClaimedLocally(item.missionSlug, item.rewardId, {
                                rewards: item.rewards,
                            });
                        }
                    }
                }

                for (const item of communityItems) {
                    const result = await completeCommunityMission(item.rewardId);
                    if (result.ok) {
                        claimed += 1;
                        await markMissionClaimedLocally(item.missionSlug, item.rewardId, {
                            rewards: result.data.rewardedIngredients.map((ing) => ({
                                ingredientId: ing.id,
                                ingredientName: ing.name,
                                imageUrl: ing.imageUrl,
                            })),
                        });
                    }
                }

                toast.showSuccess(
                    claimed > 0 ? `보상 ${claimed}개를 받았어요.` : '받을 보상이 없어요.',
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
                    일반·공동 미션 미수령 보상이에요.
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
                미션 상세에서도 받을 수 있어요.
            </Txt>
            {items.map((item) => {
                const busy = claimingId === item.key;
                const first = item.rewards[0];
                const rewardSrc = rewardImageSource(first?.imageUrl);
                return (
                    <View key={item.key} style={styles.card}>
                        <BrandEmojiImage
                            source={getMissionImageSource(item.missionSlug, item.sourceTitle)}
                            size={48}
                            accessibilityLabel={`${item.sourceTitle} 아이콘`}
                        />
                        <View style={styles.cardText}>
                            <Txt typography="t6" fontWeight="bold" numberOfLines={1}>
                                {item.sourceTitle}
                            </Txt>
                            {item.description.length > 0 ? (
                                <Txt typography="t7" color="grey600" numberOfLines={2}>
                                    {item.description}
                                </Txt>
                            ) : (
                                <Txt typography="t7" color="grey500" numberOfLines={1}>
                                    {formatRewardEntries(item)}
                                </Txt>
                            )}
                            <Txt typography="t7" color="grey500">
                                {item.kind === 'community'
                                    ? '공동 미션 · 수령 가능'
                                    : formatTabDate(item.earnedAt, '확정')}
                            </Txt>
                        </View>
                        {rewardSrc != null ? (
                            <BrandEmojiImage
                                source={rewardSrc}
                                size={36}
                                accessibilityLabel={first?.ingredientName ?? '보상'}
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
