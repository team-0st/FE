import { Button, TextButton } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
    SHARE_REWARD_ALREADY_CLAIMED_MESSAGE,
    SHARE_REWARD_ECO_JAM_AMOUNT,
    SHARE_REWARD_SUCCESS_MESSAGE,
} from '../constants/shareRewardPolicy';
import { shareZerostResult } from '../feedback/shareResult';
import { useAppToast } from '../feedback/useAppToast';
import { useUser } from '../../features/user/UserProvider';
import { formatDateKey } from '../../features/user/userStateLogic';

type ShareResultButtonProps = {
    message: string;
    label?: string;
    /** false면 공유만 (보상 없음) */
    rewardEnabled?: boolean;
    /**
     * `block`: BottomCTA 안 큰 버튼 (기본)
     * `text`: TDS TextButton — 가챠 등 보조 액션용
     */
    presentation?: 'block' | 'text';
};

export function ShareResultButton({
    message,
    label,
    rewardEnabled = true,
    presentation = 'block',
}: ShareResultButtonProps) {
    const toast = useAppToast();
    const { state, claimShareReward } = useUser();
    const [sharing, setSharing] = useState(false);

    const today = formatDateKey(new Date());
    const rewardAvailable =
        rewardEnabled && state.lastShareRewardDate !== today;

    const buttonLabel = useMemo(() => {
        if (label != null) {
            return label;
        }
        if (rewardAvailable) {
            return `친구에게 공유하고 에코잼 ${SHARE_REWARD_ECO_JAM_AMOUNT}개 받기`;
        }
        return '친구에게 결과 공유하기';
    }, [label, rewardAvailable]);

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
            if (!rewardEnabled) {
                toast.showSuccess('공유했어요!');
                return;
            }
            const reward = await claimShareReward();
            if (reward.ok) {
                toast.showSuccess(SHARE_REWARD_SUCCESS_MESSAGE(reward.ecoJamGranted));
                return;
            }
            if (reward.reason === 'already_claimed_today') {
                toast.show(SHARE_REWARD_ALREADY_CLAIMED_MESSAGE);
                return;
            }
            toast.showSuccess('공유했어요!');
        } catch {
            toast.show('공유를 취소했어요.');
        } finally {
            setSharing(false);
        }
    }, [claimShareReward, message, rewardEnabled, sharing, toast]);

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
