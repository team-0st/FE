import type { AppUserState } from '../../features/user/types';
import { resolveShopName } from '../../features/user/selectors';

export function getHomeGuideMessage(state: AppUserState): string {
    const shopName = resolveShopName(state.shopId);
    if (state.shopId == null) {
        return '먼저 함께할 제로웨이스트 샵을 선택해 주세요.';
    }
    if (state.weeklyMissionDone >= state.weeklyMissionTotal) {
        return `이번 주 실천 목표를 채웠어요.\n${shopName}과 함께 잘하고 있어요.`;
    }
    return `오늘도 일상에서 실천해요.\n${shopName} · 이번 주 ${state.weeklyMissionDone}/${state.weeklyMissionTotal}`;
}

export const ONBOARDING_GUIDE = {
    intro: '안녕하세요!\n우리는 제로랑 스티예요.\n지구를 아끼는 제로웨이스트,\n함께 천천히 시작해 볼까요?',
} as const;

export const ONBOARDING_PROFILE_GUIDE = {
    nicknameTitle: '닉네임을 입력해 주세요',
    nicknameSubtitle: '앱에서 사용할 이름이에요.\n실명은 필요하지 않아요.',
    nicknamePlaceholder: '예) 펭귄탐험가',
    privacyTitle: '필수 개인정보 동의',
    phoneTitle: '선택 · 휴대전화번호',
    phoneHelp: '나중에 입력해도 괜찮아요.',
    phonePlaceholder: '01012345678',
    skipModalTitle: '나중에 입력해도 괜찮아요',
    skipModalBody:
        '알맹 포인트는 앱에 적립될 수 있어요.\n앱에서 현금으로 바꾸거나 환불할 수 없고,\n매장에서 이용하려면 알맹상점에 직접 방문해 주세요.',
    payoutHint:
        '동의하지 않아도 앱 이용·적립은 가능해요.\n매장에서 쓰려면 알맹상점 방문이 필요해요.\n앱 내 현금 교환·환불·출금은 없어요.',
} as const;

/** Figma 03 온보딩 - 샵선택 */
export const ONBOARDING_SHOP_GUIDE = {
    title: '함께할 제로웨이스트 샵을\n선택해 주세요',
    subtitle: '선택한 샵 기준으로 미션과 포인트가 연결돼요.',
} as const;

export function getMissionCompleteMessage(ingredientLabel: string): string {
    return `미션을 완료했어요.\n${ingredientLabel} 재료를 받았어요.`;
}

export function getMissionVerifyMessage(authHint: string): string {
    return `${authHint} 사진을 올려주세요.`;
}
