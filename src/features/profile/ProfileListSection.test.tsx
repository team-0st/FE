import type { SoupCraftResponse } from '@api/notion/types';
import { getRecommendedRecipes } from '@api/mock/recipes';
import { act, fireEvent, render } from '@testing-library/react-native';
import type { ComponentProps, ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ABOUT_ZEROST_LABELS, ABOUT_ZEROST_SECTIONS } from '../../shared/constants/aboutZerost';
import { useAppToast } from '../../shared/feedback/useAppToast';
import {
    PREVIEW_ROW_HEIGHT,
    SCROLL_PREVIEW_HINT,
    ScrollPreviewSection,
    computeAdaptiveVisibleRows,
    getMaxMeasuredRowHeight,
    hasScrollOverflow,
    updateMeasuredRowHeightById,
} from '../../shared/ui/ScrollPreviewSection';
import { AboutZerostScreen } from '../about/AboutZerostScreen';
import {
    FEATURE_HEADER_SLOT_HEIGHT,
    FEATURE_STAGE_HEIGHT,
} from '../../shared/constants/brandAssets';
import {
    CAULDRON_COMPOSITE_ALPHA_BOUNDS,
    CAULDRON_LAYER_ASPECT_RATIO,
} from '../../shared/constants/cauldronImages';
import {
    CENTERED_STAGE_MIN_VISIBLE_BELOW_HEIGHT,
    CenteredFeatureStage,
    shouldUseStackedFallback,
} from '../../shared/ui/CenteredFeatureStage';
import { FixedHeightHeaderSlot } from '../../shared/ui/Screen';
import { type CraftBrewOutcome, CraftBrewAnimationOverlay } from '../craft/CraftBrewAnimationOverlay';
import { CraftLandingScreen } from '../craft/CraftLandingScreen';
import { CRAFT_STAGE_ALIGNMENT } from '../craft/craftStageAlignment';
import { GachaScreen } from '../gacha/GachaScreen';
import {
    createInitialGachaTabState,
    isGachaPullOutcomeCurrent,
    reduceGachaTabState,
} from '../gacha/gachaLogic';
import type { GachaPullResult, GachaReward } from '../gacha/gachaTypes';
import { brewStatusMessage } from '../ingredients/IngredientsScreen';
import { OnboardingProfileScreen } from '../onboarding/OnboardingProfileScreen';
import {
    BODY_CONTENT_PADDING_BOTTOM,
    HIDDEN_RECIPE_ALL_UNLOCKED_TOAST,
    RecipesScreen,
    canRecipeListScrollMore,
    hiddenRecipeUnlockButtonLabel,
} from '../recipes/RecipesScreen';
import { SoupResultScreen } from '../soup/SoupResultScreen';
import { useUser } from '../user/UserProvider';
import { DEFAULT_USER_STATE } from '../user/defaultState';
import { ONBOARDING_PRIVACY_CHECKBOX, PRIVACY_POLICY_LABELS } from '../../shared/constants/privacyPolicy';
import { NearbyShopsSection } from '../../shared/ui/NearbyShopsSection';
import {
    LOCATION_CONSENT_DENIED_LIST_HINT,
    LOCATION_CONSENT_NOTICE,
    MAP_SHOPS_SCOPE_HINT,
} from '../shop/nearbyShopLogic';
import { PartnerShopsScreen } from '../shop/PartnerShopsScreen';
import { ALMANG_STORE_INFO_LINES } from './ProfileScreen';
import { ProfileListModal } from './ProfileListSection';
import type { CoopMission } from '@api/mock';
import { COOP_MISSIONS, DAILY_MISSIONS, SPECIAL_MISSIONS } from '@api/mock/missions';
import { ListRow } from '@toss/tds-react-native';
import { getMissionImageSource } from '../../shared/constants/missionAssets';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { MissionsListScreen } from '../missions/MissionsListScreen';
import { MissionShareCard } from '../missions/MissionShareCard';
import { MissionResultScreen } from '../missions/MissionResultScreen';
import { CommunityGoalSection } from '../../shared/ui/CommunityGoalSection';
import { EcoCopyCard } from '../../shared/ui/EcoCopyCard';

jest.mock('@toss/tds-react-native', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
    const MockText = ({
        children,
        style,
    }: Pick<ComponentProps<typeof ReactNative.Text>, 'children' | 'style'>) =>
        React.createElement(ReactNative.Text, { style }, children);
    const MockButton = ({
        children,
        disabled,
        onPress,
    }: {
        children?: ReactNode;
        disabled?: boolean;
        onPress?: () => void;
    }) =>
        React.createElement(
            ReactNative.Pressable,
            {
                accessibilityLabel: typeof children === 'string' ? children : undefined,
                accessibilityRole: 'button',
                accessibilityState: { disabled: disabled === true },
                disabled,
                onPress,
            },
            React.createElement(ReactNative.Text, null, children),
        );
    const MockListRow = Object.assign(() => null, {
        Texts: () => null,
        RightTexts: () => null,
        Icon: () => null,
    });
    const MockBadge = ({
        children,
        style,
    }: Pick<ComponentProps<typeof ReactNative.Text>, 'children' | 'style'>) =>
        React.createElement(ReactNative.Text, { style }, children);
    const MockBorder = ({ style }: { style?: ComponentProps<typeof ReactNative.View>['style'] }) =>
        React.createElement(ReactNative.View, { style });
    const MockTop = Object.assign(
        ({ title }: { title?: ReactNode }) => React.createElement(ReactNative.View, null, title),
        { TitleParagraph: MockText, SubtitleParagraph: MockText },
    );
    const MockBottomCTA = Object.assign(() => null, {
        Double: ({
            leftButton,
            rightButton,
        }: {
            leftButton?: ReactNode;
            rightButton?: ReactNode;
        }) =>
            React.createElement(ReactNative.View, null, leftButton, rightButton),
        Single: ({
            children,
            onPress,
        }: {
            children?: ReactNode;
            onPress?: () => void;
        }) => React.createElement(MockButton, { onPress }, children),
    });
    const MockCheckboxLine = ({
        checked,
        accessibilityLabel,
        onCheckedChange,
        children,
    }: {
        checked?: boolean;
        accessibilityLabel?: string;
        onCheckedChange?: (checked: boolean) => void;
        children?: ReactNode;
    }) =>
        React.createElement(
            ReactNative.Pressable,
            {
                accessibilityRole: 'checkbox',
                accessibilityLabel,
                accessibilityState: { checked: checked === true },
                onPress: () => onCheckedChange?.(!checked),
            },
            children,
        );
    const MockCheckbox = Object.assign(() => null, { Line: MockCheckboxLine });
    const MockTextField = ({
        label,
        value,
        placeholder,
        onChangeText,
        maxLength,
    }: {
        label?: string;
        value?: string;
        placeholder?: string;
        onChangeText?: (text: string) => void;
        maxLength?: number;
    }) =>
        React.createElement(ReactNative.TextInput, {
            accessibilityLabel: label,
            placeholder,
            value,
            onChangeText,
            maxLength,
        });
    const MockBottomSheetHeader = ({ children }: { children?: ReactNode }) =>
        React.createElement(ReactNative.Text, null, children);
    const MockBottomSheetCTA = ({
        children,
        onPress,
    }: {
        children?: ReactNode;
        onPress?: () => void;
    }) => React.createElement(MockButton, { onPress }, children);
    const MockBottomSheetRoot = ({
        header,
        cta,
        children,
        wrapperProps,
    }: {
        header?: ReactNode;
        cta?: ReactNode;
        children?: ReactNode;
        wrapperProps?: ComponentProps<typeof ReactNative.ScrollView>;
    }) =>
        React.createElement(
            ReactNative.View,
            null,
            header,
            React.createElement(ReactNative.ScrollView, wrapperProps, children),
            cta,
        );
    const MockBottomSheet = Object.assign(() => null, {
        Root: MockBottomSheetRoot,
        Header: MockBottomSheetHeader,
        CTA: MockBottomSheetCTA,
    });

    return {
        Asset: { Icon: () => null },
        Badge: MockBadge,
        Border: MockBorder,
        BottomCTA: MockBottomCTA,
        BottomSheet: MockBottomSheet,
        Button: MockButton,
        Checkbox: MockCheckbox,
        ListRow: MockListRow,
        ProgressBar: () => null,
        TextButton: MockButton,
        TextField: MockTextField,
        Top: MockTop,
        Txt: MockText,
        frameShape: { CircleLarge: 'CircleLarge' },
    };
});

jest.mock('../../shared/ui/Screen', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
    const actual = jest.requireActual<typeof import('../../shared/ui/Screen')>('../../shared/ui/Screen');

    return {
        FixedHeightHeaderSlot: actual.FixedHeightHeaderSlot,
        SCREEN_CONTENT_PADDING: actual.SCREEN_CONTENT_PADDING,
        Screen: ({ children, scrollable }: { children?: ReactNode; scrollable?: boolean }) =>
            scrollable
                ? React.createElement(ReactNative.ScrollView, null, children)
                : React.createElement(ReactNative.View, null, children),
    };
});

jest.mock('../user/UserProvider', () => ({
    useUser: jest.fn(),
}));

jest.mock('../../shared/feedback/useAppToast', () => ({
    useAppToast: jest.fn(),
}));

jest.mock('../craft/useCraftSkipAnimationPreference', () => ({
    useCraftSkipAnimationPreference: jest.fn(),
}));

jest.mock('react-native-webview', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
    return {
        __esModule: true,
        default: () => React.createElement(ReactNative.View, null),
    };
});

const mockUseUser = jest.mocked(useUser);
const mockUseAppToast = jest.mocked(useAppToast);

describe('AboutZerostScreen', () => {
    it('화면 제목과 모든 섹션 제목·본문을 가운데 정렬한다', () => {
        const { getByText, UNSAFE_getByType } = render(<AboutZerostScreen />);
        const allCopy = [
            ABOUT_ZEROST_LABELS.title,
            ...ABOUT_ZEROST_SECTIONS.flatMap((section) => [section.heading, ...section.lines]),
        ];

        expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
        for (const copy of allCopy) {
            expect(StyleSheet.flatten(getByText(copy).props.style)).toEqual(
                expect.objectContaining({ textAlign: 'center' }),
            );
        }
    });
});

