import { listIngredientStock, normalizeIngredientInventory } from './ingredientInventory';

describe('ingredientInventory', () => {
    it('normalizeIngredientInventory keeps only known ids with positive counts', () => {
        const result = normalizeIngredientInventory({
            herb: 2,
            unknown: 99,
            carrot: 0,
        });
        expect(result).toEqual({ herb: 2 });
    });

    it('normalizeIngredientInventory returns defaults when raw is undefined', () => {
        const result = normalizeIngredientInventory(undefined);
        expect(result.herb).toBeGreaterThan(0);
    });

    it('listIngredientStock returns all mock ingredients', () => {
        const rows = listIngredientStock({ herb: 1 });
        expect(rows.length).toBeGreaterThanOrEqual(6);
        expect(rows.find((r) => r.id === 'herb')?.count).toBe(1);
        expect(rows.find((r) => r.id === 'star')?.count).toBe(0);
    });
});
