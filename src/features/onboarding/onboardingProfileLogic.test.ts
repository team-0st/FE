import { maskPhone, validateNickname, validatePhone } from './onboardingProfileLogic';

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

describe('validatePhone', () => {
    it('accepts mobile number', () => {
        const result = validatePhone('010-1234-5678');
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.masked).toBe('010-****-5678');
        }
    });

    it('rejects invalid number', () => {
        expect(validatePhone('123').ok).toBe(false);
    });
});

describe('maskPhone', () => {
    it('masks middle digits', () => {
        expect(maskPhone('01012345678')).toBe('010-****-5678');
    });
});