describe('ProfileListModal', () => {
    it('스크롤 목록을 닫기 오버레이 Pressable 밖에 렌더한다', () => {
        const { getByTestId } = render(
            <ProfileListModal
                visible
                title="에코잼 내역"
                emptyMessage="아직 내역이 없어요."
                itemCount={10}
                onClose={jest.fn()}
            >
                <Text>내역</Text>
            </ProfileListModal>,
        );

        const dismissOverlay = getByTestId('profile-list-dismiss-overlay', {
            includeHiddenElements: true,
        });
        const sheet = getByTestId('profile-list-sheet');
        const scroll = getByTestId('profile-list-scroll');

        expect(dismissOverlay.findAllByType(ScrollView)).toHaveLength(0);
        expect(sheet.findAllByType(ScrollView)).toHaveLength(1);
        expect(sheet.props.onStartShouldSetResponder).toBeUndefined();
        expect(StyleSheet.flatten(sheet.props.style)).toEqual(
            expect.objectContaining({ maxHeight: '80%' }),
        );
        expect(StyleSheet.flatten(scroll.props.style)).toEqual(
            expect.objectContaining({ flexShrink: 1, minHeight: 0 }),
        );
    });
});

describe('computeAdaptiveVisibleRows (제작 탭 보유 재료 노출 행 계산)', () => {
    it('남는 높이가 넉넉하면 최대 5행까지 늘린다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 800,
            otherContentHeight: 200,
            rowHeight: 64,
        });
        expect(rows).toBe(5);
    });

    it('남는 높이가 딱 4행 분량이면 4행을 보여준다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 456,
            otherContentHeight: 200,
            rowHeight: 64,
        });
        expect(rows).toBe(4);
    });

    it('남는 높이가 부족해도 최소 3행은 유지한다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 300,
            otherContentHeight: 280,
            rowHeight: 64,
        });
        expect(rows).toBe(3);
    });

    it('비목록 콘텐츠가 뷰포트보다 커도(음수 여유) 최소 3행으로 안전하게 유지한다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 400,
            otherContentHeight: 900,
            rowHeight: 64,
        });
        expect(rows).toBe(3);
    });

    it('rowHeight가 0 이하이면 최소 3행으로 안전하게 유지한다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 800,
            otherContentHeight: 100,
            rowHeight: 0,
        });
        expect(rows).toBe(3);
    });

    it('min/max를 전달하면 해당 범위로 클램프한다', () => {
        const rows = computeAdaptiveVisibleRows({
            viewportHeight: 1000,
            otherContentHeight: 0,
            rowHeight: 64,
            min: 3,
            max: 4,
        });
        expect(rows).toBe(4);
    });
});

describe('보유 재료 ID별 실제 행 높이 계산', () => {
    it('가장 높은 ID가 현재 목록에서 제거되면 남은 ID 기준으로 최대 높이가 감소한다', () => {
        const measuredHeights = { short: 70, tall: 92 };

        expect(
            getMaxMeasuredRowHeight({
                itemIds: ['short'],
                measuredHeights,
            }),
        ).toBe(70);
    });

    it('같은 ID의 재측정 높이가 충분히 감소하면 최신값으로 갱신한다', () => {
        expect(
            updateMeasuredRowHeightById({
                measuredHeights: { tomato: 92 },
                itemId: 'tomato',
                measuredHeight: 76,
            }),
        ).toEqual({ tomato: 76 });
    });

    it('유효하지 않은 재측정은 해당 ID의 기존값을 유지한다', () => {
        const measuredHeights = { tomato: 92 };

        expect(
            updateMeasuredRowHeightById({
                measuredHeights,
                itemId: 'tomato',
                measuredHeight: Number.NaN,
            }),
        ).toBe(measuredHeights);
    });

    it('같은 ID의 1px 이내 변화는 기존값과 상태 객체를 유지한다', () => {
        const measuredHeights = { tomato: 92 };

        expect(
            updateMeasuredRowHeightById({
                measuredHeights,
                itemId: 'tomato',
                measuredHeight: 91.4,
            }),
        ).toBe(measuredHeights);
    });

    it('현재 ID에 유효한 측정값이 없으면 기본 행 높이를 사용한다', () => {
        expect(
            getMaxMeasuredRowHeight({
                itemIds: ['tomato'],
                measuredHeights: {},
            }),
        ).toBe(PREVIEW_ROW_HEIGHT);
    });
});

describe('hasScrollOverflow (미리보기 스크롤 실제 overflow 판단)', () => {
    it('실측 content height가 viewport height보다 1px 넘게 크면 overflow로 판단한다', () => {
        expect(
            hasScrollOverflow({ contentHeight: 300, viewportHeight: 192, itemCount: 5 }),
        ).toBe(true);
    });

    it('content height와 viewport height 차이가 1px 이하이면 overflow로 보지 않는다', () => {
        expect(
            hasScrollOverflow({ contentHeight: 192.6, viewportHeight: 192, itemCount: 5 }),
        ).toBe(false);
    });

    it('항목 수가 0이면 실측 높이와 무관하게 overflow가 아니다', () => {
        expect(
            hasScrollOverflow({ contentHeight: 500, viewportHeight: 100, itemCount: 0 }),
        ).toBe(false);
    });

    it('아직 측정되지 않은(null) content 또는 viewport 높이는 overflow로 보지 않는다', () => {
        expect(
            hasScrollOverflow({ contentHeight: null, viewportHeight: null, itemCount: 5 }),
        ).toBe(false);
        expect(
            hasScrollOverflow({ contentHeight: 300, viewportHeight: null, itemCount: 5 }),
        ).toBe(false);
    });
});

