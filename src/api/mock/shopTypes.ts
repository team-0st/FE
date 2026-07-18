import type { ShopCategory } from './shopCategories';

export type ShopGeocodeStatus = 'verified' | 'approximate' | 'pending';

export type ShopDataSource =
    | 'almae-kakaomap'
    | 'seoul-smart-map'
    | 'public-website'
    | 'internal-mock';

export type Shop = {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    emoji: string;
    category: ShopCategory;
    /** 단골 샵·포인트 연동 가능 여부 (지도 표시와 별도) */
    pointEligible: boolean;
    /** 알맹상점 제공 — geocoding 전 원본 주소 */
    address: string;
    region: string;
    /** 우리가 geocoding 후 저장하는 좌표 (mock 포함) */
    latitude: number;
    longitude: number;
    geocodeStatus: ShopGeocodeStatus;
    dataSource: ShopDataSource;
};
