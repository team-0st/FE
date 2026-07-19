import type { AppUserState } from '../user/types';
import { ALMANG_UI_COPY } from '../../shared/constants/almangComplianceCopy';

export function getAlmangPayoutStatusLabel(state: AppUserState): string {
    if (state.almangPayoutConsent === 'granted') {
        return state.phoneMasked != null
            ? `${state.totalPoints}P · ${ALMANG_UI_COPY.storeOnlyHint} (${state.phoneMasked})`
            : `${state.totalPoints}P · ${ALMANG_UI_COPY.storeOnlyHint}`;
    }
    return `${state.totalPoints}P · ${ALMANG_UI_COPY.pendingStoreLink}`;
}

export function getAlmangRewardMessage(state: AppUserState, amount: number): string {
    const base = `알맹상점 포인트 ${amount}P가 적립됐어요.`;
    if (state.almangPayoutConsent === 'granted') {
        return `${base} 알맹상점 방문 후 매장에서 이용할 수 있어요. (앱 내 현금 교환·환불 없음)`;
    }
    return `${base} 매장에서 이용하려면 알맹상점에 방문해 주세요. (앱 내 현금 교환·환불 없음)`;
}

export function shouldShowAlmangPayoutBanner(state: AppUserState): boolean {
    return state.totalPoints > 0 && state.almangPayoutConsent === 'declined';
}
