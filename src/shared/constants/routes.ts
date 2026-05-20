export const ROUTES = {
    home: '/',
    login: '/login',
    onboarding: '/onboarding',
    onboardingTeam: '/onboarding/team',
    missions: '/missions',
    team: '/team',
    ranking: '/ranking',
    profile: '/profile',
} as const;

export function navigateMissionDetail(
    navigation: { navigate: (name: '/missions/:id', params: { id: string }) => void },
    id: string,
): void {
    navigation.navigate('/missions/:id', { id });
}
