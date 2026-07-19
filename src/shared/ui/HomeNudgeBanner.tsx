import { HOME_DECOR } from '../constants/homeDecorAssets';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { BrandEmojiImage } from './BrandEmojiImage';

type HomeNudgeBannerProps = {
    message: string;
};

export function HomeNudgeBanner({ message }: HomeNudgeBannerProps) {
    return (
        <View style={styles.banner} accessibilityRole="text">
            <Txt typography="t7" color="grey700" style={styles.text}>
                {message}
            </Txt>
            <BrandEmojiImage
                source={HOME_DECOR.bannerVeggies}
                size={36}
                containerStyle={styles.art}
                style={styles.artImage}
                accessibilityLabel=""
            />
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        paddingVertical: 10,
        paddingLeft: 14,
        paddingRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        gap: 8,
        overflow: 'hidden',
    },
    text: {
        flex: 1,
        textAlign: 'left',
        lineHeight: 20,
    },
    art: {
        marginRight: 0,
        opacity: 0.9,
    },
    artImage: {
        opacity: 0.9,
    },
});
