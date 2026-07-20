/**
 * 노션 「알람 관련」 — FE에서 쓸 멘트·스케줄 상수.
 * 실제 매일 9시 푸시는 앱인토스/BE 발송 연동 필요 (현재 FE는 카피·동의 UX만).
 */

export const DAILY_MISSION_PUSH_HOUR = 9;

/** 매일 발송 시 3종 중 1개 랜덤 */
export const DAILY_MISSION_PUSH_MESSAGES = [
    '오늘의 제로웨이스트 미션이 도착했습니다.',
    '오늘의 미션을 달성해서 마녀 스프를 제작해보세요!',
    '출석 체크하고 가족과 공동 미션하는 건 어떠신가요?',
] as const;

export const MISSION_APPROVED_PUSH_TEMPLATE = '{nickname}님의 미션이 완료되었어요!';

export function pickDailyMissionPushMessage(
    random: () => number = Math.random,
): string {
    const index = Math.floor(random() * DAILY_MISSION_PUSH_MESSAGES.length);
    return DAILY_MISSION_PUSH_MESSAGES[index] ?? DAILY_MISSION_PUSH_MESSAGES[0];
}

export function formatMissionApprovedPush(nickname: string): string {
    const name = nickname.trim().length > 0 ? nickname.trim() : '모험가';
    return MISSION_APPROVED_PUSH_TEMPLATE.replace('{nickname}', name);
}
