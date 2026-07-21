import { runCraftBrewSequence } from './craftBrewSequence';

type Outcome = { ok: true; value: number } | { ok: false; reason: string };

function makeClock(startAt = 0) {
    let current = startAt;
    return {
        now: () => current,
        advance: (ms: number) => {
            current += ms;
        },
    };
}

function fakeSleep(clock: { advance: (ms: number) => void }) {
    return (ms: number) => {
        clock.advance(ms);
        return Promise.resolve();
    };
}

describe('runCraftBrewSequence (저어주기 → 변환 → 완성 타이밍 오케스트레이션)', () => {
    it('API가 빠르면(예: 300ms) 저어주기를 최소 시간(1200ms)까지 채운 뒤 변환·완성을 재생한다', async () => {
        const clock = makeClock();
        const phases: string[] = [];
        const run = jest.fn(async (): Promise<Outcome> => {
            clock.advance(300);
            return { ok: true, value: 42 };
        });

        const outcome = await runCraftBrewSequence<Outcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (phase) => phases.push(phase),
            now: clock.now,
            sleep: fakeSleep(clock),
        });

        expect(outcome).toEqual({ ok: true, value: { ok: true, value: 42 } });
        expect(phases).toEqual(['stir', 'transform', 'complete']);
        // 300(API) + 900(잔여 저어주기) + 1200(변환) + 600(완성) = 3000ms
        expect(clock.now()).toBe(3000);
    });

    it('API가 느리면(예: 2000ms, 1200ms 초과) 저어주기를 API 응답까지 유지한 뒤 즉시 변환·완성을 재생한다', async () => {
        const clock = makeClock();
        const phases: string[] = [];
        const run = jest.fn(async (): Promise<Outcome> => {
            clock.advance(2000);
            return { ok: true, value: 7 };
        });

        const outcome = await runCraftBrewSequence<Outcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (phase) => phases.push(phase),
            now: clock.now,
            sleep: fakeSleep(clock),
        });

        expect(outcome).toEqual({ ok: true, value: { ok: true, value: 7 } });
        expect(phases).toEqual(['stir', 'transform', 'complete']);
        // 2000(API, 이미 1200ms 초과) + 0(잔여 저어주기 없음) + 1200(변환) + 600(완성) = 3800ms
        expect(clock.now()).toBe(3800);
    });

    it('API가 실패(reject)하면 변환·완성 단계 없이 즉시 실패를 반환한다', async () => {
        const phases: string[] = [];
        const error = new Error('network down');
        const run = jest.fn(async (): Promise<Outcome> => {
            throw error;
        });

        const outcome = await runCraftBrewSequence<Outcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (phase) => phases.push(phase),
        });

        expect(outcome).toEqual({ ok: false, error });
        expect(phases).toEqual(['stir']);
    });

    it('API가 성공적으로 resolve됐지만 업무상 실패(ok:false)면 변환·완성 단계 없이 실패를 반환한다', async () => {
        const phases: string[] = [];
        const failureValue: Outcome = { ok: false, reason: 'no_stock' };
        const run = jest.fn(async (): Promise<Outcome> => failureValue);

        const outcome = await runCraftBrewSequence<Outcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (phase) => phases.push(phase),
        });

        expect(outcome).toEqual({ ok: false, error: failureValue });
        expect(phases).toEqual(['stir']);
    });

    it('phase 콜백에 transform·complete 단계에서 성공 값을 함께 전달한다', async () => {
        const clock = makeClock();
        const seen: Array<{ phase: string; value: Outcome | undefined }> = [];
        const run = jest.fn(async (): Promise<Outcome> => ({ ok: true, value: 99 }));

        await runCraftBrewSequence<Outcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (phase, value) => seen.push({ phase, value }),
            now: clock.now,
            sleep: fakeSleep(clock),
        });

        expect(seen[0]).toEqual({ phase: 'stir', value: undefined });
        expect(seen[1]).toEqual({ phase: 'transform', value: { ok: true, value: 99 } });
        expect(seen[2]).toEqual({ phase: 'complete', value: { ok: true, value: 99 } });
    });
});
