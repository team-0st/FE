import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/** 주의 유도용 깜빡임 (opacity) */
export function useAttentionPulse(active: boolean) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!active) {
            opacity.setValue(1);
            return;
        }
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();
        return () => {
            animation.stop();
        };
    }, [active, opacity]);

    return opacity;
}