describe('ScrollPreviewSection (ScrollView 실측 기반 overflow 표시)', () => {
    it('측정 전에는 스크롤 안내 문구와 인디케이터를 숨겨 초기 깜빡임을 막는다', () => {
        const { queryByText, UNSAFE_getByType } = render(
            <ScrollPreviewSection itemCount={5}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(UNSAFE_getByType(ScrollView).props.showsVerticalScrollIndicator).toBe(false);
    });

    it('실측 content height가 viewport height를 1px 넘게 초과하면 안내 문구를 보여주고 onScrollabilityChange(true)를 호출한다', () => {
        const onScrollabilityChange = jest.fn();
        const { getByText, UNSAFE_getByType } = render(
            <ScrollPreviewSection itemCount={5} onScrollabilityChange={onScrollabilityChange}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        const scrollView = UNSAFE_getByType(ScrollView);

        fireEvent(scrollView, 'layout', { nativeEvent: { layout: { height: 192 } } });
        fireEvent(scrollView, 'contentSizeChange', 300, 260);

        expect(getByText(SCROLL_PREVIEW_HINT)).toBeTruthy();
        expect(onScrollabilityChange).toHaveBeenLastCalledWith(true);
    });

    it('content height와 viewport height 차이가 1px 이하이면 안내 문구를 숨기고 onScrollabilityChange(false)를 호출한다', () => {
        const onScrollabilityChange = jest.fn();
        const { queryByText, UNSAFE_getByType } = render(
            <ScrollPreviewSection itemCount={5} onScrollabilityChange={onScrollabilityChange}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        const scrollView = UNSAFE_getByType(ScrollView);

        fireEvent(scrollView, 'layout', { nativeEvent: { layout: { height: 192 } } });
        fireEvent(scrollView, 'contentSizeChange', 300, 192.6);

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(onScrollabilityChange).toHaveBeenLastCalledWith(false);
    });

    it('itemCount가 nonzero→0→nonzero로 바뀌면 새 측정 전에는 이전 overflow를 재사용하지 않는다', () => {
        const { getByText, queryByText, rerender, UNSAFE_getByType } = render(
            <ScrollPreviewSection itemCount={5}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        const previousScrollView = UNSAFE_getByType(ScrollView);
        const previousOnLayout = previousScrollView.props.onLayout;
        const previousOnContentSizeChange = previousScrollView.props.onContentSizeChange;

        fireEvent(previousScrollView, 'layout', {
            nativeEvent: { layout: { height: 192 } },
        });
        fireEvent(previousScrollView, 'contentSizeChange', 300, 260);
        expect(getByText(SCROLL_PREVIEW_HINT)).toBeTruthy();

        rerender(
            <ScrollPreviewSection itemCount={0}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        rerender(
            <ScrollPreviewSection itemCount={5}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(UNSAFE_getByType(ScrollView).props.showsVerticalScrollIndicator).toBe(false);

        previousOnLayout({ nativeEvent: { layout: { height: 192 } } });
        previousOnContentSizeChange(300, 260);

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(UNSAFE_getByType(ScrollView).props.showsVerticalScrollIndicator).toBe(false);
    });

    it('visibleRows가 바뀌면 새 layout/content 측정이 모두 들어오기 전까지 숨긴다', () => {
        const { getByText, queryByText, rerender, UNSAFE_getByType } = render(
            <ScrollPreviewSection itemCount={5} visibleRows={3}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        let scrollView = UNSAFE_getByType(ScrollView);

        fireEvent(scrollView, 'layout', { nativeEvent: { layout: { height: 192 } } });
        fireEvent(scrollView, 'contentSizeChange', 300, 260);
        expect(getByText(SCROLL_PREVIEW_HINT)).toBeTruthy();

        rerender(
            <ScrollPreviewSection itemCount={5} visibleRows={4}>
                <Text>row</Text>
            </ScrollPreviewSection>,
        );
        scrollView = UNSAFE_getByType(ScrollView);

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);

        fireEvent(scrollView, 'layout', { nativeEvent: { layout: { height: 256 } } });

        expect(queryByText(SCROLL_PREVIEW_HINT)).toBeNull();
        expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });
});

describe('brewStatusMessage (제작 탭 하단 상태 문구)', () => {
    it('재료가 없을 때 2개 이상 넣으라고 안내한다', () => {
        expect(brewStatusMessage(0, null)).toBe('재료를 2개 이상 넣으면 만들 수 있어요.');
    });
});

describe('getRecommendedRecipes (완성한 스프 추천 제외)', () => {
    it('재료가 충분해도 completedRecipeIds에 포함된 레시피는 추천하지 않는다', () => {
        const inventory = {
            tomato: 10,
            onion: 10,
            carrot: 10,
            broccoli: 10,
            mushroom: 10,
            cabbage: 10,
            paprika: 10,
        };

        expect(getRecommendedRecipes(inventory, []).map((recipe) => recipe.id)).toContain(
            'beginner-warm',
        );
        expect(
            getRecommendedRecipes(inventory, ['beginner-warm']).map((recipe) => recipe.id),
        ).not.toContain('beginner-warm');
    });
});

const ALMANG_REWARD: GachaReward = { type: 'ALMANG_POINT', amount: 100 };
const IDLE_FAIL_ART = { uri: 'idle-fail-art' };
const ROLLED_FAIL_ART = { uri: 'rolled-fail-art' };

describe('reduceGachaTabState (가챠 탭 재진입 시 idle 초기화 · 백그라운드 pull 보호)', () => {
    it('뽑는 중 탭을 나가면 즉시 idle로 초기화하고 generation을 증가시킨다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);
        const pulling = reduceGachaTabState(initial, { type: 'PULL_STARTED' });

        const left = reduceGachaTabState(pulling, {
            type: 'TAB_ACTIVE_CHANGED',
            active: false,
        });

        expect(left.phase).toBe('idle');
        expect(left.lastReward).toBeNull();
        expect(left.failArt).toBe(IDLE_FAIL_ART);
        expect(left.generation).toBe(initial.generation + 1);
        expect(left.isPullPending).toBe(true);
    });

    it('결과 화면(공유 버튼 노출 상태)에서 탭을 나가도 즉시 idle로 초기화한다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);
        const withResult = reduceGachaTabState(initial, {
            type: 'PULL_SETTLED',
            outcome: 'result',
            reward: ALMANG_REWARD,
        });
        expect(withResult.phase).toBe('result');

        const left = reduceGachaTabState(withResult, {
            type: 'TAB_ACTIVE_CHANGED',
            active: false,
        });

        expect(left.phase).toBe('idle');
        expect(left.lastReward).toBeNull();
    });

    it('탭으로 복귀해도(false→true) 화면을 다시 바꾸지 않는다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);
        const left = reduceGachaTabState(initial, { type: 'TAB_ACTIVE_CHANGED', active: false });

        const returned = reduceGachaTabState(left, {
            type: 'TAB_ACTIVE_CHANGED',
            active: true,
        });

        expect(returned.phase).toBe('idle');
        expect(returned.active).toBe(true);
        expect(returned.generation).toBe(left.generation);
    });

    it('PULL_STARTED는 phase를 pulling으로, isPullPending을 true로 만든다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);
        const pulling = reduceGachaTabState(initial, { type: 'PULL_STARTED' });

        expect(pulling.phase).toBe('pulling');
        expect(pulling.isPullPending).toBe(true);
    });

    it('PULL_SETTLED(outcome: idle)는 phase를 idle로 되돌리고 isPullPending을 false로 만든다', () => {
        const pulling = reduceGachaTabState(createInitialGachaTabState(true, IDLE_FAIL_ART), {
            type: 'PULL_STARTED',
        });

        const settled = reduceGachaTabState(pulling, { type: 'PULL_SETTLED', outcome: 'idle' });

        expect(settled.phase).toBe('idle');
        expect(settled.isPullPending).toBe(false);
    });

    it('PULL_SETTLED(outcome: result)는 보상을 반영하고 failArt를 전달받은 값으로 갱신한다', () => {
        const pulling = reduceGachaTabState(createInitialGachaTabState(true, IDLE_FAIL_ART), {
            type: 'PULL_STARTED',
        });

        const settled = reduceGachaTabState(pulling, {
            type: 'PULL_SETTLED',
            outcome: 'result',
            reward: { type: 'FAIL', consolationEcoJam: 30 },
            failArt: ROLLED_FAIL_ART,
        });

        expect(settled.phase).toBe('result');
        expect(settled.lastReward).toEqual({ type: 'FAIL', consolationEcoJam: 30 });
        expect(settled.failArt).toBe(ROLLED_FAIL_ART);
        expect(settled.isPullPending).toBe(false);
    });

    it('PULL_ABANDONED_SETTLED는 isPullPending만 false로 만들고 표시 상태는 건드리지 않는다', () => {
        const pulling = reduceGachaTabState(createInitialGachaTabState(true, IDLE_FAIL_ART), {
            type: 'PULL_STARTED',
        });
        const left = reduceGachaTabState(pulling, { type: 'TAB_ACTIVE_CHANGED', active: false });

        const abandoned = reduceGachaTabState(left, { type: 'PULL_ABANDONED_SETTLED' });

        expect(abandoned.isPullPending).toBe(false);
        expect(abandoned.phase).toBe('idle');
        expect(abandoned.lastReward).toBeNull();
    });

    it('탭을 나가지 않은 채 이어지는 두 번째 뽑기도 isPullPending을 계속 true로 유지한다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);
        const firstPull = reduceGachaTabState(initial, { type: 'PULL_STARTED' });
        const firstSettled = reduceGachaTabState(firstPull, {
            type: 'PULL_SETTLED',
            outcome: 'result',
            reward: ALMANG_REWARD,
        });
        expect(firstSettled.isPullPending).toBe(false);

        const secondPull = reduceGachaTabState(firstSettled, { type: 'PULL_STARTED' });
        expect(secondPull.isPullPending).toBe(true);
        expect(secondPull.phase).toBe('pulling');
    });

    it('알 수 없는 이벤트는 방어적으로 기존 상태를 유지한다', () => {
        const initial = createInitialGachaTabState(true, IDLE_FAIL_ART);

        expect(
            reduceGachaTabState(initial, { type: 'UNKNOWN_EVENT' } as never),
        ).toBe(initial);
    });
});

describe('isGachaPullOutcomeCurrent (이탈 중 시작된 pull의 결과 적용 여부 판단)', () => {
    it('시작 시점 generation과 현재 generation이 같으면 결과를 적용한다', () => {
        expect(isGachaPullOutcomeCurrent(2, 2)).toBe(true);
    });

    it('탭을 나갔다 오는 동안 generation이 바뀌었으면 결과를 적용하지 않는다', () => {
        expect(isGachaPullOutcomeCurrent(2, 3)).toBe(false);
    });
});

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((next) => {
        resolve = next;
    });
    return { promise, resolve };
}

const GACHA_PULL_LABEL = '에코잼 100개로 뽑기';
const GACHA_SUCCESS_RESULT: GachaPullResult = {
    ok: true,
    reward: ALMANG_REWARD,
    costEcoJam: 100,
};

describe('GachaScreen tab reentry integration', () => {
    const toast = {
        show: jest.fn(),
        showSuccess: jest.fn(),
        showError: jest.fn(),
    };

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockUseAppToast.mockReturnValue(toast);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    function renderGacha(pullGacha: () => Promise<GachaPullResult>) {
        mockUseUser.mockReturnValue({
            state: { ...DEFAULT_USER_STATE, ecoJam: 300, totalPoints: 0 },
            pullGacha,
            grantTestEcoJam: jest.fn(),
        } as unknown as ReturnType<typeof useUser>);

        return render(<GachaScreen active />);
    }

    async function finishPullAnimation() {
        await act(async () => {
            jest.advanceTimersByTime(700);
            await Promise.resolve();
        });
    }

    it('정상 성공 결과와 공유 상태를 보인 뒤 이탈·복귀하면 idle 최초 화면으로 초기화한다', async () => {
        const screen = renderGacha(jest.fn().mockResolvedValue(GACHA_SUCCESS_RESULT));

        fireEvent.press(screen.getByLabelText(GACHA_PULL_LABEL));
        await finishPullAnimation();

        expect(screen.getByLabelText('가챠 결과')).toBeTruthy();
        expect(screen.getByLabelText('친구에게 결과 공유하기')).toBeTruthy();

        screen.rerender(<GachaScreen active={false} />);
        screen.rerender(<GachaScreen active />);

        expect(screen.getByLabelText('가챠 머신')).toBeTruthy();
        expect(screen.queryByLabelText('가챠 결과')).toBeNull();
        expect(screen.queryByLabelText('친구에게 결과 공유하기')).toBeNull();
    });

    it('이탈한 pending pull의 늦은 성공은 복귀 후 결과와 success toast를 띄우지 않는다', async () => {
        const deferred = createDeferred<GachaPullResult>();
        const screen = renderGacha(jest.fn(() => deferred.promise));

        fireEvent.press(screen.getByLabelText(GACHA_PULL_LABEL));
        await finishPullAnimation();
        expect(screen.getByLabelText('가챠 뽑는 중')).toBeTruthy();

        screen.rerender(<GachaScreen active={false} />);
        screen.rerender(<GachaScreen active />);
        expect(screen.getByLabelText('가챠 머신')).toBeTruthy();

        await act(async () => {
            deferred.resolve(GACHA_SUCCESS_RESULT);
            await deferred.promise;
        });

        expect(screen.getByLabelText('가챠 머신')).toBeTruthy();
        expect(screen.queryByLabelText('가챠 결과')).toBeNull();
        expect(toast.showSuccess).not.toHaveBeenCalled();
    });

    it('복귀 시 pending 요청이 끝날 때까지 중복 pull을 막고 abandon settle 후 다시 허용한다', async () => {
        const deferred = createDeferred<GachaPullResult>();
        const pullGacha = jest.fn(() => deferred.promise);
        const screen = renderGacha(pullGacha);

        fireEvent.press(screen.getByLabelText(GACHA_PULL_LABEL));
        await finishPullAnimation();
        screen.rerender(<GachaScreen active={false} />);
        screen.rerender(<GachaScreen active />);

        const pendingButton = screen.getByLabelText(GACHA_PULL_LABEL);
        expect(pendingButton.props.accessibilityState).toEqual({ disabled: true });
        fireEvent.press(pendingButton);
        expect(pullGacha).toHaveBeenCalledTimes(1);

        await act(async () => {
            deferred.resolve(GACHA_SUCCESS_RESULT);
            await deferred.promise;
        });

        expect(screen.getByLabelText(GACHA_PULL_LABEL).props.accessibilityState).toEqual({
            disabled: false,
        });
    });

    it('활성 상태의 정상 성공은 결과와 success toast를 유지한다', async () => {
        const screen = renderGacha(jest.fn().mockResolvedValue(GACHA_SUCCESS_RESULT));

        fireEvent.press(screen.getByLabelText(GACHA_PULL_LABEL));
        await finishPullAnimation();

        expect(screen.getByLabelText('가챠 결과')).toBeTruthy();
        expect(toast.showSuccess).toHaveBeenCalledWith(expect.stringContaining('100P'));
    });

    it('idle과 result 모두 동일 ShareResultButton 하나를 레이아웃에 유지하되 idle만 비상호작용·접근성 숨김 처리한다', async () => {
        const screen = renderGacha(jest.fn().mockResolvedValue(GACHA_SUCCESS_RESULT));
        const shareLabel = '친구에게 결과 공유하기';

        const idleSlot = screen.getByTestId('gacha-share-slot', {
            includeHiddenElements: true,
        });
        expect(idleSlot.props.pointerEvents).toBe('none');
        expect(idleSlot.props.accessibilityElementsHidden).toBe(true);
        expect(idleSlot.props.importantForAccessibility).toBe('no-hide-descendants');
        expect(StyleSheet.flatten(idleSlot.props.style).opacity).toBe(0);
        expect(
            screen.getAllByLabelText(shareLabel, { includeHiddenElements: true }),
        ).toHaveLength(1);
        expect(screen.queryByLabelText(shareLabel)).toBeNull();

        fireEvent.press(screen.getByLabelText(GACHA_PULL_LABEL));
        await finishPullAnimation();

        const resultSlot = screen.getByTestId('gacha-share-slot');
        expect(resultSlot.props.pointerEvents).toBe('auto');
        expect(resultSlot.props.accessibilityElementsHidden).toBe(false);
        expect(resultSlot.props.importantForAccessibility).toBe('auto');
        expect(StyleSheet.flatten(resultSlot.props.style).opacity).toBe(1);
        expect(
            screen.getAllByLabelText(shareLabel, { includeHiddenElements: true }),
        ).toHaveLength(1);
        expect(screen.getByLabelText(shareLabel)).toBeTruthy();
    });
});

