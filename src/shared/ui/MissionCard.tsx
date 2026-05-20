import { Badge, Txt } from '@toss/tds-react-native';
import type { Mission } from '@api/mock';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type MissionCardProps = {
    mission: Mission;
    onPress: () => void;
};

export function MissionCard({ mission, onPress }: MissionCardProps) {
    return (
        <Pressable onPress={onPress} style={styles.card}>
            <Txt typography="t1">{mission.emoji}</Txt>
            <Txt typography="t6" fontWeight="bold" numberOfLines={2} style={styles.title}>
                {mission.title}
            </Txt>
            <Txt typography="t7" color="grey600" numberOfLines={2}>
                {mission.description}
            </Txt>
            <View style={styles.footer}>
                <Badge size="tiny" badgeStyle="weak" type={mission.completed ? 'green' : 'blue'}>
                    {mission.completed ? '완료' : `+${mission.points}P`}
                </Badge>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 156,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginRight: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        marginTop: 8,
        marginBottom: 4,
    },
    footer: {
        marginTop: 10,
    },
});
