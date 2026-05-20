export type Mission = {
    id: string;
    title: string;
    description: string;
    points: number;
    emoji: string;
    completed: boolean;
};

export type Team = {
    id: string;
    name: string;
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

export type UserProfile = {
    nickname: string;
    teamName: string;
    streakDays: number;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    totalPoints: number;
    checkedInToday: boolean;
};
