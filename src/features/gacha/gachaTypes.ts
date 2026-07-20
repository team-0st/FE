export type GachaRewardType = 'FAIL' | 'ECO_JAM' | 'INGREDIENT' | 'ALMANG_POINT';

export type GachaReward =
    | { type: 'FAIL'; consolationEcoJam: number }
    | { type: 'ECO_JAM'; amount: number }
    | { type: 'INGREDIENT'; ingredientId: string; amount: number; rarity: 'COMMON' | 'HIDDEN' }
    | { type: 'ALMANG_POINT'; amount: number };

export type GachaPullResult =
    | { ok: true; reward: GachaReward; costEcoJam: number }
    | { ok: false; reason: 'insufficient_eco_jam' };
