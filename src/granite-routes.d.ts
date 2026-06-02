import '@granite-js/react-native';

/** Granite 파일 라우트([id])와 createRoute(:id) 병행 시 타입 보조 */
declare module '@granite-js/react-native' {
    interface RegisterScreenInput {
        '/gacha': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/missions/:id/verify': { id: string };
        '/missions/:id/result': { id: string };
        '/soup/result': { recipeId: string; rewardKind: string; rewardValue: string };
    }

    interface RegisterScreen {
        '/gacha': Record<string, never> | undefined;
        '/missions/:id': { id: string };
        '/missions/:id/verify': { id: string };
        '/missions/:id/result': { id: string };
        '/soup/result': { recipeId: string; rewardKind: string; rewardValue: string };
    }
}
