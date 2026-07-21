import {
    DEFAULT_SKIP_CRAFT_ANIMATION,
    decodeSkipCraftAnimation,
    encodeSkipCraftAnimation,
    readSkipCraftAnimationSafely,
} from './craftAnimationSkipPreferenceCodec';

describe('decodeSkipCraftAnimation (저장된 스킵 설정 → boolean 복구, 순수 함수)', () => {
    it('저장된 값이 없으면(null) 기본값 false를 반환한다', () => {
        expect(decodeSkipCraftAnimation(null)).toBe(DEFAULT_SKIP_CRAFT_ANIMATION);
        expect(decodeSkipCraftAnimation(null)).toBe(false);
    });

    it('저장된 값이 undefined면 기본값 false를 반환한다', () => {
        expect(decodeSkipCraftAnimation(undefined)).toBe(false);
    });

    it('{ skip: true }면 true를 반환한다', () => {
        expect(decodeSkipCraftAnimation({ skip: true })).toBe(true);
    });

    it('{ skip: false }면 false를 반환한다', () => {
        expect(decodeSkipCraftAnimation({ skip: false })).toBe(false);
    });

    it('손상된 값(문자열, 숫자, 배열, skip이 boolean이 아님)이면 기본값 false로 안전 복구한다', () => {
        expect(decodeSkipCraftAnimation('true')).toBe(false);
        expect(decodeSkipCraftAnimation(1)).toBe(false);
        expect(decodeSkipCraftAnimation([])).toBe(false);
        expect(decodeSkipCraftAnimation({ skip: 'yes' })).toBe(false);
        expect(decodeSkipCraftAnimation({})).toBe(false);
    });
});

describe('encodeSkipCraftAnimation (boolean → 저장 payload, 순수 함수)', () => {
    it('true를 { skip: true }로 인코딩한다', () => {
        expect(encodeSkipCraftAnimation(true)).toEqual({ skip: true });
    });

    it('false를 { skip: false }로 인코딩한다', () => {
        expect(encodeSkipCraftAnimation(false)).toEqual({ skip: false });
    });

    it('인코딩 후 디코딩하면 원래 값으로 복구된다 (round-trip)', () => {
        expect(decodeSkipCraftAnimation(encodeSkipCraftAnimation(true))).toBe(true);
        expect(decodeSkipCraftAnimation(encodeSkipCraftAnimation(false))).toBe(false);
    });
});

describe('readSkipCraftAnimationSafely (Storage read 실패 복구)', () => {
    it('손상된 JSON 파싱 등 read promise가 reject되면 기본값 false를 반환한다', async () => {
        const read = async (): Promise<unknown> => {
            throw new SyntaxError('Unexpected token');
        };

        await expect(readSkipCraftAnimationSafely(read)).resolves.toBe(false);
    });

    it('정상 read 값은 decode 규칙으로 복구한다', async () => {
        await expect(readSkipCraftAnimationSafely(async () => ({ skip: true }))).resolves.toBe(true);
        await expect(readSkipCraftAnimationSafely(async () => ({ skip: 'broken' }))).resolves.toBe(false);
    });
});
