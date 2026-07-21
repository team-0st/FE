import type { SoupCraftResponse } from '@api/notion/types';
import { resolveCraftAnimationTier } from './craftAnimationTier';

function baseCraft(overrides: Partial<SoupCraftResponse> = {}): SoupCraftResponse {
    return {
        soupId: 1,
        result: 'SUCCESS',
        recipeName: '토마토 스프',
        ...overrides,
    };
}

describe('resolveCraftAnimationTier (보상 응답 → 모션 등급 매핑)', () => {
    it('rewardGrade가 FAIL이면 에코잼이 많아도 normal이다', () => {
        const craft = baseCraft({ rewardGrade: 'FAIL', rewardEcoJam: 30, rewardAmount: 30 });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardPoint가 1 이상이면 legendary다', () => {
        const craft = baseCraft({ rewardGrade: 'MEDIUM', rewardPoint: 1 });
        expect(resolveCraftAnimationTier(craft)).toBe('legendary');
    });

    it('rewardType이 ALMANG_POINT면 rewardPoint 없이도 legendary다', () => {
        const craft = baseCraft({ rewardGrade: 'SMALL', rewardType: 'ALMANG_POINT', rewardAmount: 40 });
        expect(resolveCraftAnimationTier(craft)).toBe('legendary');
    });

    it('포인트 없이 rewardEcoJam이 있으면 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardEcoJam: 5 });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('포인트 없이 rewardAmount가 있으면 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardAmount: 5, rewardType: 'ECO_JAM' });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('포인트 없이 rewarded ingredient만 있어도 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardIngredientId: 'cabbage' });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('보상 정보가 전혀 없으면 안전하게 normal로 fallback한다', () => {
        const craft = baseCraft({ rewardGrade: undefined });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardGrade가 JACKPOT이며 REAL_ITEM(포인트·에코잼·재료 없음)이어도 안전하게 normal로 fallback한다', () => {
        const craft = baseCraft({ rewardGrade: 'JACKPOT', rewardType: 'REAL_ITEM', rewardDescription: '리워드 지급 예정' });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardPoint가 0이면 legendary 조건을 만족하지 않는다', () => {
        const craft = baseCraft({ rewardGrade: 'SMALL', rewardPoint: 0, rewardEcoJam: 10 });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });
});
