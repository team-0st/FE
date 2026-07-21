import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/** Screen의 스크롤 콘텐츠가 공유하는 상·좌·우 기본 padding. */
export const SCREEN_CONTENT_PADDING = 20;

/** Screen의 contentCentered가 공유하는 최대 너비. CenteredFeatureStage를 쓰는 화면도 동일하게 맞춘다. */
export const SCREEN_CONTENT_MAX_WIDTH = 400;

type ScreenProps = PropsWithChildren<{
    scrollable?: boolean;
    contentCentered?: boolean;
}>;

type FixedHeightHeaderSlotProps = PropsWithChildren<{
    height: number;
    testID?: string;
}>;

/**
 * stage 시작 위치를 고정하면서 큰 글씨로 넘치는 헤더 콘텐츠는 슬롯 안에서 스크롤한다.
 * ScrollView를 접근성 요소로 묶지 않아 내부 제목과 버튼의 접근성을 그대로 유지한다.
 */
export function FixedHeightHeaderSlot({
    children,
    height,
    testID,
}: FixedHeightHeaderSlotProps) {
    return (
        <View style={[styles.fixedHeaderSlot, { height }]} testID={testID}>
            <ScrollView
                style={styles.fixedHeaderScroll}
                contentContainerStyle={styles.fixedHeaderContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                testID={testID == null ? undefined : `${testID}-scroll`}
            >
                {children}
            </ScrollView>
        </View>
    );
}

export function Screen({ children, scrollable = false, contentCentered = false }: ScreenProps) {
    if (scrollable) {
        return (
            <ScrollView
                style={styles.screen}
                contentContainerStyle={[styles.content, contentCentered && styles.contentCentered]}
            >
                {children}
            </ScrollView>
        );
    }
    return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: SCREEN_CONTENT_PADDING,
        paddingBottom: 32,
    },
    contentCentered: {
        alignItems: 'center',
        maxWidth: SCREEN_CONTENT_MAX_WIDTH,
        width: '100%',
        alignSelf: 'center',
    },
    fixedHeaderSlot: {
        width: '100%',
        overflow: 'hidden',
    },
    fixedHeaderScroll: {
        width: '100%',
        flex: 1,
    },
    fixedHeaderContent: {
        width: '100%',
        minHeight: '100%',
        justifyContent: 'center',
    },
});
