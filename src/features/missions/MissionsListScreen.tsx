import { formatMissionIngredientReward } from '@api/mock/ingredients';
import { COOP_MISSIONS, DAILY_MISSIONS, missionStatusLabel, SPECIAL_MISSIONS } from '@api/mock/missions';
import type { CoopMission, Mission } from '@api/mock';
import { ListHeader, ListRow, Top, Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { missionStatusFor } from '../user/selectors';
import type { MissionProgressStatus } from '../user/types';
import {
    coopDifficultyLabel,
    coopUnlockHint,
    isCoopMissionUnlocked,
} from './coopMissionLogic';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { colors } from '../../shared/theme/colors';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
    onPressBack?: () => void;
};

function statusColor(status: MissionProgressStatus): 'green500' | 'blue500' | 'grey600' | 'red500' {
    if (status === 'completed') {
        return 'green500';
    }
    if (status === 'pending_review') {
        return 'grey600';
    }
    if (status === 'rejected') {
        return 'red500';
    }
    return 'blue500';
}

function MissionRow({
    mission,
    status,
    locked = false,
    rightOverride,
    onPress,
}: {
    mission: Mission;
    status: MissionProgressStatus;
    locked?: boolean;
    rightOverride?: string;
    onPress: () => void;
}) {
    const rightLabel =
        rightOverride ??
        (status === 'available'
            ? formatMissionIngredientReward(mission.id)
            : missionStatusLabel(status));

    return (
        <ListRow
            onPress={onPress}
            left={
                <ListRow.Icon
                    name={locked ? TDS_ICON.missionLock : TDS_ICON.missionCamera}
                    color={locked ? colors.textSecondary : undefined}
                />
            }
            contents={
                <ListRow.Texts
                    type="2RowTypeA"
                    top={mission.title}
                    topProps={{ fontWeight: 'bold', color: locked ? 'grey500' : undefined }}
                    bottom={locked ? (rightOverride ?? '잠김') : mission.description}
                    bottomProps={{ color: locked ? 'grey500' : undefined }}
                />
            }
            withArrow={!locked}
            right={
                <ListRow.RightTexts
                    type="1RowTypeA"
                    top={rightLabel}
                    topProps={{ color: locked ? 'grey500' : statusColor(status) }}
                />
            }
        />
    );
}

export function MissionsListScreen({ onPressMission, onPressBack }: MissionsListScreenProps) {
    const { state } = useUser();
    const toast = useAppToast();

    const handleCoopPress = (mission: CoopMission) => {
        if (!isCoopMissionUnlocked(state, mission)) {
            const hint = coopUnlockHint(mission);
            toast.show(hint ?? '이전 미션을 먼저 완료해 주세요.');
            return;
        }
        onPressMission(mission.id);
    };

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
            <ListHeader
                title={
                    <ListHeader.TitleParagraph typography="t5" fontWeight="semibold">
                        공동 미션
                    </ListHeader.TitleParagraph>
                }
                lower={
                    <ListHeader.DescriptionParagraph>
                        난이도 1부터 차례로 해금돼요. 파일럿에서는 난이도 1 미션부터 시작해요.
                    </ListHeader.DescriptionParagraph>
                }
            />
            {COOP_MISSIONS.map((mission) => {
                const unlocked = isCoopMissionUnlocked(state, mission);
                const status = missionStatusFor(state, mission.id);
                return (
                    <MissionRow
                        key={mission.id}
                        mission={mission}
                        status={status}
                        locked={!unlocked}
                        rightOverride={
                            unlocked
                                ? `${coopDifficultyLabel(mission.difficulty)} · ${formatMissionIngredientReward(mission.id)}`
                                : `잠금 · ${coopDifficultyLabel(mission.difficulty)}`
                        }
                        onPress={() => handleCoopPress(mission)}
                    />
                );
            })}
            <View style={styles.sectionGap} />
            <ListHeader
                title={
                    <ListHeader.TitleParagraph typography="t5" fontWeight="semibold">
                        일반 미션
                    </ListHeader.TitleParagraph>
                }
            />
            {DAILY_MISSIONS.map((mission) => (
                <MissionRow
                    key={mission.id}
                    mission={mission}
                    status={missionStatusFor(state, mission.id)}
                    onPress={() => onPressMission(mission.id)}
                />
            ))}
            <View style={styles.sectionGap} />
            <ListHeader
                title={
                    <ListHeader.TitleParagraph typography="t5" fontWeight="semibold">
                        특별 미션 (히든 재료)
                    </ListHeader.TitleParagraph>
                }
            />
            {SPECIAL_MISSIONS.map((mission) => (
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
    sectionGap: {
        height: 8,
    },
});
