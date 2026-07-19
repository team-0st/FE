import type { Shop } from '@api/mock/shops';
import { getShopCategoryLabel, getShopPointBadge } from '@api/mock/shops';
import { Button, Txt } from '@toss/tds-react-native';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Clipboard } from 'react-native';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { colors } from '../../shared/theme/colors';
import { formatStraightLineDistance, type ShopWithDistance } from './nearbyShopLogic';

type ShopDetailSheetProps = {
    shop: Shop | ShopWithDistance | null;
    visible: boolean;
    onClose: () => void;
};

export function ShopDetailSheet({ shop, visible, onClose }: ShopDetailSheetProps) {
    const toast = useAppToast();
    if (shop == null) {
        return null;
    }
    const distanceMeters = 'distanceMeters' in shop ? shop.distanceMeters : undefined;
    const categoryLabel = getShopCategoryLabel(shop.category);
    const pointBadge = getShopPointBadge(shop.pointEligible);

    const handleCopyAddress = () => {
        Clipboard.setString(shop.address);
        toast.showSuccess('주소를 복사했어요.');
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <Pressable style={styles.dismissArea} onPress={onClose} accessibilityLabel="닫기" />
                <View style={styles.sheet}>
                    {shop.imageUrl != null ? (
                        <Image source={{ uri: shop.imageUrl }} style={styles.photo} resizeMode="cover" />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Txt typography="t7" color="grey500">
                                상점 사진 준비 중
                            </Txt>
                        </View>
                    )}
                    <Txt typography="t4" fontWeight="bold">
                        {shop.name}
                    </Txt>
                    <Txt typography="t7" color="grey600">
                        {categoryLabel} · {pointBadge}
                    </Txt>
                    {distanceMeters != null ? (
                        <Txt typography="t7" color="blue500">
                            {formatStraightLineDistance(distanceMeters)} · {shop.region}
                        </Txt>
                    ) : (
                        <Txt typography="t7" color="grey600">
                            {shop.region}
                        </Txt>
                    )}
                    <Txt typography="t6" color="grey700" style={styles.description}>
                        {shop.description}
                    </Txt>
                    {shop.geocodeStatus === 'pending' ? (
                        <Txt typography="t7" color="grey500">
                            지도 위치는 알맹·공개 자료 수령 후 보정될 예정이에요.
                        </Txt>
                    ) : shop.geocodeStatus === 'approximate' ? (
                        <Txt typography="t7" color="grey500">
                            지도 핀은 구·군 단위 대략 위치예요. 정확한 좌표는 추후 보정돼요.
                        </Txt>
                    ) : null}
                    <View style={styles.addressBox}>
                        <Txt typography="t7" color="grey600">
                            주소
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.address}>
                            {shop.address}
                        </Txt>
                    </View>
                    <Button size="large" type="primary" style="weak" display="block" onPress={handleCopyAddress}>
                        주소 복사
                    </Button>
                    <Button size="medium" type="dark" style="weak" display="block" onPress={onClose}>
                        닫기
                    </Button>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        gap: 10,
    },
    photo: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    photoPlaceholder: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    description: {
        lineHeight: 22,
    },
    addressBox: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
    },
    address: {
        lineHeight: 22,
    },
});
