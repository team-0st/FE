/** 파일럿용 커뮤니티 목표 mock (BE 집계 전) */

export type CommunityGoal = {
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
};

/** Figma 04 홈 — 진행도는 % 표기 (절대 횟수는 보조) */
export const PILOT_COMMUNITY_GOAL: CommunityGoal = {
    title: '이번 주 함께 실천',
    description: '참여자 실천이 모이면 목표가 채워져요.',
    current: 42,
    target: 100,
    unit: '회',
};

export function getCommunityGoalProgressPercent(goal: CommunityGoal): number {
    if (goal.target <= 0) {
        return 0;
    }
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
}
