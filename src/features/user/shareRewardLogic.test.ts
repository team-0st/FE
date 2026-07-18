import { DEFAULT_USER_STATE } from './defaultState';
import { claimShareReward, formatDateKey } from './userStateLogic';
import { SHARE_REWARD_ECO_JAM_AMOUNT } from '../../shared/constants/shareRewardPolicy';

describe('claimShareReward', () => {
    const today = formatDateKey(new Date());

    it('grants eco jam once per day', () => {
        const { state: next, result } = claimShareReward(DEFAULT_USER_STATE, today);
        expect(result).toEqual({ ok: true, ecoJamGranted: SHARE_REWARD_ECO_JAM_AMOUNT });
        expect(next.ecoJam).toBe(DEFAULT_USER_STATE.ecoJam + SHARE_REWARD_ECO_JAM_AMOUNT);
        expect(next.lastShareRewardDate).toBe(today);
    });

    it('rejects second claim on same day', () => {
        const once = claimShareReward(DEFAULT_USER_STATE, today);
        const twice = claimShareReward(once.state, today);
        expect(twice.result).toEqual({ ok: false, reason: 'already_claimed_today' });
        expect(twice.state.ecoJam).toBe(once.state.ecoJam);
    });
});
