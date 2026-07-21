import { CAULDRON_BASE_IMAGE } from './cauldronBase';
import { GLOW_LEGENDARY_IMAGE } from './glowLegendary';
import { GLOW_NORMAL_IMAGE } from './glowNormal';
import { GLOW_RARE_IMAGE } from './glowRare';
import { SOUP_LEGENDARY_IMAGE } from './soupLegendary';
import { SOUP_NORMAL_IMAGE } from './soupNormal';
import { SOUP_RARE_IMAGE } from './soupRare';
import { SPARKLE_LEGENDARY_IMAGE } from './sparkleLegendary';
import { SPARKLE_NORMAL_IMAGE } from './sparkleNormal';
import { SPARKLE_RARE_IMAGE } from './sparkleRare';
import { STIR_STICK_IMAGE } from './stirStick';

export {
    CAULDRON_BASE_IMAGE,
    STIR_STICK_IMAGE,
    SOUP_NORMAL_IMAGE,
    SOUP_RARE_IMAGE,
    SOUP_LEGENDARY_IMAGE,
    GLOW_NORMAL_IMAGE,
    GLOW_RARE_IMAGE,
    GLOW_LEGENDARY_IMAGE,
    SPARKLE_NORMAL_IMAGE,
    SPARKLE_RARE_IMAGE,
    SPARKLE_LEGENDARY_IMAGE,
};

/** 제작(브루) 애니메이션 보상 등급 — 실제 보상에 따라 이 중 하나만 재생한다 */
export type CraftAnimationTier = 'normal' | 'rare' | 'legendary';

export type CauldronTierLayers = {
    glow: { uri: string };
    soup: { uri: string };
    sparkle: { uri: string };
};

/** 900x864, alpha 포함, 동일 좌표계. 레이어 순서: glow → cauldron_base → soup → stir_stick → sparkle */
export const CAULDRON_LAYER_ASPECT_RATIO = 900 / 864;

/**
 * CauldronStage는 height = width / CAULDRON_LAYER_ASPECT_RATIO로 높이를 계산한다.
 * 이 함수는 그 역연산으로, 원본 비율을 유지하면서 목표 높이(targetHeight)를 만드는 width를 구한다.
 */
export function cauldronStageWidthForHeight(targetHeight: number): number {
    return targetHeight * CAULDRON_LAYER_ASPECT_RATIO;
}

/** 원본 이미지 안에서 실제 보이는(alpha 채널이 있는) 영역의 상/하단(px, 원본 좌표계 기준) */
export type AlphaVisibleBounds = {
    /** 원본 이미지 전체 높이(px) */
    imageHeight: number;
    /** alpha 콘텐츠 상단(px) */
    top: number;
    /** alpha 콘텐츠 하단(px) */
    bottom: number;
};

/**
 * 랜딩 가마솥 합성(cauldron_base + soup + stir_stick) 실측 alpha bbox.
 * 900x864 원본 기준, union bbox (133,111,900,796) → top=111, bottom=796.
 */
export const CAULDRON_COMPOSITE_ALPHA_BOUNDS: AlphaVisibleBounds = {
    imageHeight: 864,
    top: 111,
    bottom: 796,
};

export type StageAlphaAlignment = {
    /** 원본 비율을 유지한 내부 캔버스 너비(px) */
    innerCanvasWidth: number;
    /** 원본 비율을 유지한 내부 캔버스 높이(px) */
    innerCanvasHeight: number;
    /** viewport 안에서 내부 캔버스를 옮겨야 하는 세로 거리(px). 음수면 위로 올린다. */
    translateY: number;
};

/**
 * height=viewportHeight, overflow hidden인 viewport 안에서
 * source 합성 이미지의 실제 보이는(alpha) top·height가
 * reference 이미지의 보이는(alpha) top·height와 같아지도록,
 * source 원본 비율(sourceAspectRatio = width/height)을 유지한 내부 캔버스 크기와
 * viewport 기준 translateY를 계산한다.
 *
 * 전제: 내부 캔버스는 sourceAspectRatio를 유지하고, source가 그 안에 resizeMode="contain"으로
 * 그려질 때 캔버스 비율과 원본 비율이 같아 1:1로 스케일된다 (CauldronStage가 이 조건을 만족한다).
 * translateY는 내부 캔버스의 미변형 상단이 viewport 상단(y=0)에 있다고 가정한 값이므로,
 * viewport 자체는 세로 정렬(justifyContent)을 별도로 주지 않아야 한다.
 */
export function computeStageAlphaAlignment({
    viewportHeight,
    reference,
    source,
    sourceAspectRatio,
}: {
    viewportHeight: number;
    reference: AlphaVisibleBounds;
    source: AlphaVisibleBounds;
    sourceAspectRatio: number;
}): StageAlphaAlignment {
    const targetVisibleTop = viewportHeight * (reference.top / reference.imageHeight);
    const targetVisibleHeight =
        viewportHeight * ((reference.bottom - reference.top) / reference.imageHeight);

    const sourceAlphaHeight = source.bottom - source.top;
    const innerCanvasHeight = targetVisibleHeight * (source.imageHeight / sourceAlphaHeight);
    const innerCanvasWidth = innerCanvasHeight * sourceAspectRatio;
    const translateY = targetVisibleTop - innerCanvasHeight * (source.top / source.imageHeight);

    return { innerCanvasWidth, innerCanvasHeight, translateY };
}

export const CAULDRON_TIER_LAYERS: Record<CraftAnimationTier, CauldronTierLayers> = {
    normal: { glow: GLOW_NORMAL_IMAGE, soup: SOUP_NORMAL_IMAGE, sparkle: SPARKLE_NORMAL_IMAGE },
    rare: { glow: GLOW_RARE_IMAGE, soup: SOUP_RARE_IMAGE, sparkle: SPARKLE_RARE_IMAGE },
    legendary: { glow: GLOW_LEGENDARY_IMAGE, soup: SOUP_LEGENDARY_IMAGE, sparkle: SPARKLE_LEGENDARY_IMAGE },
};
