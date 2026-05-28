import type { Mission } from '@api/mock';
import {
    formatIngredientReward,
    formatMissionIngredientReward,
    getMissionRewardIngredient,
} from '@api/mock/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMissionCompleteMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { RewardIngredientBadge } from '../../shared/ui/RewardIngredientBadge';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';

type MissionResultScreenProps = {
    mission: Mission;
    onApproved: () => void;
    onPressHome: () => void;
    autoApproveDemo: boolean;
};

export function MissionResultScreen({
    mission,
    onApproved,
    onPressHome,
    autoApproveDemo,
}: MissionResultScreenProps) {
    const approvedRef = useRef(false);
    const { state } = useUser();
    const progress = state.missionProgress[mission.id];
    const rewardIngredient = getMissionRewardIngredient(
        mission.id,
        progress?.rewardIngredientId,
    );
    const isCompleted = progress?.status === 'completed';
    const rewardLabel =
        rewardIngredient != null
            ? formatIngredientReward(rewardIngredient.id)
            : formatMissionIngredientReward(mission.id);

    useEffect(() => {
        if (!autoApproveDemo || approvedRef.current) {
            return;
        }
        approvedRef.current = true;
        onApproved();
    }, [autoApproveDemo, onApproved]);

    return (
        <Screen scrollable>
            <View style={styles.body}>
                <GuideHero
                    message={
                        isCompleted
                            ? getMissionCompleteMessage(rewardLabel)
                            : '제출이 완료됐어요. 검수 후 재료가 지급돼요.'
                    }
                    mood={isCompleted ? 'happy' : 'think'}
                    align="start"
                />
                <View style={styles.card}>
                    <Txt typography="t1">{mission.emoji}</Txt>
                    <Txt typography="t5" fontWeight="bold" style={styles.title}>
                        {mission.title}
                    </Txt>
                    {isCompleted && rewardIngredient != null ? (
                        <RewardIngredientBadge ingredient={rewardIngredient} />
                    ) : (
                        <Txt typography="t7" color="grey600" style={styles.pendingNote}>
                            {autoApproveDemo
                                ? '잠시만 기다려 주세요…'
                                : '운영팀 검수 후 재료가 들어와요.'}
                        </Txt>
                    )}
                    <Txt typography="t7" color="grey600" style={styles.note}>
                        재료는 제작 탭에서 스프를 끓일 때 사용해요.
                    </Txt>
                </View>
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" onPress={onPressHome}>
                    홈으로
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    card: {
        marginTop: 8,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    title: {
        marginTop: 12,
        marginBottom: 16,
    },
    pendingNote: {
        textAlign: 'center',
        marginBottom: 8,
    },
    note: {
        marginTop: 16,
        textAlign: 'center',
    },
    cta: {
        marginTop: 24,
    },
});
