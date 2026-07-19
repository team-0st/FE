import { INGREDIENTS } from '@api/mock/ingredients';
import { DEFAULT_USER_STATE } from './defaultState';

/** Storage에 unknown key가 있어도 mock 재료 id만 유지 */
export function normalizeIngredientInventory(
    raw: Record<string, number> | undefined,
): Record<string, number> {
    if (raw == null) {
        return { ...DEFAULT_USER_STATE.ingredientInventory };
    }
    const normalized: Record<string, number> = {};
    for (const item of INGREDIENTS) {
        const count = raw[item.id];
        if (typeof count === 'number' && count > 0) {
            normalized[item.id] = count;
        }
    }
    return normalized;
}

export type IngredientStockRow = {
    id: string;
    name: string;
    emoji: string;
    count: number;
    imageSource: (typeof INGREDIENTS)[number]['imageSource'];
};

/** 마이·제작 등 UI용 — 전체 재료 + 보유 개수 */
export function listIngredientStock(inventory: Record<string, number>): IngredientStockRow[] {
    return INGREDIENTS.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        count: inventory[item.id] ?? 0,
        imageSource: item.imageSource,
    }));
}
