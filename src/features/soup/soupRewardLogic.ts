/** @deprecated Use `@api/soup` / `@api/mock/soupCraftMock` */
export {
    decodeSoupCraftFromRoute as decodeSoupOutcome,
    encodeSoupCraftForRoute as encodeSoupOutcome,
    mockRollSoupCraft as rollSoupReward,
} from '@api/mock/soupCraftMock';

export type { SoupCraftResponse as SoupBrewOutcome } from '@api/notion/types';