describe('FixedHeightHeaderSlot (헤더 슬롯 내부 스크롤 계약)', () => {
    it('shared fixed header slot은 큰 콘텐츠를 고정 높이 안의 nested ScrollView로 스크롤한다', () => {
        const { getByTestId } = render(
            <FixedHeightHeaderSlot height={FEATURE_HEADER_SLOT_HEIGHT} testID="test-header-slot">
                <Text style={{ height: 240 }}>큰 글씨 헤더</Text>
            </FixedHeightHeaderSlot>,
        );
        const slotStyle = StyleSheet.flatten(getByTestId('test-header-slot').props.style);
        const scroll = getByTestId('test-header-slot-scroll');
        const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

        expect(getByTestId('test-header-slot').findByType(Text).props.children).toBe(
            '큰 글씨 헤더',
        );
        expect(slotStyle).toEqual(
            expect.objectContaining({
                width: '100%',
                height: FEATURE_HEADER_SLOT_HEIGHT,
                overflow: 'hidden',
            }),
        );
        expect(scroll.props.nestedScrollEnabled).toBe(true);
        expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
        expect(contentStyle).toEqual(
            expect.objectContaining({
                minHeight: '100%',
                justifyContent: 'center',
            }),
        );
    });
});

describe('CenteredFeatureStage (header·footer 사이 flex body 안에서 stage를 정확히 정중앙에 고정)', () => {
    function renderStage(
        overrides: Partial<ComponentProps<typeof CenteredFeatureStage>> = {},
    ) {
        return render(
            <View style={{ flex: 1, height: 600 }} testID="cfs-body">
                <CenteredFeatureStage
                    testID="cfs-root"
                    stageTestID="cfs-stage"
                    belowTestID="cfs-below"
                    stage={<Text>stage-content</Text>}
                    below={<Text>below-content</Text>}
                    {...overrides}
                />
            </View>,
        );
    }

    it('측정 전에는 root가 레이아웃에 참여하되 콘텐츠를 숨겨 모드 전환 flicker를 막는다', () => {
        const { getByTestId } = renderStage();
        const rootStyle = StyleSheet.flatten(getByTestId('cfs-root').props.style);

        expect(rootStyle.flex).toBe(1);
        expect(rootStyle.opacity).toBe(0);
    });

    it('316px body를 측정하면 stage 중심을 50%에 고정하고 아래에 실제 32px를 확보한다', () => {
        const { getByTestId } = renderStage();
        fireEvent(getByTestId('cfs-root'), 'layout', {
            nativeEvent: { layout: { height: 316 } },
        });

        const rootStyle = StyleSheet.flatten(getByTestId('cfs-root').props.style);
        const stageStyle = StyleSheet.flatten(getByTestId('cfs-stage').props.style);
        const belowStyle = StyleSheet.flatten(getByTestId('cfs-below').props.style);

        expect(rootStyle.opacity).toBe(1);
        expect(stageStyle.position).toBe('absolute');
        expect(stageStyle.top).toBe('50%');
        expect(stageStyle.height).toBe(220);
        expect(stageStyle.overflow).toBe('hidden');
        expect(stageStyle.transform).toEqual([{ translateY: -110 }]);
        expect(belowStyle.top).toBe('50%');
        expect(belowStyle.marginTop).toBe(126);
        expect(belowStyle.bottom).toBe(0);

        const belowTop = 316 / 2 + 126;
        expect(316 - belowTop).toBe(32);
    });

    it('below는 stage와 분리된 독립 ScrollView이고, below 콘텐츠 크기와 무관하게 stage 위치는 그대로다', () => {
        const short = renderStage();
        fireEvent(short.getByTestId('cfs-root'), 'layout', {
            nativeEvent: { layout: { height: 600 } },
        });
        const shortStageStyle = StyleSheet.flatten(short.getByTestId('cfs-stage').props.style);

        const long = renderStage({
            below: (
                <View>
                    {Array.from({ length: 40 }, (_, index) => (
                        <Text key={index}>아주 긴 below 콘텐츠 {index}</Text>
                    ))}
                </View>
            ),
        });
        fireEvent(long.getByTestId('cfs-root'), 'layout', {
            nativeEvent: { layout: { height: 600 } },
        });
        const longStageStyle = StyleSheet.flatten(long.getByTestId('cfs-stage').props.style);

        expect(longStageStyle).toEqual(shortStageStyle);
        expect(long.getByTestId('cfs-below').findAllByType(ScrollView)).toHaveLength(1);
        expect(long.getByTestId('cfs-stage').findAllByType(ScrollView)).toHaveLength(0);
    });

    it('315px body를 측정하면 콘텐츠를 표시하면서 스크롤 스택으로 전환한다', () => {
        const { getByTestId } = renderStage();
        const root = getByTestId('cfs-root');

        fireEvent(root, 'layout', {
            nativeEvent: { layout: { height: 315 } },
        });

        const rootStyle = StyleSheet.flatten(root.props.style);
        const stageStyle = StyleSheet.flatten(getByTestId('cfs-stage').props.style);
        const belowStyle = StyleSheet.flatten(getByTestId('cfs-below').props.style);

        expect(rootStyle.opacity).toBe(1);
        expect(stageStyle.position).not.toBe('absolute');
        expect(stageStyle.height).toBe(220);
        expect(belowStyle.position).not.toBe('absolute');
        expect(root.findAllByType(ScrollView)).toHaveLength(1);

        const scroll = root.findByType(ScrollView);
        expect(scroll.findAllByProps({ testID: 'cfs-stage' }).length).toBeGreaterThan(0);
        expect(scroll.findAllByProps({ testID: 'cfs-below' }).length).toBeGreaterThan(0);
    });

    it('overflow fallback은 stage 위·아래 inset을 실제 레이아웃으로 확보하고 below gap은 별도로 유지한다', () => {
        const { getByTestId } = renderStage({
            allowStageOverflow: true,
            stageOverflowInset: 40,
        });

        fireEvent(getByTestId('cfs-root'), 'layout', {
            nativeEvent: { layout: { height: 315 } },
        });

        const safeAreaStyle = StyleSheet.flatten(
            getByTestId('cfs-stage-overflow-safe-area').props.style,
        );
        const stageStyle = StyleSheet.flatten(getByTestId('cfs-stage').props.style);
        const belowStyle = StyleSheet.flatten(getByTestId('cfs-below').props.style);

        expect(safeAreaStyle.paddingVertical).toBe(40);
        expect(stageStyle.height).toBe(220);
        expect(stageStyle.overflow).toBe('visible');
        expect(belowStyle.marginTop).toBe(16);
    });

    it('overflow를 허용하지 않는 fallback은 inset prop이 있어도 레이아웃 여유를 추가하지 않는다', () => {
        const { getByTestId } = renderStage({
            allowStageOverflow: false,
            stageOverflowInset: 40,
        });

        fireEvent(getByTestId('cfs-root'), 'layout', {
            nativeEvent: { layout: { height: 315 } },
        });

        const safeAreaStyle = StyleSheet.flatten(
            getByTestId('cfs-stage-overflow-safe-area').props.style,
        );
        expect(safeAreaStyle.paddingVertical).toBe(0);
    });

    it('충분한 높이를 측정하면 콘텐츠를 표시하면서 centered mode를 유지한다', () => {
        const { getByTestId } = renderStage();
        const root = getByTestId('cfs-root');

        fireEvent(root, 'layout', {
            nativeEvent: { layout: { height: 500 } },
        });

        expect(StyleSheet.flatten(root.props.style).opacity).toBe(1);
        const stageStyle = StyleSheet.flatten(getByTestId('cfs-stage').props.style);
        expect(stageStyle.position).toBe('absolute');
    });
});

describe('shouldUseStackedFallback (small body 폴백 순수 함수 경계값)', () => {
    it('315px이면 stage 220·gap 16·최소 노출 32 계약을 만족하지 못해 fallback한다', () => {
        expect(
            shouldUseStackedFallback({
                bodyHeight: 315,
                stageHeight: 220,
                belowGap: 16,
                minVisibleBelowHeight: 32,
            }),
        ).toBe(true);
    });

    it('316px이면 stage 아래 실제 32px가 남아 centered mode를 유지한다', () => {
        expect(
            shouldUseStackedFallback({
                bodyHeight: 316,
                stageHeight: 220,
                belowGap: 16,
                minVisibleBelowHeight: 32,
            }),
        ).toBe(false);
    });

    it('기본 최소 below 노출 높이는 사용자 우선순위에 맞춘 32px다', () => {
        expect(CENTERED_STAGE_MIN_VISIBLE_BELOW_HEIGHT).toBe(32);
    });

    it('0 이하이거나 유효하지 않은 높이는 fallback 계산 대상이 아니다', () => {
        expect(
            shouldUseStackedFallback({
                bodyHeight: 0,
                stageHeight: 220,
                belowGap: 16,
            }),
        ).toBe(false);
        expect(
            shouldUseStackedFallback({
                bodyHeight: -10,
                stageHeight: 220,
                belowGap: 16,
            }),
        ).toBe(false);
        expect(
            shouldUseStackedFallback({
                bodyHeight: Number.NaN,
                stageHeight: 220,
                belowGap: 16,
            }),
        ).toBe(false);
    });
});

