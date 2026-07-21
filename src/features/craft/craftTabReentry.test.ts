import type { SoupCraftResponse } from '@api/notion/types';
import { act, renderHook } from '@testing-library/react-native';
import { useCraftTabController } from './craftTabReentry';

const craft: SoupCraftResponse = {
    soupId: 10,
    result: 'SUCCESS',
    rewardType: 'ALMANG_POINT',
    rewardAmount: 40,
};

describe('useCraftTabController (제작 탭 pending outcome 상태 전이)', () => {
    it('비활성 중 성공은 전달하지 않고 복귀 시 onSoupMade를 정확히 한 번 호출한다', () => {
        const onSoupMade = jest.fn();
        const onBrewFailure = jest.fn();
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) =>
                useCraftTabController({ active, onSoupMade, onBrewFailure }),
            { initialProps: { active: true } },
        );

        act(() => {
            result.current.startSelecting();
            result.current.markBrewStarted();
        });
        rerender({ active: false });
        act(() => {
            result.current.completeBrewSuccess('recipe-1', craft);
        });

        expect(onSoupMade).not.toHaveBeenCalled();
        expect(result.current.phase).toBe('select');

        rerender({ active: true });

        expect(onSoupMade).toHaveBeenCalledTimes(1);
        expect(onSoupMade).toHaveBeenCalledWith('recipe-1', craft);
        rerender({ active: true });
        expect(onSoupMade).toHaveBeenCalledTimes(1);
    });

    it('비활성 중 실패는 토스트를 보류하고 복귀 시 select 유지·오류를 정확히 한 번 전달한다', () => {
        const onSoupMade = jest.fn();
        const onBrewFailure = jest.fn();
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) =>
                useCraftTabController({ active, onSoupMade, onBrewFailure }),
            { initialProps: { active: true } },
        );

        act(() => {
            result.current.startSelecting();
            result.current.markBrewStarted();
        });
        rerender({ active: false });
        act(() => {
            result.current.completeBrewFailure('network');
        });

        expect(onBrewFailure).not.toHaveBeenCalled();

        rerender({ active: true });

        expect(result.current.phase).toBe('select');
        expect(onBrewFailure).toHaveBeenCalledTimes(1);
        expect(onBrewFailure).toHaveBeenCalledWith('network');
        rerender({ active: true });
        expect(onBrewFailure).toHaveBeenCalledTimes(1);
    });

    it('활성 탭 실패는 select를 유지하고 오류를 즉시 한 번 전달한다', () => {
        const onSoupMade = jest.fn();
        const onBrewFailure = jest.fn();
        const { result } = renderHook(() =>
            useCraftTabController({ active: true, onSoupMade, onBrewFailure }),
        );

        act(() => {
            result.current.startSelecting();
            result.current.markBrewStarted();
            result.current.completeBrewFailure('no_stock');
        });

        expect(result.current.phase).toBe('select');
        expect(onBrewFailure).toHaveBeenCalledTimes(1);
        expect(onBrewFailure).toHaveBeenCalledWith('no_stock');
    });

    it('진행 중 복귀는 select를 유지하고, idle 복귀만 landing으로 초기화한다', () => {
        const options = {
            onSoupMade: jest.fn(),
            onBrewFailure: jest.fn(),
        };
        const running = renderHook(
            ({ active }: { active: boolean }) =>
                useCraftTabController({ active, ...options }),
            { initialProps: { active: true } },
        );
        act(() => {
            running.result.current.startSelecting();
            running.result.current.markBrewStarted();
        });
        running.rerender({ active: false });
        running.rerender({ active: true });
        expect(running.result.current.phase).toBe('select');

        act(() => {
            running.result.current.completeBrewFailure('network');
        });
        running.rerender({ active: false });
        running.rerender({ active: true });
        expect(running.result.current.phase).toBe('landing');
    });

    it('브루 진행 중이 아니면 탭을 나가는 즉시 landing으로 초기화하고, 복귀 시 다시 바꾸지 않는다', () => {
        const onSoupMade = jest.fn();
        const onBrewFailure = jest.fn();
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) =>
                useCraftTabController({ active, onSoupMade, onBrewFailure }),
            { initialProps: { active: true } },
        );

        act(() => {
            result.current.startSelecting();
        });
        expect(result.current.phase).toBe('select');

        rerender({ active: false });
        expect(result.current.phase).toBe('landing');

        rerender({ active: true });
        expect(result.current.phase).toBe('landing');
    });

    it('브루 진행 중에는 탭을 나가도 기존 제작 화면을 유지한다', () => {
        const onSoupMade = jest.fn();
        const onBrewFailure = jest.fn();
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) =>
                useCraftTabController({ active, onSoupMade, onBrewFailure }),
            { initialProps: { active: true } },
        );

        act(() => {
            result.current.startSelecting();
            result.current.markBrewStarted();
        });

        rerender({ active: false });
        expect(result.current.phase).toBe('select');
    });
});
