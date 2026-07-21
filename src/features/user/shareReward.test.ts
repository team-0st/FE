import { DEFAULT_USER_STATE } from './defaultState';
import { claimShareReward } from './userStateLogic';

describe('claimShareReward (서버 검증 없는 SNS 공유 보상 차단)', () => {
    it('서버 검증 API가 없으므로 항상 verification_unavailable을 반환한다', () => {
        const { result } = claimShareReward(DEFAULT_USER_STATE);
        expect(result).toEqual({ ok: false, reason: 'verification_unavailable' });
    });

    it('호출돼도 ecoJam을 변경하지 않는다', () => {
        const before = { ...DEFAULT_USER_STATE, ecoJam: 42 };
        const { state } = claimShareReward(before);
        expect(state.ecoJam).toBe(42);
    });

    it('호출돼도 ecoJamLedger에 항목을 추가하지 않는다', () => {
        const before = DEFAULT_USER_STATE;
        const { state } = claimShareReward(before);
        expect(state.ecoJamLedger).toEqual(before.ecoJamLedger);
    });

    it('호출돼도 lastShareRewardDate를 변경하지 않는다 (이미 지급된 계정도 다시 건드리지 않음)', () => {
        const before = { ...DEFAULT_USER_STATE, lastShareRewardDate: '2026-01-01' };
        const { state } = claimShareReward(before);
        expect(state.lastShareRewardDate).toBe('2026-01-01');
    });

    it('입력 state 객체 참조 자체를 그대로 반환한다 (부분 mutation 없음)', () => {
        const before = DEFAULT_USER_STATE;
        const { state } = claimShareReward(before);
        expect(state).toBe(before);
    });
});
