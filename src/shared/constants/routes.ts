export const ROUTES = {
    home: '/',
    login: '/login',
    onboarding: '/onboarding',
    onboardingPractitioner: '/onboarding/practitioner',
    onboardingExperience: '/onboarding/experience',
    onboardingInterest: '/onboarding/interest',
    missions: '/missions',
    team: '/team',
    teamSelect: '/team/select',
    ranking: '/ranking',
    profile: '/profile',
} as const;

export function navigateMissionDetail(
    navigation: { navigate: (name: '/missions/:id', params: { id: string }) => void },
    id: string,
): void {
    navigation.navigate('/missions/:id', { id });
}
