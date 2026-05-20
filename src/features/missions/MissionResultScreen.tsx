import type { Mission } from '@api/mock';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>미션 완료</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>MVP에서는 제출 즉시 포인트가 반영돼요.</Top.SubtitleParagraph>}
                />
                <View style={styles.card}>
                    <Txt typography="t1">{mission.emoji}</Txt>
                    <Txt typography="t5" fontWeight="bold" style={styles.title}>
                        {mission.title}
                    </Txt>
                    <Txt typography="t4" fontWeight="bold" color="blue500">
                        +{mission.points}P
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.note}>
                        실제 서비스에서는 검수 후 포인트가 지급됩니다.
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
        paddingHorizontal: 20,
    },
    card: {
        marginTop: 24,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    title: {
        marginTop: 12,
        marginBottom: 8,
    },
    note: {
        marginTop: 16,
        textAlign: 'center',
    },
    cta: {
        padding: 20,
    },
});
