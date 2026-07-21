import { useCallback, useEffect, useRef, useState } from 'react';
import {
    DEFAULT_SKIP_CRAFT_ANIMATION,
    readSkipCraftAnimation,
    writeSkipCraftAnimation,
} from './craftAnimationSkipPreference';

/**
 * 제작 애니메이션 건너뛰기 설정. 기본 false, Apps in Toss Storage에 저장해 앱 재실행 후에도 유지한다.
 */
export function useCraftSkipAnimationPreference() {
    const [skip, setSkipState] = useState(DEFAULT_SKIP_CRAFT_ANIMATION);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        void readSkipCraftAnimation()
            .then((stored) => {
                if (mountedRef.current) {
                    setSkipState(stored);
                }
            })
            .catch(() => {
                if (mountedRef.current) {
                    setSkipState(DEFAULT_SKIP_CRAFT_ANIMATION);
                }
            });
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const setSkip = useCallback((value: boolean) => {
        setSkipState(value);
        void writeSkipCraftAnimation(value);
    }, []);

    return { skip, setSkip };
}
