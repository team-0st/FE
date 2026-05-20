import { mockTeams } from '@api/mock';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import { useUser } from '../user/UserProvider';
import { Screen } from '../../shared/ui/Screen';
import { TeamAvatar } from '../../shared/ui/TeamAvatar';
import { colors } from '../../shared/theme/colors';

type TeamScreenProps = {
    onPressSelectTeam: () => void;
};

export function TeamScreen({ onPressSelectTeam }: TeamScreenProps) {
    const { state } = useUser();
    const myTeam =
        state.teamId != null
            ? mockTeams.find((team) => team.id === state.teamId)
            : undefined;
    const displayTeam = myTeam ?? mockTeams[0];

    return (
        <Screen scrollable>
            <Top
                title={
                    <Top.TitleParagraph size={22}>
                        {displayTeam != null ? `${displayTeam.name} 팀` : '팀 미선택'}
                    </Top.TitleParagraph>
                }
                subtitle2={
                    <Top.SubtitleParagraph>동물 팀 · 주간 포인트를 함께 모아요</Top.SubtitleParagraph>
                }
            />
            {displayTeam != null ? (
                <View style={styles.avatarRow}>
                    <TeamAvatar
                        animalId={displayTeam.id as AnimalTeamId}
                        emoji={displayTeam.emoji}
                        size="medium"
                    />
                </View>
            ) : null}
            <View style={styles.summary}>
                <Txt typography="t6" color="grey600">
                    이번 주 팀 포인트
                </Txt>
                <Txt typography="t2" fontWeight="bold">
                    {displayTeam?.weeklyPoints ?? 0}P
                </Txt>
                <Txt typography="t6" color="blue500">
                    현재 {displayTeam?.rank ?? '-'}위
                </Txt>
            </View>
            <Button size="medium" type="dark" style="weak" onPress={onPressSelectTeam}>
                동물 팀 바꾸기
            </Button>
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                전체 동물 팀
            </Txt>
            {mockTeams.map((team) => (
                <ListRow
                    key={team.id}
                    left={
                        <TeamAvatar animalId={team.id as AnimalTeamId} emoji={team.emoji} size="small" />
                    }
                    contents={
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={`${team.name} 팀`}
                            topProps={{ fontWeight: 'bold' }}
                            bottom={`${team.memberCount}명 · ${team.weeklyPoints}P`}
                        />
                    }
                    right={
                        <ListRow.RightTexts
                            type="1RowTypeA"
                            top={`${team.rank}위`}
                            topProps={{ color: 'grey600' }}
                        />
                    }
                />
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    avatarRow: {
        alignItems: 'center',
        marginBottom: 16,
    },
    summary: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        gap: 4,
    },
    section: {
        marginTop: 8,
        marginBottom: 8,
    },
});
