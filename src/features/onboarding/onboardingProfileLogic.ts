export type NicknameValidationResult =
    | { ok: true; nickname: string }
    | { ok: false; message: string };

export type PhoneValidationResult =
    | { ok: true; digits: string; masked: string }
    | { ok: false; message: string };

export type PasswordValidationResult =
    | { ok: true; password: string }
    | { ok: false; message: string };

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;

/** 국내 휴대전화 전체 자리 (예: 01012345678) */
export const PHONE_DIGITS_LENGTH = 11;

/** @deprecated 입력란 prefix 고정 제거 — 하위 호환용 */
export const PHONE_PREFIX = '010';
/** @deprecated PHONE_DIGITS_LENGTH 사용 */
export const PHONE_BODY_LENGTH = 8;

/** iOS 한글 IME·보이지 않는 문자로 검증이 깨지지 않게 정규화 */
export function normalizeNicknameInput(raw: string): string {
    return raw
        .normalize('NFC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();
}

export function validateNickname(raw: string): NicknameValidationResult {
    const nickname = normalizeNicknameInput(raw);
    if (nickname.length < NICKNAME_MIN) {
        return { ok: false, message: `닉네임은 ${NICKNAME_MIN}자 이상 입력해 주세요.` };
    }
    if (nickname.length > NICKNAME_MAX) {
        return { ok: false, message: `닉네임은 ${NICKNAME_MAX}자까지 입력할 수 있어요.` };
    }
    // \p{L} 대신 한글·영문·숫자 범위를 명시 — 기기/엔진별 유니코드 속성 차이를 피함
    if (!/^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/.test(nickname)) {
        return { ok: false, message: '닉네임은 한글·영문·숫자만 사용할 수 있어요.' };
    }
    return { ok: true, nickname };
}

/** 숫자만 남기고 최대 11자리 */
export function normalizePhoneDigits(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, PHONE_DIGITS_LENGTH);
}

/** @deprecated normalizePhoneDigits 사용 */
export function normalizePhoneBody(raw: string): string {
    return normalizePhoneDigits(raw);
}

export function maskPhone(digits: string): string {
    if (digits.length < 10) {
        return digits;
    }
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-****-${tail}`;
}

export function validatePhoneBody(raw: string): PhoneValidationResult {
    const digits = normalizePhoneDigits(raw);
    if (digits.length === 0) {
        return { ok: false, message: '전화번호를 입력해 주세요.' };
    }
    if (digits.length !== PHONE_DIGITS_LENGTH) {
        return { ok: false, message: '휴대전화번호 11자리를 입력해 주세요.' };
    }
    if (!/^01[016789]\d{8}$/.test(digits)) {
        return { ok: false, message: '올바른 휴대전화번호를 입력해 주세요.' };
    }
    return { ok: true, digits, masked: maskPhone(digits) };
}

export function validatePassword(password: string): PasswordValidationResult {
    if (password.length < PASSWORD_MIN) {
        return { ok: false, message: `비밀번호는 ${PASSWORD_MIN}자 이상 입력해 주세요.` };
    }
    if (password.length > PASSWORD_MAX) {
        return { ok: false, message: `비밀번호는 ${PASSWORD_MAX}자까지 입력할 수 있어요.` };
    }
    return { ok: true, password };
}

/** @deprecated validatePhoneBody 사용 */
export function validatePhone(raw: string): PhoneValidationResult {
    return validatePhoneBody(raw);
}
