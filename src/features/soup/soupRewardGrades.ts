import type { Recipe } from '@api/mock/recipeTypes';
import type { SoupCraftResponse } from '@api/notion/types';

/** 노션 리롤 등급 — 꽝 / 재료 / 소박 / 중박 / 대박 */
export type SoupRewardGrade = 'FAIL' | 'INGREDIENT' | 'SMALL' | 'MEDIUM' | 'JACKPOT';

export const SOUP_GRADE_ORDER: SoupRewardGrade[] = [
    'FAIL',
    'INGREDIENT',
    'SMALL',
    'MEDIUM',
    'JACKPOT',
];

export const SOUP_GRADE_LABEL: Record<SoupRewardGrade, string> = {
    FAIL: '꽝',
    INGREDIENT: '재료 지급',
    SMALL: '소박',
    MEDIUM: '중박',
    JACKPOT: '대박',
};

export type SoupRerollKind = 'common' | 'hidden' | 'legendary';

export function soupRerollKindFor(recipe: Recipe): SoupRerollKind {
    if (recipe.kind === 'hidden') {
        return 'hidden';
    }
    if (recipe.kind === 'legendary') {
        return 'legendary';
    }
    return 'common';
}

export function soupRerollActionName(kind: SoupRerollKind): string {
    if (kind === 'hidden') {
        return '운명의 물약';
    }
    if (kind === 'legendary') {
        return '마녀의 축복';
    }
    return '행운의 주문';
}

/** 현재 등급 → 리롤 비용 (노션). 대박·불가 등급은 null */
export function soupRerollCost(
    kind: SoupRerollKind,
    grade: SoupRewardGrade,
): number | null {
    if (grade === 'JACKPOT') {
        return null;
    }
    if (kind === 'common') {
        const map: Partial<Record<SoupRewardGrade, number>> = {
            FAIL: 30,
            INGREDIENT: 50,
            SMALL: 70,
            MEDIUM: 100,
        };
        return map[grade] ?? null;
    }
    if (kind === 'hidden') {
        if (grade === 'FAIL') {
            return null;
        }
        const map: Partial<Record<SoupRewardGrade, number>> = {
            INGREDIENT: 80,
            SMALL: 120,
            MEDIUM: 150,
        };
        return map[grade] ?? null;
    }
    if (grade === 'FAIL') {
        return null;
    }
    const map: Partial<Record<SoupRewardGrade, number>> = {
        INGREDIENT: 100,
        SMALL: 150,
        MEDIUM: 200,
    };
    return map[grade] ?? null;
}

type WeightedGrade = { grade: SoupRewardGrade; weight: number };

function pickWeighted(grades: WeightedGrade[], random: () => number): SoupRewardGrade {
    const total = grades.reduce((sum, g) => sum + g.weight, 0);
    let roll = random() * total;
    for (const entry of grades) {
        roll -= entry.weight;
        if (roll < 0) {
            return entry.grade;
        }
    }
    return grades[grades.length - 1]?.grade ?? 'INGREDIENT';
}

