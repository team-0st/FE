export type Shop = {
    id: string;
    name: string;
    area: string;
    philosophy: string;
    emoji: string;
};

export const MOCK_SHOPS: Shop[] = [
    {
        id: 'demo',
        name: '제로스트 데모샵',
        area: '파일럿',
        philosophy: '일상에서 작은 실천을 함께 기록해요.',
        emoji: '🌿',
    },
    {
        id: 'almae',
        name: '알맹상점',
        area: '성수',
        philosophy: '쓰레기 없는 소비를 함께 만들어가요.',
        emoji: '♻️',
    },
];

export function getShopById(id: string): Shop | undefined {
    return MOCK_SHOPS.find((shop) => shop.id === id);
}
