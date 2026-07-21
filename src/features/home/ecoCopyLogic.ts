/**
 * 환경 카피 카드 — 날짜 키 기반 결정적 선택.
 * 같은 날짜 키(YYYY-MM-DD)는 하루 동안 항상 같은 인덱스/카피를 반환하고,
 * 날짜 키가 바뀌면(다음 날) 다른 인덱스가 나올 수 있다. (순수 함수, side effect 없음)
 */

/** djb2 계열 문자열 해시. 같은 입력 → 항상 같은 출력 */
export function pickDeterministicIndex(dateKey: string, itemCount: number): number {
    if (itemCount <= 0) {
        return 0;
    }
    let hash = 0;
    for (let i = 0; i < dateKey.length; i += 1) {
        hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }
    return hash % itemCount;
}

export function selectDailyEcoCopy<T>(items: readonly T[], dateKey: string): T {
    if (items.length === 0) {
        throw new Error('selectDailyEcoCopy: items must not be empty');
    }
    const index = pickDeterministicIndex(dateKey, items.length);
    const picked = items[index];
    if (picked == null) {
        throw new Error('selectDailyEcoCopy: index out of range');
    }
    return picked;
}
