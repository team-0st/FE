import type { ZodiacId } from './zodiac';

/**
 * 팀 캐릭터 PNG를 `assets/characters/{zodiacId}.png` 에 넣은 뒤
 * 아래 require 주석을 해제하세요. (권장: 512×512, 배경 투명)
 */
export const teamCharacterImages: Partial<Record<ZodiacId, number>> = {
    // rat: require('../../../assets/characters/rat.png'),
    // ox: require('../../../assets/characters/ox.png'),
    // tiger: require('../../../assets/characters/tiger.png'),
    // rabbit: require('../../../assets/characters/rabbit.png'),
    // dragon: require('../../../assets/characters/dragon.png'),
    // snake: require('../../../assets/characters/snake.png'),
    // horse: require('../../../assets/characters/horse.png'),
    // goat: require('../../../assets/characters/goat.png'),
    // monkey: require('../../../assets/characters/monkey.png'),
    // rooster: require('../../../assets/characters/rooster.png'),
    // dog: require('../../../assets/characters/dog.png'),
    // pig: require('../../../assets/characters/pig.png'),
};

export function getTeamCharacterImage(zodiacId: ZodiacId): number | undefined {
    return teamCharacterImages[zodiacId];
}
