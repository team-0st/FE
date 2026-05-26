import '@granite-js/react-native';

declare module '@granite-js/react-native' {
    interface RegisterScreenInput {
        '/': Record<string, never> | undefined;
        '/ingredients': Record<string, never> | undefined;
        '/login': Record<string, never> | undefined;
        '/onboarding': Record<string, never> | undefined;
        '/onboarding/shop': Record<string, never> | undefined;
        '/recipes': Record<string, never> | undefined;
        '/soup/result': { recipeId: string };
        '/missions': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/missions/:id/verify': { id: string };
        '/missions/:id/result': { id: string };
        '/shop': Record<string, never> | undefined;
        '/shop/select': Record<string, never> | undefined;
        '/profile': Record<string, never> | undefined;
    }

    interface RegisterScreen {
        '/': Record<string, never> | undefined;
        '/ingredients': Record<string, never> | undefined;
        '/login': Record<string, never> | undefined;
        '/onboarding': Record<string, never> | undefined;
        '/onboarding/shop': Record<string, never> | undefined;
        '/recipes': Record<string, never> | undefined;
        '/soup/result': { recipeId: string };
        '/missions': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/missions/:id/verify': { id: string };
        '/missions/:id/result': { id: string };
        '/shop': Record<string, never> | undefined;
        '/shop/select': Record<string, never> | undefined;
        '/profile': Record<string, never> | undefined;
    }
}
