import type { AppUserState } from '../../features/user/types';
import { resolveShopName } from '../../features/user/selectors';

export function getHomeGuideMessage(state: AppUserState): string {
    const shopName = resolveShopName(state.shopId);
    if (state.shopId == null) {
        return '먼저 함께할 제로웨이스트 샵을 선택해 주세요.';
    }
    if (!state.preSurveyDone) {
        return '시작 전 설문을 완료하면, 실천 전·후 변화를 비교할 수 있어요.';
    }
    if (state.weeklyMissionDone >= state.weeklyMissionTotal) {
        return `이번 주 실천 목표를 채웠어요. ${shopName}과 함께 잘하고 있어요.`;
    }
    return `오늘도 일상에서 실천해요. ${shopName} · 이번 주 ${state.weeklyMissionDone}/${state.weeklyMissionTotal}`;
}

export const ONBOARDING_GUIDE = {
    intro: '안녕하세요. 저는 새싹이에요. 짧은 질문으로 맞춤 안내를 준비할게요.',
    practitioner: '제로웨이스트를 실천하고 계신가요? 편하게 골라주세요.',
    experience: '실천하고 계신 분이시군요. 지금 상황에 가장 가까운 것을 골라주세요.',
    interest: '관심이 있으시군요. 지금 상황에 가장 가까운 것을 골라주세요.',
} as const;

export function getMissionCompleteMessage(points: number): string {
    return `미션을 완료했어요. +${points}P를 받았어요.`;
}

export function getMissionVerifyMessage(authHint: string): string {
    return `${authHint} 사진을 올려주세요.`;
}
