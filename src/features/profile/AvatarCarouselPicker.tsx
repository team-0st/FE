import { useEffect, useMemo, useRef, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import { AVATAR_OPTIONS } from '../../shared/constants/avatarOptions';
import { colors } from '../../shared/theme/colors';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';

const ITEM_SIZE = 72;
const ITEM_GAP = 16;
const SNAP_INTERVAL = ITEM_SIZE + ITEM_GAP;

type AvatarCarouselPickerProps = {
    selectedId: string;
    onChange: (avatarId: string) => void;
};

function indexOfAvatar(avatarId: string): number {
    const index = AVATAR_OPTIONS.findIndex((option) => option.id === avatarId);
    return index >= 0 ? index : 0;
}

/** 아바타 선택 — 가로 스냅 캐러셀. 가운데 정지한 항목이 선택된 아바타. */
export function AvatarCarouselPicker({ selectedId, onChange }: AvatarCarouselPickerProps) {
    const scrollRef = useRef<ScrollView>(null);
    const [trackWidth, setTrackWidth] = useState(0);
    const sidePadding = Math.max((trackWidth - ITEM_SIZE) / 2, 0);
    const initialIndex = useMemo(() => indexOfAvatar(selectedId), [selectedId]);

    useEffect(() => {
        if (trackWidth === 0) {
            return;
        }
        scrollRef.current?.scrollTo({ x: initialIndex * SNAP_INTERVAL, animated: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackWidth]);

    const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const rawIndex = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
        const clampedIndex = Math.min(Math.max(rawIndex, 0), AVATAR_OPTIONS.length - 1);
        const option = AVATAR_OPTIONS[clampedIndex];
        if (option != null && option.id !== selectedId) {
            onChange(option.id);
        }
    };

    return (
        <View style={styles.track} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
            {trackWidth > 0 ? (
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    style={styles.scrollView}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SNAP_INTERVAL}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: sidePadding, gap: ITEM_GAP }}
                    onMomentumScrollEnd={handleMomentumEnd}
                >
                    {AVATAR_OPTIONS.map((option) => {
                        const active = option.id === selectedId;
                        const imageSize = active ? 64 : 44;
                        return (
                            <View
                                key={option.id}
                                style={[styles.item, !active && styles.itemInactive]}
                                accessibilityLabel={option.label}
                            >
                                <BrandEmojiImage
                                    source={option.source}
                                    size={imageSize}
                                    accessibilityLabel={option.label}
                                />
                            </View>
                        );
                    })}
                </ScrollView>
            ) : null}
            <View style={styles.selectionFrame} pointerEvents="none" />
        </View>
    );
}

const FRAME_SIZE = 72;

const styles = StyleSheet.create({
    track: {
        width: '100%',
        height: 96,
        justifyContent: 'center',
    },
    scrollView: {
        flexGrow: 0,
        height: ITEM_SIZE,
    },
    item: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInactive: {
        opacity: 0.5,
    },
    selectionFrame: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        marginLeft: -FRAME_SIZE / 2,
        marginTop: -FRAME_SIZE / 2,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
    },
});
