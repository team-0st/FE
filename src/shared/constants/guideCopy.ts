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
    intro: '안녕하세요.\n저는 새싹이에요.\n함께 제로웨이스트 실천,\n천천히 시작해 볼까요?',
} as const;

export const ONBOARDING_PROFILE_GUIDE = {
    nicknameTitle: '닉네임을 입력해 주세요',
    nicknameSubtitle: '앱에서 사용할 이름이에요. 실명은 필요하지 않아요.',
    nicknamePlaceholder: '예) 펭귄탐험가',
    phoneTitle: '휴대전화번호를 입력해 주세요',
    /** Figma 02 — 본문 / Help text 분리 */
    phoneSubtitle: '알맹상점 포인트 지급에 사용해요. 010 번호만 입력할 수 있어요.',
    phoneHelp: '나중에 입력해도 괜찮아요.',
    phoneBodyPlaceholder: '12345678',
    phoneConsentCheckbox:
        '[필수] 개인정보 처리방침 전문을 확인했으며, 휴대전화번호 수집·이용에 동의해요.',
    skipModalTitle: '나중에 입력해도 괜찮아요',
    skipModalBody:
        '알맹상점 포인트는 게임에서 쌓일 수 있어요. 지급을 받으려면 알맹상점에 직접 방문해 주세요. 매장에서 본인 확인 후 지급해 드려요.',
    payoutHint:
        '동의하지 않으면 포인트는 적립되지만 지급받을 수 없어요. 지급은 알맹상점 방문이 필요해요.',
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
