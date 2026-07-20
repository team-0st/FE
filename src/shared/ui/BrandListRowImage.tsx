import type { ImageSourcePropType } from 'react-native';
import { BrandEmojiImage } from './BrandEmojiImage';

type BrandListRowImageProps = {
    source: ImageSourcePropType | null | undefined;
    size?: number;
};

/** ListRow left — ListRow.Image(FastImage) 대신 RN Image */
export function BrandListRowImage({ source, size = 40 }: BrandListRowImageProps) {
    if (source == null) {
        return null;
    }
    return (
        <BrandEmojiImage
            source={source}
            size={size}
            containerStyle={{ marginRight: 8 }}
        />
    );
}
