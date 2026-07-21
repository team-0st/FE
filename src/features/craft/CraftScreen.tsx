import type { SoupCraftResponse } from '@api/notion/types';
import { useCallback } from 'react';
import { getBrewFailureMessage } from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { IngredientsScreen } from '../ingredients/IngredientsScreen';
import { CraftLandingScreen } from './CraftLandingScreen';
import { useCraftTabController } from './craftTabReentry';

type CraftScreenProps = {
    onSoupMade: (recipeId: string, craft: SoupCraftResponse) => void;
    /** 이 화면이 현재 보이는 탭인지 여부. true→false로 바뀔 때 브루 진행 중이 아니면 랜딩으로 초기화한다. */
    active: boolean;
};

/**
 * 제작 탭 진입점. 랜딩(스킵 버튼 없음) → 재료 선택(IngredientsScreen) 순서로만 진행한다.
 * 평상시 탭 재진입은 랜딩으로 초기화하되, 브루 진행·완료 결과는 탭 이탈 중에도 보존한다.
 */
export function CraftScreen({ onSoupMade, active }: CraftScreenProps) {
    const { showError } = useAppToast();
    const handleBrewFailure = useCallback(
        (reason: Parameters<typeof getBrewFailureMessage>[0]) => {
            showError(getBrewFailureMessage(reason));
        },
        [showError],
    );
    const controller = useCraftTabController({
        active,
        onSoupMade,
        onBrewFailure: handleBrewFailure,
    });

    if (controller.phase === 'landing') {
        return <CraftLandingScreen onPressStart={controller.startSelecting} />;
    }

    return (
        <IngredientsScreen
            onSoupMade={controller.completeBrewSuccess}
            onBrewStarted={controller.markBrewStarted}
            onBrewFailure={controller.completeBrewFailure}
        />
    );
}
