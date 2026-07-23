export const NETWORK_ERROR_MESSAGE = '연결이 불안정해요.\n잠시 후 다시 시도해 주세요.';

export type BrewFailureReason =
    | 'incomplete'
    | 'no_match'
    | 'already_done'
    | 'no_stock'
    | 'network';

export function getBrewFailureMessage(reason: BrewFailureReason): string {
    switch (reason) {
        case 'incomplete':
            return '입문 2개 · 일반 3개 · 히든 4개 · 전설 5개를 맞춰 넣어 주세요.';
        case 'no_match':
            return '재료끼리 사이가 안 좋은가봐요\n다른 조합을 시도해 보세요.';
        case 'already_done':
            return '이미 만들어 본 스프예요.\n각 레시피는 한 번만 만들 수 있어요.';
        case 'no_stock':
            return '재료가 부족해요.\n미션으로 재료를 모아 주세요.';
        case 'network':
            return NETWORK_ERROR_MESSAGE;
    }
}

export const CHECK_IN_ALREADY_MESSAGE = '오늘은 이미 출석했어요.';

/** BE에 유저가 없을 때 (등록 실패·리셋 후 미재등록 등) */
export const USER_NOT_FOUND_MESSAGE =
    '서버에 계정이 없어요.\n앱을 완전히 종료한 뒤 다시 열어 주세요.';

export const REGISTER_FAILED_MESSAGE =
    '서버 등록에 실패했어요.\n네트워크를 확인한 뒤 다시 시도해 주세요.';

export const ONBOARDING_SYNC_FAILED_MESSAGE =
    '서버에 온보딩 정보를 저장하지 못했어요.\n잠시 후 다시 시도해 주세요.';

export const LOGIN_FAILED_MESSAGE =
    '로그인에 실패했어요.\n전화번호와 비밀번호를 확인해 주세요.';
