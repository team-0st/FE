export type MissionAuthType = 'photo' | 'receipt' | 'attendance_7d';

export type Mission = {
    id: string;
    title: string;
    description: string;
    points: number;
    emoji: string;
    authHint: string;
    authType?: MissionAuthType;
};

export type CoopMission = Mission & {
    kind: 'coop';
    difficulty: 1 | 2 | 3;
    unlockAfter: string | null;
    authType: MissionAuthType;
};

export function isCoopMission(mission: Mission): mission is CoopMission {
    return (mission as CoopMission).kind === 'coop';
}
