import { createRoute } from '@granite-js/react-native';
import { OnboardingSurveyListScreen } from '../../src/features/onboarding/OnboardingSurveyListScreen';
import { EXPERIENCE_OPTIONS } from '../../src/features/onboarding/surveyOptions';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/experience', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { saveOnboarding } = useUser();

    return (
        <OnboardingSurveyListScreen
            title="실천 상황을 알려주세요"
            subtitle="기존 실천자분을 위한 질문이에요."
            options={EXPERIENCE_OPTIONS}
            onSubmit={async (segment) => {
                await saveOnboarding({
                    practitioner: 'yes',
                    practitionerSegment: segment,
                });
                navigation.navigate(ROUTES.home);
            }}
        />
    );
}
