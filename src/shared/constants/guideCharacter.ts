/** 가이드 마스코트 — 펭귄 제로 · 북극곰 스티 (제로스트) */
export const GUIDE_CHARACTER = {
    penguinName: '제로',
    bearName: '스티',
    /** 네임태그·짧은 표기 */
    name: '제로 · 스티',
    /** 접근성·문장용 */
    duoLabel: '제로와 스티',
} as const;

export type GuideMood = 'default' | 'happy' | 'cheer' | 'think';
