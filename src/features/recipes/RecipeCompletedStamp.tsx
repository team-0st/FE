import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { completedStampUriSource } from '../../shared/constants/completedStampImageUris';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';

type RecipeCompletedStampProps = {
    visible: boolean;
};

export function RecipeCompletedStamp({ visible }: RecipeCompletedStampProps) {
    if (!visible) {
        return null;
    }
    return (
        <View style={styles.stampWrap} pointerEvents="none">
            <BrandEmojiImage
                source={completedStampUriSource()}
                size={48}
                containerStyle={styles.stampImage}
                accessibilityLabel="완료"
            />
        </View>
    );
}

export function RecipeListRowShell({ children, done }: PropsWithChildren<{ done: boolean }>) {
    return (
        <View style={styles.rowShell}>
            {children}
            <RecipeCompletedStamp visible={done} />
        </View>
    );
}

const styles = StyleSheet.create({
    rowShell: {
        position: 'relative',
        width: '100%',
    },
    stampWrap: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 8,
        zIndex: 2,
    },
    stampImage: {
        marginRight: 0,
    },
});
