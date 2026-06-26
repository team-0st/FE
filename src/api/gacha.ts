import type { GachaReward } from '../features/gacha/gachaTypes';
import { mockPostGacha, type GachaPullApiResult } from './mock/gachaMock';

export type { GachaReward };

export type { GachaPullApiResult };

/** POST /api/gacha — 에코잼으로 뽑기 (노션 명세) */
export async function postGacha(
    currentEcoJam: number,
    random: () => number = Math.random,
): Promise<GachaPullApiResult> {
    return mockPostGacha(currentEcoJam, random);
}
