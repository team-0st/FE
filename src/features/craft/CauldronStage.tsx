import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { CAULDRON_BASE_IMAGE, CAULDRON_LAYER_ASPECT_RATIO } from '../../shared/constants/cauldronImages';

export type CauldronStageLayers = {
    soup: { uri: string };
    stirStick?: { uri: string } | null;
    glow?: { uri: string } | null;
    sparkle?: { uri: string } | null;
};

type CauldronStageProps = {
    layers: CauldronStageLayers;
    /** 가로 크기(px). 세로는 600x600 비율로 계산한다. */
    width?: number;
    /** 저어주기 단계 — stir_stick·soup에 약한 움직임을 준다 */
    stirring?: boolean;
    /** 완성 단계 — glow·sparkle을 한 번 강조한다 */
    emphasize?: boolean;
    accessibilityLabel?: string;
};

const DEFAULT_WIDTH = 220;

/**
 * 가마솥 레이어 합성 스테이지.
 * 레이어 순서(아래→위): glow → cauldron_base → soup → stir_stick → sparkle.
 */
export function CauldronStage({
    layers,
    width = DEFAULT_WIDTH,
    stirring = false,
    emphasize = false,
    accessibilityLabel,
}: CauldronStageProps) {
    const height = width / CAULDRON_LAYER_ASPECT_RATIO;

    const stirTilt = useRef(new Animated.Value(0)).current;
    const soupPulse = useRef(new Animated.Value(1)).current;
    const emphasizeScale = useRef(new Animated.Value(1)).current;
    const emphasizeOpacity = useRef(new Animated.Value(0.82)).current;

    useEffect(() => {
        if (!stirring) {
            return;
        }
        const tiltLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(stirTilt, { toValue: 1, duration: 460, useNativeDriver: true }),
                Animated.timing(stirTilt, { toValue: -1, duration: 460, useNativeDriver: true }),
            ]),
            { resetBeforeIteration: false },
        );
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(soupPulse, { toValue: 1.03, duration: 620, useNativeDriver: true }),
                Animated.timing(soupPulse, { toValue: 1, duration: 620, useNativeDriver: true }),
            ]),
            { resetBeforeIteration: false },
        );
        tiltLoop.start();
        pulseLoop.start();
        return () => {
            tiltLoop.stop();
            pulseLoop.stop();
        };
    }, [stirring, stirTilt, soupPulse]);

    useEffect(() => {
        if (!emphasize) {
            return;
        }
        emphasizeScale.setValue(1);
        emphasizeOpacity.setValue(0.82);
        Animated.parallel([
            Animated.sequence([
                Animated.timing(emphasizeScale, { toValue: 1.1, duration: 260, useNativeDriver: true }),
                Animated.timing(emphasizeScale, { toValue: 1, duration: 340, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.timing(emphasizeOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
                Animated.timing(emphasizeOpacity, { toValue: 0.88, duration: 340, useNativeDriver: true }),
            ]),
        ]).start();
    }, [emphasize, emphasizeScale, emphasizeOpacity]);

    const stirRotate = stirTilt.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-8deg', '0deg', '8deg'],
    });

    return (
        <View
            style={[styles.stage, { width, height }]}
            accessible
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
        >
            {layers.glow != null ? (
                <Animated.Image
                    source={layers.glow}
                    resizeMode="contain"
                    accessible={false}
                    style={[
                        StyleSheet.absoluteFill,
                        { opacity: emphasizeOpacity, transform: [{ scale: emphasizeScale }] },
                    ]}
                />
            ) : null}
            <Image
                source={CAULDRON_BASE_IMAGE}
                resizeMode="contain"
                accessible={false}
                style={StyleSheet.absoluteFill}
            />
            <Animated.Image
                source={layers.soup}
                resizeMode="contain"
                accessible={false}
                style={[StyleSheet.absoluteFill, { transform: [{ scale: soupPulse }] }]}
            />
            {layers.stirStick != null ? (
                <Animated.Image
                    source={layers.stirStick}
                    resizeMode="contain"
                    accessible={false}
                    style={[StyleSheet.absoluteFill, { transform: [{ rotate: stirRotate }] }]}
                />
            ) : null}
            {layers.sparkle != null ? (
                <Animated.Image
                    source={layers.sparkle}
                    resizeMode="contain"
                    accessible={false}
                    style={[
                        StyleSheet.absoluteFill,
                        { opacity: emphasizeOpacity, transform: [{ scale: emphasizeScale }] },
                    ]}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    stage: {
        alignSelf: 'center',
    },
});
