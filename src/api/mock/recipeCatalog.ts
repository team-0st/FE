import {
    BEGINNER_SLOT_COUNT,
    getIsoWeekKey,
    HIDDEN_SLOT_COUNT,
    type Recipe,
    WEEKLY_SLOT_COUNT,
} from './recipeTypes';

type WeeklyTemplate = {
    id: string;
    name: string;
    hintDrip: string;
    ingredientIds: [string, string, string];
    ecoJamReward: number;
};

const WEEKLY_TEMPLATES: WeeklyTemplate[] = [
    { id: 'weekly-01', name: '차분한 허브 스프', hintDrip: '향긋한 게 좋대요.', ingredientIds: ['herb', 'drop', 'leaf'], ecoJamReward: 30 },
    { id: 'weekly-02', name: '숲속 버섯 스프', hintDrip: '숲 냄새가 나면 반은 맞아요.', ingredientIds: ['mushroom', 'leaf', 'herb'], ecoJamReward: 32 },
    { id: 'weekly-03', name: '별빛 이슬 스프', hintDrip: '밤하늘을 닮은 맛.', ingredientIds: ['star', 'drop', 'herb'], ecoJamReward: 34 },
    { id: 'weekly-04', name: '당근 포션', hintDrip: '주황빛이 포인트예요.', ingredientIds: ['carrot', 'herb', 'drop'], ecoJamReward: 28 },
    { id: 'weekly-05', name: '친환경 잎차 스프', hintDrip: '잎사귀가 살짝 겹쳐요.', ingredientIds: ['leaf', 'seed', 'drop'], ecoJamReward: 30 },
    { id: 'weekly-06', name: '씨앗 싹 스프', hintDrip: '싹 트는 기운이 필요해요.', ingredientIds: ['seed', 'herb', 'leaf'], ecoJamReward: 26 },
    { id: 'weekly-07', name: '수정 빛 스프', hintDrip: '투명한 반짝임.', ingredientIds: ['crystal', 'drop', 'star'], ecoJamReward: 36 },
    { id: 'weekly-08', name: '바람잎 스프', hintDrip: '바람이 스치듯 가볍게.', ingredientIds: ['wind', 'leaf', 'herb'], ecoJamReward: 30 },
    { id: 'weekly-09', name: '잔불 따뜻 스프', hintDrip: '은은한 온기.', ingredientIds: ['ember', 'mushroom', 'drop'], ecoJamReward: 33 },
    { id: 'weekly-10', name: '이슬꽃 스프', hintDrip: '아침 이슬을 떠올려 보세요.', ingredientIds: ['drop', 'herb', 'seed'], ecoJamReward: 29 },
    { id: 'weekly-11', name: '버섯별 스프', hintDrip: '땅과 하늘 사이.', ingredientIds: ['mushroom', 'star', 'leaf'], ecoJamReward: 35 },
    { id: 'weekly-12', name: '당근잎 콤보', hintDrip: '뿌리와 잎이 짝이에요.', ingredientIds: ['carrot', 'leaf', 'wind'], ecoJamReward: 31 },
    { id: 'weekly-13', name: '허브 수정탕', hintDrip: '차가운 빛 한 스푼.', ingredientIds: ['herb', 'crystal', 'drop'], ecoJamReward: 37 },
    { id: 'weekly-14', name: '불씨 버섯탕', hintDrip: '불과 땅의 만남.', ingredientIds: ['ember', 'mushroom', 'herb'], ecoJamReward: 34 },
    { id: 'weekly-15', name: '바람별 스프', hintDrip: '날리는 별가루.', ingredientIds: ['wind', 'star', 'drop'], ecoJamReward: 38 },
];

export function buildWeeklyRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return WEEKLY_TEMPLATES.map((t) => ({
        id: t.id,
        kind: 'weekly' as const,
        name: t.name,
        hint: t.hintDrip,
        hintDrip: t.hintDrip,
        ingredientIds: [...t.ingredientIds],
        slotCount: WEEKLY_SLOT_COUNT,
        ecoJamReward: t.ecoJamReward,
        weekKey,
    }));
}

export const BEGINNER_RECIPES: Recipe[] = [
    {
        id: 'beginner-warm',
        kind: 'beginner',
        name: '따뜻한 입문 스프',
        hint: '두 가지면 충분해요.',
        hintDrip: '작은 냄비로 시작해 보세요.',
        ingredientIds: ['herb', 'drop'],
        slotCount: BEGINNER_SLOT_COUNT,
        ecoJamReward: 12,
    },
    {
        id: 'beginner-leaf',
        kind: 'beginner',
        name: '잎사귀 입문 스프',
        hint: '가벼운 조합.',
        hintDrip: '잎과 씨앗의 조화.',
        ingredientIds: ['leaf', 'seed'],
        slotCount: BEGINNER_SLOT_COUNT,
        ecoJamReward: 10,
    },
];

export const HIDDEN_RECIPES: Recipe[] = [
    {
        id: 'hidden-golden',
        kind: 'hidden',
        name: '황금 마녀스프',
        hint: '별가루가 들어간 비밀 레시피예요.',
        hintDrip: '반짝이는 네 가지.',
        ingredientIds: ['star', 'herb', 'mushroom', 'drop'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '제로웨이스트 샵 쿠폰 (실물)',
    },
    {
        id: 'hidden-moon',
        kind: 'hidden',
        name: '달빛 스프',
        hint: '네 가지 재료가 모두 필요해요.',
        hintDrip: '달빛 아래서만 완성돼요.',
        ingredientIds: ['star', 'carrot', 'leaf', 'crystal'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '친환경 굿즈 추첨 (실물)',
    },
    {
        id: 'hidden-aurora',
        kind: 'hidden',
        name: '오로라 스프',
        hint: '북극빛 비밀 조합.',
        hintDrip: '차가운 바람과 불씨.',
        ingredientIds: ['wind', 'ember', 'crystal', 'drop'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '알맹 굿즈 세트 (실물)',
    },
];

export const LEGENDARY_RECIPES: Recipe[] = [
    {
        id: 'legendary-void',
        kind: 'legendary',
        name: '공허의 전설 스프',
        hint: '전설 등급',
        hintDrip: '아무도 레시피를 모른대요.',
        ingredientIds: ['crystal', 'star', 'ember', 'wind'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '한정 실물 패키지 (전설)',
    },
    {
        id: 'legendary-sun',
        kind: 'legendary',
        name: '태양의 전설 스프',
        hint: '전설 등급',
        hintDrip: '빛이 세 가지 이상 모여야 해요.',
        ingredientIds: ['ember', 'star', 'seed', 'herb'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '제로스트 한정 굿즈 (전설)',
    },
    {
        id: 'legendary-tide',
        kind: 'legendary',
        name: '조수의 전설 스프',
        hint: '전설 등급',
        hintDrip: '물결과 잎이 동시에.',
        ingredientIds: ['drop', 'leaf', 'wind', 'mushroom'],
        slotCount: HIDDEN_SLOT_COUNT,
        realRewardLabel: '친환경 체험권 (전설)',
    },
];

export function buildAllRecipes(weekKey = getIsoWeekKey()): Recipe[] {
    return [...buildWeeklyRecipes(weekKey), ...BEGINNER_RECIPES, ...HIDDEN_RECIPES, ...LEGENDARY_RECIPES];
}
