import type { AppUserState, MissionProgressStatus } from './types';

export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isCheckedInToday(state: AppUserState, today = formatDateKey(new Date())): boolean {
    return state.lastCheckInDate === today;
}

export function checkIn(state: AppUserState, today = formatDateKey(new Date())): AppUserState {
    if (state.lastCheckInDate === today) {
        return state;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);
    const streakDays = state.lastCheckInDate === yesterdayKey ? state.streakDays + 1 : 1;
    return {
        ...state,
        lastCheckInDate: today,
        streakDays,
    };
}

export function finishOnboarding(state: AppUserState, shopId: string): AppUserState {
    return {
        ...state,
        shopId,
        onboardingCompleted: true,
    };
}

export function setShopId(state: AppUserState, shopId: string): AppUserState {
    return { ...state, shopId };
}

export function getMissionStatus(state: AppUserState, missionId: string): MissionProgressStatus {
    return state.missionProgress[missionId]?.status ?? 'available';
}

export function submitMissionReview(state: AppUserState, missionId: string): AppUserState {
    const now = new Date().toISOString();
    return {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: { status: 'pending_review', submittedAt: now },
        },
    };
}

export function approveMission(state: AppUserState, missionId: string, points: number): AppUserState {
    const now = new Date().toISOString();
    const wasCompleted = state.missionProgress[missionId]?.status === 'completed';
    const next: AppUserState = {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: { status: 'completed', completedAt: now },
        },
    };
    if (wasCompleted) {
        return next;
    }
    const weeklyMissionDone = Math.min(next.weeklyMissionTotal, next.weeklyMissionDone + 1);
    return {
        ...next,
        weeklyMissionDone,
        totalPoints: next.totalPoints + points,
    };
}
