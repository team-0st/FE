import type { AnimalTeamId } from './animalTeams';

/** PNG: assets/characters/{id}.png → require 주석 해제 */
export const teamCharacterImages: Partial<Record<AnimalTeamId, number>> = {
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

export function getTeamCharacterImage(animalId: AnimalTeamId): number | undefined {
    return teamCharacterImages[animalId];
}
