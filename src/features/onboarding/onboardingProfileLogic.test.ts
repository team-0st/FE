import { validatePassword, validatePhoneBody } from './onboardingProfileLogic';

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
});
