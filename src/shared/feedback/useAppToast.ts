import { useToast } from '@toss/tds-react-native';
import { useCallback, useMemo } from 'react';

export function useAppToast() {
    const toast = useToast();

    const show = useCallback(
        (message: string, duration = 2800) => {
            // 하단 탭바·홈 인디케이터에 가리지 않도록 상단 노출
            toast.open(message, { duration, type: 'top' });
        },
        [toast],
    );

    const showSuccess = useCallback(
        (message: string) => {
            show(message, 2600);
        },
        [show],
    );

    const showError = useCallback(
        (message: string) => {
            show(message, 3200);
        },
        [show],
    );

    return useMemo(() => ({ show, showSuccess, showError }), [show, showSuccess, showError]);
}
