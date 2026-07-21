import { FEATURE_STAGE_HEIGHT, GACHA_HERO_ALPHA_BOUNDS } from '../../shared/constants/brandAssets';
import {
    CAULDRON_COMPOSITE_ALPHA_BOUNDS,
    CAULDRON_LAYER_ASPECT_RATIO,
    computeStageAlphaAlignment,
} from '../../shared/constants/cauldronImages';

/**
 * 가마솥 합성의 실제 보이는(alpha) 영역이 가챠 히어로와 같은 높이·위치로 보이도록,
 * 원본 600x600 비율을 유지한 내부 캔버스 크기와 stage viewport 안에서의 이동값을 계산한다.
 * CraftLandingScreen과 CraftBrewAnimationOverlay가 이 값을 공유해야 두 화면의
 * 가마솥이 같은 크기·위치로 보인다 (DRY). 이 모듈은 React 컴포넌트를 포함하지 않아
 * (TDS 의존 없음) 순수 로직 테스트에서도 부담 없이 import할 수 있다.
 */
export const CRAFT_STAGE_ALIGNMENT = computeStageAlphaAlignment({
    viewportHeight: FEATURE_STAGE_HEIGHT,
    reference: GACHA_HERO_ALPHA_BOUNDS,
    source: CAULDRON_COMPOSITE_ALPHA_BOUNDS,
    sourceAspectRatio: CAULDRON_LAYER_ASPECT_RATIO,
});
