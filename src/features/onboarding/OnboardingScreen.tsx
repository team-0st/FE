import { BottomCTA, Txt } from '@toss/tds-react-native';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { GUIDE_CHARACTER } from '../../shared/constants/guideCharacter';
import { ONBOARDING_GUIDE } from '../../shared/constants/guideCopy';
import { HOME_DECOR } from '../../shared/constants/homeDecorAssets';
import { useFloatAnimation } from '../../shared/hooks/useFloatAnimation';
import { colors } from '../../shared/theme/colors';
import { Screen } from '../../shared/ui/Screen';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';

type OnboardingScreenProps = {
    onPressStart: () => void;
};

/** Figma `01 온보딩 - 시작` — 마스코트 제로·스티 */
export function OnboardingScreen({ onPressStart }: OnboardingScreenProps) {
    const floatStyle = useFloatAnimation(true, 10);
    const heroSource = toBrandImageSource(HOME_DECOR.homeHero);

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
                                accessibilityLabel={GUIDE_CHARACTER.duoLabel}
                            />
                        ) : null}
                    </Animated.View>
                    <Txt typography="t7" fontWeight="semibold" color="grey500" style={styles.nameTag}>
                        {GUIDE_CHARACTER.name}
                    </Txt>
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
        gap: 16,
        paddingBottom: 24,
    },
    /** 듀오 가로형 */
    hero: {
        width: 220,
        height: 164,
    },
    nameTag: {
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        lineHeight: 32,
        maxWidth: 311,
        marginTop: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
});
