export type BrewFailureReason = 'incomplete' | 'no_match' | 'already_done' | 'no_stock';

export function getBrewFailureMessage(reason: BrewFailureReason): string {
    switch (reason) {
        case 'incomplete':
            return '일반 레시피는 재료 3개, 히든 레시피는 4개를 넣어 주세요.';
        case 'no_match':
            return '아직 알려지지 않은 조합이에요. 레시피 힌트를 확인해 보세요.';
        case 'already_done':
            return '이미 만들어 본 스프예요. 각 레시피는 한 번만 만들 수 있어요.';
        case 'no_stock':
            return '재료가 부족해요. 미션으로 재료를 모아 주세요.';
    }
}

export const NETWORK_ERROR_MESSAGE = '연결이 불안정해요. 잠시 후 다시 시도해 주세요.';

export const CHECK_IN_ALREADY_MESSAGE = '오늘은 이미 출석했어요.';
