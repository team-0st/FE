import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { completedStampUriSource } from '../../shared/constants/completedStampImageUris';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';

/** 등급 탭(입문·일반·히든·전설)에서만 가운데 큰 도장 + 반투명 */
const GRADE_STAMP_SIZE = 88;

type RecipeCompletedStampProps = {
    visible: boolean;
    size?: number;
    centered?: boolean;
};

export function RecipeCompletedStamp({
    visible,
    size = 48,
    centered = false,
}: RecipeCompletedStampProps) {
    if (!visible) {
        return null;
    }
    return (
        <View
            style={[styles.stampWrap, centered ? styles.stampWrapCentered : styles.stampWrapEnd]}
            pointerEvents="none"
        >
            <BrandEmojiImage
                source={completedStampUriSource()}
                size={size}
                containerStyle={styles.stampImage}
                accessibilityLabel="완료"
            />
        </View>
    );
}

type RecipeListRowShellProps = PropsWithChildren<{
    done: boolean;
    /** 등급 탭: 흐림+큰 가운데 도장 / 완료 탭: 일반 표시 */
    appearance?: 'grade' | 'completedTab';
}>;

export function RecipeListRowShell({
    children,
    done,
    appearance = 'grade',
}: RecipeListRowShellProps) {
    const gradeDone = appearance === 'grade' && done;
    return (
        <View style={[styles.rowShell, gradeDone ? styles.rowDone : undefined]}>
            {children}
            <RecipeCompletedStamp
                visible={gradeDone}
                size={GRADE_STAMP_SIZE}
                centered
            />
        </View>
    );
}

const styles = StyleSheet.create({
    rowShell: {
        position: 'relative',
        width: '100%',
    },
    rowDone: {
        opacity: 0.45,
    },
    stampWrap: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    stampWrapEnd: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 8,
    },
    stampWrapCentered: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    stampImage: {
        marginRight: 0,
    },
});
