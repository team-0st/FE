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
                    {'곧 토스 로그인으로 이어질 예정이에요.\n지금은 홈으로 돌아가 주세요.'}
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
