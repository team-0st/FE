import { render } from '@testing-library/react-native';
import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AboutZerostScreen } from '../about/AboutZerostScreen';
import { ABOUT_ZEROST_LABELS, ABOUT_ZEROST_SECTIONS } from '../../shared/constants/aboutZerost';
import {
    PREVIEW_ROW_HEIGHT,
    computeAdaptiveVisibleRows,
    getMaxMeasuredRowHeight,
    updateMeasuredRowHeightById,
} from '../../shared/ui/ScrollPreviewSection';
import { brewStatusMessage } from '../ingredients/IngredientsScreen';
import { ProfileListModal } from './ProfileListSection';

jest.mock('@toss/tds-react-native', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
    const MockText = ({
        children,
        style,
    }: Pick<ComponentProps<typeof ReactNative.Text>, 'children' | 'style'>) =>
        React.createElement(ReactNative.Text, { style }, children);
    const MockListRow = Object.assign(() => null, {
        Texts: () => null,
        RightTexts: () => null,
    });
    const MockTop = Object.assign(
        ({ title }: { title?: ReactNode }) => React.createElement(ReactNative.View, null, title),
        { TitleParagraph: MockText },
    );

    return {
        Button: MockText,
        ListRow: MockListRow,
        Top: MockTop,
        Txt: MockText,
    };
});

jest.mock('../../shared/ui/Screen', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');

    return {
        Screen: ({ children, scrollable }: { children?: ReactNode; scrollable?: boolean }) =>
            scrollable
                ? React.createElement(ReactNative.ScrollView, null, children)
                : React.createElement(ReactNative.View, null, children),
    };
});

jest.mock('../user/UserProvider', () => ({
    useUser: jest.fn(),
}));

jest.mock('../craft/useCraftSkipAnimationPreference', () => ({
    useCraftSkipAnimationPreference: jest.fn(),
}));

jest.mock('../craft/CraftBrewAnimationOverlay', () => ({
    CraftBrewAnimationOverlay: () => null,
}));

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

describe('brewStatusMessage (제작 탭 하단 상태 문구)', () => {
    it('재료가 없을 때 2개 이상 넣으라고 안내한다', () => {
        expect(brewStatusMessage(0, null)).toBe('재료를 2개 이상 넣으면 만들 수 있어요.');
    });
});
