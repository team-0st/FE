import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { CAULDRON_TIER_LAYERS, STIR_STICK_IMAGE } from '../../shared/constants/cauldronImages';
import { colors } from '../../shared/theme/colors';
import { Screen } from '../../shared/ui/Screen';
import { CauldronStage } from './CauldronStage';

const STAGE_WIDTH = 220;

type CraftLandingScreenProps = {
    onPressStart: () => void;
};

/**
 * 제작 탭 진입 시 항상 먼저 보이는 랜딩 화면. Skip 버튼 없음.
 * CTA를 누르면 재료 선택 화면(IngredientsScreen)으로 이동한다.
 */
export function CraftLandingScreen({ onPressStart }: CraftLandingScreenProps) {
    return (
        <View style={styles.root}>
            <Screen scrollable contentCentered>
                <Top
                    title={<Top.TitleParagraph size={22}>마녀의 마법 솥 🧙‍♀️</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>오늘의 제로웨이스트 요리를 시작해요</Top.SubtitleParagraph>
                    }
                />
                <View style={styles.stageWrap}>
                    <CauldronStage
                        layers={{ soup: CAULDRON_TIER_LAYERS.normal.soup, stirStick: STIR_STICK_IMAGE }}
                        width={STAGE_WIDTH}
                        stirring
                        accessibilityLabel="마녀의 마법 솥"
                    />
                </View>
                <Txt typography="t6" color="grey600" style={styles.description}>
                    {'재료를 넣고 마녀의 솥에서\n스프를 만들어보세요.'}
                </Txt>
            </Screen>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    onPress={onPressStart}
                    accessibilityLabel="스프 만들기"
                >
                    🍲 스프 만들기
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    stageWrap: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 16,
    },
    description: {
        textAlign: 'center',
        marginTop: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 8,
        backgroundColor: colors.background,
    },
});
