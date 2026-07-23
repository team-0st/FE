import {
    applyRegisterUser,
    reconcileOnboardingFromMyPage,
} from './userStateLogic';
import { DEFAULT_USER_STATE } from './defaultState';

describe('applyRegisterUser', () => {
    it('로컬 onboardingCompleted true여도 BE 응답(false)을 따른다', () => {
        const local = {
            ...DEFAULT_USER_STATE,
            onboardingCompleted: true,
            nickname: '로컬유저',
        };
        const next = applyRegisterUser(local, {
            userId: 42,
            deviceId: 'dev',
            onboardingCompleted: false,
        });
        expect(next.userId).toBe(42);
        expect(next.onboardingCompleted).toBe(false);
    });
});

describe('reconcileOnboardingFromMyPage', () => {
    it('nickname·shop이 없으면 온보딩 미완료로 맞춘다', () => {
        const local = {
            ...DEFAULT_USER_STATE,
            onboardingCompleted: true,
            nickname: '로컬',
        };
        const next = reconcileOnboardingFromMyPage(local, {
            nickname: null,
            shopName: null,
            ecoJam: 500,
            point: 0,
        });
        expect(next.onboardingCompleted).toBe(false);
        expect(next.ecoJam).toBe(500);
    });

    it('nickname·shop이 있으면 온보딩 완료로 맞춘다', () => {
        const next = reconcileOnboardingFromMyPage(DEFAULT_USER_STATE, {
            nickname: '서버닉',
            shopName: '알맹상점',
            ecoJam: 500,
            point: 10,
        });
        expect(next.onboardingCompleted).toBe(true);
        expect(next.nickname).toBe('서버닉');
        expect(next.totalPoints).toBe(10);
    });
});
