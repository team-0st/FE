export type MissionKind = 'daily' | 'weekly';

export type Mission = {
    id: string;
    kind: MissionKind;
    title: string;
    description: string;
    points: number;
    emoji: string;
    authHint: string;
};

export type Team = {
    /** 동물 팀 id (rat, ox, …) */
    id: string;
    /** 동물 이름 (쥐, 소, …) */
    name: string;
    emoji: string;
    animalOrder: number;
    rank: number;
    weeklyPoints: number;
    memberCount: number;
};

export type RankingEntry = {
    rank: number;
    teamName: string;
    points: number;
    isMyTeam: boolean;
};

export type PersonalRankingEntry = {
    rank: number;
    nickname: string;
    teamName: string;
    teamId: string;
    points: number;
    isMe: boolean;
};

export type UserProfile = {
    nickname: string;
    teamName: string;
    streakDays: number;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    checkedInToday: boolean;
};
