import { Asset, frameShape, Txt } from '@toss/tds-react-native';
import { Image, StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { formatCarbonGrams } from './carbonReduction';

const BOTTOM_GRADIENT_URI =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAABgCAYAAADcvRh2AAAALElEQVR42mNgwA4YmRgYGBhQCUZcXJJYpHNxihErSzHBRJ4SMsWYqCIBYQEA5I0BEKGREdcAAAAASUVORK5CYII=';

type MissionShareCardProps = {
    practiceCount: number;
    /** 공식 절감량 자료가 있는 미션만 전달 — 없으면 null */
    carbonGrams: number | null;
    /** 인증 촬영 사진(RN Image uri). 없으면 카메라 아이콘 플레이스홀더 */
    photoUri?: string | null;
};

/** Figma `12 미션결과 - SNS 인증카드(안)` (193:204) */
export function MissionShareCard({
    practiceCount,
    carbonGrams,
    photoUri = null,
}: MissionShareCardProps) {
    return (
        <View style={styles.card}>
            {photoUri != null ? (
                <Image
                    source={{ uri: photoUri }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                    accessibilityLabel="인증 사진"
                />
            ) : null}

            {photoUri == null ? (
                <View style={styles.photoPlaceholder}>
                    <Asset.Icon
                        name={TDS_ICON.missionCamera}
                        frameShape={frameShape.CircleLarge}
                        backgroundColor="rgba(255,255,255,0.16)"
                        accessibilityLabel="인증 사진"
                    />
                    <Txt typography="t7" color="white" style={styles.photoPlaceholderLabel}>
                        인증 사진
                    </Txt>
                </View>
            ) : null}

            <Txt typography="t7" fontWeight="bold" color="white" style={styles.brand}>
                제로스트
            </Txt>

            <Image
                testID="mission-share-gradient"
                source={{ uri: BOTTOM_GRADIENT_URI }}
                style={styles.gradient}
                resizeMode="stretch"
                accessible={false}
            />
            <View style={styles.resultCopy}>
                <Txt typography="t3" fontWeight="bold" color="white" style={styles.resultTitle}>
                    {`일회용품 ${practiceCount}개 절감`}
                </Txt>
                {carbonGrams != null ? (
                    <Txt typography="t6" color="white" style={styles.resultSub}>
                        {`약 ${formatCarbonGrams(carbonGrams)} CO2 감소`}
                    </Txt>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 16,
        marginHorizontal: 20,
        aspectRatio: 4 / 5,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#296B4A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 3,
    },
    photoPlaceholder: {
        position: 'absolute',
        alignSelf: 'center',
        top: '40%',
        alignItems: 'center',
        gap: 8,
        opacity: 0.7,
    },
    photoPlaceholderLabel: {
        textAlign: 'center',
    },
    brand: {
        position: 'absolute',
        top: 16,
        left: 16,
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '42%',
    },
    resultCopy: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 20,
        gap: 4,
    },
    resultTitle: {
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    resultSub: {
        opacity: 0.92,
    },
});
