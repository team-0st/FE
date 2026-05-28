import type { Mission } from '@api/mock';
import { formatMissionIngredientReward, getMissionRewardIngredient } from '@api/mock/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMissionCompleteMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { RewardIngredientBadge } from '../../shared/ui/RewardIngredientBadge';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionResultScreenProps = {
    mission: Mission;
    onApproved: () => void;
    onPressHome: () => void;
};

export function MissionResultScreen({ mission, onApproved, onPressHome }: MissionResultScreenProps) {
    const approvedRef = useRef(false);
    const rewardIngredient = getMissionRewardIngredient(mission.id);

    useEffect(() => {
        if (!approvedRef.current) {
            approvedRef.current = true;
            onApproved();
        }
    }, [onApproved]);

    return (
        <Screen scrollable>
            <View style={styles.body}>
                <GuideHero
                    message={getMissionCompleteMessage(formatMissionIngredientReward(mission.id))}
                    mood="happy"
                    align="start"
                />
                <View style={styles.card}>
                    <Txt typography="t1">{mission.emoji}</Txt>
                    <Txt typography="t5" fontWeight="bold" style={styles.title}>
                        {mission.title}
                    </Txt>
                    {rewardIngredient != null ? (
                        <RewardIngredientBadge ingredient={rewardIngredient} />
                    ) : null}
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
    note: {
        marginTop: 16,
        textAlign: 'center',
    },
    cta: {
        marginTop: 24,
    },
});
