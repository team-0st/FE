import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import {
    encodeSkipCraftAnimation,
    readSkipCraftAnimationSafely,
    type StoredSkipCraftAnimation,
} from './craftAnimationSkipPreferenceCodec';

export {
    DEFAULT_SKIP_CRAFT_ANIMATION,
    decodeSkipCraftAnimation,
    encodeSkipCraftAnimation,
} from './craftAnimationSkipPreferenceCodec';

export async function readSkipCraftAnimation(): Promise<boolean> {
    return readSkipCraftAnimationSafely(() =>
        readJson<StoredSkipCraftAnimation>(STORAGE_KEYS.craftSkipAnimation),
    );
}

export async function writeSkipCraftAnimation(value: boolean): Promise<void> {
    await writeJson<StoredSkipCraftAnimation>(STORAGE_KEYS.craftSkipAnimation, encodeSkipCraftAnimation(value));
}
