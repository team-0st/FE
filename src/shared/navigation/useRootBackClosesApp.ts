import { closeView, useBackEvent } from '@granite-js/react-native';
import { useEffect } from 'react';

/**
 * 탭 루트 화면(홈/제작/가챠/레시피/마이)용.
 *
 * `navigationBar.withBackButton`은 앱 전체 static 설정이라 화면별로 back 버튼을
 * 숨길 수 없음 (`granite.config.ts` 참고).
 * 탭 루트에서는 스택에 쌓인 이전 화면이 없어서 back을 누르면 앱이 그대로 닫히는 게
 * 자연스러운데, 라우터 스택에 히스토리가 남아있으면 이상한 화면으로 튈 수 있어
 * 탭 루트에서는 back 이벤트를 가로채 `closeView`로 앱을 닫도록 고정한다.
 */
export function useRootBackClosesApp(): void {
    const backEvent = useBackEvent();

    useEffect(() => {
        const handleBack = () => {
            void closeView();
        };
        backEvent.addEventListener(handleBack);
        return () => {
            backEvent.removeEventListener(handleBack);
        };
    }, [backEvent]);
}
