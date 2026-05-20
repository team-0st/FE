import { DAILY_MISSIONS, missionStatusLabel, WEEKLY_MISSIONS } from '@api/mock';
import type { Mission } from '@api/mock';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { missionStatusFor } from '../user/selectors';
import type { MissionProgressStatus } from '../user/types';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionTab = 'daily' | 'weekly';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
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
    const rightLabel = status === 'available' ? `+${mission.points}P` : missionStatusLabel(status);

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

export function MissionsListScreen({ onPressMission }: MissionsListScreenProps) {
    const { state } = useUser();
    const [tab, setTab] = useState<MissionTab>('daily');
    const missions = tab === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS;

    return (
        <Screen>
            <Top
                title={<Top.TitleParagraph size={22}>미션</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>완료하면 포인트와 팀 기여도가 쌓여요.</Top.SubtitleParagraph>
                }
            />
            <View style={styles.tabs}>
                <Pressable
                    onPress={() => setTab('daily')}
                    style={[styles.tab, tab === 'daily' && styles.tabActive]}
                >
                    <Txt typography="t6" fontWeight={tab === 'daily' ? 'bold' : 'regular'}>
                        데일리
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setTab('weekly')}
                    style={[styles.tab, tab === 'weekly' && styles.tabActive]}
                >
                    <Txt typography="t6" fontWeight={tab === 'weekly' ? 'bold' : 'regular'}>
                        위클리
                    </Txt>
                </Pressable>
            </View>
            {missions.map((mission) => (
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
    tabs: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabActive: {
        borderColor: colors.primary,
        backgroundColor: '#E8F3FF',
    },
});
