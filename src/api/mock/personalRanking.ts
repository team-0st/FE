import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import { getTeamById } from './data';
import type { PersonalRankingEntry } from './types';

type PersonalLeaderboardRow = {
    nickname: string;
    teamId: AnimalTeamId;
    weeklyPoints: number;
};

const MOCK_PERSONAL_LEADERBOARD: PersonalLeaderboardRow[] = [
    { nickname: '민지', teamId: 'horse', weeklyPoints: 320 },
    { nickname: '준호', teamId: 'dragon', weeklyPoints: 295 },
    { nickname: '서연', teamId: 'tiger', weeklyPoints: 280 },
    { nickname: '현우', teamId: 'rabbit', weeklyPoints: 265 },
    { nickname: '지아', teamId: 'ox', weeklyPoints: 250 },
    { nickname: '도윤', teamId: 'monkey', weeklyPoints: 238 },
    { nickname: '하은', teamId: 'rooster', weeklyPoints: 220 },
    { nickname: '시우', teamId: 'dog', weeklyPoints: 205 },
    { nickname: '유나', teamId: 'goat', weeklyPoints: 190 },
    { nickname: '건우', teamId: 'rat', weeklyPoints: 175 },
    { nickname: '수아', teamId: 'snake', weeklyPoints: 160 },
    { nickname: '예준', teamId: 'pig', weeklyPoints: 145 },
];

function toEntry(row: PersonalLeaderboardRow, isMe: boolean): Omit<PersonalRankingEntry, 'rank'> {
    const team = getTeamById(row.teamId);
    return {
        nickname: row.nickname,
        teamName: team?.name ?? row.teamId,
        teamId: row.teamId,
        points: row.weeklyPoints,
        isMe,
    };
}

export function buildPersonalRanking(params: {
    nickname: string;
    teamId: AnimalTeamId | null;
    weeklyPoints: number;
}): PersonalRankingEntry[] {
    const myTeamId = params.teamId ?? 'rabbit';
    const others = MOCK_PERSONAL_LEADERBOARD.filter((row) => row.nickname !== params.nickname).map((row) =>
        toEntry(row, false),
    );
    const me = toEntry(
        {
            nickname: params.nickname,
            teamId: myTeamId,
            weeklyPoints: params.weeklyPoints,
        },
        true,
    );
    const sorted = [...others, me].sort((a, b) => b.points - a.points);
    return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}
