/** @deprecated Use `@api/soup` / `@api/mock/soupCraftMock` */
export {
    mockRollSoupCraft as mockRollSoupReward,
    encodeSoupCraftForRoute as encodeSoupOutcome,
    decodeSoupCraftFromRoute as decodeSoupOutcome,
} from './soupCraftMock';

export type { SoupCraftResponse as SoupBrewOutcome } from '../notion/types';
