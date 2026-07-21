/** Auto-generated — mission id → assets/brand/missions/*.png 매핑. 수정 시 스크립트 재실행, 수동 편집 금지. */
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

/** mission.id별 개별 아이콘. 알 수 없는 id는 기존 카메라 이미지로 안전 폴백. */
export function getMissionImageSource(missionId: string): { uri: string } {
    const key = MISSION_IMAGE_KEY[missionId];
    if (key != null) {
        return missionUriSource(key);
    }
    return BRAND_EMOJI.camera;
}
