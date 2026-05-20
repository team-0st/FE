/** 십이지신(띠) 팀 — id는 영문, name은 화면 표기용 동물 이름 */
export const ZODIAC_ANIMALS = [
    { id: 'rat', name: '쥐', emoji: '🐭', order: 1 },
    { id: 'ox', name: '소', emoji: '🐮', order: 2 },
    { id: 'tiger', name: '호랑이', emoji: '🐯', order: 3 },
    { id: 'rabbit', name: '토끼', emoji: '🐰', order: 4 },
    { id: 'dragon', name: '용', emoji: '🐲', order: 5 },
    { id: 'snake', name: '뱀', emoji: '🐍', order: 6 },
    { id: 'horse', name: '말', emoji: '🐴', order: 7 },
    { id: 'goat', name: '양', emoji: '🐑', order: 8 },
    { id: 'monkey', name: '원숭이', emoji: '🐵', order: 9 },
    { id: 'rooster', name: '닭', emoji: '🐔', order: 10 },
    { id: 'dog', name: '개', emoji: '🐶', order: 11 },
    { id: 'pig', name: '돼지', emoji: '🐷', order: 12 },
] as const;

export type ZodiacId = (typeof ZODIAC_ANIMALS)[number]['id'];
