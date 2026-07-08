export type NicknameValidationResult =
    | { ok: true; nickname: string }
    | { ok: false; message: string };

export type PhoneValidationResult =
    | { ok: true; digits: string; masked: string }
    | { ok: false; message: string };

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;

export function validateNickname(raw: string): NicknameValidationResult {
    const nickname = raw.trim();
    if (nickname.length < NICKNAME_MIN) {
        return { ok: false, message: `닉네임은 ${NICKNAME_MIN}자 이상 입력해 주세요.` };
    }
    if (nickname.length > NICKNAME_MAX) {
        return { ok: false, message: `닉네임은 ${NICKNAME_MAX}자까지 입력할 수 있어요.` };
    }
    if (!/^[\p{L}\p{N}]+$/u.test(nickname)) {
        return { ok: false, message: '닉네임은 한글·영문·숫자만 사용할 수 있어요.' };
    }
    return { ok: true, nickname };
}

export function normalizePhoneDigits(raw: string): string {
    return raw.replace(/\D/g, '');
}

export function maskPhone(digits: string): string {
    if (digits.length < 10) {
        return digits;
    }
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-****-${tail}`;
}

export function validatePhone(raw: string): PhoneValidationResult {
    const digits = normalizePhoneDigits(raw);
    if (digits.length === 0) {
        return { ok: false, message: '전화번호를 입력해 주세요.' };
    }
    if (!/^01[016789]\d{7,8}$/.test(digits)) {
        return { ok: false, message: '올바른 휴대전화 번호를 입력해 주세요.' };
    }
    return { ok: true, digits, masked: maskPhone(digits) };
}
