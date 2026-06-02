import { rollGachaReward } from '../features/gacha/gachaLogic';
import type { GachaReward } from '../features/gacha/gachaTypes';

export type { GachaReward };

/** BE `POST /gacha/pull` mock */
export async function postGachaPull(random: () => number = Math.random): Promise<GachaReward> {
    await new Promise((r) => setTimeout(r, 60));
    return rollGachaReward(random);
}
