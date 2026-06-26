/** 확률 안내 모달 — 노션 DB/API mock 정책과 동일 */

export const PROBABILITY_FOOTNOTE =
    '확률은 노션 명세·BE mock 기준이에요. 실제 서비스는 운영 정책·API 응답을 따릅니다.';

export const GACHA_PROBABILITY_TITLE = '가챠 확률';
export const GACHA_PROBABILITY_LINES = [
    '꽝(FAIL) 35%',
    '에코잼 30% (1~3개)',
    '재료 28% (풀에서 1종)',
    '알맹상점 포인트 7% (10~30P, 희소)',
    '1회당 에코잼 100개 소모',
];

export const SOUP_WEEKLY_PROBABILITY_TITLE = '일반(COMMON) 스프 보상';
export const SOUP_WEEKLY_PROBABILITY_LINES = [
    '성공 약 70% → 에코잼',
    '실패 약 30% → TRASH_ITEM (쓰레기 봉투 등)',
    '레시피 1회 소진',
];

export const SOUP_HIDDEN_PROBABILITY_TITLE = '히든·전설 스프 보상';
export const SOUP_HIDDEN_PROBABILITY_LINES = [
    '성공 100% → REAL_ITEM (실물·특별 리워드)',
    '완성 시 팀 확인 후 연락',
];

export const SOUP_BEGINNER_PROBABILITY_TITLE = '입문(COMMON) 스프';
export const SOUP_BEGINNER_PROBABILITY_LINES = [
    '일반 스프와 동일 성공률 (약 70%)',
    '재료 2개만 사용',
];

export const MISSION_REWARD_PROBABILITY_TITLE = '미션 재료 지급';
export const MISSION_REWARD_PROBABILITY_LINES = [
    '미션별 재료 풀에서 1종 랜덤',
    'verify 즉시 지급 (노션 API)',
    '동일 미션 하루 1회',
];

export const CHECK_IN_PROBABILITY_TITLE = '출석 보상';
export const CHECK_IN_PROBABILITY_LINES = [
    '랜덤 재료 1개',
    '하루 1회',
];
