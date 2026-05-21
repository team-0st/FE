import type { Mission } from '@api/mock';
import { Button, Txt } from '@toss/tds-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { getMissionCompleteMessage } from '../../shared/constants/guideCopy';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { RewardPointsBadge } from '../../shared/ui/RewardPointsBadge';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionResultScreenProps = {
    mission: Mission;
    onApproved: () => void;
    onPressHome: () => void;
};

export function MissionResultScreen({ mission, onApproved, onPressHome }: MissionResultScreenProps) {
    const approvedRef = useRef(false);

    useEffect(() => {
        if (!approvedRef.current) {
            approvedRef.current = true;
            onApproved();
        }
    }, [onApproved]);

    return (
        <Screen scrollable>
            <View style={styles.body}>
                <GuideDialogue message={getMissionCompleteMessage(mission.points)} mood="happy" />
                <View style={styles.card}>
                    <Txt typography="t1">{mission.emoji}</Txt>
                    <Txt typography="t5" fontWeight="bold" style={styles.title}>
                        {mission.title}
                    </Txt>
                    <RewardPointsBadge points={mission.points} />
                    <Txt typography="t7" color="grey600" style={styles.note}>
                        실제 서비스에서는 검수 후 포인트가 지급돼요.
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
