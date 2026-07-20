import { homeDecorUriSource } from './homeDecorImageUris';

/**
 * 홈 장식·스탬프 — Downloads/홈 파일명 기준
 * 대표 캐릭터 / 게이지* / 스템프* / 안내 배너 / 버튼 주변 장식 / 배경
 */
export const HOME_DECOR = {
    /** 홈 대표 — 제로·스티 (사진1) */
    homeHero: homeDecorUriSource('home_hero'),
    /** 온보딩·가이드 — 제로·스티 (사진2) */
    onboardingHero: homeDecorUriSource('onboarding_hero'),
    stampPending: homeDecorUriSource('stamp_pending'),
    stampProgress: homeDecorUriSource('stamp_progress'),
    stampDone: homeDecorUriSource('stamp_done'),
    progressWait: homeDecorUriSource('progress_wait'),
    progressMid: homeDecorUriSource('progress_mid'),
    progressExcited: homeDecorUriSource('progress_excited'),
    bannerVeggies: homeDecorUriSource('banner_veggies'),
} as const;

/** 진행률 → 게이지 응원 캐릭터 */
export function progressCheerSource(percent: number) {
    if (percent <= 30) {
        return HOME_DECOR.progressWait;
    }
    if (percent <= 70) {
        return HOME_DECOR.progressMid;
    }
    return HOME_DECOR.progressExcited;
}
