import type { ImageSourcePropType } from 'react-native';
import { BRAND_ASSET, BRAND_EMOJI } from './brandAssets';

export type AvatarOption = {
    id: string;
    source: ImageSourcePropType;
    label: string;
};

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
    { id: 'mascotCarrot', source: BRAND_ASSET.mascotCarrot, label: '당근' },
    { id: 'tomato', source: BRAND_EMOJI.tomato, label: '토마토' },
    { id: 'onion', source: BRAND_EMOJI.onion, label: '양파' },
    { id: 'mushroom', source: BRAND_EMOJI.mushroom, label: '버섯' },
    { id: 'broccoli', source: BRAND_EMOJI.broccoli, label: '브로콜리' },
    { id: 'paprika', source: BRAND_EMOJI.paprika, label: '파프리카' },
    { id: 'lettuce', source: BRAND_EMOJI.lettuce, label: '상추' },
] as const;

const FALLBACK_AVATAR_OPTION = AVATAR_OPTIONS[0] as AvatarOption;

export const DEFAULT_AVATAR_ID = FALLBACK_AVATAR_OPTION.id;

export function getAvatarOption(avatarId: string): AvatarOption {
    return AVATAR_OPTIONS.find((option) => option.id === avatarId) ?? FALLBACK_AVATAR_OPTION;
}
