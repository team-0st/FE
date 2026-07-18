/** SNS 공유 리워드 — FE mock (Notion 보상안 §1 소량 보상 50 미만 파일럿용) */

export const SHARE_REWARD_ECO_JAM_AMOUNT = 30;

export const SHARE_REWARD_LEDGER_LABEL = '결과 공유 보상';

export const SHARE_REWARD_ALREADY_CLAIMED_MESSAGE =
    '오늘 공유 보상은 이미 받았어요. 내일 다시 도전해 보세요.';

export const SHARE_REWARD_SUCCESS_MESSAGE = (amount: number) =>
    `공유해 주셔서 감사해요! 에코잼 ${amount}개를 받았어요.`;
