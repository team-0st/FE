import { Asset, frameShape, Txt } from '@toss/tds-react-native';
import { Image, StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { ZEROST_SHARE_HASHTAG } from '../../shared/feedback/shareResult';
import { formatCarbonGrams } from './carbonReduction';

const TODAY_PRACTICE_HASHTAG = '#오늘의실천';

type MissionShareCardProps = {
    missionTitle: string;
    practiceCount: number;
    checkInStreak: number;
    shopName: string;
    dateLabel: string;
    rewardLabel: string;
    /** 공식 절감량 자료가 있는 미션만 전달 — 없으면 null */
    carbonGrams: number | null;
    /** 인증 촬영 사진(RN Image uri). 없으면 카메라 아이콘 플레이스홀더 */
    photoUri?: string | null;
};

/** Figma `12 미션결과 - SNS 인증카드(안)` (193:204) */
export function MissionShareCard({
    missionTitle,
    practiceCount,
    checkInStreak,
    shopName,
    dateLabel,
    rewardLabel,
    carbonGrams,
    photoUri = null,
}: MissionShareCardProps) {
    return (
        <View style={styles.polaroid}>
            <View style={styles.photo}>
                {photoUri != null ? (
                    <Image
                        source={{ uri: photoUri }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                        accessibilityLabel="인증 사진"
                    />
                ) : null}
                <View style={styles.heroGlass}>
                    <Txt typography="t1" fontWeight="bold" color="white" style={styles.heroCount}>
                        {practiceCount}
                    </Txt>
                    <Txt typography="t7" fontWeight="semibold" color="white" style={styles.heroLabel}>
                        개의 일회용품을 아꼈어요
                    </Txt>
                    {carbonGrams != null ? (
                        <Txt typography="st11" color="white" style={styles.heroSub}>
                            {`이 실천으로 약 ${formatCarbonGrams(carbonGrams)} CO2를 줄였어요`}
                        </Txt>
                    ) : null}
                </View>

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

                <View style={styles.dataGlass}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                완료 미션
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white" numberOfLines={1}>
                                {missionTitle}
                            </Txt>
                        </View>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                획득 재료
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white" numberOfLines={1}>
                                {rewardLabel}
                            </Txt>
                        </View>
                    </View>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                연속 출석
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white">
                                {`${checkInStreak}일째`}
                            </Txt>
                        </View>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                참여 샵
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white" numberOfLines={1}>
                                {shopName}
                            </Txt>
                        </View>
                    </View>
                </View>
            </View>

            <Txt typography="t7" fontWeight="semibold" color="grey800" style={styles.hashtags}>
                {ZEROST_SHARE_HASHTAG}  {TODAY_PRACTICE_HASHTAG}
            </Txt>
            <Txt typography="st11" color="grey500" style={styles.date}>
                {dateLabel}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    polaroid: {
        marginTop: 16,
        marginHorizontal: 20,
        alignItems: 'center',
        gap: 8,
    },
    photo: {
        width: '100%',
        aspectRatio: 307 / 476,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#296B4A',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 3,
    },
    heroGlass: {
        marginTop: 14,
        marginLeft: 14,
        width: 190,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.26)',
        gap: 4,
    },
    heroCount: {
        lineHeight: 58,
    },
    heroLabel: {
        opacity: 0.92,
    },
    heroSub: {
        opacity: 0.75,
        marginTop: 2,
    },
    photoPlaceholder: {
        position: 'absolute',
        alignSelf: 'center',
        top: '44%',
        alignItems: 'center',
        gap: 8,
        opacity: 0.7,
    },
    photoPlaceholderLabel: {
        textAlign: 'center',
    },
    dataGlass: {
        marginHorizontal: 14,
        marginBottom: 14,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(0,0,0,0.26)',
        gap: 10,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 16,
    },
    gridCell: {
        flex: 1,
        gap: 4,
    },
    gridLabel: {
        opacity: 0.7,
    },
    hashtags: {
        textAlign: 'center',
        marginTop: 4,
    },
    date: {
        textAlign: 'center',
    },
});
