import type { Recipe } from '@api/mock/recipeTypes';
import type { SoupCraftResponse } from '@api/notion/types';
import { DEFAULT_USER_STATE } from './defaultState';
import { applySoupRerollServerSync } from './userStateLogic';

const recipe: Recipe = {
    id: 'tomato-soup',
    kind: 'weekly',
    name: '토마토 스프',
    hint: '',
    ingredientIds: ['tomato'],
    slotCount: 1,
};

const nextCraft: SoupCraftResponse = {
    soupId: 10,
    result: 'SUCCESS',
    recipeName: '토마토 스프',
    rewardType: 'ALMANG_POINT',
    rewardAmount: 80,
    rewardPoint: 80,
    rewardGrade: 'MEDIUM',
};

describe('applySoupRerollServerSync', () => {
    it('동기화 조회가 실패하면 응답 delta를 더하지 않고 기존 point와 inventory를 유지한다', () => {
        const current = {
            ...DEFAULT_USER_STATE,
            ecoJam: 100,
            totalPoints: 40,
            ingredientInventory: { tomato: 2 },
        };

        const next = applySoupRerollServerSync(current, recipe, {
            remainingEcoJam: 30,
            nextCraft,
            syncedPoint: null,
            syncedInventory: null,
        });

        expect(next.ecoJam).toBe(30);
        expect(next.totalPoints).toBe(40);
        expect(next.ingredientInventory).toEqual({ tomato: 2 });
    });

    it('재료 조회 성공 시 복수 재료와 각 quantity를 서버 스냅샷 그대로 반영한다', () => {
        const current = {
            ...DEFAULT_USER_STATE,
            ingredientInventory: { tomato: 1 },
        };
        const syncedInventory = { tomato: 4, onion: 2, 'be-99': 3 };

        const next = applySoupRerollServerSync(current, recipe, {
            remainingEcoJam: 30,
            nextCraft: {
                ...nextCraft,
                rewardType: 'ECO_JAM',
                rewardPoint: undefined,
                rewardIngredientId: 'tomato',
            },
            syncedPoint: 70,
            syncedInventory,
        });

        expect(next.totalPoints).toBe(70);
        expect(next.ingredientInventory).toEqual(syncedInventory);
    });

    it('복구 후 최신 state를 기준으로 만들어 새 userId를 보존한다', () => {
        const recovered = {
            ...DEFAULT_USER_STATE,
            userId: 777,
            deviceId: 'recovered-device',
        };

        const next = applySoupRerollServerSync(recovered, recipe, {
            remainingEcoJam: 30,
            nextCraft,
            syncedPoint: null,
            syncedInventory: null,
        });

        expect(next.userId).toBe(777);
        expect(next.deviceId).toBe('recovered-device');
    });
});
