import type { CommunityMissionProgressDto } from '../../api/notion/types';
import {
    floorAchievementPercent,
    getCommunityGoalProgressPercent,
    pickHomeCommunityMission,
    toCommunityGoalView,
} from './communityGoalMock';

function mission(
    partial: Partial<CommunityMissionProgressDto> & Pick<CommunityMissionProgressDto, 'id' | 'title'>,
): CommunityMissionProgressDto {
    return {
        description: null,
        imageUrl: null,
        difficulty: 'ONE_STAR',
        stage: 1,
        targetRatio: 30,
        achievementRatio: 0,
        participantCount: 0,
        totalUserCount: 0,
        succeeded: false,
        unlocked: true,
        completed: false,
        requiredProofCount: 1,
        submittedProofCount: 0,
        approvedProofCount: 0,
        readyToComplete: false,
        ...partial,
    };
}

describe('floorAchievementPercent', () => {
    it('소수는 내림하고 0~100으로 클램프한다', () => {
        expect(floorAchievementPercent(42.86)).toBe(42);
        expect(floorAchievementPercent(0.9)).toBe(0);
        expect(floorAchievementPercent(100.8)).toBe(100);
        expect(floorAchievementPercent(-1)).toBe(0);
    });
});

describe('pickHomeCommunityMission / toCommunityGoalView', () => {
    it('해금·미완료 미션을 우선하고 achievementRatio를 내림 %로 쓴다', () => {
        const picked = pickHomeCommunityMission([
            mission({ id: 1, title: '잠김', unlocked: false, achievementRatio: 10 }),
            mission({ id: 2, title: '완료', unlocked: true, completed: true, achievementRatio: 90 }),
            mission({ id: 3, title: '진행', unlocked: true, completed: false, achievementRatio: 42.86 }),
        ]);
        expect(picked?.id).toBe(3);
        expect(toCommunityGoalView(picked).percent).toBe(42);
        expect(toCommunityGoalView(picked).title).toBe('이번 주 함께 실천');
    });

    it('목록이 비면 0% 폴백', () => {
        expect(toCommunityGoalView(null).percent).toBe(0);
    });
});

describe('getCommunityGoalProgressPercent (legacy)', () => {
    it('current/target를 %로 바꾸고 소수는 내림한다', () => {
        expect(
            getCommunityGoalProgressPercent({
                title: 't',
                description: 'd',
                current: 1,
                target: 3,
            }),
        ).toBe(33);
    });
});
