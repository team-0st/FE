/** 가이드 캐릭터 (12동물 팀과 별도) */
export const GUIDE_CHARACTER = {
    name: '새싹',
    emoji: '🌱',
} as const;

export type GuideMood = 'default' | 'happy' | 'cheer' | 'think';

const MOOD_EMOJI: Record<GuideMood, string> = {
    default: '🌱',
    happy: '🌿',
    cheer: '✨',
    think: '🌱',
};

export function guideEmoji(mood: GuideMood = 'default'): string {
    return MOOD_EMOJI[mood];
}
