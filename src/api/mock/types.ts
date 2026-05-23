export type MissionKind = 'daily';

export type Mission = {
    id: string;
    kind: MissionKind;
    title: string;
    description: string;
    points: number;
    emoji: string;
    authHint: string;
};
