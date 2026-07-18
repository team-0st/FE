import type { Shop } from '@api/mock/shops';
import { Txt } from '@toss/tds-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { OSM_MAP_ATTRIBUTION } from '../../shared/constants/mapAttribution';
import { colors } from '../../shared/theme/colors';
import { hasPlottableCoordinates, MAP_VISIBLE_PIN_LIMIT, type ShopWithDistance } from './nearbyShopLogic';
import { buildPartnerMapHtml } from './buildPartnerMapHtml';

const MAP_HEIGHT = 300;

type PartnerShopsMapViewProps = {
    shops: Array<Shop | ShopWithDistance>;
    userLatitude?: number;
    userLongitude?: number;
    onPressShop: (shopId: string) => void;
};

export function PartnerShopsMapView({
    shops,
    userLatitude,
    userLongitude,
    onPressShop,
}: PartnerShopsMapViewProps) {
    const plottableShops = useMemo(
        () => shops.filter((shop) => hasPlottableCoordinates(shop)),
        [shops],
    );

    const mapHtml = useMemo(
        () =>
            buildPartnerMapHtml(
                plottableShops.map((shop) => ({
                    id: shop.id,
                    emoji: shop.emoji,
                    latitude: shop.latitude,
                    longitude: shop.longitude,
                })),
                userLatitude,
                userLongitude,
                MAP_VISIBLE_PIN_LIMIT,
            ),
        [plottableShops, userLatitude, userLongitude],
    );

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data) as { type?: string; shopId?: string };
            if (data.type === 'shop' && data.shopId != null) {
                onPressShop(data.shopId);
            }
        } catch {
            // ignore malformed messages
        }
    };

    return (
        <View style={styles.wrap}>
            {plottableShops.length === 0 ? (
                <View style={styles.emptyMap}>
                    <Txt typography="t7" color="grey600" style={styles.emptyMapText}>
                        주소 좌표 보정 전이라 지도 핀은 아직 표시되지 않아요. 리스트에서 매장명·주소를 확인할 수 있어요.
                    </Txt>
                </View>
            ) : (
                <View style={styles.mapFrame}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: mapHtml }}
                        style={styles.webview}
                        scrollEnabled={false}
                        nestedScrollEnabled
                        onMessage={handleMessage}
                        startInLoadingState
                        renderLoading={() => (
                            <View style={styles.loading}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        )}
                    />
                </View>
            )}
            <Txt typography="t7" color="grey500" style={styles.legend}>
                지도를 움직이면 화면 중심에서 가까운 상점 {MAP_VISIBLE_PIN_LIMIT}곳만 핀으로 보여요. 핀을 탭하면 상세를 볼 수 있어요.
            </Txt>
            <Txt typography="t7" color="grey500" style={styles.attribution}>
                {OSM_MAP_ATTRIBUTION}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        gap: 8,
    },
    mapFrame: {
        width: '100%',
        height: MAP_HEIGHT,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        backgroundColor: '#E8EEF2',
    },
    emptyMap: {
        width: '100%',
        minHeight: MAP_HEIGHT,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    emptyMapText: {
        textAlign: 'center',
        lineHeight: 20,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loading: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    legend: {
        textAlign: 'center',
        lineHeight: 18,
    },
    attribution: {
        textAlign: 'center',
        lineHeight: 16,
    },
});
