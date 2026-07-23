import type { Recipe } from '@api/mock/recipeTypes';

/** 미완료 먼저, 완료는 각 목록 맨 아래 */
export function sortRecipesCompletedLast(
    recipes: Recipe[],
    completedRecipeIds: string[],
): Recipe[] {
    const doneSet = new Set(completedRecipeIds);
    return [...recipes].sort((a, b) => {
        const aDone = doneSet.has(a.id) ? 1 : 0;
        const bDone = doneSet.has(b.id) ? 1 : 0;
        return aDone - bDone;
    });
}

export function collectCompletedRecipes(
    sections: { beginner: Recipe[]; weekly: Recipe[]; hidden: Recipe[]; legendary: Recipe[] },
    completedRecipeIds: string[],
): Recipe[] {
    const doneSet = new Set(completedRecipeIds);
    const seen = new Set<string>();
    const out: Recipe[] = [];
    for (const recipe of [
        ...sections.beginner,
        ...sections.weekly,
        ...sections.hidden,
        ...sections.legendary,
    ]) {
        if (!doneSet.has(recipe.id) || seen.has(recipe.id)) {
            continue;
        }
        seen.add(recipe.id);
        out.push(recipe);
    }
    return out;
}
