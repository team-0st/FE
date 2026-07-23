import type { CommunityMissionProgressDto } from '../../api/notion/types';

/** 홈 「이번 주 함께 실천」 표시용 */
export type CommunityGoalView = {
    title: string;
    description: string;
    /** 0~100 정수 % (내림) */
    percent: number;
    communityMissionId?: number;
    readyToComplete?: boolean;
    completed?: boolean;
};

export const COMMUNITY_GOAL_FALLBACK: CommunityGoalView = {
    title: '이번 주 함께 실천',
    description: '참여자 실천이 모이면 목표가 채워져요.',
    percent: 0,
};

/** BE achievementRatio → 0~100 정수 %. 소수는 내림. */
export function floorAchievementPercent(ratio: number): number {
    if (!Number.isFinite(ratio)) {
        return 0;
    }
    return Math.min(100, Math.max(0, Math.floor(ratio)));
}

/**
 * 홈 카드에 쓸 공동 미션 1개 선택.
 * 해금·미완료 우선 → 해금 → 목록 첫 항목.
 */
export function pickHomeCommunityMission(
    missions: CommunityMissionProgressDto[],
): CommunityMissionProgressDto | null {
    if (missions.length === 0) {
        return null;
    }
    const unlockedOpen = missions.find((m) => m.unlocked && !m.completed && !m.succeeded);
    if (unlockedOpen != null) {
        return unlockedOpen;
    }
    const unlocked = missions.find((m) => m.unlocked);
    if (unlocked != null) {
        return unlocked;
    }
    return missions[0] ?? null;
}

export function toCommunityGoalView(
    mission: CommunityMissionProgressDto | null,
): CommunityGoalView {
    if (mission == null) {
        return COMMUNITY_GOAL_FALLBACK;
    }
    const description =
        mission.description != null && mission.description.trim().length > 0
            ? mission.description.trim()
            : COMMUNITY_GOAL_FALLBACK.description;
    return {
        title: COMMUNITY_GOAL_FALLBACK.title,
        description,
        percent: floorAchievementPercent(mission.achievementRatio),
        communityMissionId: mission.id,
        readyToComplete: mission.readyToComplete,
        completed: mission.completed || mission.succeeded,
    };
}

/** @deprecated current/target 비율용 — BE % 연동 후 floorAchievementPercent 사용 */
export type CommunityGoal = {
    title: string;
    description: string;
    current: number;
    target: number;
};

/** @deprecated */
export const PILOT_COMMUNITY_GOAL: CommunityGoal = {
    title: COMMUNITY_GOAL_FALLBACK.title,
    description: COMMUNITY_GOAL_FALLBACK.description,
    current: 0,
    target: 100,
};

/** @deprecated current/target → % */
export function getCommunityGoalProgressPercent(goal: CommunityGoal): number {
    if (goal.target <= 0) {
        return 0;
    }
    return Math.min(100, Math.max(0, Math.floor((goal.current / goal.target) * 100)));
}
