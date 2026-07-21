import {
    getMapShops,
    MOCK_USER_LOCATION,
    type Shop,
} from '@api/mock/shops';
import type { ShopCategoryFilter } from '@api/mock/shopCategories';
import { getShopCategoryLabel, getShopPointBadge } from '@api/mock/shops';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LocationConsentModal } from '../legal/LocationConsentModal';
import { useUser } from '../user/UserProvider';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { colors } from '../../shared/theme/colors';
import { ShopCategoryChips } from '../../shared/ui/ShopCategoryChips';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import {
    formatStraightLineDistance,
    getNearbyShops,
    LOCATION_CONSENT_DENIED_LIST_HINT,
    MAP_SHOPS_SCOPE_HINT,
    MAP_VISIBLE_PIN_LIMIT,
    STRAIGHT_LINE_DISTANCE_HINT,
    type ShopWithDistance,
} from './nearbyShopLogic';
import { filterShopsByCategory } from './shopFilters';
import { PartnerShopsMapView } from './PartnerShopsMapView';
import { ShopDetailSheet } from './ShopDetailSheet';

type ViewMode = 'list' | 'map';

export function PartnerShopsScreen() {
    const { state, setLocationConsent } = useUser();
    const toast = useAppToast();
    const locationConsentGranted = state.locationConsent === 'granted';
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [categoryFilter, setCategoryFilter] = useState<ShopCategoryFilter>('all');
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [consentModalVisible, setConsentModalVisible] = useState(false);

    const filteredShops = useMemo(
        () => filterShopsByCategory(getMapShops(), categoryFilter),
        [categoryFilter],
    );

    const sortedShops = useMemo(() => {
        if (!locationConsentGranted) {
            return filteredShops;
        }
        return getNearbyShops(
            filteredShops,
            MOCK_USER_LOCATION.latitude,
            MOCK_USER_LOCATION.longitude,
            filteredShops.length,
        );
    }, [filteredShops, locationConsentGranted]);

    const selectedShop = useMemo(() => {
        if (selectedShopId == null) {
            return null;
        }
        return sortedShops.find((shop) => shop.id === selectedShopId) ?? null;
    }, [selectedShopId, sortedShops]);

    const renderShopRow = (shop: Shop | ShopWithDistance) => {
        const hasDistance =
            locationConsentGranted &&
            'distanceMeters' in shop &&
            Number.isFinite(shop.distanceMeters);
        const distanceLabel = hasDistance ? formatStraightLineDistance(shop.distanceMeters) : null;
        const pointBadge = getShopPointBadge(shop.pointEligible);
        const categoryLabel = getShopCategoryLabel(shop.category);

        return (
            <ListRow
                key={shop.id}
                onPress={() => setSelectedShopId(shop.id)}
                left={<ListRow.Icon name={TDS_ICON.nearbyShop} />}
                contents={
                    <ListRow.Texts
                        type="3RowTypeA"
                        top={shop.name}
                        topProps={{ fontWeight: 'bold' }}
                        middle={`${categoryLabel} · ${shop.address}`}
                        middleProps={{ color: 'grey600' }}
                        bottom={
                            distanceLabel != null
                                ? `${shop.description} · ${distanceLabel}`
                                : `${shop.description} · ${pointBadge}`
                        }
                    />
                }
                right={
                    distanceLabel != null ? (
                        <ListRow.RightTexts
                            type="1RowTypeA"
                            top={distanceLabel}
                            topProps={{ color: 'blue500' }}
                        />
                    ) : (
                        <ListRow.RightTexts
                            type="1RowTypeA"
                            top={pointBadge ?? ''}
                            topProps={{ color: shop.pointEligible ? 'blue500' : 'grey500' }}
                        />
                    )
                }
            />
        );
    };

    return (
        <>
            <ScrollView style={styles.root} contentContainerStyle={styles.content}>
                <Top
                    title={<Top.TitleParagraph size={22}>주변 상점</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            {locationConsentGranted
                                ? `직선 거리 가까운 순이에요. ${STRAIGHT_LINE_DISTANCE_HINT}`
                                : '위치 동의 후 직선 거리·가까운 순·지도를 볼 수 있어요.'}
                        </Top.SubtitleParagraph>
                    }
                />
                <Txt typography="t7" color="grey600">
                    {MAP_SHOPS_SCOPE_HINT}
                </Txt>
                <ShopCategoryChips selected={categoryFilter} onSelect={setCategoryFilter} />
                <View style={styles.modeRow}>
                    <Pressable
                        onPress={() => setViewMode('list')}
                        style={[styles.modeChip, viewMode === 'list' ? styles.modeChipActive : undefined]}
                    >
                        <Txt typography="t7" fontWeight={viewMode === 'list' ? 'bold' : 'regular'}>
                            리스트
                        </Txt>
                    </Pressable>
                    <Pressable
                        onPress={() => setViewMode('map')}
                        style={[styles.modeChip, viewMode === 'map' ? styles.modeChipActive : undefined]}
                    >
                        <Txt typography="t7" fontWeight={viewMode === 'map' ? 'bold' : 'regular'}>
                            지도
                        </Txt>
                    </Pressable>
                </View>
                {!locationConsentGranted ? (
                    <>
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
                        <Button
                            size="medium"
                            type="primary"
                            style="weak"
                            display="block"
                            onPress={() => setConsentModalVisible(true)}
                        >
                            위치 동의하고 거리·지도 보기
                        </Button>
                    </>
                ) : null}
                {viewMode === 'list' ? (
                    <View style={styles.listCard}>
                        {sortedShops.length === 0 ? (
                            <Txt typography="t7" color="grey600" style={styles.empty}>
                                이 카테고리에 표시할 상점이 없어요.
                            </Txt>
                        ) : (
                            sortedShops.map((shop) => renderShopRow(shop))
                        )}
                    </View>
                ) : (
                    <PartnerShopsMapView
                        shops={sortedShops}
                        userLatitude={locationConsentGranted ? MOCK_USER_LOCATION.latitude : undefined}
                        userLongitude={locationConsentGranted ? MOCK_USER_LOCATION.longitude : undefined}
                        onPressShop={setSelectedShopId}
                    />
                )}
                <Txt typography="t7" color="grey500" style={styles.source}>
                    데이터: 알맹 카카오맵 폴더 341곳 · 지도 핀은 가까운 {MAP_VISIBLE_PIN_LIMIT}곳만 표시 · 좌표는 구·군 단위 대략값
                </Txt>
            </ScrollView>
            <ShopDetailSheet
                shop={selectedShop}
                visible={selectedShop != null}
                onClose={() => setSelectedShopId(null)}
            />
            <LocationConsentModal
                visible={consentModalVisible}
                onClose={() => setConsentModalVisible(false)}
                onAgree={() => {
                    void (async () => {
                        await setLocationConsent('granted');
                        setConsentModalVisible(false);
                        toast.showSuccess('위치 동의했어요. 가까운 상점을 보여드릴게요.');
                    })();
                }}
                onDecline={() => {
                    void (async () => {
                        await setLocationConsent('declined');
                        setConsentModalVisible(false);
                        toast.show('위치 동의 없이 상점 목록만 볼 수 있어요.');
                    })();
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 12,
    },
    modeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    modeChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    modeChipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    listCard: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    empty: {
        padding: 20,
        textAlign: 'center',
    },
    source: {
        lineHeight: 18,
        textAlign: 'center',
    },
});
