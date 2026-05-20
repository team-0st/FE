import { createRoute } from '@granite-js/react-native';
import { OnboardingSurveyListScreen } from '../../src/features/onboarding/OnboardingSurveyListScreen';
import { PRACTITIONER_OPTIONS } from '../../src/features/onboarding/surveyOptions';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/practitioner', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <OnboardingSurveyListScreen
            title="제로웨이스트를 실천하고 계신가요?"
            subtitle="솔직하게 선택해 주세요. 팀 배정과는 무관해요."
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
