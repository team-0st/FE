import { formatMissionIngredientReward } from '@api/mock/ingredients';
import { DAILY_MISSIONS, missionStatusLabel } from '@api/mock/missions';
import type { Mission } from '@api/mock';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useUser } from '../user/UserProvider';
import { missionStatusFor } from '../user/selectors';
import type { MissionProgressStatus } from '../user/types';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
    onPressBack?: () => void;
};

function statusColor(status: MissionProgressStatus): 'green500' | 'blue500' | 'grey500' {
    if (status === 'completed') {
        return 'green500';
    }
    if (status === 'pending_review') {
        return 'grey500';
    }
    return 'blue500';
}

function MissionRow({
    mission,
    status,
    onPress,
}: {
    mission: Mission;
    status: MissionProgressStatus;
    onPress: () => void;
}) {
    const rightLabel =
        status === 'available' ? formatMissionIngredientReward(mission.id) : missionStatusLabel(status);

    return (
        <ListRow
            onPress={onPress}
            left={<ListRow.Icon name="icon-leaf-mono" />}
            contents={
                <ListRow.Texts
                    type="2RowTypeA"
                    top={`${mission.emoji} ${mission.title}`}
                    topProps={{ fontWeight: 'bold' }}
                    bottom={mission.description}
                />
            }
            right={
                <ListRow.RightTexts
                    type="1RowTypeA"
                    top={rightLabel}
                    topProps={{ color: statusColor(status) }}
                />
            }
        />
    );
}

export function MissionsListScreen({ onPressMission, onPressBack }: MissionsListScreenProps) {
    const { state } = useUser();

    return (
        <Screen scrollable>
            {onPressBack != null ? (
                <Pressable onPress={onPressBack} style={styles.back} accessibilityRole="button">
                    <Txt typography="t6" color="blue500">
                        ← 홈
                    </Txt>
                </Pressable>
            ) : null}
            <Top
                title={<Top.TitleParagraph size={22}>오늘의 미션</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>미션을 완료하면 재료가 쌓여요.</Top.SubtitleParagraph>
                }
            />
            <GuideHero
                message="텀블러, 장바구니, 대중교통처럼 일상에서 할 수 있는 미션이에요."
                align="start"
                compact
            />
            {DAILY_MISSIONS.map((mission) => (
                <MissionRow
                    key={mission.id}
                    mission={mission}
                    status={missionStatusFor(state, mission.id)}
                    onPress={() => onPressMission(mission.id)}
                />
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    back: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        marginBottom: 4,
    },
});
