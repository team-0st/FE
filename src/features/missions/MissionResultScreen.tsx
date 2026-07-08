import type { Mission } from '@api/mock';
import {
    formatIngredientReward,
    getMissionRewardIngredient,
} from '@api/mock/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { getMissionCompleteMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { RewardIngredientBadge } from '../../shared/ui/RewardIngredientBadge';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';

type MissionResultScreenProps = {
    mission: Mission;
    onPressHome: () => void;
};

export function MissionResultScreen({ mission, onPressHome }: MissionResultScreenProps) {
    const { state } = useUser();
    const progress = state.missionProgress[mission.id];
    const isPending = progress?.status === 'pending_review';
    const rewardIngredient = getMissionRewardIngredient(
        mission.id,
        progress?.rewardIngredientId,
    );
    const rewardLabel =
        rewardIngredient != null
            ? formatIngredientReward(rewardIngredient.id)
            : '랜덤 재료';

    return (
        <Screen scrollable>
            <View style={styles.body}>
                <GuideHero
                    message={
                        isPending
                            ? '인증 사진을 제출했어요.\n검수가 끝나면 재료를 받을 수 있어요.'
                            : getMissionCompleteMessage(rewardLabel)
                    }
                    mood={isPending ? 'think' : 'happy'}
                    align="start"
                />
                <View style={styles.card}>
                    <Txt typography="t1">{mission.emoji}</Txt>
                    <Txt typography="t5" fontWeight="bold" style={styles.title}>
                        {mission.title}
                    </Txt>
                    {isPending ? (
                        <Txt typography="t7" color="grey600" style={styles.note}>
                            보통 몇 시간 안에 검수가 완료돼요. 마이페이지에서 상태를 확인할 수 있어요.
                        </Txt>
                    ) : null}
                    {!isPending && rewardIngredient != null ? (
                        <RewardIngredientBadge ingredient={rewardIngredient} />
                    ) : null}
                    {!isPending ? (
                        <Txt typography="t7" color="grey600" style={styles.note}>
                            재료는 제작 탭에서 스프를 끓일 때 사용해요.
                        </Txt>
                    ) : null}
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
