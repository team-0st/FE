import type { Mission } from '@api/mock';
import { getMissionRewardIngredient } from '@api/mock/ingredients';
import { missionStatusLabel } from '@api/mock/missions';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import type { MissionProgressStatus } from '../user/types';
import { GuideHero } from '../../shared/ui/GuideHero';
import { RewardIngredientBadge } from '../../shared/ui/RewardIngredientBadge';
import { Screen } from '../../shared/ui/Screen';

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    onPressVerify: () => void;
};

export function MissionDetailScreen({ mission, status, onPressVerify }: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isPending = status === 'pending_review';
    const rewardIngredient = getMissionRewardIngredient(mission.id);

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <Txt typography="t1">{mission.emoji}</Txt>
                <Top
                    title={<Top.TitleParagraph size={22}>{mission.title}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
            </View>
            <GuideHero
                message={getMissionVerifyMessage(mission.authHint)}
                mood="think"
                align="start"
                compact
            />
            {rewardIngredient != null ? <RewardIngredientBadge ingredient={rewardIngredient} /> : null}
            <View style={styles.note}>
                <Txt typography="t7" color="grey500">
                    사진을 올리면 검수 후 재료가 지급돼요.
                </Txt>
                {isPending ? (
                    <Txt typography="t6" color="grey600" style={styles.status}>
                        {missionStatusLabel(status)}
                    </Txt>
                ) : null}
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={isCompleted || isPending}
                    onPress={onPressVerify}
                >
                    {isCompleted ? '이미 완료한 미션' : isPending ? '검수 중' : '인증하기'}
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        paddingTop: 8,
    },
    note: {
        marginTop: 16,
        gap: 8,
    },
    status: {
        marginTop: 4,
    },
    cta: {
        marginTop: 24,
    },
});
