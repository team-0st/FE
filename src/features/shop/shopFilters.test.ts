import { MOCK_MAP_SHOPS } from '@api/mock/shops';
import { filterShopsByCategory } from './shopFilters';

describe('shopFilters', () => {
    it('returns all shops when filter is all', () => {
        expect(filterShopsByCategory(MOCK_MAP_SHOPS, 'all')).toHaveLength(MOCK_MAP_SHOPS.length);
    });

    it('filters by category', () => {
        const reuse = filterShopsByCategory(MOCK_MAP_SHOPS, 'reuse');
        expect(reuse.every((shop) => shop.category === 'reuse')).toBe(true);
        expect(reuse.length).toBeGreaterThan(0);
    });

    it('separates point-eligible shops', () => {
        const eligible = MOCK_MAP_SHOPS.filter((shop) => shop.pointEligible);
        const mapOnly = MOCK_MAP_SHOPS.filter((shop) => !shop.pointEligible);
        expect(eligible.length).toBeGreaterThan(0);
        expect(mapOnly.length).toBeGreaterThan(0);
        expect(eligible.length + mapOnly.length).toBe(MOCK_MAP_SHOPS.length);
    });
});
