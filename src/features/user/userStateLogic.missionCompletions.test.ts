import { applyMissionCompletionsToState } from './userStateLogic';
import { DEFAULT_USER_STATE } from './defaultState';

describe('applyMissionCompletionsToState', () => {
    it('marks claimed missions completed even without rewardedIngredient', () => {
        const withClaimable = {
            ...DEFAULT_USER_STATE,
            missionProgress: {
                tumbler: { status: 'claimable' as const, completionId: 55 },
            },
        };
        const next = applyMissionCompletionsToState(
            withClaimable,
            [
                {
                    completionId: 55,
                    missionId: 1,
                    missionTitle: '텀블러 사용 인증',
                    status: 'APPROVED',
                    rewardClaimable: false,
                    rewardClaimed: true,
                    rewardedIngredient: null,
                },
            ],
            () => 'tumbler',
            () => undefined,
        );
        expect(next.missionProgress.tumbler?.status).toBe('completed');
    });

    it('keeps claimable when BE says rewardClaimable', () => {
        const next = applyMissionCompletionsToState(
            DEFAULT_USER_STATE,
            [
                {
                    completionId: 10,
                    missionId: 2,
                    missionTitle: '장바구니 사용 인증',
                    status: 'APPROVED',
                    rewardClaimable: true,
                    rewardClaimed: false,
                    rewardedIngredient: { id: 3, name: '토마토', imageUrl: null },
                },
            ],
            () => 'bag',
            (id) => `be-${id}`,
        );
        expect(next.missionProgress.bag?.status).toBe('claimable');
        expect(next.missionProgress.bag?.completionId).toBe(10);
    });

    it('marks pending_review as rejected when latest completion is REJECTED', () => {
        const withPending = {
            ...DEFAULT_USER_STATE,
            missionProgress: {
                tumbler: { status: 'pending_review' as const, completionId: 40 },
            },
        };
        const next = applyMissionCompletionsToState(
            withPending,
            [
                {
                    completionId: 40,
                    missionId: 1,
                    missionTitle: '텀블러 사용 인증',
                    status: 'REJECTED',
                    rewardClaimable: false,
                    rewardClaimed: false,
                },
            ],
            () => 'tumbler',
            () => undefined,
        );
        expect(next.missionProgress.tumbler?.status).toBe('rejected');
    });

    it('prefers newer PENDING over older REJECTED for the same mission', () => {
        const next = applyMissionCompletionsToState(
            DEFAULT_USER_STATE,
            [
                {
                    completionId: 42,
                    missionId: 1,
                    missionTitle: '텀블러 사용 인증',
                    status: 'PENDING',
                    rewardClaimable: false,
                    rewardClaimed: false,
                    submittedAt: '2026-07-24T12:00:00',
                },
                {
                    completionId: 40,
                    missionId: 1,
                    missionTitle: '텀블러 사용 인증',
                    status: 'REJECTED',
                    rewardClaimable: false,
                    rewardClaimed: false,
                    submittedAt: '2026-07-24T10:00:00',
                },
            ],
            () => 'tumbler',
            () => undefined,
        );
        expect(next.missionProgress.tumbler?.status).toBe('pending_review');
        expect(next.missionProgress.tumbler?.completionId).toBe(42);
    });
});
