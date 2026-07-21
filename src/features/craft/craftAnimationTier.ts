import type { SoupCraftResponse } from '@api/notion/types';
import type { CraftAnimationTier } from '../../shared/constants/cauldronImages';

/**
 * 브루 보상 응답 → 제작 애니메이션 등급 매핑 (순수 함수).
 * 우선순위:
 *   1) rewardGrade가 FAIL이면(BE CONSOLATION 포함, mapBeGrade가 이미 FAIL로 정규화함) 다른 보상과 무관하게 normal.
 *   2) rewardPoint가 1 이상이거나 rewardType이 ALMANG_POINT면 legendary.
 *   3) 포인트 없이 rewardEcoJam/rewardAmount가 있거나 rewarded ingredient가 있으면 rare.
 *   4) 그 외는 안전하게 normal로 fallback.
 */
export function resolveCraftAnimationTier(craft: SoupCraftResponse): CraftAnimationTier {
    if (craft.rewardGrade === 'FAIL') {
        return 'normal';
    }

    const hasPoint = (craft.rewardPoint ?? 0) >= 1 || craft.rewardType === 'ALMANG_POINT';
    if (hasPoint) {
        return 'legendary';
    }

    const hasEcoJamOrAmountOrIngredient =
        (craft.rewardEcoJam ?? 0) > 0 || (craft.rewardAmount ?? 0) > 0 || craft.rewardIngredientId != null;
    if (hasEcoJamOrAmountOrIngredient) {
        return 'rare';
    }

    return 'normal';
}
