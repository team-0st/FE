import {
    PILOT_SHOP_ID,
    PILOT_USER_LOCATION,
} from '../../shared/constants/pilotShop';
import type { ShopCategory } from './shopCategories';
import { getShopCategoryLabel } from './shopCategories';
import { KAKAO_MAP_SHOPS } from './kakaoMapShopMapper';
import type { Shop } from './shopTypes';

export type { Shop, ShopDataSource, ShopGeocodeStatus } from './shopTypes';
export { getShopCategoryLabel } from './shopCategories';

/**
 * 지도·주변 상점 목록 — 알맹 카카오맵 폴더에서 파싱한 실제 매장명·주소.
 * 좌표·사진은 저작권·개인정보 이슈로 보류 (geocodeStatus: pending, imageUrl: null).
 * @see https://map.kakao.com/?map_type=TYPE_MAP&folderid=4049789
 */
export const MOCK_MAP_SHOPS: Shop[] = KAKAO_MAP_SHOPS;

/** @deprecated MOCK_MAP_SHOPS 사용 권장 */
export const MOCK_SHOPS: Shop[] = MOCK_MAP_SHOPS;

/** 미리보기용 — 파일럿 마포(망원) 인근 (useGeolocation 연동 전) */
export const MOCK_USER_LOCATION = PILOT_USER_LOCATION;

export const DEFAULT_PILOT_SHOP_ID = PILOT_SHOP_ID;

const DEFAULT_LEGACY_SHOP_ID = PILOT_SHOP_ID;

/** @deprecated id 호환 — 온보딩 등 기존 slug */
const LEGACY_SHOP_ID: Record<string, string> = {
    demo: DEFAULT_LEGACY_SHOP_ID,
    almae: DEFAULT_LEGACY_SHOP_ID,
    'almae-seongsu': DEFAULT_LEGACY_SHOP_ID,
    'almae-mapo': DEFAULT_LEGACY_SHOP_ID,
};

export function getMapShops(): Shop[] {
    return MOCK_MAP_SHOPS;
}

/** 단골 샵·포인트 연동 가능한 제휴/직영 샵만 */
export function getPointEligibleShops(): Shop[] {
    return MOCK_MAP_SHOPS.filter((shop) => shop.pointEligible);
}

export function getShopById(id: string): Shop | undefined {
    const resolvedId = LEGACY_SHOP_ID[id] ?? id;
    return MOCK_MAP_SHOPS.find((shop) => shop.id === resolvedId);
}

export function getShopCategoryBadge(category: ShopCategory): string {
    return getShopCategoryLabel(category);
}

export function getShopPointBadge(pointEligible: boolean): string | null {
    if (pointEligible) {
        return '포인트 연동';
    }
    return '지도 안내';
}
