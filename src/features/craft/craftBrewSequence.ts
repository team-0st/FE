export type CraftBrewPhase = 'stir' | 'transform' | 'complete';

export type CraftBrewOutcome<TSuccess> = { ok: true; value: TSuccess } | { ok: false; error: unknown };

export type CraftBrewSequenceOptions<TSuccess> = {
    /** 브루 API 호출. resolve된 값은 isSuccess로 성공/업무상 실패를 판단한다. */
    run: () => Promise<TSuccess>;
    /** value가 성공인지 판단 (기본: 항상 성공) */
    isSuccess?: (value: TSuccess) => boolean;
    /** stir 단계 시작 시 value는 undefined, transform·complete 단계에서는 resolve된 값을 함께 전달한다 */
    onPhaseChange: (phase: CraftBrewPhase, value?: TSuccess) => void;
    /** 저어주기 최소 유지 시간(ms) — API가 이보다 빠르면 이 시간까지 저어주기를 유지한다 */
    minStirMs?: number;
    /** 변환 단계 재생 시간(ms) */
    transformMs?: number;
    /** 완성 단계 재생 시간(ms) */
    completeMs?: number;
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
};

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * 제작(브루) 애니메이션 타이밍 오케스트레이션 (순수 로직, 타이머·API 콜은 주입).
 *
 * - API가 minStirMs보다 빠르게 끝나면: 저어주기를 minStirMs까지 채운 뒤 변환→완성을 재생한다. (API가 빠르면 총 약 3초)
 * - API가 minStirMs보다 느리면: 저어주기를 API 응답까지 유지했다가, 응답을 받은 즉시 변환→완성을 재생한다.
 * - API가 실패(reject)하거나 업무상 실패(isSuccess가 false)면: 변환·완성 없이 즉시 실패를 반환한다.
 */
export async function runCraftBrewSequence<TSuccess>(
    options: CraftBrewSequenceOptions<TSuccess>,
): Promise<CraftBrewOutcome<TSuccess>> {
    const {
        run,
        isSuccess = () => true,
        onPhaseChange,
        minStirMs = 1200,
        transformMs = 1200,
        completeMs = 600,
        now = Date.now,
        sleep = defaultSleep,
    } = options;

    onPhaseChange('stir');

    const startedAt = now();
    let value: TSuccess;
    try {
        value = await run();
    } catch (error) {
        return { ok: false, error };
    }

    if (!isSuccess(value)) {
        return { ok: false, error: value };
    }

    const elapsed = now() - startedAt;
    const remainingStir = Math.max(0, minStirMs - elapsed);
    if (remainingStir > 0) {
        await sleep(remainingStir);
    }

    onPhaseChange('transform', value);
    await sleep(transformMs);

    onPhaseChange('complete', value);
    await sleep(completeMs);

    return { ok: true, value };
}