describe('CraftLanding·Gacha 화면 구조 계약 (fixed header + CenteredFeatureStage flex body + fixed footer)', () => {
    function renderCraftLanding() {
        return render(<CraftLandingScreen onPressStart={jest.fn()} />);
    }

    function renderGachaIdle() {
        mockUseUser.mockReturnValue({
            state: { ...DEFAULT_USER_STATE, ecoJam: 300, totalPoints: 0 },
            pullGacha: jest.fn(),
            grantTestEcoJam: jest.fn(),
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });
        return render(<GachaScreen active />);
    }

    it('craft와 gacha는 같은 shared fixed header slot의 고정 height와 내부 ScrollView 계약을 사용한다', () => {
        const craft = renderCraftLanding();
        const gacha = renderGachaIdle();

        const craftHeaderStyle = StyleSheet.flatten(
            craft.getByTestId('craft-header-slot').props.style,
        );
        const gachaHeaderStyle = StyleSheet.flatten(
            gacha.getByTestId('gacha-header-slot').props.style,
        );

        expect(FEATURE_HEADER_SLOT_HEIGHT).toBe(112);
        expect(craftHeaderStyle.height).toBe(FEATURE_HEADER_SLOT_HEIGHT);
        expect(gachaHeaderStyle.height).toBe(FEATURE_HEADER_SLOT_HEIGHT);
        expect(craftHeaderStyle.minHeight).toBeUndefined();
        expect(gachaHeaderStyle.minHeight).toBeUndefined();
        expect(craftHeaderStyle.overflow).toBe('hidden');
        expect(gachaHeaderStyle.overflow).toBe('hidden');
        expect(craft.getByTestId('craft-header-slot-scroll').props.nestedScrollEnabled).toBe(true);
        expect(gacha.getByTestId('gacha-header-slot-scroll').props.nestedScrollEnabled).toBe(true);
    });

    it('craft·gacha body의 직속 자식은 header slot 다음 CenteredFeatureStage 순서다 (marginTop 순차 스택이 아니다)', () => {
        const craft = renderCraftLanding();
        const gacha = renderGachaIdle();
        const directChildTestIds = (flow: ReturnType<typeof craft.getByTestId>) =>
            flow.children.flatMap((child) => {
                if (typeof child === 'string') {
                    return [];
                }
                return typeof child.props.testID === 'string' ? [child.props.testID] : [];
            });

        expect(directChildTestIds(craft.getByTestId('craft-body'))).toEqual([
            'craft-header-slot',
            'craft-centered-stage',
        ]);
        expect(directChildTestIds(gacha.getByTestId('gacha-body'))).toEqual([
            'gacha-header-slot',
            'gacha-centered-stage',
        ]);
    });

    it('craft·gacha 모두 body와 centered stage가 flex:1이다 (outer Screen scroll stack이 아니다)', () => {
        const craft = renderCraftLanding();
        const gacha = renderGachaIdle();

        expect(StyleSheet.flatten(craft.getByTestId('craft-body').props.style).flex).toBe(1);
        expect(StyleSheet.flatten(gacha.getByTestId('gacha-body').props.style).flex).toBe(1);
        expect(
            StyleSheet.flatten(craft.getByTestId('craft-centered-stage').props.style).flex,
        ).toBe(1);
        expect(
            StyleSheet.flatten(gacha.getByTestId('gacha-centered-stage').props.style).flex,
        ).toBe(1);
    });

    it('craft·gacha stage viewport는 같은 top 50%·translateY -110·height 220·overflow hidden 계약을 공유한다', () => {
        const craft = renderCraftLanding();
        const gacha = renderGachaIdle();

        const craftStageStyle = StyleSheet.flatten(
            craft.getByTestId('craft-stage-viewport').props.style,
        );
        const gachaStageStyle = StyleSheet.flatten(
            gacha.getByTestId('gacha-stage-viewport').props.style,
        );

        for (const stageStyle of [craftStageStyle, gachaStageStyle]) {
            expect(stageStyle.position).toBe('absolute');
            expect(stageStyle.top).toBe('50%');
            expect(stageStyle.height).toBe(FEATURE_STAGE_HEIGHT);
            expect(stageStyle.overflow).toBe('hidden');
            expect(stageStyle.transform).toEqual([{ translateY: -(FEATURE_STAGE_HEIGHT / 2) }]);
        }
    });

    it('gacha phase image box는 onLoad 비율 상태 없이 항상 stageSlot 100%를 contain으로 채운다', () => {
        const gacha = renderGachaIdle();
        const image = gacha.getByTestId('gacha-stage-image');
        const imageStyle = StyleSheet.flatten(image.props.style);

        expect(image.props.onLoad).toBeUndefined();
        expect(image.props.resizeMode).toBe('contain');
        expect(imageStyle.width).toBe('100%');
        expect(imageStyle.height).toBe('100%');
        expect(imageStyle.aspectRatio).toBeUndefined();
    });

    it('craft·gacha는 outer Screen ScrollView로 header+stage 전체를 감싸지 않고 필요한 내부 ScrollView만 둔다', () => {
        const craft = renderCraftLanding();
        const gacha = renderGachaIdle();

        expect(craft.UNSAFE_getAllByType(ScrollView)).toHaveLength(2);
        expect(gacha.UNSAFE_getAllByType(ScrollView)).toHaveLength(1);
    });
});

describe('CraftBrewAnimationOverlay stage 계약 (width 240 하드코딩 제거 + CenteredFeatureStage + 공통 alpha alignment 공유)', () => {
    function renderOverlay() {
        const run = () => new Promise<CraftBrewOutcome>(() => {});
        return render(<CraftBrewAnimationOverlay run={run} onSuccess={jest.fn()} onFailure={jest.fn()} />);
    }

    it('신규 가마솥 레이어는 600×600 정사각 좌표계와 합성 alpha 경계를 사용한다', () => {
        expect(CAULDRON_LAYER_ASPECT_RATIO).toBe(1);
        expect(CAULDRON_COMPOSITE_ALPHA_BOUNDS).toEqual({
            imageHeight: 600,
            top: 23,
            bottom: 540,
        });
    });

    it('가마솥 stage는 CenteredFeatureStage viewport 정중앙에 있고, hint는 below 영역에 있다', () => {
        const { getByTestId, getByLabelText } = renderOverlay();

        const stageStyle = StyleSheet.flatten(
            getByTestId('craft-brew-stage-viewport').props.style,
        );
        expect(stageStyle.position).toBe('absolute');
        expect(stageStyle.top).toBe('50%');
        expect(stageStyle.height).toBe(FEATURE_STAGE_HEIGHT);
        expect(stageStyle.transform).toEqual([{ translateY: -(FEATURE_STAGE_HEIGHT / 2) }]);
        expect(stageStyle.overflow).toBe('visible');

        expect(getByTestId('craft-brew-below').findByType(Text).props.children).toBe(
            '스프를 젓고 있어요…',
        );
        expect(getByLabelText('스프 만드는 중')).toBeTruthy();
    });

    it('가마솥 stage width는 하드코딩된 240이 아니라 CraftLandingScreen과 공유하는 CRAFT_STAGE_ALIGNMENT.innerCanvasWidth다', () => {
        const { getByLabelText } = renderOverlay();

        const cauldronStyle = StyleSheet.flatten(getByLabelText('스프 만드는 중').props.style);

        expect(cauldronStyle.width).not.toBe(240);
        expect(cauldronStyle.width).toBeCloseTo(CRAFT_STAGE_ALIGNMENT.innerCanvasWidth, 6);
    });

    it('stacked fallback에서는 Brew glow 안전 inset 40px을 stage 위·아래에 확보한다', () => {
        const { getByTestId } = renderOverlay();

        fireEvent(getByTestId('craft-brew-centered-stage'), 'layout', {
            nativeEvent: { layout: { height: 315 } },
        });

        const safeAreaStyle = StyleSheet.flatten(
            getByTestId('craft-brew-stage-viewport-overflow-safe-area').props.style,
        );
        const stageStyle = StyleSheet.flatten(
            getByTestId('craft-brew-stage-viewport').props.style,
        );
        const belowStyle = StyleSheet.flatten(getByTestId('craft-brew-below').props.style);

        expect(safeAreaStyle.paddingVertical).toBe(40);
        expect(stageStyle.height).toBe(220);
        expect(stageStyle.overflow).toBe('visible');
        expect(belowStyle.marginTop).toBe(16);
    });
});

