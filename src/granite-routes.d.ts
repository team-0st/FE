import '@granite-js/react-native';

declare module '@granite-js/react-native' {
    interface RegisterScreenInput {
        '/': Record<string, never> | undefined;
        '/login': Record<string, never> | undefined;
        '/onboarding': Record<string, never> | undefined;
        '/onboarding/team': Record<string, never> | undefined;
        '/missions': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/team': Record<string, never> | undefined;
        '/ranking': Record<string, never> | undefined;
        '/profile': Record<string, never> | undefined;
    }

    interface RegisterScreen {
        '/': Record<string, never> | undefined;
        '/login': Record<string, never> | undefined;
        '/onboarding': Record<string, never> | undefined;
        '/onboarding/team': Record<string, never> | undefined;
        '/missions': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/team': Record<string, never> | undefined;
        '/ranking': Record<string, never> | undefined;
        '/profile': Record<string, never> | undefined;
    }
}
