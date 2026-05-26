export type Ingredient = {
    id: string;
    name: string;
    emoji: string;
};

export const INGREDIENTS: Ingredient[] = [
    { id: 'herb', name: '제로 허브', emoji: '🌿' },
    { id: 'carrot', name: '당근 조각', emoji: '🥕' },
    { id: 'mushroom', name: '버섯', emoji: '🍄' },
    { id: 'star', name: '별가루', emoji: '✨' },
    { id: 'leaf', name: '친환경 잎', emoji: '🍃' },
    { id: 'drop', name: '이슬', emoji: '💧' },
];

export const MISSION_INGREDIENT_REWARD: Record<string, string> = {
    tumbler: 'herb',
    bag: 'leaf',
    transit: 'drop',
    'visit-not-delivery': 'carrot',
    recycle: 'mushroom',
};

export function getIngredientById(id: string): Ingredient | undefined {
    return INGREDIENTS.find((item) => item.id === id);
}
