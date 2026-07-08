import { listIngredientStock, normalizeIngredientInventory } from './ingredientInventory';

describe('ingredientInventory', () => {
    it('normalizeIngredientInventory keeps only known ids with positive counts', () => {
        const result = normalizeIngredientInventory({
            cabbage: 2,
            unknown: 99,
            carrot: 0,
        });
        expect(result).toEqual({ cabbage: 2 });
    });

    it('normalizeIngredientInventory returns defaults when raw is undefined', () => {
        const result = normalizeIngredientInventory(undefined);
        expect(result.tomato).toBeGreaterThan(0);
    });

    it('listIngredientStock returns all mock ingredients', () => {
        const rows = listIngredientStock({ cabbage: 1 });
        expect(rows.length).toBeGreaterThanOrEqual(10);
        expect(rows.find((r) => r.id === 'cabbage')?.count).toBe(1);
        expect(rows.find((r) => r.id === 'eco_star')?.count).toBe(0);
    });
});