/** 노션 리롤 확률표 */
export function rollRerollGrade(
    kind: SoupRerollKind,
    from: SoupRewardGrade,
    random: () => number = Math.random,
): SoupRewardGrade {
    if (from === 'JACKPOT') {
        return 'JACKPOT';
    }
    if (kind === 'common') {
        if (from === 'FAIL') {
            return pickWeighted(
                [
                    { grade: 'INGREDIENT', weight: 60 },
                    { grade: 'SMALL', weight: 30 },
                    { grade: 'MEDIUM', weight: 8 },
                    { grade: 'JACKPOT', weight: 2 },
                ],
                random,
            );
        }
        if (from === 'INGREDIENT') {
            return pickWeighted(
                [
                    { grade: 'INGREDIENT', weight: 65 },
                    { grade: 'SMALL', weight: 25 },
                    { grade: 'MEDIUM', weight: 8 },
                    { grade: 'JACKPOT', weight: 2 },
                ],
                random,
            );
        }
        if (from === 'SMALL') {
            return pickWeighted(
                [
                    { grade: 'SMALL', weight: 75 },
                    { grade: 'MEDIUM', weight: 20 },
                    { grade: 'JACKPOT', weight: 5 },
                ],
                random,
            );
        }
        return pickWeighted(
            [
                { grade: 'MEDIUM', weight: 90 },
                { grade: 'JACKPOT', weight: 10 },
            ],
            random,
        );
    }
    if (kind === 'hidden') {
        if (from === 'INGREDIENT') {
            return pickWeighted(
                [
                    { grade: 'INGREDIENT', weight: 70 },
                    { grade: 'SMALL', weight: 20 },
                    { grade: 'MEDIUM', weight: 8 },
                    { grade: 'JACKPOT', weight: 2 },
                ],
                random,
            );
        }
        if (from === 'SMALL') {
            return pickWeighted(
                [
                    { grade: 'SMALL', weight: 80 },
                    { grade: 'MEDIUM', weight: 15 },
                    { grade: 'JACKPOT', weight: 5 },
                ],
                random,
            );
        }
        return pickWeighted(
            [
                { grade: 'MEDIUM', weight: 92 },
                { grade: 'JACKPOT', weight: 8 },
            ],
            random,
        );
    }
    // legendary
    if (from === 'INGREDIENT') {
        return pickWeighted(
            [
                { grade: 'INGREDIENT', weight: 75 },
                { grade: 'SMALL', weight: 18 },
                { grade: 'MEDIUM', weight: 5 },
                { grade: 'JACKPOT', weight: 2 },
            ],
            random,
        );
    }
    if (from === 'SMALL') {
        return pickWeighted(
            [
                { grade: 'SMALL', weight: 82 },
                { grade: 'MEDIUM', weight: 15 },
                { grade: 'JACKPOT', weight: 3 },
            ],
            random,
        );
    }
    return pickWeighted(
        [
            { grade: 'MEDIUM', weight: 95 },
            { grade: 'JACKPOT', weight: 5 },
        ],
        random,
    );
}

/** 최초 제작 등급 분포 (노션 리롤표 외 FE 초기값) */
export function rollInitialSoupGrade(
    kind: SoupRerollKind,
    random: () => number = Math.random,
): SoupRewardGrade {
    if (kind === 'common') {
        if (random() >= 0.7) {
            return 'FAIL';
        }
        return pickWeighted(
            [
                { grade: 'INGREDIENT', weight: 40 },
                { grade: 'SMALL', weight: 30 },
                { grade: 'MEDIUM', weight: 20 },
                { grade: 'JACKPOT', weight: 10 },
            ],
            random,
        );
    }
    return pickWeighted(
        [
            { grade: 'INGREDIENT', weight: 30 },
            { grade: 'SMALL', weight: 35 },
            { grade: 'MEDIUM', weight: 25 },
            { grade: 'JACKPOT', weight: 10 },
        ],
        random,
    );
}

export function gradeFromCraft(craft: SoupCraftResponse): SoupRewardGrade {
    if (craft.rewardGrade != null) {
        return craft.rewardGrade;
    }
    if (craft.result === 'FAIL' || craft.rewardType === 'TRASH_ITEM') {
        return 'FAIL';
    }
    if (craft.rewardType === 'REAL_ITEM') {
        return 'JACKPOT';
    }
    if (craft.rewardType === 'ALMANG_POINT') {
        const amount = craft.rewardAmount ?? 0;
        if (amount >= 80) {
            return 'MEDIUM';
        }
        if (amount >= 40) {
            return 'SMALL';
        }
        return 'INGREDIENT';
    }
    return 'SMALL';
}

export function gradeRank(grade: SoupRewardGrade): number {
    return SOUP_GRADE_ORDER.indexOf(grade);
}
