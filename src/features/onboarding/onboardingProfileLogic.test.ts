import {
    normalizeNicknameInput,
    validateNickname,
    validatePassword,
    validatePhoneBody,
} from './onboardingProfileLogic';

describe('계정 온보딩 입력 검증', () => {
    it('BE 계약에 맞는 010 휴대전화번호 11자리를 요구한다', () => {
        expect(validatePhoneBody('')).toEqual({
            ok: false,
            message: '전화번호를 입력해 주세요.',
        });
        expect(validatePhoneBody('01012345678')).toMatchObject({
            ok: true,
            digits: '01012345678',
        });
    });

    it('비밀번호는 8자 이상 64자 이하를 요구하고 앞뒤 공백을 제거하지 않는다', () => {
        expect(validatePassword('short')).toEqual({
            ok: false,
            message: '비밀번호는 8자 이상 입력해 주세요.',
        });
        expect(validatePassword('password123')).toEqual({
            ok: true,
            password: 'password123',
        });
        expect(validatePassword(' password123 ')).toEqual({
            ok: true,
            password: ' password123 ',
        });
        expect(validatePassword('a'.repeat(65))).toEqual({
            ok: false,
            message: '비밀번호는 64자까지 입력할 수 있어요.',
        });
    });

    it('닉네임은 한글·영문·숫자만 허용하고 보이지 않는 문자를 제거한다', () => {
        expect(normalizeNicknameInput('닉\u200B네임')).toBe('닉네임');
        expect(validateNickname('닉\u200B네임')).toEqual({ ok: true, nickname: '닉네임' });
        expect(validateNickname('한글')).toEqual({ ok: true, nickname: '한글' });
        expect(validateNickname('a')).toEqual({
            ok: false,
            message: '닉네임은 2자 이상 입력해 주세요.',
        });
        expect(validateNickname('닉네임!')).toEqual({
            ok: false,
            message: '닉네임은 한글·영문·숫자만 사용할 수 있어요.',
        });
    });
});
