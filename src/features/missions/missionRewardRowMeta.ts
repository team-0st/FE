import { getMissionById } from '@api/mock/missions';
import { resolveMissionSlugFromBe } from '@api/missions';
import type { ImageSourcePropType } from 'react-native';
import { getMissionImageSource } from '../../shared/constants/missionAssets';

export type MissionRewardRowMeta = {
    slug: string;
    title: string;
    description: string;
    missionImage: ImageSourcePropType;
};

export function resolveMissionRewardRowMeta(
    missionId: number,
    missionTitle: string,
): MissionRewardRowMeta {
    const slug = resolveMissionSlugFromBe({ id: missionId, title: missionTitle });
    const catalog = getMissionById(slug);
    const title = missionTitle.trim().length > 0 ? missionTitle : (catalog?.title ?? '미션');
    return {
        slug,
        title,
        description: catalog?.description ?? '',
        missionImage: getMissionImageSource(slug, title),
    };
}

export function rewardImageSource(
    imageUrl: string | null | undefined,
): ImageSourcePropType | null {
    if (imageUrl == null || imageUrl.trim().length === 0) {
        return null;
    }
    return { uri: imageUrl };
}
