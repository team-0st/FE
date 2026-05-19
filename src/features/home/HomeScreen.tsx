import { Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';

type HomeScreenProps = {
  onPressLogin: () => void;
};

export function HomeScreen({ onPressLogin }: HomeScreenProps) {
  return (
    <Screen>
      <View style={styles.content}>
        <Txt typography="t1" fontWeight="bold">
          제로스타트
        </Txt>
        <Txt typography="t5" color="grey600" style={styles.subtitle}>
          Granite + Apps in Toss + TDS foundation
        </Txt>
        <Button size="large" onPress={onPressLogin}>
          로그인 화면으로
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
  subtitle: {
    marginBottom: 8,
  },
});
