export type Shop = {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    emoji: string;
};

export const MOCK_SHOPS: Shop[] = [
    {
        id: 'demo',
        name: '알맹상점',
        description: '일상에서 작은 실천을 함께 기록해요. (파일럿)',
        imageUrl: null,
        emoji: '🌿',
    },
    {
        id: 'almae',
        name: '알맹상점',
        description: '쓰레기 없는 소비를 함께 만들어가요. (성수)',
        imageUrl: null,
        emoji: '♻️',
    },
];

export function getShopById(id: string): Shop | undefined {
    return MOCK_SHOPS.find((shop) => shop.id === id);
}
