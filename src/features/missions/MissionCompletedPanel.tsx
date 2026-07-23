import { getMissionCompletions } from '@api/missions';
import type { MissionCompletionItem } from '@api/notion/types';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { CenterLoader } from '../../shared/ui/CenterLoader';
import { useAppToast } from '../../shared/feedback/useAppToast';
import {
    resolveMissionRewardRowMeta,
    rewardImageSource,
} from './missionRewardRowMeta';

/**
 * 수령 완료된 미션 보상 이력.
 * 행: 미션 아이콘 · 미션 내용 · 보상 아이콘
 */
export function MissionCompletedPanel() {
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<MissionCompletionItem[]>([]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const completions = await getMissionCompletions();
            const claimed = completions
                .filter((item) => item.rewardClaimed === true)
                .sort((a, b) => {
                    const at = Date.parse(a.rewardClaimedAt ?? a.reviewedAt ?? a.submittedAt);
                    const bt = Date.parse(b.rewardClaimedAt ?? b.reviewedAt ?? b.submittedAt);
                    return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
                });
            setItems(claimed);
        } catch {
            toast.showError('완료 목록을 불러오지 못했어요.\n잠시 후 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

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
                이미 받은 보상이에요.
            </Txt>
            {items.map((item) => {
                const meta = resolveMissionRewardRowMeta(item.missionId, item.missionTitle);
                const rewardSrc = rewardImageSource(item.rewardedIngredient?.imageUrl);
                const rewardName = item.rewardedIngredient?.name ?? '보상';
                return (
                    <View key={item.completionId} style={styles.card}>
                        <BrandEmojiImage
                            source={meta.missionImage}
                            size={48}
                            containerStyle={styles.missionIcon}
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
                            ) : null}
                            <Txt typography="t7" color="grey500">
                                {formatClaimedAt(item.rewardClaimedAt ?? item.reviewedAt)}
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

function formatClaimedAt(iso: string | null | undefined): string {
    if (iso == null || iso.length === 0) {
        return '수령 완료';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '수령 완료';
    }
    return `${d.getMonth() + 1}/${d.getDate()} 수령`;
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
    missionIcon: {
        marginRight: 0,
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
