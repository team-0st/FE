import { createRoute } from '@granite-js/react-native';
import { OnboardingSurveyListScreen } from '../../src/features/onboarding/OnboardingSurveyListScreen';
import { PRACTITIONER_OPTIONS } from '../../src/features/onboarding/surveyOptions';
import { ONBOARDING_GUIDE } from '../../src/shared/constants/guideCopy';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/practitioner', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <OnboardingSurveyListScreen
            guideMessage={ONBOARDING_GUIDE.practitioner}
            options={PRACTITIONER_OPTIONS}
            onSubmit={(value) => {
                if (value === 'yes') {
                    navigation.navigate(ROUTES.onboardingExperience);
                } else {
                    navigation.navigate(ROUTES.onboardingInterest);
                }
            }}
        />
    );
}
