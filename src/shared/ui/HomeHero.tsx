import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { AnimalTeamId } from '../constants/animalTeams';
import { APP_DISPLAY_NAME } from '../constants/app';
import { colors } from '../theme/colors';
import { TeamAvatar } from './TeamAvatar';

type HomeHeroProps = {
    nickname: string;
    totalPoints: number;
    streakDays: number;
    teamId: AnimalTeamId | null;
    teamEmoji: string;
    teamName: string;
};

export function HomeHero({
    nickname,
    totalPoints,
    streakDays,
    teamId,
    teamEmoji,
    teamName,
}: HomeHeroProps) {
    return (
        <View style={styles.hero}>
            <View style={styles.textBlock}>
                <Txt typography="t7" color="grey600">
                    {APP_DISPLAY_NAME}
                </Txt>
                <Txt typography="t3" fontWeight="bold" style={styles.title}>
                    {`${nickname}님`}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {`누적 ${totalPoints}P · 연속 ${streakDays}일`}
                </Txt>
            </View>
            {teamId != null ? (
                <View style={styles.teamBadge}>
                    <TeamAvatar animalId={teamId} emoji={teamEmoji} size="medium" />
                    <Txt typography="t7" color="grey600" style={styles.teamLabel}>
                        {`${teamName} 팀`}
                    </Txt>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.sproutTint,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        marginTop: 4,
        marginBottom: 4,
    },
    teamBadge: {
        alignItems: 'center',
        gap: 4,
    },
    teamLabel: {
        marginTop: 4,
    },
});
