import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useFloatAnimation(enabled = true, distance = 8) {
    const translateY = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -distance,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();
        return () => {
            animation.stop();
            translateY.stopAnimation();
        };
    }, [distance, enabled, translateY]);
    return { transform: [{ translateY }] };
}
