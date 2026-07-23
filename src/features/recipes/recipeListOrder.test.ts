import type { Recipe } from '@api/mock/recipeTypes';
import { collectCompletedRecipes, sortRecipesCompletedLast } from './recipeListOrder';

function recipe(id: string, kind: Recipe['kind'] = 'weekly'): Recipe {
    return {
        id,
        kind,
        name: id,
        hint: '',
        ingredientIds: [],
        slotCount: 3,
    };
}

describe('sortRecipesCompletedLast', () => {
    it('완료 레시피를 목록 맨 아래로 보낸다', () => {
        const sorted = sortRecipesCompletedLast(
            [recipe('a'), recipe('b'), recipe('c')],
            ['b'],
        );
        expect(sorted.map((item) => item.id)).toEqual(['a', 'c', 'b']);
    });
});

describe('collectCompletedRecipes', () => {
    it('입문·일반·히든·전설에서 완료분만 모은다', () => {
        const completed = collectCompletedRecipes(
            {
                beginner: [recipe('beginner-warm', 'beginner')],
                weekly: [recipe('weekly-01'), recipe('weekly-02')],
                hidden: [recipe('hidden-crystal', 'hidden')],
                legendary: [recipe('legendary-life', 'legendary')],
            },
            ['weekly-02', 'hidden-crystal', 'beginner-warm'],
        );
        expect(completed.map((item) => item.id)).toEqual([
            'beginner-warm',
            'weekly-02',
            'hidden-crystal',
        ]);
    });
});
