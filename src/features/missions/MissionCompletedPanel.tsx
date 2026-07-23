import { getMissionCompletions } from '@api/missions';
import { getCommunityMissions } from '@api/communityMissions';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { CenterLoader } from '../../shared/ui/CenterLoader';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { getMissionImageSource } from '../../shared/constants/missionAssets';
import {
    communityToCompletedTabItem,
    completionToClaimedTabItem,
    formatRewardEntries,
    formatTabDate,
    localCompletedToTabItems,
    rewardImageSource,
    sortClaimedDesc,
    type MissionRewardTabItem,
} from './missionRewardTabItems';

/**
 * 수령·완료 이력: 일반 미션 completions + 공동 미션 completed.
 */
export function MissionCompletedPanel() {
    const { state } = useUser();
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<MissionRewardTabItem[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [completions, community] = await Promise.all([
                getMissionCompletions().catch(() => []),
                getCommunityMissions().catch(() => null),
            ]);

            const byKey = new Map<string, MissionRewardTabItem>();

            for (const c of completions) {
                const claimed =
                    c.rewardClaimed === true ||
                    (c.rewardClaimedAt != null && c.rewardClaimedAt.length > 0);
                if (!claimed) {
                    continue;
                }
                const row = completionToClaimedTabItem(c);
                byKey.set(row.key, row);
            }

            if (community != null) {
                for (const dto of community) {
                    if (!dto.completed && !dto.succeeded) {
                        continue;
                    }
                    const row = communityToCompletedTabItem(dto);
                    byKey.set(row.key, row);
                }
            }

            for (const row of localCompletedToTabItems(state, new Set(byKey.keys()))) {
                byKey.set(row.key, row);
            }

            setItems(sortClaimedDesc(Array.from(byKey.values())));
        } catch {
            toast.showError('완료 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [state.missionProgress, toast]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

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
                    아직 받은 보상이 없어요.{'\n'}미션을 완료하고 보상을 받아 보세요.
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
        <View style={styles.list} testID="mission-completed-panel">
            <Txt typography="t7" color="grey600" style={styles.hint}>
                일반·공동 미션에서 받은 보상이에요.
            </Txt>
            {items.map((item) => {
                const rewardSrc = rewardImageSource(item.rewards[0]?.imageUrl);
                const rewardName = item.rewards[0]?.ingredientName ?? '보상';
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
                                    ? '공동 미션 · 완료'
                                    : formatTabDate(item.claimedAt, '수령')}
                            </Txt>
                        </View>
                        {rewardSrc != null ? (
                            <BrandEmojiImage
                                source={rewardSrc}
                                size={40}
                                accessibilityLabel={rewardName}
                            />
                        ) : (
                            <Txt typography="t7" color="grey600" style={styles.rewardFallback}>
                                {rewardName}
                            </Txt>
                        )}
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
    rewardFallback: {
        maxWidth: 72,
        textAlign: 'right',
    },
});
