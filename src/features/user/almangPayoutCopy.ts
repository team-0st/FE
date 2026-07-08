import type { AppUserState } from '../user/types';

export function getAlmangPayoutStatusLabel(state: AppUserState): string {
    if (state.almangPayoutConsent === 'granted') {
        return state.phoneMasked != null
            ? `${state.totalPoints}P · 매장 방문 시 지급 (${state.phoneMasked})`
            : `${state.totalPoints}P · 매장 방문 시 지급`;
    }
    return `${state.totalPoints}P · 지급 대기 (동의·매장 방문 필요)`;
}

export function getAlmangRewardMessage(state: AppUserState, amount: number): string {
    const base = `알맹상점 포인트 ${amount}P가 적립됐어요!`;
    if (state.almangPayoutConsent === 'granted') {
        return `${base} 알맹상점 방문 시 지급받을 수 있어요.`;
    }
    return `${base} 지급을 받으려면 알맹상점에 직접 방문해 주세요. (동의 후 지급 가능)`;
}

export function shouldShowAlmangPayoutBanner(state: AppUserState): boolean {
    return state.totalPoints > 0 && state.almangPayoutConsent === 'declined';
}
