import { COMMON_INGREDIENT_IDS } from './ingredients';
import type { Recipe } from './recipeTypes';
import type { RecipeCatalogType, SoupCraftResponse, RewardCatalogType } from '../notion/types';
import {
    rollInitialSoupGrade,
    soupRerollKindFor,
    type SoupRewardGrade,
} from '../../features/soup/soupRewardGrades';

const TRASH_REWARD_LABELS = ['아쉬운 한 그릇', '덜 익은 스프', '다시 끓여봐요'] as const;

function catalogTypeFor(recipe: Recipe): RecipeCatalogType {
    if (recipe.kind === 'hidden') {
        return 'HIDDEN';
    }
    if (recipe.kind === 'legendary') {
        return 'LEGENDARY';
    }
    return 'COMMON';
}

function pickTrashLabel(random: () => number): string {
    const index = Math.floor(random() * TRASH_REWARD_LABELS.length);
    return TRASH_REWARD_LABELS[index] ?? TRASH_REWARD_LABELS[0];
}

function pickCommonIngredient(random: () => number): string {
    const index = Math.floor(random() * COMMON_INGREDIENT_IDS.length);
    return COMMON_INGREDIENT_IDS[index] ?? 'cabbage';
}

let nextSoupId = 1;

/** 등급 → SoupCraftResponse 페이로드 */
export function buildCraftForGrade(
    recipe: Recipe,
    grade: SoupRewardGrade,
    soupId: number,
    random: () => number = Math.random,
): SoupCraftResponse {
    const recipeName = recipe.name;
    if (grade === 'FAIL') {
        return {
            soupId,
            result: 'FAIL',
            recipeName,
            rewardType: 'TRASH_ITEM',
            rewardDescription: pickTrashLabel(random),
            rewardGrade: 'FAIL',
        };
    }
    if (grade === 'INGREDIENT') {
        const ingredientId = pickCommonIngredient(random);
        return {
            soupId,
            result: 'SUCCESS',
            recipeName,
            rewardType: 'ECO_JAM',
            rewardAmount: 0,
            rewardDescription: '재료 지급',
            rewardGrade: 'INGREDIENT',
            rewardIngredientId: ingredientId,
        };
    }
    if (grade === 'SMALL') {
        return {
            soupId,
            result: 'SUCCESS',
            recipeName,
            rewardType: 'ALMANG_POINT',
            rewardAmount: 40,
            rewardDescription: '소박한 보상',
            rewardGrade: 'SMALL',
        };
    }
    if (grade === 'MEDIUM') {
        return {
            soupId,
            result: 'SUCCESS',
            recipeName,
            rewardType: 'ALMANG_POINT',
            rewardAmount: 80,
            rewardDescription: '중박 보상',
            rewardGrade: 'MEDIUM',
        };
    }
    const type = catalogTypeFor(recipe);
    if (type === 'HIDDEN' || type === 'LEGENDARY') {
        return {
            soupId,
            result: 'SUCCESS',
            recipeName,
            rewardType: 'REAL_ITEM',
            rewardDescription: recipe.realRewardLabel ?? '리워드 지급 예정',
            rewardGrade: 'JACKPOT',
        };
    }
    return {
        soupId,
        result: 'SUCCESS',
        recipeName,
        rewardType: 'ALMANG_POINT',
        rewardAmount: 150,
        rewardDescription: '대박 보상',
        rewardGrade: 'JACKPOT',
    };
}

/** BE `POST /api/soup/craft` mock — 노션 등급·리롤 스펙 */
export function mockRollSoupCraft(
    recipe: Recipe,
    random: () => number = Math.random,
): SoupCraftResponse {
    const soupId = nextSoupId++;
    const kind = soupRerollKindFor(recipe);
    const grade = rollInitialSoupGrade(kind, random);
    return buildCraftForGrade(recipe, grade, soupId, random);
}

export function encodeSoupCraftForRoute(craft: SoupCraftResponse): {
    soupId: string;
    result: string;
    rewardType: string;
    rewardAmount: string;
    rewardDescription: string;
    rewardGrade: string;
    rewardIngredientId: string;
} {
    return {
        soupId: String(craft.soupId),
        result: craft.result,
        rewardType: craft.rewardType ?? '',
        rewardAmount: String(craft.rewardAmount ?? 0),
        rewardDescription: craft.rewardDescription ?? '',
        rewardGrade: craft.rewardGrade ?? '',
        rewardIngredientId: craft.rewardIngredientId ?? '',
    };
}

export function decodeSoupCraftFromRoute(params: {
    soupId?: string;
    result?: string;
    rewardType?: string;
    rewardAmount?: string;
    rewardDescription?: string;
    rewardGrade?: string;
    rewardIngredientId?: string;
}): SoupCraftResponse {
    const grade = params.rewardGrade;
    return {
        soupId: Number.parseInt(params.soupId ?? '0', 10) || 0,
        result: (params.result as SoupCraftResponse['result']) ?? 'FAIL',
        rewardType: (params.rewardType as RewardCatalogType) || undefined,
        rewardAmount: Number.parseInt(params.rewardAmount ?? '0', 10) || undefined,
        rewardDescription: params.rewardDescription || undefined,
        rewardGrade:
            grade === 'FAIL' ||
            grade === 'INGREDIENT' ||
            grade === 'SMALL' ||
            grade === 'MEDIUM' ||
            grade === 'JACKPOT'
                ? grade
                : undefined,
        rewardIngredientId: params.rewardIngredientId || undefined,
    };
}
