import { createRoute } from '@granite-js/react-native';
import { DEFAULT_PILOT_SHOP_ID } from '@api/mock/shops';
import {
    OnboardingProfileScreen,
    type OnboardingProfilePayload,
} from '../../src/features/onboarding/OnboardingProfileScreen';
import { useUser } from '../../src/features/user/UserProvider';
import {
    navigateHomeClearingOnboarding,
    useRedirectHomeIfOnboarded,
} from '../../src/shared/navigation/onboardingNavigation';
import {
    ONBOARDING_SYNC_FAILED_MESSAGE,
    REGISTER_FAILED_MESSAGE,
} from '../../src/shared/feedback/messages';
import { useAppToast } from '../../src/shared/feedback/useAppToast';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/onboarding/profile', {
    component: Page,
});

/** 레거시 기본 닉네임 — 입력란에 미리 채우지 않음 */
function nicknameForOnboardingField(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed === '사용자') {
        return '';
    }
    return trimmed;
}

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state, saveOnboardingProfile, finishOnboarding } = useUser();
    const { showError } = useAppToast();

    useRedirectHomeIfOnboarded(navigation, isReady, state.onboardingCompleted);

    const handleComplete = async (payload: OnboardingProfilePayload) => {
        await saveOnboardingProfile(payload);
        // 당분간 샵 선택 온보딩 생략 — 파일럿 단골 샵으로 완료
        const result = await finishOnboarding(DEFAULT_PILOT_SHOP_ID);
        if (!result.ok) {
            showError(
                result.code === 'NOT_READY'
                    ? REGISTER_FAILED_MESSAGE
                    : ONBOARDING_SYNC_FAILED_MESSAGE,
            );
            return;
        }
        navigateHomeClearingOnboarding(navigation);
    };

    if (!isReady) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    if (state.onboardingCompleted) {
        return null;
    }

    return (
        <OnboardingProfileScreen
            initialNickname={nicknameForOnboardingField(state.nickname)}
            onComplete={handleComplete}
        />
    );
}
