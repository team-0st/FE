import { Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';

type LoginScreenProps = {
    onPressBack: () => void;
};

export function LoginScreen({ onPressBack }: LoginScreenProps) {
    return (
        <Screen>
            <View style={styles.content}>
                <Txt typography="t2" fontWeight="bold">
                    토스 로그인
                </Txt>
                <Txt typography="t6" color="grey600">
                    BE 연동 후 사용할 화면이에요.
                </Txt>
                <Button size="large" type="primary" onPress={onPressBack}>
                    홈으로
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },
});
