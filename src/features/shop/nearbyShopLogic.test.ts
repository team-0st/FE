import { formatDistanceMeters, formatStraightLineDistance } from './nearbyShopLogic';

describe('nearbyShopLogic distance labels', () => {
    it('formats straight-line distance with prefix', () => {
        expect(formatStraightLineDistance(350)).toBe('직선 약 350m');
        expect(formatStraightLineDistance(1500)).toBe('직선 약 1.5km');
    });

    it('keeps raw meters helper for internal use', () => {
        expect(formatDistanceMeters(999)).toBe('999m');
    });
});
