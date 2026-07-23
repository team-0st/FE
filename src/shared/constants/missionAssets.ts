/**
 * mission id → assets/brand/missions/*.png
 * id가 `be-*` / `community-*` 이거나 제목만 맞을 때도 컨셉 이미지를 고른다.
 * 매칭 실패 시에만 카메라 폴백.
 */
import { BRAND_EMOJI } from './brandAssets';
import { missionUriSource, type MissionImageUriKey } from './missionImageUris';

const MISSION_IMAGE_KEY: Record<string, MissionImageUriKey> = {
    tumbler: 'tumbler',
    bag: 'bag',
    reusable: 'reusable',
    recycle: 'recycle',
    transit: 'transit',
    'pickup-not-delivery': 'pickup-not-delivery',
    'almang-visit': 'almang-visit',
    'refill-station': 'refill-station',
    plogging: 'plogging',
    'coop-photo-start': 'coop-photo-start',
    'coop-receipt': 'coop-receipt',
    'coop-week-attendance': 'coop-week-attendance',
};

/** 제목 키워드 → 컨셉 이미지 (BE/공동 미션 id가 달라도 매칭) */
const TITLE_IMAGE_HINTS: Array<{ key: MissionImageUriKey; pattern: RegExp }> = [
    { key: 'tumbler', pattern: /텀블러/ },
    { key: 'bag', pattern: /장바구니/ },
    { key: 'reusable', pattern: /다회용/ },
    { key: 'recycle', pattern: /분리\s*배출|분리수거|재활용/ },
    { key: 'transit', pattern: /대중교통|교통카드|버스|지하철/ },
    { key: 'pickup-not-delivery', pattern: /배달|포장/ },
    { key: 'almang-visit', pattern: /알맹/ },
    { key: 'refill-station', pattern: /리필/ },
    { key: 'plogging', pattern: /플로깅/ },
    { key: 'coop-receipt', pattern: /영수증/ },
    { key: 'coop-week-attendance', pattern: /7\s*일|출석/ },
    { key: 'coop-photo-start', pattern: /첫\s*실천|실천\s*인증/ },
];

export function resolveMissionImageKey(
    missionId: string,
    title?: string | null,
): MissionImageUriKey | null {
    const byId = MISSION_IMAGE_KEY[missionId];
    if (byId != null) {
        return byId;
    }

    const trimmed = title?.trim();
    if (trimmed != null && trimmed.length > 0) {
        for (const hint of TITLE_IMAGE_HINTS) {
            if (hint.pattern.test(trimmed)) {
                return hint.key;
            }
        }
    }

    return null;
}

/**
 * 미션별 컨셉 아이콘.
 * 매핑이 없으면 카메라(인증용)로 폴백.
 */
export function getMissionImageSource(
    missionId: string,
    title?: string | null,
): { uri: string } {
    const key = resolveMissionImageKey(missionId, title);
    if (key != null) {
        return missionUriSource(key);
    }
    return BRAND_EMOJI.camera;
}
