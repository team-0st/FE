import { createRoute } from '@granite-js/react-native';
import { OnboardingSurveyListScreen } from '../../src/features/onboarding/OnboardingSurveyListScreen';
import { INTEREST_OPTIONS } from '../../src/features/onboarding/surveyOptions';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/interest', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { saveOnboarding } = useUser();

    return (
        <OnboardingSurveyListScreen
            title="지금 상황에 가장 가까운 것은?"
            subtitle="관심이 생긴 시점·실천 어려움 등을 구분해요."
            options={INTEREST_OPTIONS}
            onSubmit={async (segment) => {
                await saveOnboarding({
                    practitioner: 'no',
                    interestSegment: segment,
                });
                navigation.navigate(ROUTES.home);
            }}
        />
    );
}
