/**
 * 스킵 설정 저장값 인코딩/디코딩 (순수 함수, 저장소 의존 없음).
 * `craftAnimationSkipPreference.ts`가 실제 Storage IO를 담당하고 여기 함수를 사용한다.
 * 이 파일을 분리해 두면 `@apps-in-toss/framework` 디바이스 모듈 없이도 테스트할 수 있다.
 */
export const DEFAULT_SKIP_CRAFT_ANIMATION = false;

export type StoredSkipCraftAnimation = { skip: boolean };

function isStoredSkipCraftAnimation(raw: unknown): raw is StoredSkipCraftAnimation {
    return (
        raw != null &&
        typeof raw === 'object' &&
        !Array.isArray(raw) &&
        typeof (raw as { skip?: unknown }).skip === 'boolean'
    );
}

/** 저장된 원시 값 → boolean (손상·누락 시 기본값 false로 안전 복구) */
export function decodeSkipCraftAnimation(raw: unknown): boolean {
    if (!isStoredSkipCraftAnimation(raw)) {
        return DEFAULT_SKIP_CRAFT_ANIMATION;
    }
    return raw.skip;
}

/** boolean → 저장 payload */
export function encodeSkipCraftAnimation(value: boolean): StoredSkipCraftAnimation {
    return { skip: value };
}

/** Storage read·JSON parse 실패를 기본값 false로 복구한다. */
export async function readSkipCraftAnimationSafely(
    read: () => Promise<unknown>,
): Promise<boolean> {
    try {
        return decodeSkipCraftAnimation(await read());
    } catch {
        return DEFAULT_SKIP_CRAFT_ANIMATION;
    }
}
