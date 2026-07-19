import type { Shop } from '@api/mock/shops';

const EARTH_RADIUS_M = 6_371_000;

export type ShopWithDistance = Shop & {
    distanceMeters: number;
};

export function distanceMeters(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(toLat - fromLat);
    const dLng = toRad(toLng - fromLng);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_M * c;
}

export function formatDistanceMeters(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

/** 지도에 표시할 최대 핀 수 (화면 중심 기준 가까운 순) */
export const MAP_VISIBLE_PIN_LIMIT = 4;

/** geocoding 완료·대략 좌표가 있는 매장만 지도·거리 정렬에 사용 */
export function hasPlottableCoordinates(shop: Shop): boolean {
    return !(shop.latitude === 0 && shop.longitude === 0) && shop.geocodeStatus !== 'pending';
}

export function getMapVisibleShops(
    shops: Shop[],
    centerLat: number,
    centerLng: number,
    limit = MAP_VISIBLE_PIN_LIMIT,
): ShopWithDistance[] {
    return getNearbyShops(
        shops.filter(hasPlottableCoordinates),
        centerLat,
        centerLng,
        limit,
    );
}

export function formatStraightLineDistance(meters: number): string {
    if (!Number.isFinite(meters) || meters < 0) {
        return '거리 준비 중';
    }
    return `직선 약 ${formatDistanceMeters(meters)}`;
}

export const STRAIGHT_LINE_DISTANCE_HINT =
    '거리는 직선 기준이에요.\n실제 도보·차량 거리와 다를 수 있어요.';

export function getNearbyShops(
    shops: Shop[],
    userLat: number,
    userLng: number,
    limit = 3,
): ShopWithDistance[] {
    const plottable = shops.filter(hasPlottableCoordinates);
    if (plottable.length === 0) {
        return shops.slice(0, limit).map((shop) => ({
            ...shop,
            distanceMeters: Number.POSITIVE_INFINITY,
        }));
    }

    return plottable
        .map((shop) => ({
            ...shop,
            distanceMeters: distanceMeters(userLat, userLng, shop.latitude, shop.longitude),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit);
}

export const LOCATION_CONSENT_NOTICE =
    '위치 동의 후 가까운 제로·재사용 상점과 직선 거리를 볼 수 있어요. 동의하지 않아도 목록은 확인할 수 있어요.';

export const LOCATION_CONSENT_DENIED_LIST_HINT =
    '거리 정보 없이 주변 상점만 보여드려요. 포인트는 제휴 샵에서만 적립돼요.';

export const MAP_SHOPS_SCOPE_HINT =
    '제로웨이스트 샵·샵앤샵·재사용 매장·제웨 숙소를 함께 보여줘요. 포인트 연동은 제휴 샵만 해당돼요.';
