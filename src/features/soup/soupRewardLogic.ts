import type { Recipe } from '@api/mock/recipes';

export type SoupRewardKind = 'miss' | 'ecoJam' | 'real';

export type SoupBrewOutcome = {
    kind: SoupRewardKind;
    /** 꽝 유머 카드 문구 */
    missMessage?: string;
    ecoJamAmount?: number;
    realRewardLabel?: string;
};

const SOUP_MISS_MESSAGES = [
    '냄비가 “다음에…”라고 속삭였어요.',
    '스프가 투명해졌어요. (꽝)',
    '마녀가 “연습이야”라고 웃었어요.',
    '재료는 사라지고 향기만 남았어요.',
] as const;

const WEEKLY_MISS_RATE = 0.7;
const HIDDEN_MISS_RATE = 0.3;

function pickMissMessage(random: () => number): string {
    const index = Math.floor(random() * SOUP_MISS_MESSAGES.length);
    return SOUP_MISS_MESSAGES[index] ?? SOUP_MISS_MESSAGES[0];
}

function rollWeeklyEcoJam(recipe: Recipe, random: () => number): number {
    const base = recipe.ecoJamReward ?? 20;
    const variance = Math.floor(random() * 21) - 10;
    return Math.max(5, base + variance);
}

export function rollSoupReward(recipe: Recipe, random: () => number = Math.random): SoupBrewOutcome {
    const missRate = recipe.kind === 'hidden' ? HIDDEN_MISS_RATE : WEEKLY_MISS_RATE;
    if (random() < missRate) {
        return { kind: 'miss', missMessage: pickMissMessage(random) };
    }
    if (recipe.kind === 'hidden') {
        return {
            kind: 'real',
            realRewardLabel: recipe.realRewardLabel ?? '리워드 지급 예정',
        };
    }
    return { kind: 'ecoJam', ecoJamAmount: rollWeeklyEcoJam(recipe, random) };
}

export function encodeSoupOutcome(outcome: SoupBrewOutcome): {
    rewardKind: SoupRewardKind;
    rewardValue: string;
} {
    if (outcome.kind === 'miss') {
        return { rewardKind: 'miss', rewardValue: outcome.missMessage ?? '' };
    }
    if (outcome.kind === 'ecoJam') {
        return { rewardKind: 'ecoJam', rewardValue: String(outcome.ecoJamAmount ?? 0) };
    }
    return { rewardKind: 'real', rewardValue: outcome.realRewardLabel ?? '' };
}

export function decodeSoupOutcome(
    rewardKind: SoupRewardKind,
    rewardValue: string,
): SoupBrewOutcome {
    if (rewardKind === 'miss') {
        return { kind: 'miss', missMessage: rewardValue || SOUP_MISS_MESSAGES[0] };
    }
    if (rewardKind === 'ecoJam') {
        const amount = Number.parseInt(rewardValue, 10);
        return { kind: 'ecoJam', ecoJamAmount: Number.isFinite(amount) ? amount : 0 };
    }
    return { kind: 'real', realRewardLabel: rewardValue || '리워드 지급 예정' };
}
