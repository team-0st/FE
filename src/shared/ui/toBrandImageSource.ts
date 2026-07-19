import { Image } from 'react-native';
import type { ImageSourcePropType, ImageURISource } from 'react-native';

/** Apps in Toss / Granite Image·ListRow.Image 는 `{ uri }` 만 지원 */
export function toBrandImageSource(
    source: ImageSourcePropType | null | undefined,
): ImageURISource | null {
    if (source == null) {
        return null;
    }
    if (typeof source === 'object' && !Array.isArray(source)) {
        const uriSource = source as ImageURISource;
        if (typeof uriSource.uri === 'string' && uriSource.uri.length > 0) {
            return { uri: uriSource.uri };
        }
    }
    try {
        const resolved = Image.resolveAssetSource(source as number);
        if (resolved?.uri != null && resolved.uri.length > 0) {
            return { uri: resolved.uri };
        }
    } catch {
        return null;
    }
    return null;
}
