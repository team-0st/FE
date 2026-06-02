import type { Recipe } from './recipeTypes';

export type SoupRewardKind = 'miss' | 'ecoJam' | 'real';

export type SoupBrewOutcome = {
    kind: SoupRewardKind;
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

function pickMissMessage(random: () => number): string {
    const index = Math.floor(random() * SOUP_MISS_MESSAGES.length);
    return SOUP_MISS_MESSAGES[index] ?? SOUP_MISS_MESSAGES[0];
}

function missRateFor(recipe: Recipe): number {
    if (recipe.kind === 'beginner') {
        return 0.5;
    }
    if (recipe.kind === 'hidden' || recipe.kind === 'legendary') {
        return 0.3;
    }
    return 0.7;
}

function rollWeeklyEcoJam(recipe: Recipe, random: () => number): number {
    const base = recipe.ecoJamReward ?? 20;
    const variance = Math.floor(random() * 21) - 10;
    return Math.max(5, base + variance);
}

/** BE `POST /soup/brew` mock — 확률은 서버 책임, FE는 응답만 반영 */
export function mockRollSoupReward(recipe: Recipe, random: () => number = Math.random): SoupBrewOutcome {
    if (random() < missRateFor(recipe)) {
        return { kind: 'miss', missMessage: pickMissMessage(random) };
    }
    if (recipe.kind === 'hidden' || recipe.kind === 'legendary') {
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
