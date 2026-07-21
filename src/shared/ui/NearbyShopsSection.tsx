import { getMapShops, MOCK_USER_LOCATION } from '@api/mock/shops';
import { Button, ListRow, Txt } from '@toss/tds-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../constants/tdsAssets';
import { colors } from '../theme/colors';
import {
    formatStraightLineDistance,
    getNearbyShops,
    LOCATION_CONSENT_DENIED_LIST_HINT,
    LOCATION_CONSENT_NOTICE,
    STRAIGHT_LINE_DISTANCE_HINT,
} from '../../features/shop/nearbyShopLogic';
import { ProbabilityInfoButton } from './ProbabilityInfoButton';

const HOME_NEARBY_LIMIT = 2;

const NEARBY_DISTANCE_INFO_LINES = [
    '가장 가까운 상점이에요.',
    ...STRAIGHT_LINE_DISTANCE_HINT.split('\n').map((line) => line.trim()).filter(Boolean),
];

type NearbyShopsSectionProps = {
    locationConsentGranted: boolean;
    onPressViewAll: () => void;
    onPressRequestConsent: () => void;
    onPressShop: (shopId: string) => void;
};

export function NearbyShopsSection({
    locationConsentGranted,
    onPressViewAll,
    onPressRequestConsent,
    onPressShop,
}: NearbyShopsSectionProps) {
    const nearbyShops = useMemo(
        () =>
            getNearbyShops(
                getMapShops(),
                MOCK_USER_LOCATION.latitude,
                MOCK_USER_LOCATION.longitude,
                HOME_NEARBY_LIMIT,
            ),
        [],
    );

    return (
        <View style={styles.section}>
            <View style={styles.titleRow}>
                <Txt typography="t5" fontWeight="semibold" color="grey900">
                    내 주변 상점
                </Txt>
                {locationConsentGranted ? (
                    <ProbabilityInfoButton
                        title="거리 안내"
                        lines={NEARBY_DISTANCE_INFO_LINES}
                        footnote={null}
                        accessibilitySuffix="보기"
                    />
                ) : null}
            </View>
            {!locationConsentGranted ? (
                <>
                    <Txt typography="t7" color="grey600" style={styles.notice}>
                        {LOCATION_CONSENT_NOTICE}
                    </Txt>
                    <View style={styles.locationInfoRow}>
                        <Txt typography="t7" color="grey600">
                            위치 정보
                        </Txt>
                        <ProbabilityInfoButton
                            title="주변 상점 위치 정보"
                            lines={[LOCATION_CONSENT_DENIED_LIST_HINT]}
                            footnote={null}
                        />
                    </View>
                    <Button size="medium" type="primary" style="weak" display="block" onPress={onPressRequestConsent}>
                        위치 동의하고 가까운 상점 보기
                    </Button>
                </>
            ) : (
                <View style={styles.listCard}>
                    {nearbyShops.map((shop) => {
                        const distanceLabel = Number.isFinite(shop.distanceMeters)
                            ? formatStraightLineDistance(shop.distanceMeters)
                            : null;
                        return (
                            <ListRow
                                key={shop.id}
                                onPress={() => onPressShop(shop.id)}
                                left={<ListRow.Icon name={TDS_ICON.nearbyShop} />}
                                contents={
                                    <ListRow.Texts
                                        type="2RowTypeA"
                                        top={shop.name}
                                        topProps={{ fontWeight: 'bold' }}
                                        bottom={
                                            distanceLabel != null
                                                ? `${shop.region} · ${distanceLabel}`
                                                : `${shop.region} · ${shop.address}`
                                        }
                                    />
                                }
                                withArrow
                                right={
                                    distanceLabel != null ? (
                                        <ListRow.RightTexts
                                            type="1RowTypeA"
                                            top={distanceLabel}
                                            topProps={{ color: 'blue500' }}
                                        />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </View>
            )}
            <Pressable onPress={onPressViewAll} accessibilityRole="button" accessibilityLabel="주변 상점 전체 보기">
                <Txt typography="t7" color="blue500" style={styles.viewAll}>
                    주변 상점 전체 보기 →
                </Txt>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        width: '100%',
        gap: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    notice: {
        lineHeight: 20,
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    listCard: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    viewAll: {
        textAlign: 'center',
        paddingVertical: 4,
    },
});
