import { createRoute } from '@granite-js/react-native';
import { OnboardingSurveyListScreen } from '../../src/features/onboarding/OnboardingSurveyListScreen';
import { EXPERIENCE_OPTIONS } from '../../src/features/onboarding/surveyOptions';
import { useUser } from '../../src/features/user/UserProvider';
import { ONBOARDING_GUIDE } from '../../src/shared/constants/guideCopy';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/experience', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { saveOnboarding } = useUser();

    return (
        <OnboardingSurveyListScreen
            guideMessage={ONBOARDING_GUIDE.experience}
            options={EXPERIENCE_OPTIONS}
            onSubmit={async (segment) => {
                await saveOnboarding({
                    practitioner: 'yes',
                    practitionerSegment: segment,
                });
                navigation.replace(ROUTES.home);
            }}
        />
    );
}
