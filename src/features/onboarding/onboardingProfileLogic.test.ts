import { maskPhone, normalizePhoneBody, validateNickname, validatePhoneBody } from './onboardingProfileLogic';

describe('validateNickname', () => {
    it('accepts valid nickname', () => {
        expect(validateNickname('펭귄탐험가')).toEqual({ ok: true, nickname: '펭귄탐험가' });
    });

    it('rejects too short nickname', () => {
        expect(validateNickname('a').ok).toBe(false);
    });

    it('trims whitespace', () => {
        expect(validateNickname('  펭귄  ')).toEqual({ ok: true, nickname: '펭귄' });
    });
});

describe('validatePhoneBody', () => {
    it('accepts 8-digit body after fixed 010', () => {
        const result = validatePhoneBody('12345678');
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.digits).toBe('01012345678');
            expect(result.masked).toBe('010-****-5678');
        }
    });

    it('strips pasted 010 prefix', () => {
        const result = validatePhoneBody('01012345678');
        expect(result.ok).toBe(true);
    });

    it('rejects incomplete body', () => {
        expect(validatePhoneBody('1234').ok).toBe(false);
    });
});

describe('normalizePhoneBody', () => {
    it('removes non-digits and leading 010', () => {
        expect(normalizePhoneBody('010-1234-5678')).toBe('12345678');
    });
});

describe('maskPhone', () => {
    it('masks middle digits', () => {
        expect(maskPhone('01012345678')).toBe('010-****-5678');
    });
});
