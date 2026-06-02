import { rollGachaReward, type GachaReward } from '../features/gacha/gachaLogic';

export type { GachaReward };

/** BE `POST /gacha/pull` mock */
export async function postGachaPull(random: () => number = Math.random): Promise<GachaReward> {
    await new Promise((r) => setTimeout(r, 60));
    return rollGachaReward(random);
}