describe('SoupResultScreen 전체 결과 스크롤 + 고정 액션 + 재료 개수 시각화', () => {
    const BASE_CRAFT: SoupCraftResponse = {
        soupId: 1,
        result: 'SUCCESS',
        recipeName: '따뜻한 입문 스프',
        rewardGrade: 'SMALL',
        rewardType: 'ECO_JAM',
        rewardAmount: 50,
    };

    function renderSoupResult(
        session: { recipeId: string; craft: SoupCraftResponse; rerollUsed: boolean } | null = null,
        craft: SoupCraftResponse = BASE_CRAFT,
    ) {
        mockUseUser.mockReturnValue({
            state: { ...DEFAULT_USER_STATE, ecoJam: 300, lastSoupSession: session },
            rerollSoupReward: jest.fn(),
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });
        return render(
            <SoupResultScreen recipeId="beginner-warm" craft={craft} onPressDone={jest.fn()} />,
        );
    }

    it('hero와 결과 상세 전체를 하나의 ScrollView로 움직이고 footer는 밖에 고정한다', () => {
        const { getByTestId } = renderSoupResult();

        const scroll = getByTestId('soup-result-scroll');
        const footer = getByTestId('soup-result-footer');

        expect(
            scroll.findAllByProps({ testID: 'soup-result-hero-image' }).length,
        ).toBeGreaterThanOrEqual(1);
        expect(
            scroll.findAllByProps({ testID: 'soup-result-details' }).length,
        ).toBeGreaterThanOrEqual(1);
        expect(footer.findAllByType(ScrollView)).toHaveLength(0);
    });

    it('필요한 리롤 버튼은 스크롤 영역 밖 footer에서 공유·확인 바로 위에 고정한다', () => {
        const { getByTestId } = renderSoupResult();
        const scroll = getByTestId('soup-result-scroll');
        const footer = getByTestId('soup-result-footer');
        const scrollTexts = scroll.findAllByType(Text).map((node) => node.props.children);
        const footerTexts = footer.findAllByType(Text).map((node) => node.props.children);

        expect(scrollTexts).not.toContain('행운의 주문 · 70잼');
        expect(footerTexts).toContain('행운의 주문 · 70잼');
        expect(footerTexts).toContain('친구에게 결과 공유하기');
        expect(footerTexts).toContain('확인');
    });

    it('재료 2개 보상은 수량 텍스트 대신 한글 라벨이 붙은 아이콘 2개로 보여준다', () => {
        const ingredientCraft: SoupCraftResponse = {
            ...BASE_CRAFT,
            rewardGrade: 'INGREDIENT',
            rewardIngredientId: 'tomato',
            rewardAmount: 2,
        };
        const screen = renderSoupResult(null, ingredientCraft);

        expect(screen.getAllByLabelText(/^토마토 보상/)).toHaveLength(2);
        expect(screen.getAllByText('토마토')).toHaveLength(2);
        expect(screen.queryByText(/토마토 2개/)).toBeNull();
    });

    it('CTA footer는 기존과 동일하게 body 밖에 고정된 상태로 유지된다', () => {
        const { getByLabelText, getByTestId } = renderSoupResult();

        expect(getByLabelText('친구에게 결과 공유하기')).toBeTruthy();
        expect(getByLabelText('확인')).toBeTruthy();
        expect(StyleSheet.flatten(getByTestId('soup-result-footer').props.style).paddingTop).toBe(16);
    });

    it('실패 결과에서도 리롤 사용 여부와 무관하게 공유 버튼을 노출한다', () => {
        const failCraft: SoupCraftResponse = {
            ...BASE_CRAFT,
            result: 'FAIL',
            rewardGrade: 'FAIL',
            rewardAmount: 0,
            rewardDescription: '조금 덜 익은 스프',
        };
        const { getByLabelText } = renderSoupResult(null, failCraft);

        expect(getByLabelText('친구에게 결과 공유하기')).toBeTruthy();
        expect(getByLabelText('확인')).toBeTruthy();
    });
});

describe('hiddenRecipeUnlockButtonLabel (히든 레시피 해금 버튼 문구)', () => {
    it('잠긴 히든 레시피가 남아 있으면 해금 비용을 안내한다', () => {
        expect(
            hiddenRecipeUnlockButtonLabel({
                hiddenLockedCount: 3,
                unlockLoading: false,
                unlockCost: 500,
            }),
        ).toBe('히든 레시피 랜덤 해금 · 에코잼 500');
    });

    it('해금 요청 중이면 로딩 문구를 우선한다', () => {
        expect(
            hiddenRecipeUnlockButtonLabel({
                hiddenLockedCount: 3,
                unlockLoading: true,
                unlockCost: 500,
            }),
        ).toBe('해금 중…');
    });

    it('잠긴 히든 레시피가 없으면 모두 해금됨을 안내한다', () => {
        expect(
            hiddenRecipeUnlockButtonLabel({
                hiddenLockedCount: 0,
                unlockLoading: false,
                unlockCost: 500,
            }),
        ).toBe('히든 레시피 모두 해금됨');
    });

    it('버튼 문구는 더 이상 희귀 레시피라는 표현을 쓰지 않는다', () => {
        expect(
            hiddenRecipeUnlockButtonLabel({
                hiddenLockedCount: 0,
                unlockLoading: false,
                unlockCost: 500,
            }),
        ).not.toContain('희귀');
        expect(HIDDEN_RECIPE_ALL_UNLOCKED_TOAST).not.toContain('희귀');
        expect(HIDDEN_RECIPE_ALL_UNLOCKED_TOAST).toBe('히든 레시피를 모두 열었어요.');
    });
});

describe('canRecipeListScrollMore (레시피 목록 하단 안내)', () => {
    it('버튼 하단이 뷰포트에 도달하면 paddingBottom 28이 남아 있어도 숨긴다', () => {
        expect(
            canRecipeListScrollMore({
                contentHeight: 528,
                viewportHeight: 400,
                scrollY: 100,
                contentPaddingBottom: BODY_CONTENT_PADDING_BOTTOM,
                threshold: 24,
            }),
        ).toBe(false);
    });

    it('paddingBottom을 제외하고도 실제 레시피 콘텐츠가 threshold보다 더 남으면 표시한다', () => {
        expect(
            canRecipeListScrollMore({
                contentHeight: 568,
                viewportHeight: 400,
                scrollY: 100,
                contentPaddingBottom: BODY_CONTENT_PADDING_BOTTOM,
                threshold: 24,
            }),
        ).toBe(true);
    });
});

describe('RecipesScreen (분류 탭 고정 · 목록 영역만 스크롤)', () => {
    function renderRecipes(stateOverrides: Partial<typeof DEFAULT_USER_STATE> = {}) {
        mockUseUser.mockReturnValue({
            state: { ...DEFAULT_USER_STATE, ...stateOverrides },
            unlockRandomHiddenRecipe: jest.fn().mockResolvedValue({ ok: false, reason: 'none' }),
            hideTodayRecipePin: jest.fn(),
            showTodayRecipePin: jest.fn(),
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });

        return render(<RecipesScreen />);
    }

    it('입문/일반/히든/전설 탭은 이 순서로 ScrollView 밖 고정 영역에 렌더되고, ScrollView 안에는 탭이 없다', () => {
        const { UNSAFE_getByType, UNSAFE_getAllByProps } = renderRecipes();

        const scrollView = UNSAFE_getByType(ScrollView);
        expect(scrollView.findAllByProps({ accessibilityRole: 'tab' })).toHaveLength(0);

        const allTabs = UNSAFE_getAllByProps({ accessibilityRole: 'tab' });
        const orderedTabIds = [...new Set(allTabs.map((tab) => tab.props.testID))];
        expect(orderedTabIds).toEqual([
            'recipe-tab-beginner',
            'recipe-tab-today',
            'recipe-tab-hidden',
            'recipe-tab-legendary',
        ]);

        const labelById = new Map(
            allTabs.map((tab) => [tab.props.testID, tab.findByType(Text).props.children]),
        );
        expect(orderedTabIds.map((tabId) => labelById.get(tabId))).toEqual([
            '입문',
            '일반',
            '히든',
            '전설',
        ]);
    });

    it('첫 진입 시 기본 선택 탭은 입문(beginner)이다', () => {
        const { getByTestId } = renderRecipes();

        expect(getByTestId('recipe-tab-beginner').props.accessibilityState).toEqual({
            selected: true,
        });
        expect(getByTestId('recipe-tab-today').props.accessibilityState).toEqual({
            selected: false,
        });
    });

    it('히든 탭을 눌러도 탭 목록은 그대로 고정 영역에 남고 목록만 다시 그려진다', () => {
        const { getByTestId, UNSAFE_getByType } = renderRecipes();

        fireEvent.press(getByTestId('recipe-tab-hidden'));

        expect(getByTestId('recipe-tab-hidden').props.accessibilityState).toEqual({
            selected: true,
        });
        const scrollView = UNSAFE_getByType(ScrollView);
        expect(scrollView.findAllByProps({ accessibilityRole: 'tab' })).toHaveLength(0);
    });

    it('ScrollView contentContainer는 충분한 paddingBottom을 확보해 하단 잘림을 막는다', () => {
        const { UNSAFE_getByType } = renderRecipes();

        const scrollView = UNSAFE_getByType(ScrollView);
        const contentStyle = StyleSheet.flatten(scrollView.props.contentContainerStyle);

        expect(contentStyle.paddingBottom).toBe(BODY_CONTENT_PADDING_BOTTOM);
    });

    it('히든 탭 해금 버튼은 absolute 배치 없이 목록 하단에서 자연스러운 여백을 갖는다', () => {
        const { getByTestId } = renderRecipes();

        fireEvent.press(getByTestId('recipe-tab-hidden'));

        const unlockWrap = getByTestId('recipe-hidden-unlock-wrap');
        const wrapStyle = StyleSheet.flatten(unlockWrap.props.style);

        expect(wrapStyle.position).not.toBe('absolute');
        expect(wrapStyle.marginBottom).toBeGreaterThanOrEqual(12);
    });

    it('히든 탭 해금 버튼 문구에는 히든 레시피 표현만 쓰인다 (희귀 레시피 금지)', () => {
        const { getByTestId } = renderRecipes();

        fireEvent.press(getByTestId('recipe-tab-hidden'));

        const unlockWrap = getByTestId('recipe-hidden-unlock-wrap');
        const buttonTexts = unlockWrap.findAllByType(Text).map((node) => node.props.children);

        expect(buttonTexts.some((text) => typeof text === 'string' && text.includes('희귀'))).toBe(
            false,
        );
    });
});

