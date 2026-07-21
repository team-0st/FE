import { Button, TextButton } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { shareZerostResult } from '../feedback/shareResult';
import { useAppToast } from '../feedback/useAppToast';

type ShareResultButtonProps = {
    message: string;
    label?: string;
    /**
     * `block`: BottomCTA 안 큰 버튼 (기본)
     * `text`: TDS TextButton — 가챠 등 보조 액션용
     */
    presentation?: 'block' | 'text';
};

/**
 * 공유 성공 검증 서버 API가 아직 없어 에코잼 보상 없이 공유만 수행한다.
 * (보상 문구·지급 로직은 서버 검증 연동 전까지 노출하지 않는다)
 */
export function ShareResultButton({
    message,
    label,
    presentation = 'block',
}: ShareResultButtonProps) {
    const toast = useAppToast();
    const [sharing, setSharing] = useState(false);

    const buttonLabel = label ?? '친구에게 결과 공유하기';

    const onPress = useCallback(async () => {
        if (sharing) {
            return;
        }
        setSharing(true);
        try {
            const shared = await shareZerostResult(message);
            if (!shared) {
                toast.show('공유를 취소했어요.');
                return;
            }
            toast.showSuccess('공유했어요!');
        } catch {
            toast.show('공유를 취소했어요.');
        } finally {
            setSharing(false);
        }
    }, [message, sharing, toast]);

    if (presentation === 'text') {
        return (
            <TextButton
                typography="t6"
                fontWeight="semibold"
                variant="underline"
                disabled={sharing}
                onPress={() => void onPress()}
            >
                {buttonLabel}
            </TextButton>
        );
    }

    return (
        <Button
            size="medium"
            type="primary"
            style="weak"
            display="block"
            disabled={sharing}
            onPress={() => void onPress()}
        >
            {buttonLabel}
        </Button>
    );
}
