import { BottomCTA, Txt } from '@toss/tds-react-native';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { BRAND_ASSET } from '../../shared/constants/brandAssets';
import { ONBOARDING_GUIDE } from '../../shared/constants/guideCopy';
import { useFloatAnimation } from '../../shared/hooks/useFloatAnimation';
import { colors } from '../../shared/theme/colors';
import { Screen } from '../../shared/ui/Screen';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';

type OnboardingScreenProps = {
    onPressStart: () => void;
};

/** Figma `01 온보딩 - 시작` (WSJgAg2xe1eSESfkzaWzXV / 26:3476) */
export function OnboardingScreen({ onPressStart }: OnboardingScreenProps) {
    const floatStyle = useFloatAnimation(true, 10);
    const heroSource = toBrandImageSource(BRAND_ASSET.mascotCarrot);

    return (
        <Screen>
            <View style={styles.root}>
                <View style={styles.stage}>
                    <Animated.View style={floatStyle}>
                        {heroSource != null ? (
                            <Image
                                source={heroSource}
                                style={styles.hero}
                                resizeMode="contain"
                                accessibilityLabel="제로스트 당근"
                            />
                        ) : null}
                    </Animated.View>
                    <Txt typography="t4" fontWeight="medium" color="grey800" style={styles.message}>
                        {ONBOARDING_GUIDE.intro}
                    </Txt>
                </View>
                <View style={styles.footer}>
                    <BottomCTA.Single
                        size="large"
                        type="primary"
                        display="block"
                        onPress={onPressStart}
                        accessibilityLabel="시작하기"
                    >
                        시작하기
                    </BottomCTA.Single>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    stage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 40,
        paddingBottom: 24,
    },
    /** Figma Frame 26:3630 — 140×140 */
    hero: {
        width: 140,
        height: 140,
    },
    message: {
        textAlign: 'center',
        lineHeight: 32,
        maxWidth: 311,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
});
