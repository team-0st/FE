/**
 * 포인트 연동 샵 수동 목록 (알맹·기획 확정 후 추가).
 * 지도 표시(341곳)와 별도 — 단골 샵·포인트만 여기서 관리.
 */
export const POINT_ELIGIBLE_SHOP_NAMES = new Set<string>([
    '알맹상점',
]);

export function isManualPointEligibleShop(name: string): boolean {
    return POINT_ELIGIBLE_SHOP_NAMES.has(name.trim());
}
