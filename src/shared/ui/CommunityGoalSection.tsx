import { Button, ProgressBar, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    completeCommunityMission,
    getCommunityMissions,
} from '../../api/communityMissions';
import {
    COMMUNITY_GOAL_FALLBACK,
    type CommunityGoalView,
    pickHomeCommunityMission,
    toCommunityGoalView,
} from '../constants/communityGoalMock';
import { HOME_DECOR, progressCheerSource } from '../constants/homeDecorAssets';
import { useAppToast } from '../feedback/useAppToast';
import { colors } from '../theme/colors';
import { BrandEmojiImage } from './BrandEmojiImage';
import { ProbabilityInfoButton } from './ProbabilityInfoButton';

const CHEER_SIZE = 22;
const HERO_SIZE = 52;

export function CommunityGoalSection() {
    const toast = useAppToast();
    const [goal, setGoal] = useState<CommunityGoalView>(
        COMMUNITY_GOAL_FALLBACK,
    );
    const [claimLoading, setClaimLoading] = useState(false);

    const refresh = useCallback(async (signal?: AbortSignal) => {
        try {
            const list = await getCommunityMissions({ signal });
            if (signal?.aborted) {
                return;
            }
            if (list == null) {
                return;
            }
            setGoal(toCommunityGoalView(pickHomeCommunityMission(list)));
        } catch {
            // 유지: 폴백 0%
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void refresh(controller.signal);
        return () => {
            controller.abort();
        };
    }, [refresh]);

    const handleComplete = async () => {
        if (goal.communityMissionId == null || claimLoading) {
            return;
        }
        setClaimLoading(true);
        try {
            const result = await completeCommunityMission(goal.communityMissionId);
            if (!result.ok) {
                toast.showError('아직 보상을 받을 수 없어요. 인증·검수를 확인해 주세요.');
                return;
            }
            if (result.data.rewardGranted) {
                toast.showSuccess('공동 미션 보상을 받았어요!');
            } else {
                toast.show('공동 미션을 완료했어요.');
            }
            await refresh();
        } finally {
            setClaimLoading(false);
        }
    };

    const percent = goal.percent;
    const cheer = progressCheerSource(percent);
    const showClaim =
        goal.readyToComplete === true &&
        goal.completed !== true &&
        goal.communityMissionId != null;

    return (
        <View style={styles.wrap}>
            <View style={styles.headerRow}>
                <View style={styles.titleRow}>
                    <Txt typography="t6" fontWeight="semibold">
                        {goal.title} · {percent}%
                    </Txt>
                    <ProbabilityInfoButton
                        title="공동 목표"
                        lines={[goal.description]}
                        footnote={null}
                    />
                </View>
                <BrandEmojiImage
                    source={HOME_DECOR.homeHero}
                    size={HERO_SIZE}
                    containerStyle={styles.hero}
                    accessibilityLabel="제로와 스티"
                />
            </View>
            <View style={styles.barRow}>
                <ProgressBar
                    progress={percent}
                    size="normal"
                    color={colors.success}
                    style={styles.bar}
                />
                <BrandEmojiImage
                    source={cheer}
                    size={CHEER_SIZE}
                    containerStyle={styles.cheer}
                    accessibilityLabel="진행 응원 캐릭터"
                />
            </View>
            {showClaim ? (
                <Button
                    size="medium"
                    type="primary"
                    display="block"
                    loading={claimLoading}
                    disabled={claimLoading}
                    onPress={() => {
                        void handleComplete();
                    }}
                    accessibilityLabel="공동 미션 보상 받기"
                >
                    {claimLoading ? '받는 중…' : '보상 받기'}
                </Button>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 6,
    },
    headerRow: {
        minHeight: HERO_SIZE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    hero: {
        flexShrink: 0,
        marginRight: 0,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bar: {
        flex: 1,
    },
    cheer: {
        marginRight: 0,
        flexShrink: 0,
    },
});
