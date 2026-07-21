import type { SoupCraftResponse } from '@api/notion/types';
import {
    FEATURE_HEADER_SLOT_HEIGHT,
    FEATURE_STAGE_HEIGHT,
    FEATURE_STAGE_TOP_SPACING,
    GACHA_HERO_ALPHA_BOUNDS,
} from '../../shared/constants/brandAssets';
import {
    CAULDRON_COMPOSITE_ALPHA_BOUNDS,
    CAULDRON_LAYER_ASPECT_RATIO,
    cauldronStageWidthForHeight,
    computeStageAlphaAlignment,
} from '../../shared/constants/cauldronImages';
import { SCREEN_CONTENT_PADDING } from '../../shared/ui/Screen';
import { resolveCraftAnimationTier } from './craftAnimationTier';
import { CRAFT_STAGE_ALIGNMENT } from './craftStageAlignment';

function baseCraft(overrides: Partial<SoupCraftResponse> = {}): SoupCraftResponse {
    return {
        soupId: 1,
        result: 'SUCCESS',
        recipeName: '토마토 스프',
        ...overrides,
    };
}

describe('resolveCraftAnimationTier (보상 응답 → 모션 등급 매핑)', () => {
    it('rewardGrade가 FAIL이면 에코잼이 많아도 normal이다', () => {
        const craft = baseCraft({ rewardGrade: 'FAIL', rewardEcoJam: 30, rewardAmount: 30 });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardPoint가 1 이상이면 legendary다', () => {
        const craft = baseCraft({ rewardGrade: 'MEDIUM', rewardPoint: 1 });
        expect(resolveCraftAnimationTier(craft)).toBe('legendary');
    });

    it('rewardType이 ALMANG_POINT면 rewardPoint 없이도 legendary다', () => {
        const craft = baseCraft({ rewardGrade: 'SMALL', rewardType: 'ALMANG_POINT', rewardAmount: 40 });
        expect(resolveCraftAnimationTier(craft)).toBe('legendary');
    });

    it('포인트 없이 rewardEcoJam이 있으면 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardEcoJam: 5 });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('포인트 없이 rewardAmount가 있으면 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardAmount: 5, rewardType: 'ECO_JAM' });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('포인트 없이 rewarded ingredient만 있어도 rare다', () => {
        const craft = baseCraft({ rewardGrade: 'INGREDIENT', rewardIngredientId: 'cabbage' });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });

    it('보상 정보가 전혀 없으면 안전하게 normal로 fallback한다', () => {
        const craft = baseCraft({ rewardGrade: undefined });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardGrade가 JACKPOT이며 REAL_ITEM(포인트·에코잼·재료 없음)이어도 안전하게 normal로 fallback한다', () => {
        const craft = baseCraft({ rewardGrade: 'JACKPOT', rewardType: 'REAL_ITEM', rewardDescription: '리워드 지급 예정' });
        expect(resolveCraftAnimationTier(craft)).toBe('normal');
    });

    it('rewardPoint가 0이면 legendary 조건을 만족하지 않는다', () => {
        const craft = baseCraft({ rewardGrade: 'SMALL', rewardPoint: 0, rewardEcoJam: 10 });
        expect(resolveCraftAnimationTier(craft)).toBe('rare');
    });
});

describe('cauldronStageWidthForHeight (제작 탭 가마솥 합성 이미지를 가챠 탭 StageArt와 같은 높이로 만드는 width 계산)', () => {
    it('공통 기능 스테이지 높이로 계산한 가마솥 결과 높이가 공통 높이와 같다', () => {
        const width = cauldronStageWidthForHeight(FEATURE_STAGE_HEIGHT);
        expect(width / CAULDRON_LAYER_ASPECT_RATIO).toBeCloseTo(FEATURE_STAGE_HEIGHT, 10);
    });
});