describe('OnboardingProfileScreen 개인정보 동의 (필수/선택 처리방침 재확인)', () => {
    type OnboardingRender = ReturnType<typeof render>;

    function renderOnboarding(onComplete: (payload: unknown) => void = jest.fn()) {
        const screen = render(<OnboardingProfileScreen onComplete={onComplete} />);
        fireEvent.changeText(screen.getByLabelText('닉네임'), '테스터');
        fireEvent.press(screen.getByLabelText('다음'));
        return screen;
    }

    function readPolicyToEnd(screen: OnboardingRender) {
        const scroll = screen.getByTestId('privacy-policy-modal-scroll');
        fireEvent(scroll, 'layout', { nativeEvent: { layout: { height: 1000 } } });
        fireEvent(scroll, 'contentSizeChange', 400, 900);
    }

    function completePrivacyStep(onComplete: (payload: unknown) => void = jest.fn()) {
        const screen = renderOnboarding(onComplete);
        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull));
        readPolicyToEnd(screen);
        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.agreeRequired));
        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.confirmRead));
        fireEvent.press(screen.getByLabelText('동의하고 다음'));
        return screen;
    }

    it('필수 동의 오류 문구는 정확히 "개인정보 처리방침을 끝까지 확인해 주세요."다', () => {
        expect(PRIVACY_POLICY_LABELS.mustReadBeforeConsent).toBe(
            '개인정보 처리방침을 끝까지 확인해 주세요.',
        );
    });

    it('필수 처리방침을 끝까지 확인하지 않고 필수 체크를 누르면 체크가 차단되고 오류·링크 강조가 표시된다', () => {
        const screen = renderOnboarding();
        const requiredLink = screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull);
        expect(requiredLink.findAllByProps({ color: 'blue500', fontWeight: 'bold' })).toHaveLength(1);

        fireEvent.press(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.policy));

        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.policy).props.accessibilityState).toEqual({
            checked: false,
        });
        expect(screen.getByText(PRIVACY_POLICY_LABELS.mustReadBeforeConsent)).toBeTruthy();
        expect(
            screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull).findAllByProps({
                color: 'red500',
                fontWeight: 'bold',
            }),
        ).toHaveLength(1);
    });

    it('필수 처리방침을 끝까지 읽고 동의하면 필수 체크가 활성화되고 다음 단계(phone)로 진행된다', () => {
        const screen = completePrivacyStep();

        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone)).toBeTruthy();
    });

    it('privacy 단계 모달은 끝까지 읽어도 선택 요약과 선택 동의 경로를 노출하지 않는다', () => {
        const screen = renderOnboarding();

        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull));
        readPolicyToEnd(screen);

        expect(screen.getAllByText(PRIVACY_POLICY_LABELS.requiredSection)).toHaveLength(2);
        expect(screen.queryByText(PRIVACY_POLICY_LABELS.optionalSection)).toBeNull();
        expect(screen.getByLabelText(PRIVACY_POLICY_LABELS.agreeRequired)).toBeTruthy();
        expect(screen.queryByLabelText(PRIVACY_POLICY_LABELS.agreeOptional)).toBeNull();
        expect(screen.queryByLabelText(PRIVACY_POLICY_LABELS.declineOptional)).toBeNull();
    });

    it('privacy 단계 완료만으로 phone 선택 동의가 체크되지 않고 정책 미확인 체크도 차단된다', () => {
        const screen = completePrivacyStep();
        const phoneConsent = screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone);

        expect(phoneConsent.props.accessibilityState).toEqual({ checked: false });

        fireEvent.press(phoneConsent);

        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone).props.accessibilityState).toEqual({
            checked: false,
        });
        expect(screen.getByText(PRIVACY_POLICY_LABELS.mustReadBeforeConsent)).toBeTruthy();
    });

    it('phone 단계에서 선택 처리방침을 다시 끝까지 확인하지 않으면 선택 체크가 차단되고 오류·선택 링크 강조가 표시된다 (필수 확인은 재사용되지 않음)', () => {
        const screen = completePrivacyStep();
        const optionalLink = screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull);
        expect(optionalLink.findAllByProps({ color: 'blue500', fontWeight: 'bold' })).toHaveLength(1);

        fireEvent.press(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone));

        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone).props.accessibilityState).toEqual({
            checked: false,
        });
        expect(screen.getByText(PRIVACY_POLICY_LABELS.mustReadBeforeConsent)).toBeTruthy();
        expect(
            screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull).findAllByProps({
                color: 'red500',
                fontWeight: 'bold',
            }),
        ).toHaveLength(1);
    });

    it('선택 처리방침 모달은 끝까지 읽기 전 선택 동의 버튼이 비활성화되고, 읽은 뒤 누르면 선택 체크와 optionalPolicyAcknowledged가 활성화된다', () => {
        const screen = completePrivacyStep();

        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.viewFull));
        expect(screen.queryByText(PRIVACY_POLICY_LABELS.requiredSection)).toBeNull();
        expect(screen.queryByText(PRIVACY_POLICY_LABELS.requiredAgreed)).toBeNull();
        expect(screen.queryByLabelText(PRIVACY_POLICY_LABELS.agreeRequired)).toBeNull();
        expect(screen.getAllByText(PRIVACY_POLICY_LABELS.optionalSection)).toHaveLength(2);
        expect(screen.getByLabelText(PRIVACY_POLICY_LABELS.agreeOptional).props.accessibilityState).toEqual({
            disabled: true,
        });

        readPolicyToEnd(screen);
        expect(screen.getByLabelText(PRIVACY_POLICY_LABELS.agreeOptional).props.accessibilityState).toEqual({
            disabled: false,
        });

        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.agreeOptional));
        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone).props.accessibilityState).toEqual({
            checked: true,
        });

        fireEvent.press(screen.getByLabelText(PRIVACY_POLICY_LABELS.confirmRead));
        fireEvent.press(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone));
        fireEvent.press(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone));
        expect(screen.getByLabelText(ONBOARDING_PRIVACY_CHECKBOX.phone).props.accessibilityState).toEqual({
            checked: true,
        });
        expect(screen.queryByText(PRIVACY_POLICY_LABELS.mustReadBeforeConsent)).toBeNull();
    });

    it('선택 동의와 무관하게 필수 계정 전화번호 형식을 먼저 검증한다', () => {
        const screen = completePrivacyStep();

        fireEvent.changeText(screen.getByLabelText('휴대전화번호'), '123');
        fireEvent.changeText(screen.getByLabelText('비밀번호'), 'password123');
        fireEvent.press(screen.getByLabelText('계정 만들고 계속'));

        expect(screen.getByText('휴대전화번호 11자리를 입력해 주세요.')).toBeTruthy();
        expect(screen.queryByText('전화번호를 등록하려면 선택 항목에 동의해 주세요.')).toBeNull();
    });

    it('필수 전화번호가 유효해도 비밀번호가 8자 미만이면 완료하지 않는다', () => {
        const screen = completePrivacyStep();

        fireEvent.changeText(screen.getByLabelText('휴대전화번호'), '01012345678');
        fireEvent.changeText(screen.getByLabelText('비밀번호'), 'short');
        fireEvent.press(screen.getByLabelText('계정 만들고 계속'));

        expect(screen.getByText('비밀번호는 8자 이상 입력해 주세요.')).toBeTruthy();
    });

    it('알맹 포인트 선택 동의 없이도 필수 전화번호·비밀번호로 계정을 만들 수 있다', () => {
        const onComplete = jest.fn();
        const screen = completePrivacyStep(onComplete);

        fireEvent.changeText(screen.getByLabelText('휴대전화번호'), '01012345678');
        fireEvent.changeText(screen.getByLabelText('비밀번호'), 'password123');
        fireEvent.press(screen.getByLabelText('계정 만들고 계속'));

        expect(onComplete).toHaveBeenCalledWith(
            expect.objectContaining({
                almangPayoutConsent: 'declined',
                phoneDigits: '01012345678',
                password: 'password123',
            }),
        );
    });
});

describe('shop nearbyShopLogic 안내 문구 (제휴 매장/제휴 샵 중복 문구 제거)', () => {
    it('LOCATION_CONSENT_DENIED_LIST_HINT는 거리 정보 안내 한 문장만 담고 제휴 매장 문구를 포함하지 않는다', () => {
        expect(LOCATION_CONSENT_DENIED_LIST_HINT).toBe('거리 정보 없이 주변 상점 정보만 보여드려요.');
        expect(LOCATION_CONSENT_DENIED_LIST_HINT).not.toContain('제휴 매장');
        expect(LOCATION_CONSENT_DENIED_LIST_HINT).not.toContain('제휴 샵');
    });

    it('MAP_SHOPS_SCOPE_HINT는 상점 범위 설명 한 문장만 남기고 제휴 샵 중복 문구를 제거한다', () => {
        expect(MAP_SHOPS_SCOPE_HINT).toBe('제로웨이스트 샵·샵앤샵·재사용 매장·제웨 숙소를 함께 보여줘요.');
        expect(MAP_SHOPS_SCOPE_HINT).not.toContain('제휴 샵');
        expect(MAP_SHOPS_SCOPE_HINT).not.toContain('제휴 매장');
    });
});

describe('ProfileScreen 알맹 포인트 info (제휴 매장 중복 문구 제거, 이용 안내는 유지)', () => {
    it('ALMANG_STORE_INFO_LINES에는 제휴 매장 문구가 없고 알맹상점 방문 이용 안내는 유지된다', () => {
        expect(ALMANG_STORE_INFO_LINES.some((line) => line.includes('제휴 매장'))).toBe(false);
        expect(ALMANG_STORE_INFO_LINES).toContain(
            '알맹상점에 방문해 본인 확인 후 매장 포인트로 이용해 주세요.',
        );
    });
});

describe('PartnerShopsScreen 위치 미동의 안내 (본문 중복 문구 대신 info 버튼)', () => {
    function renderPartnerShops(locationConsent: 'granted' | 'declined' | null = null) {
        mockUseUser.mockReturnValue({
            state: { ...DEFAULT_USER_STATE, locationConsent },
            setLocationConsent: jest.fn(),
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });
        return render(<PartnerShopsScreen />);
    }

    it('위치 미동의 상태에서는 info 버튼을 누르기 전 본문에 안내 문구를 직접 노출하지 않는다', () => {
        const screen = renderPartnerShops(null);

        expect(
            screen.queryAllByText(new RegExp(LOCATION_CONSENT_DENIED_LIST_HINT)),
        ).toHaveLength(0);
        expect(screen.queryByText(/제휴 매장/)).toBeNull();
        expect(screen.queryByText(/제휴 샵/)).toBeNull();
    });

    it('위치 미동의 상태에서는 "위치 정보" info 버튼이 있고, 누르면 안내 문장 한 줄만 보여준다', () => {
        const screen = renderPartnerShops(null);

        expect(screen.getByText('위치 정보')).toBeTruthy();
        const infoTrigger = screen.getByLabelText('주변 상점 위치 정보 안내');
        expect(infoTrigger).toBeTruthy();

        fireEvent.press(infoTrigger);

        expect(
            screen.getAllByText(new RegExp(LOCATION_CONSENT_DENIED_LIST_HINT)),
        ).toHaveLength(1);
        const infoLines = screen
            .UNSAFE_getByType(Modal)
            .findAllByType(Text)
            .filter((node) => StyleSheet.flatten(node.props.style)?.lineHeight === 22);
        expect(infoLines).toHaveLength(1);
        expect(infoLines[0]?.props.children).toEqual(['· ', LOCATION_CONSENT_DENIED_LIST_HINT]);
        expect(screen.queryByText(/제휴 매장/)).toBeNull();
    });

    it('위치 동의 상태에서는 "위치 정보" info 버튼을 노출하지 않는다', () => {
        const screen = renderPartnerShops('granted');

        expect(screen.queryByLabelText(/위치 정보/)).toBeNull();
    });
});

