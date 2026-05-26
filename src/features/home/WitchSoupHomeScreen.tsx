import { getTodayRecipeHint } from '@api/mock/recipes';
import { Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type WitchSoupHomeScreenProps = {
    onPressMissions: () => void;
};

export function WitchSoupHomeScreen({ onPressMissions }: WitchSoupHomeScreenProps) {
    const { state } = useUser();
    const hint = getTodayRecipeHint();

    return (
        <Screen scrollable contentCentered>
            <View style={styles.stage}>
                <Txt typography="t1" style={styles.witch}>
                    🐱‍👤
                </Txt>
                <Txt typography="t7" color="grey600">
                    마녀의 주방
                </Txt>
                <View style={styles.pot}>
                    <Txt typography="t1">🍲</Txt>
                    <Txt typography="t7" color="grey500">
                        휘리릭…
                    </Txt>
                </View>
                <View style={styles.hintBox}>
                    <Txt typography="t7" fontWeight="semibold" style={{ color: colors.primary }}>
                        오늘의 레시피 힌트
                    </Txt>
                    <Txt typography="t6" color="grey700" style={styles.hintText}>
                        {hint}
                    </Txt>
                </View>
                <Txt typography="t7" color="grey600">
                    {`에코잼 ${state.ecoJam}잼`}
                </Txt>
            </View>
            <Button size="large" type="primary" display="block" onPress={onPressMissions}>
                오늘 미션 하고 재료 받기
            </Button>
        </Screen>
    );
}

const styles = StyleSheet.create({
    stage: {
        alignItems: 'center',
        width: '100%',
        paddingVertical: 24,
        gap: 12,
    },
    witch: {
        marginBottom: 4,
    },
    pot: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primaryLight,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    hintBox: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 6,
    },
    hintText: {
        textAlign: 'center',
        lineHeight: 22,
    },
});