describe('computeStageAlphaAlignment (제작 가마솥 합성 alpha 영역을 가챠 히어로 alpha 영역과 같은 위치·높이로 맞추는 계산)', () => {
    /**
     * 실측값 (독립 리터럴 — 프로덕션 상수와 무관하게 이 테스트에서 직접 명시한다):
     * - assets/brand/hero-gacha.png: 405x395, alpha bbox (6,6,400,390) → top=6, bottom=390 (기준: imageHeight=395)
     * - 랜딩 composite(cauldron_base+soup+stir_stick) union alpha bbox: (133,111,900,796) → top=111, bottom=796 (기준: imageHeight=864)
     */
    const GACHA_HERO_ALPHA_LITERAL = { imageHeight: 395, top: 6, bottom: 390 };
    const CRAFT_COMPOSITE_ALPHA_LITERAL = { imageHeight: 864, top: 111, bottom: 796 };
    const VIEWPORT_HEIGHT_LITERAL = 220;
    const SOURCE_ASPECT_RATIO_LITERAL = 900 / 864;

    function visibleTopAndHeight(
        bounds: { imageHeight: number; top: number; bottom: number },
        canvasHeight: number,
        translateY: number,
    ) {
        const top = translateY + canvasHeight * (bounds.top / bounds.imageHeight);
        const bottom = translateY + canvasHeight * (bounds.bottom / bounds.imageHeight);
        return { top, height: bottom - top };
    }

    it('정렬 없이 공통 캔버스 높이 그대로 그리면 craft가 gacha보다 실제로 더 작게 보인다 (회귀 방지용 대조군)', () => {
        const naiveCraftVisibleHeight =
            VIEWPORT_HEIGHT_LITERAL *
            ((CRAFT_COMPOSITE_ALPHA_LITERAL.bottom - CRAFT_COMPOSITE_ALPHA_LITERAL.top) /
                CRAFT_COMPOSITE_ALPHA_LITERAL.imageHeight);
        const gachaVisibleHeight =
            VIEWPORT_HEIGHT_LITERAL *
            ((GACHA_HERO_ALPHA_LITERAL.bottom - GACHA_HERO_ALPHA_LITERAL.top) /
                GACHA_HERO_ALPHA_LITERAL.imageHeight);

        expect(naiveCraftVisibleHeight).toBeLessThan(gachaVisibleHeight);
    });

    it('정렬 후 craft 합성의 실제 보이는 top/height가 gacha 히어로 기준과 일치한다', () => {
        const alignment = computeStageAlphaAlignment({
            viewportHeight: VIEWPORT_HEIGHT_LITERAL,
            reference: GACHA_HERO_ALPHA_LITERAL,
            source: CRAFT_COMPOSITE_ALPHA_LITERAL,
            sourceAspectRatio: SOURCE_ASPECT_RATIO_LITERAL,
        });

        const expectedVisibleTop =
            VIEWPORT_HEIGHT_LITERAL * (GACHA_HERO_ALPHA_LITERAL.top / GACHA_HERO_ALPHA_LITERAL.imageHeight);
        const expectedVisibleHeight =
            VIEWPORT_HEIGHT_LITERAL *
            ((GACHA_HERO_ALPHA_LITERAL.bottom - GACHA_HERO_ALPHA_LITERAL.top) /
                GACHA_HERO_ALPHA_LITERAL.imageHeight);

        const actual = visibleTopAndHeight(
            CRAFT_COMPOSITE_ALPHA_LITERAL,
            alignment.innerCanvasHeight,
            alignment.translateY,
        );

        expect(actual.top).toBeCloseTo(expectedVisibleTop, 6);
        expect(actual.height).toBeCloseTo(expectedVisibleHeight, 6);
    });

    it('실측 리터럴 기준 결과 px 값이 계산된 기대값과 일치한다', () => {
        const alignment = computeStageAlphaAlignment({
            viewportHeight: VIEWPORT_HEIGHT_LITERAL,
            reference: GACHA_HERO_ALPHA_LITERAL,
            source: CRAFT_COMPOSITE_ALPHA_LITERAL,
            sourceAspectRatio: SOURCE_ASPECT_RATIO_LITERAL,
        });

        expect(alignment.innerCanvasHeight).toBeCloseTo(269.7615, 3);
        expect(alignment.innerCanvasWidth).toBeCloseTo(281.0016, 3);
        expect(alignment.translateY).toBeCloseTo(-31.3151, 3);
    });

    it('실제 프로덕션 상수(CAULDRON_COMPOSITE_ALPHA_BOUNDS·GACHA_HERO_ALPHA_BOUNDS)로 계산해도 위 리터럴 결과와 같다', () => {
        expect(CAULDRON_COMPOSITE_ALPHA_BOUNDS).toEqual(CRAFT_COMPOSITE_ALPHA_LITERAL);
        expect(GACHA_HERO_ALPHA_BOUNDS).toEqual(GACHA_HERO_ALPHA_LITERAL);

        const alignment = computeStageAlphaAlignment({
            viewportHeight: FEATURE_STAGE_HEIGHT,
            reference: GACHA_HERO_ALPHA_BOUNDS,
            source: CAULDRON_COMPOSITE_ALPHA_BOUNDS,
            sourceAspectRatio: CAULDRON_LAYER_ASPECT_RATIO,
        });

        expect(alignment.innerCanvasHeight).toBeCloseTo(269.7615, 3);
        expect(alignment.translateY).toBeCloseTo(-31.3151, 3);
    });
});

describe('공유 top anchor 상수 (Craft·Gacha stage viewport 위치를 같게 만드는 계약)', () => {
    it('두 기능이 같은 화면 콘텐츠 top padding을 공유한다', () => {
        expect(SCREEN_CONTENT_PADDING).toBe(20);
    });

    it('헤더 슬롯 높이와 stage 앞 spacing이 0보다 큰 유효한 상수다', () => {
        expect(FEATURE_HEADER_SLOT_HEIGHT).toBeGreaterThan(0);
        expect(FEATURE_STAGE_TOP_SPACING).toBeGreaterThan(0);
    });
});

describe('CRAFT_STAGE_ALIGNMENT (CraftLandingScreen이 export하고 CraftBrewAnimationOverlay와 공유하는 alpha alignment)', () => {
    it('실제 프로덕션 상수(CAULDRON_COMPOSITE_ALPHA_BOUNDS·GACHA_HERO_ALPHA_BOUNDS·FEATURE_STAGE_HEIGHT)로 계산한 값과 같다', () => {
        const expected = computeStageAlphaAlignment({
            viewportHeight: FEATURE_STAGE_HEIGHT,
            reference: GACHA_HERO_ALPHA_BOUNDS,
            source: CAULDRON_COMPOSITE_ALPHA_BOUNDS,
            sourceAspectRatio: CAULDRON_LAYER_ASPECT_RATIO,
        });

        expect(CRAFT_STAGE_ALIGNMENT).toEqual(expected);
        expect(CRAFT_STAGE_ALIGNMENT.innerCanvasWidth).not.toBe(240);
    });
});
