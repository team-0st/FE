import {
    BEGINNER_SLOT_COUNT,
    getIsoWeekKey,
    HIDDEN_SLOT_COUNT,
    LEGENDARY_SLOT_COUNT,
    type Recipe,
    WEEKLY_SLOT_COUNT,
} from './recipeTypes';

type WeeklyTemplate = {
    id: string;
    name: string;
    hintDrip: string;
    ingredientIds: string[];
    slotCount?: number;
    ecoJamReward: number;
};

/** Notion 일반 레시피 15 — hintDrip: 쉬운 버전 */
const WEEKLY_TEMPLATES: WeeklyTemplate[] = [
    {
        id: 'weekly-01',
        name: '오리지널 스프',
        hintDrip: '기본에 충실한 한 그릇! 빨간 채소와 동그란 친구가 함께하면 완성될지도?',
        ingredientIds: ['cabbage', 'tomato', 'onion'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-02',
        name: '토마토 스프',
        hintDrip: '새콤한 붉은 풍미가 중심! 눈물 나는 채소와 숲속 친구가 함께 등장합니다.',
        ingredientIds: ['tomato', 'onion', 'mushroom'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-03',
        name: '그린 스프',
        hintDrip: '초록빛 가득! 십자화과 채소 둘과 숲속의 향긋한 재료가 어울립니다.',
        ingredientIds: ['cabbage', 'broccoli', 'mushroom'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-04',
        name: '매콤 스프',
        hintDrip: '붉은 채소와 알싸한 향이 만났어요. 매운 색깔을 내는 채소가 핵심!',
        ingredientIds: ['tomato', 'paprika', 'onion'],
        ecoJamReward: 32,
    },
    {
        id: 'weekly-05',
        name: '버섯 스프',
        hintDrip: '숲에서 온 주인공이 있습니다. 달콤한 뿌리채소와 향긋한 채소가 함께해요.',
        ingredientIds: ['mushroom', 'onion', 'carrot'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-06',
        name: '채소 스프',
        hintDrip: '건강한 초록과 주황의 만남! 싱싱한 채소들이 주인공입니다.',
        ingredientIds: ['cabbage', 'carrot', 'broccoli'],
        ecoJamReward: 28,
    },
    {
        id: 'weekly-07',
        name: '비타민 스프',
        hintDrip: '비타민이 듬뿍! 빨간 채소와 주황빛 친구, 그리고 초록 채소가 함께해요.',
        ingredientIds: ['tomato', 'carrot', 'broccoli'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-08',
        name: '컬러 스프',
        hintDrip: '접시 위가 알록달록! 빨간색과 주황색 재료는 꼭 들어갈 것 같네요.',
        ingredientIds: ['tomato', 'carrot', 'paprika'],
        ecoJamReward: 32,
    },
    {
        id: 'weekly-09',
        name: '포만감 스프',
        hintDrip: '든든한 한 끼! 양배추와 숲속 재료가 들어가는 건 확실해 보여요.',
        ingredientIds: ['cabbage', 'mushroom', 'onion'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-10',
        name: '에너지 스프',
        hintDrip: '활력이 샘솟는 조합! 초록 채소와 주황빛 채소가 힘을 합칩니다.',
        ingredientIds: ['broccoli', 'paprika', 'carrot'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-11',
        name: '숲속 스프',
        hintDrip: '숲을 한 그릇에 담은 느낌! 초록 채소와 버섯 향이 가득합니다.',
        ingredientIds: ['cabbage', 'broccoli', 'mushroom', 'onion'],
        slotCount: HIDDEN_SLOT_COUNT,
        ecoJamReward: 34,
    },
    {
        id: 'weekly-12',
        name: '레드 스프',
        hintDrip: '붉은빛이 매력적인 오늘의 한 그릇! 빨간 채소 두 가지가 들어가는 것 같아요.',
        ingredientIds: ['tomato', 'paprika', 'mushroom'],
        ecoJamReward: 32,
    },
    {
        id: 'weekly-13',
        name: '가든 스프',
        hintDrip: '밭에서 온 신선한 조합! 초록과 빨강이 어우러집니다.',
        ingredientIds: ['cabbage', 'tomato', 'broccoli'],
        ecoJamReward: 28,
    },
    {
        id: 'weekly-14',
        name: '선셋 스프',
        hintDrip: '노을빛 주황과 붉은 채소, 그리고 동그란 친구가 만납니다.',
        ingredientIds: ['tomato', 'carrot', 'onion'],
        ecoJamReward: 30,
    },
    {
        id: 'weekly-15',
        name: '하모니 스프',
        hintDrip: '양배추·버섯·파프리카가 조화롭게 어울리는 한 그릇이에요.',
        ingredientIds: ['cabbage', 'mushroom', 'paprika'],
        ecoJamReward: 31,
    },
];

export function buildWeeklyRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return WEEKLY_TEMPLATES.map((t) => ({
        id: t.id,
        kind: 'weekly' as const,
        name: t.name,
        hint: t.hintDrip,
        hintDrip: t.hintDrip,
        ingredientIds: [...t.ingredientIds],
        slotCount: t.slotCount ?? WEEKLY_SLOT_COUNT,
        ecoJamReward: t.ecoJamReward,
        weekKey,
    }));
}

export const BEGINNER_RECIPES: Recipe[] = [
    {
        id: 'beginner-warm',
        kind: 'beginner',
        name: '따뜻한 입문 스프',
        hint: '토마토와 양파로 시작해요.',
        hintDrip: '토마토와 양파 두 가지면 충분해요.',
        ingredientIds: ['tomato', 'onion'],
        slotCount: BEGINNER_SLOT_COUNT,
        ecoJamReward: 12,
    },
    {
        id: 'beginner-green',
        kind: 'beginner',
        name: '초록 입문 스프',
        hint: '당근과 브로콜리 조합.',
        hintDrip: '주황과 초록, 가벼운 첫 스프예요.',
        ingredientIds: ['carrot', 'broccoli'],
        slotCount: BEGINNER_SLOT_COUNT,
        ecoJamReward: 10,
    },
];

export const HIDDEN_RECIPES: Recipe[] = [
    {
        id: 'hidden-crystal',
        kind: 'hidden',
        name: '크리스탈 스프',
        hint: '반짝이는 특별 재료가 필요해요.',
        hintDrip: '반짝이는 특별한 재료가 숨겨져 있습니다. 빨간 채소와 향긋한 채소를 먼저 떠올려 보세요.',
        ingredientIds: ['tomato', 'onion', 'mushroom', 'refill_crystal'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '알맹상점 쿠폰 (실물)',
    },
    {
        id: 'hidden-forest',
        kind: 'hidden',
        name: '포레스트 스프',
        hint: '숲의 기운이 담긴 레시피.',
        hintDrip: '깊은 숲의 기운이 담긴 레시피! 초록 채소와 숲속 친구가 만나면 비밀이 풀릴지도?',
        ingredientIds: ['cabbage', 'broccoli', 'mushroom', 'nature_sprout'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '친환경 굿즈 추첨 (실물)',
    },
    {
        id: 'hidden-starlight',
        kind: 'hidden',
        name: '스타라이트 스프',
        hint: '별처럼 특별한 재료가 마지막 퍼즐.',
        hintDrip: '밤하늘처럼 특별한 한 그릇! 붉은 채소와 주황빛 채소가 별을 기다리고 있습니다.',
        ingredientIds: ['tomato', 'paprika', 'carrot', 'eco_star'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '알맹 굿즈 세트 (실물)',
    },
];

export const LEGENDARY_RECIPES: Recipe[] = [
    {
        id: 'legendary-life',
        kind: 'legendary',
        name: '생명의 비약 스프',
        hint: '전설 등급',
        hintDrip: '비공개',
        ingredientIds: ['cabbage', 'tomato', 'onion', 'refill_crystal', 'nature_sprout'],
        slotCount: LEGENDARY_SLOT_COUNT,
        realRewardLabel: '한정 실물 패키지 (전설)',
    },
    {
        id: 'legendary-star-blessing',
        kind: 'legendary',
        name: '별의 축복 스프',
        hint: '전설 등급',
        hintDrip: '비공개',
        ingredientIds: ['mushroom', 'broccoli', 'paprika', 'nature_sprout', 'eco_star'],
        slotCount: LEGENDARY_SLOT_COUNT,
        realRewardLabel: '제로스트 한정 굿즈 (전설)',
    },
    {
        id: 'legendary-eternal',
        kind: 'legendary',
        name: '영원의 마법 스프',
        hint: '전설 등급',
        hintDrip: '비공개',
        ingredientIds: ['tomato', 'carrot', 'mushroom', 'refill_crystal', 'eco_star'],
        slotCount: LEGENDARY_SLOT_COUNT,
        realRewardLabel: '친환경 체험권 (전설)',
    },
];

export function buildAllRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return [...buildWeeklyRecipes(weekKey), ...BEGINNER_RECIPES, ...HIDDEN_RECIPES, ...LEGENDARY_RECIPES];
}

/** id·이름 조회용 */
export function findRecipeInCatalog(id: string, weekKey = getIsoWeekKey()): Recipe | undefined {
    return buildAllRecipes(weekKey).find((recipe) => recipe.id === id);
}