describe('NearbyShopsSection 위치 미동의 안내 (본문 대신 info 버튼)', () => {
    function renderNearbyShops(locationConsentGranted = false) {
        return render(
            <NearbyShopsSection
                locationConsentGranted={locationConsentGranted}
                onPressViewAll={jest.fn()}
                onPressRequestConsent={jest.fn()}
                onPressShop={jest.fn()}
            />,
        );
    }

    it('위치 미동의 상태에서는 info 버튼을 누르기 전 본문에 안내 문구를 직접 노출하지 않는다', () => {
        const screen = renderNearbyShops();

        expect(
            screen.queryAllByText(new RegExp(LOCATION_CONSENT_DENIED_LIST_HINT)),
        ).toHaveLength(0);
        expect(screen.getByText('위치 정보')).toBeTruthy();
        expect(screen.queryByText(LOCATION_CONSENT_NOTICE)).toBeNull();
        expect(screen.getByLabelText('위치 동의하고 가까운 상점 보기')).toBeTruthy();
    });

    it('위치 미동의 상태에서는 info 버튼을 누른 뒤 위치 동의 안내와 거리 제한 안내를 문장별로 보여준다', () => {
        const screen = renderNearbyShops();

        fireEvent.press(screen.getByLabelText('주변 상점 위치 정보 안내'));

        expect(
            screen.getAllByText(new RegExp(LOCATION_CONSENT_DENIED_LIST_HINT)),
        ).toHaveLength(1);
        const infoLines = screen
            .UNSAFE_getByType(Modal)
            .findAllByType(Text)
            .filter((node) => StyleSheet.flatten(node.props.style)?.lineHeight === 22);
        expect(infoLines).toHaveLength(3);
        expect(infoLines.map((line) => line.props.children)).toEqual([
            ['· ', '위치 동의 후 가까운 제로·재사용 상점과 직선 거리를 볼 수 있어요.'],
            ['· ', '동의하지 않아도 목록은 확인할 수 있어요.'],
            ['· ', LOCATION_CONSENT_DENIED_LIST_HINT],
        ]);
    });

    it('위치 동의 상태에서는 "위치 정보" info 버튼을 노출하지 않는다', () => {
        const screen = renderNearbyShops(true);

        expect(screen.queryByText('위치 정보')).toBeNull();
        expect(screen.queryByLabelText('주변 상점 위치 정보 안내')).toBeNull();
    });
});

describe('CommunityGoalSection 참여 안내 (본문 대신 info 버튼)', () => {
    it('참여 안내를 본문에 노출하지 않고 info 버튼 안에 보여준다', () => {
        const screen = render(<CommunityGoalSection />);

        expect(screen.queryByText('참여자 실천이 모이면 목표가 채워져요.')).toBeNull();

        fireEvent.press(screen.getByLabelText('공동 목표 안내'));

        expect(screen.getByText(/참여자 실천이 모이면 목표가 채워져요/)).toBeTruthy();
    });
});

describe('EcoCopyCard 환경 이야기 (홈 한 줄 + 스크롤 팝업)', () => {
    it('홈에서는 한 줄 진입부만 보여주고 누르면 분류된 전체 이야기를 스크롤로 보여준다', () => {
        const screen = render(<EcoCopyCard />);

        expect(screen.getByText('오늘의 환경 이야기')).toBeTruthy();
        expect(screen.queryByText('환경 소식')).toBeNull();
        expect(screen.queryByText('실천 팁')).toBeNull();

        fireEvent.press(screen.getByLabelText('오늘의 환경 이야기 모두 보기'));

        expect(screen.getByText('환경 소식')).toBeTruthy();
        expect(screen.getByText('실천 팁')).toBeTruthy();
        expect(screen.UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('배경 닫기 Pressable은 ScrollView와 분리되어 스크롤 제스처를 가로채지 않는다', () => {
        const screen = render(<EcoCopyCard />);

        fireEvent.press(screen.getByLabelText('오늘의 환경 이야기 모두 보기'));

        const dismissOverlay = screen.getByTestId('eco-copy-dismiss-overlay', {
            includeHiddenElements: true,
        });
        expect(dismissOverlay.findAllByType(ScrollView)).toHaveLength(0);
        expect(screen.getByTestId('eco-copy-sheet').findAllByType(ScrollView)).toHaveLength(1);
    });
});

describe('미션 아이콘 — 미션별 개별 asset', () => {
    const ALL_MISSION_IDS = [...DAILY_MISSIONS, ...SPECIAL_MISSIONS, ...COOP_MISSIONS].map(
        (mission) => mission.id,
    );

    it('12개 미션 id 모두 PNG data URI source를 가지며 서로 다른 이미지로 매핑된다', () => {
        expect(ALL_MISSION_IDS).toHaveLength(12);

        const sources = ALL_MISSION_IDS.map((id) => getMissionImageSource(id));
        for (const source of sources) {
            expect(source.uri).toMatch(/^data:image\/png;base64,/);
        }

        const uniqueUris = new Set(sources.map((source) => source.uri));
        expect(uniqueUris.size).toBe(ALL_MISSION_IDS.length);
    });

    it('알 수 없는 미션 id는 안전한 폴백 이미지를 반환한다', () => {
        expect(getMissionImageSource('unknown-mission-id')).toEqual(getMissionImageSource('unknown-mission-id'));
        expect(ALL_MISSION_IDS).not.toContain('unknown-mission-id');
        expect(getMissionImageSource('unknown-mission-id').uri).toMatch(/^data:image\/png;base64,/);
    });

    function renderMissionsList() {
        mockUseUser.mockReturnValue({
            state: DEFAULT_USER_STATE,
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });

        return render(<MissionsListScreen onPressMission={jest.fn()} />);
    }

    it('일반/특별 미션 행은 공통 카메라 아이콘 대신 미션별 이미지를 렌더한다', () => {
        const { UNSAFE_getAllByType } = renderMissionsList();

        const listRows = UNSAFE_getAllByType(ListRow);
        // 렌더 순서: 공동 미션(3) → 일반 미션(6) → 특별 미션(3)
        const dailyAndSpecialRows = listRows.slice(COOP_MISSIONS.length);
        const dailyAndSpecialMissions = [...DAILY_MISSIONS, ...SPECIAL_MISSIONS];
        expect(dailyAndSpecialRows).toHaveLength(dailyAndSpecialMissions.length);

        dailyAndSpecialRows.forEach((row, index) => {
            const mission = dailyAndSpecialMissions[index]!;
            expect(row.props.left.type).toBe(BrandEmojiImage);
            expect(row.props.left.props.source).toEqual(getMissionImageSource(mission.id));
            expect(row.props.left.props.accessibilityLabel).toBe(`${mission.title} 아이콘`);
        });
    });

    it('해금된 공동 미션은 개별 이미지를, 잠긴 공동 미션은 기존 잠금 아이콘을 유지한다', () => {
        const { UNSAFE_getAllByType } = renderMissionsList();

        const listRows = UNSAFE_getAllByType(ListRow);
        const coopRows = listRows.slice(0, COOP_MISSIONS.length);
        expect(coopRows).toHaveLength(COOP_MISSIONS.length);

        // 기본 상태에서는 unlockAfter가 없는 첫 공동 미션만 해금돼요.
        const [firstMission, secondMission, thirdMission] = COOP_MISSIONS as [
            CoopMission,
            CoopMission,
            CoopMission,
        ];
        expect(firstMission.unlockAfter).toBeNull();
        expect(secondMission.unlockAfter).not.toBeNull();
        expect(thirdMission.unlockAfter).not.toBeNull();

        const [unlockedRow, lockedRowA, lockedRowB] = coopRows as [
            (typeof coopRows)[number],
            (typeof coopRows)[number],
            (typeof coopRows)[number],
        ];
        expect(unlockedRow.props.left.type).toBe(BrandEmojiImage);
        expect(unlockedRow.props.left.props.source).toEqual(getMissionImageSource(firstMission.id));

        for (const lockedRow of [lockedRowA, lockedRowB]) {
            expect(lockedRow.props.left.type).toBe(ListRow.Icon);
            expect(lockedRow.props.left.props.name).toBe(TDS_ICON.missionLock);
        }
    });

    it('해금된 공동 미션은 짧은 보상 배지와 3줄 설명으로 본문 잘림을 막는다', () => {
        const { UNSAFE_getAllByType } = renderMissionsList();
        const [unlockedRow] = UNSAFE_getAllByType(ListRow);
        const contentsChildren = unlockedRow?.props.contents.props.children;
        const texts = Array.isArray(contentsChildren) ? contentsChildren[1] : undefined;

        expect(unlockedRow?.props.right.props.children).toBe('재료 1종');
        expect(texts.props.bottomProps.numberOfLines).toBe(3);
    });
});

describe('MissionShareCard 사진 중심 공유 카드', () => {
    it('브랜드·핵심 성과만 하단 그라데이션에 남기고 상세 정보는 카드에서 제거한다', () => {
        const screen = render(
            <MissionShareCard
                practiceCount={4}
                carbonGrams={150}
                photoUri="file:///mission.jpg"
            />,
        );

        expect(screen.getByText('제로스트')).toBeTruthy();
        expect(screen.getByText('일회용품 4개 절감')).toBeTruthy();
        expect(screen.getByText('약 150g CO2 감소')).toBeTruthy();
        expect(screen.getByTestId('mission-share-gradient')).toBeTruthy();
        expect(screen.queryByText('연속 출석')).toBeNull();
        expect(screen.queryByText('참여 샵')).toBeNull();
        expect(screen.queryByText('획득 재료')).toBeNull();
        expect(screen.queryByText('알맹상점 · 마포')).toBeNull();
        expect(screen.queryByText('토마토 1개')).toBeNull();
    });

    it('카드에서 뺀 미션·재료·출석·상점 정보는 결과 화면 하단 상세영역에 보여준다', () => {
        const mission = DAILY_MISSIONS[0]!;
        mockUseUser.mockReturnValue({
            state: DEFAULT_USER_STATE,
        } as unknown as ReturnType<typeof useUser>);
        mockUseAppToast.mockReturnValue({
            show: jest.fn(),
            showSuccess: jest.fn(),
            showError: jest.fn(),
        });

        const screen = render(<MissionResultScreen mission={mission} onPressHome={jest.fn()} />);

        expect(screen.getByText('완료 미션')).toBeTruthy();
        expect(screen.getByText('획득 재료')).toBeTruthy();
        expect(screen.getByText('연속 출석')).toBeTruthy();
        expect(screen.getByText('참여 상점')).toBeTruthy();
    });
});
