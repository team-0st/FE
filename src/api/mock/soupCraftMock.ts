import type { Recipe } from './recipeTypes';
import type { RecipeCatalogType, SoupCraftResponse, RewardCatalogType } from '../notion/types';

const TRASH_REWARD_LABELS = ['쓰레기 봉투', '빈 냄비', '투명 스프'] as const;

function catalogTypeFor(recipe: Recipe): RecipeCatalogType {
    if (recipe.kind === 'hidden') {
        return 'HIDDEN';
    }
    if (recipe.kind === 'legendary') {
        return 'LEGENDARY';
    }
    return 'COMMON';
}

/** 노션 Recipes.success_rate — COMMON 70% 성공, HIDDEN/LEGENDARY 100% */
function successRateFor(recipe: Recipe): number {
    const type = catalogTypeFor(recipe);
    if (type === 'HIDDEN' || type === 'LEGENDARY') {
        return 1;
    }
    return 0.7;
}

function rollWeeklyEcoJam(recipe: Recipe, random: () => number): number {
    const base = recipe.ecoJamReward ?? 20;
    const variance = Math.floor(random() * 21) - 10;
    return Math.max(5, base + variance);
}

function pickTrashLabel(random: () => number): string {
    const index = Math.floor(random() * TRASH_REWARD_LABELS.length);
    return TRASH_REWARD_LABELS[index] ?? TRASH_REWARD_LABELS[0];
}

let nextSoupId = 1;

/** BE `POST /api/soup/craft` mock — 노션 Soups.result / reward_type 스펙 */
export function mockRollSoupCraft(
    recipe: Recipe,
    random: () => number = Math.random,
): SoupCraftResponse {
    const soupId = nextSoupId++;
    const success = random() < successRateFor(recipe);
    if (!success) {
        return {
            soupId,
            result: 'FAIL',
            recipeName: recipe.name,
            rewardType: 'TRASH_ITEM',
            rewardDescription: pickTrashLabel(random),
        };
    }
    const type = catalogTypeFor(recipe);
    if (type === 'HIDDEN' || type === 'LEGENDARY') {
        return {
            soupId,
            result: 'SUCCESS',
            recipeName: recipe.name,
            rewardType: 'REAL_ITEM',
            rewardDescription: recipe.realRewardLabel ?? '리워드 지급 예정',
        };
    }
    const amount = rollWeeklyEcoJam(recipe, random);
    return {
        soupId,
        result: 'SUCCESS',
        recipeName: recipe.name,
        rewardType: 'ECO_JAM',
        rewardAmount: amount,
    };
}

export function encodeSoupCraftForRoute(craft: SoupCraftResponse): {
    soupId: string;
    result: string;
    rewardType: string;
    rewardAmount: string;
    rewardDescription: string;
} {
    return {
        soupId: String(craft.soupId),
        result: craft.result,
        rewardType: craft.rewardType ?? '',
        rewardAmount: String(craft.rewardAmount ?? 0),
        rewardDescription: craft.rewardDescription ?? '',
    };
}

export function decodeSoupCraftFromRoute(params: {
    soupId?: string;
    result?: string;
    rewardType?: string;
    rewardAmount?: string;
    rewardDescription?: string;
}): SoupCraftResponse {
    return {
        soupId: Number.parseInt(params.soupId ?? '0', 10) || 0,
        result: (params.result as SoupCraftResponse['result']) ?? 'FAIL',
        rewardType: (params.rewardType as RewardCatalogType) || undefined,
        rewardAmount: Number.parseInt(params.rewardAmount ?? '0', 10) || undefined,
        rewardDescription: params.rewardDescription || undefined,
    };
}
