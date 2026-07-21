import { ECO_COPY_ITEMS } from '../../shared/constants/ecoCopy';
import { pickDeterministicIndex, selectDailyEcoCopy } from './ecoCopyLogic';

describe('pickDeterministicIndex', () => {
    it('같은 날짜 키는 항상 같은 인덱스를 반환한다', () => {
        const first = pickDeterministicIndex('2026-07-21', 23);
        const second = pickDeterministicIndex('2026-07-21', 23);
        expect(first).toBe(second);
    });

    it('itemCount 범위 안의 인덱스만 반환한다', () => {
        for (let day = 1; day <= 28; day += 1) {
            const dateKey = `2026-07-${String(day).padStart(2, '0')}`;
            const index = pickDeterministicIndex(dateKey, 23);
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(23);
        }
    });

    it('연속된 날짜 키들에서 다양한 인덱스가 나온다 (하루 고정, 날마다 변경)', () => {
        const indices = new Set<number>();
        for (let day = 1; day <= 28; day += 1) {
            const dateKey = `2026-07-${String(day).padStart(2, '0')}`;
            indices.add(pickDeterministicIndex(dateKey, 23));
        }
        expect(indices.size).toBeGreaterThan(1);
    });

    it('itemCount가 0이면 0을 반환한다 (0으로 나누기 방지)', () => {
        expect(pickDeterministicIndex('2026-07-21', 0)).toBe(0);
    });

    it('날짜 키가 하나라도 다르면 다음 날은 다른 인덱스일 수 있다 (다음 날 변경 요건 확인용 샘플)', () => {
        const today = pickDeterministicIndex('2026-07-21', 23);
        const tomorrow = pickDeterministicIndex('2026-07-22', 23);
        // 같은 값이 나올 수도 있으니 로직 자체가 순수하고 안정적인지만 재확인한다.
        expect(pickDeterministicIndex('2026-07-21', 23)).toBe(today);
        expect(pickDeterministicIndex('2026-07-22', 23)).toBe(tomorrow);
    });
});

describe('selectDailyEcoCopy', () => {
    it('같은 날짜 키로는 항상 같은 카피를 반환한다', () => {
        const first = selectDailyEcoCopy(ECO_COPY_ITEMS, '2026-07-21');
        const second = selectDailyEcoCopy(ECO_COPY_ITEMS, '2026-07-21');
        expect(first.id).toBe(second.id);
    });

    it('ECO_COPY_ITEMS는 환경 10종 + 실천 13종 = 23종이다', () => {
        expect(ECO_COPY_ITEMS.length).toBe(23);
        expect(ECO_COPY_ITEMS.filter((item) => item.category === 'fact').length).toBe(10);
        expect(ECO_COPY_ITEMS.filter((item) => item.category === 'practice').length).toBe(13);
    });

    it('빈 배열이면 에러를 던진다', () => {
        expect(() => selectDailyEcoCopy([], '2026-07-21')).toThrow();
    });

    it('반환된 카피는 항상 ECO_COPY_ITEMS 안의 항목이다', () => {
        for (let day = 1; day <= 28; day += 1) {
            const dateKey = `2026-07-${String(day).padStart(2, '0')}`;
            const picked = selectDailyEcoCopy(ECO_COPY_ITEMS, dateKey);
            expect(ECO_COPY_ITEMS).toContain(picked);
        }
    });
});
