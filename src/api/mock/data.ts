import { ANIMAL_TEAMS } from '../../shared/constants/animalTeams';
import type { Mission, RankingEntry, Team, UserProfile } from './types';

/** mock 주간 포인트 (정렬 후 rank 부여) */
const TEAM_WEEKLY_STATS: Record<string, { weeklyPoints: number; memberCount: number }> = {
    horse: { weeklyPoints: 1520, memberCount: 28 },
    dragon: { weeklyPoints: 1480, memberCount: 26 },
    rabbit: { weeklyPoints: 1280, memberCount: 24 },
    tiger: { weeklyPoints: 1210, memberCount: 22 },
    ox: { weeklyPoints: 1150, memberCount: 25 },
    monkey: { weeklyPoints: 1090, memberCount: 21 },
    rooster: { weeklyPoints: 1020, memberCount: 20 },
    dog: { weeklyPoints: 980, memberCount: 23 },
    goat: { weeklyPoints: 940, memberCount: 19 },
    rat: { weeklyPoints: 900, memberCount: 18 },
    snake: { weeklyPoints: 860, memberCount: 17 },
    pig: { weeklyPoints: 820, memberCount: 16 },
};

function buildMockTeams(): Team[] {
    const teams = ANIMAL_TEAMS.map((animal) => {
        const stats = TEAM_WEEKLY_STATS[animal.id] ?? { weeklyPoints: 0, memberCount: 0 };
        return {
            id: animal.id,
            name: animal.name,
            emoji: animal.emoji,
            animalOrder: animal.order,
            rank: 0,
            weeklyPoints: stats.weeklyPoints,
            memberCount: stats.memberCount,
        };
    });
    teams.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export const mockTeams: Team[] = buildMockTeams();

export const mockUser: UserProfile = {
    nickname: '사용자',
    teamName: '토끼',
    streakDays: 5,
    weeklyMissionDone: 3,
    weeklyMissionTotal: 5,
    totalPoints: 420,
    checkedInToday: false,
};

export const mockMissions: Mission[] = [
    {
        id: 'tumbler',
        title: '텀블러 사용하기',
        description: '일회용 컵 대신 텀블러를 사용해요.',
        points: 30,
        emoji: '☕️',
        completed: false,
    },
    {
        id: 'recycle',
        title: '분리수거 인증',
        description: '올바르게 분리수거한 사진을 남겨요.',
        points: 50,
        emoji: '♻️',
        completed: true,
    },
    {
        id: 'bag',
        title: '장바구니 챙기기',
        description: '마트·편의점에서 장바구니를 사용해요.',
        points: 20,
        emoji: '🛍️',
        completed: false,
    },
];

export const mockRanking: RankingEntry[] = mockTeams.map((team) => ({
    rank: team.rank,
    teamName: team.name,
    points: team.weeklyPoints,
    isMyTeam: team.name === mockUser.teamName,
}));

export function getMissionById(id: string): Mission | undefined {
    return mockMissions.find((mission) => mission.id === id);
}

export function getTeamById(id: string): Team | undefined {
    return mockTeams.find((team) => team.id === id);
}
