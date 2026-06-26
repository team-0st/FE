import { DEFAULT_USER_STATE } from '../user/defaultState';
import { GACHA_PULL_COST_ECO_JAM } from './gachaConfig';
import {
    applyGachaPull,
    canAffordGachaPull,
    rollGachaReward,
} from './gachaLogic';
import type { GachaReward } from './gachaTypes';

describe('rollGachaReward', () => {
    it('returns ALMANG_POINT when roll is in rare band', () => {
        const sequence = [0.99, 0];
        const reward = rollGachaReward(() => sequence.shift() ?? 0);
        expect(reward.type).toBe('ALMANG_POINT');
    });

    it('returns FAIL when roll is in miss band', () => {
        const reward = rollGachaReward(() => 0.1);
        expect(reward.type).toBe('FAIL');
    });
});

describe('applyGachaPull', () => {
    it('deducts cost and grants eco jam', () => {
        const state = { ...DEFAULT_USER_STATE, ecoJam: 200 };
        const reward: GachaReward = { type: 'ECO_JAM', amount: 2 };
        const next = applyGachaPull(state, reward);
        expect(next?.ecoJam).toBe(200 - GACHA_PULL_COST_ECO_JAM + 2);
    });

    it('returns null when eco jam is insufficient', () => {
        const state = { ...DEFAULT_USER_STATE, ecoJam: 5 };
        const next = applyGachaPull(state, { type: 'FAIL' });
        expect(next).toBeNull();
    });

    it('adds shop points on rare reward', () => {
        const state = { ...DEFAULT_USER_STATE, ecoJam: 150, totalPoints: 0 };
        const next = applyGachaPull(state, { type: 'ALMANG_POINT', amount: 30 });
        expect(next?.totalPoints).toBe(30);
        expect(next?.ecoJam).toBe(50);
    });
});

describe('canAffordGachaPull', () => {
    it('is false below cost', () => {
        expect(canAffordGachaPull({ ...DEFAULT_USER_STATE, ecoJam: 99 })).toBe(false);
    });
});
