import { mockTeams, mockUser } from '@api/mock';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { ZodiacId } from '../../shared/constants/zodiac';
import { Screen } from '../../shared/ui/Screen';
import { TeamAvatar } from '../../shared/ui/TeamAvatar';
import { colors } from '../../shared/theme/colors';

export function TeamScreen() {
    const myTeam = mockTeams.find((team) => team.name === mockUser.teamName) ?? mockTeams[0];

    return (
        <Screen scrollable>
            <Top
                title={
                    <Top.TitleParagraph size={22}>
                        {myTeam != null ? `${myTeam.name}띠` : mockUser.teamName}
                    </Top.TitleParagraph>
                }
                subtitle2={<Top.SubtitleParagraph>십이지신 팀 · 주간 포인트를 함께 모아요</Top.SubtitleParagraph>}
            />
            {myTeam != null ? (
                <View style={styles.avatarRow}>
                    <TeamAvatar zodiacId={myTeam.id as ZodiacId} emoji={myTeam.emoji} size="medium" />
                </View>
            ) : null}
            <View style={styles.summary}>
                <Txt typography="t6" color="grey600">
                    이번 주 팀 포인트
                </Txt>
                <Txt typography="t2" fontWeight="bold">
                    {myTeam?.weeklyPoints ?? 0}P
                </Txt>
                <Txt typography="t6" color="blue500">
                    현재 {myTeam?.rank ?? '-'}위
                </Txt>
            </View>
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                다른 팀
            </Txt>
            {mockTeams.map((team) => (
                <ListRow
                    key={team.id}
                    left={
                        <TeamAvatar zodiacId={team.id as ZodiacId} emoji={team.emoji} size="small" />
                    }
                    contents={
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={`${team.name}띠`}
                            topProps={{ fontWeight: 'bold' }}
                            bottom={`${team.memberCount}명 · ${team.weeklyPoints}P`}
                        />
                    }
                    right={
                        <ListRow.RightTexts type="1RowTypeA" top={`${team.rank}위`} topProps={{ color: 'grey600' }} />
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
        marginBottom: 20,
        gap: 4,
    },
    section: {
        marginBottom: 8,
    },
});
