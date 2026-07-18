export type NicknameValidationResult =
    | { ok: true; nickname: string }
    | { ok: false; message: string };

export type PhoneValidationResult =
    | { ok: true; digits: string; masked: string }
    | { ok: false; message: string };

const NICKNAME_MIN = 2;
const NICKNAME_MAX = 12;

/** 휴대전화 앞자리 고정 (알맹 포인트·본인 확인) */
export const PHONE_PREFIX = '010';
export const PHONE_BODY_LENGTH = 8;

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

export function normalizePhoneBody(raw: string): string {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith(PHONE_PREFIX)) {
        digits = digits.slice(PHONE_PREFIX.length);
    }
    return digits.slice(0, PHONE_BODY_LENGTH);
}

export function maskPhone(digits: string): string {
    if (digits.length < 10) {
        return digits;
    }
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-****-${tail}`;
}

export function validatePhoneBody(body: string): PhoneValidationResult {
    const normalized = normalizePhoneBody(body);
    if (normalized.length === 0) {
        return { ok: false, message: '전화번호를 입력해 주세요.' };
    }
    if (normalized.length !== PHONE_BODY_LENGTH) {
        return { ok: false, message: '전화번호 8자리를 입력해 주세요.' };
    }
    const digits = `${PHONE_PREFIX}${normalized}`;
    return { ok: true, digits, masked: maskPhone(digits) };
}

/** @deprecated validatePhoneBody 사용 */
export function validatePhone(raw: string): PhoneValidationResult {
    return validatePhoneBody(raw);
}
