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
          BE 연동 전 플레이스홀더 화면입니다. 샌드박스에서 Toss 로그인 플로우를
          검증하세요.
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
