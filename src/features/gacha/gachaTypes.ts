export type GachaRewardType =
    | 'nothing'
    | 'ecoJam'
    | 'ingredient'
    | 'shopPoints';

export type GachaReward =
    | { type: 'nothing' }
    | { type: 'ecoJam'; amount: number }
    | { type: 'ingredient'; ingredientId: string; amount: number }
    | { type: 'shopPoints'; amount: number };

export type GachaPullResult =
    | { ok: true; reward: GachaReward; costEcoJam: number; usedTicket?: boolean }
    | { ok: false; reason: 'insufficient_eco_jam' };
