import { brandUriSource } from './brandImageUris';
import { soupUriSource, type SoupImageUriKey } from './soupImageUris';

/** recipe.id → soup art key (`assets/brand/soups`) */
const RECIPE_SOUP_KEY: Record<string, SoupImageUriKey> = {
    'weekly-01': 'weekly_01',
    'weekly-02': 'weekly_02',
    'weekly-03': 'weekly_03',
    'weekly-04': 'weekly_04',
    'weekly-05': 'weekly_05',
    'weekly-06': 'weekly_06',
    'weekly-07': 'weekly_07',
    'weekly-08': 'weekly_08',
    'weekly-09': 'weekly_09',
    'weekly-10': 'weekly_10',
    'weekly-11': 'weekly_11',
    'weekly-12': 'weekly_12',
    'weekly-13': 'weekly_13',
    'weekly-14': 'weekly_14',
    'weekly-15': 'weekly_15',
    'beginner-warm': 'beginner_warm',
    'beginner-green': 'beginner_green',
    'hidden-crystal': 'hidden_crystal',
    'hidden-forest': 'hidden_forest',
    'hidden-starlight': 'hidden_starlight',
    'legendary-life': 'legendary_life',
    'legendary-star-blessing': 'legendary_star_blessing',
    'legendary-eternal': 'legendary_eternal',
};

/** 레시피별 스프 이미지. 없으면 공통 스프 아이콘. */
export function getSoupImageSource(recipeId: string | null | undefined): { uri: string } {
    if (recipeId != null) {
        const key = RECIPE_SOUP_KEY[recipeId];
        if (key != null) {
            return soupUriSource(key);
        }
    }
    return brandUriSource('soup');
}

export function hasSoupImage(recipeId: string): boolean {
    return recipeId in RECIPE_SOUP_KEY;
}
