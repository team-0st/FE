import type { Mission, RankingEntry, Team, UserProfile } from './types';

export const mockUser: UserProfile = {
    nickname: '제로히어로',
    teamName: '그린워커스',
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

export const mockTeams: Team[] = [
    { id: 'green', name: '그린워커스', rank: 2, weeklyPoints: 1280, memberCount: 24 },
    { id: 'ocean', name: '오션가드', rank: 1, weeklyPoints: 1410, memberCount: 22 },
    { id: 'earth', name: '어스메이트', rank: 3, weeklyPoints: 1190, memberCount: 26 },
];

export const mockRanking: RankingEntry[] = [
    { rank: 1, teamName: '오션가드', points: 1410, isMyTeam: false },
    { rank: 2, teamName: '그린워커스', points: 1280, isMyTeam: true },
    { rank: 3, teamName: '어스메이트', points: 1190, isMyTeam: false },
];

export function getMissionById(id: string): Mission | undefined {
    return mockMissions.find((mission) => mission.id === id);
}
