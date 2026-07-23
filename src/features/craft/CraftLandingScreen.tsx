import { Button, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { FEATURE_HEADER_SLOT_HEIGHT } from '../../shared/constants/brandAssets';
import { CAULDRON_TIER_LAYERS, STIR_STICK_IMAGE } from '../../shared/constants/cauldronImages';
import { colors } from '../../shared/theme/colors';
import { CenteredFeatureStage } from '../../shared/ui/CenteredFeatureStage';
import { FixedHeightHeaderSlot } from '../../shared/ui/Screen';
import { CauldronStage } from './CauldronStage';
import { CRAFT_STAGE_ALIGNMENT } from './craftStageAlignment';

export { CRAFT_STAGE_ALIGNMENT };

type CraftLandingScreenProps = {
    onPressStart: () => void;
};

/**
 * 제작 탭 진입 시 항상 먼저 보이는 랜딩 화면. Skip 버튼 없음.
 * CTA를 누르면 재료 선택 화면(IngredientsScreen)으로 이동한다.
 */
export function CraftLandingScreen({ onPressStart }: CraftLandingScreenProps) {
    return (
        <View style={styles.root} accessibilityLabel="마녀스프 제작">
            <View style={styles.body} testID="craft-body">
                <FixedHeightHeaderSlot
                    height={FEATURE_HEADER_SLOT_HEIGHT}
                    testID="craft-header-slot"
                />
                <CenteredFeatureStage
                    testID="craft-centered-stage"
                    stageTestID="craft-stage-viewport"
                    belowTestID="craft-below"
                    stage={
                        <View style={{ transform: [{ translateY: CRAFT_STAGE_ALIGNMENT.translateY }] }}>
                            <CauldronStage
                                layers={{ soup: CAULDRON_TIER_LAYERS.normal.soup, stirStick: STIR_STICK_IMAGE }}
                                width={CRAFT_STAGE_ALIGNMENT.innerCanvasWidth}
                                stirring
                                accessibilityLabel="마녀의 마법 솥"
                            />
                        </View>
                    }
                    below={
                        <Txt typography="t6" color="grey600" style={styles.description}>
                            {'재료를 넣고 마녀의 솥에서\n스프를 만들어보세요.'}
                        </Txt>
                    }
                />
            </View>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    onPress={onPressStart}
                    accessibilityLabel="스프 만들기"
                >
                    스프 만들기
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
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
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
