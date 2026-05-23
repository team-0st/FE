export const ROUTES = {
    home: '/',
    login: '/login',
    onboarding: '/onboarding',
    onboardingPractitioner: '/onboarding/practitioner',
    onboardingExperience: '/onboarding/experience',
    onboardingInterest: '/onboarding/interest',
    missions: '/missions',
    shop: '/shop',
    shopSelect: '/shop/select',
    profile: '/profile',
} as const;

type MissionNavigation = {
    navigate: (name: string, params?: { id: string }) => void;
};

export function navigateMissionDetail(navigation: MissionNavigation, id: string): void {
    navigation.navigate('/missions/:id', { id });
}

export function navigateMissionVerify(navigation: MissionNavigation, id: string): void {
    navigation.navigate('/missions/:id/verify', { id });
}

export function navigateMissionResult(navigation: MissionNavigation, id: string): void {
    navigation.navigate('/missions/:id/result', { id });
}
