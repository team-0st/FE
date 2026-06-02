export type RecipeKind = 'weekly' | 'hidden' | 'legendary' | 'beginner';

export type Recipe = {
    id: string;
    kind: RecipeKind;
    name: string;
    hint: string;
    hintDrip?: string;
    ingredientIds: string[];
    slotCount: number;
    ecoJamReward?: number;
    realRewardLabel?: string;
    weekKey?: string;
};

export const BREW_SLOT_MAX = 4;
export const BEGINNER_SLOT_COUNT = 2;
export const WEEKLY_SLOT_COUNT = 3;
export const HIDDEN_SLOT_COUNT = 4;

export function getIsoWeekKey(date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
