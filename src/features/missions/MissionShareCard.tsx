import { Txt } from '@toss/tds-react-native';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { BRAND_ASSET } from '../../shared/constants/brandAssets';
import { ZEROST_SHARE_HASHTAG } from '../../shared/feedback/shareResult';
import { colors } from '../../shared/theme/colors';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';

const TODAY_PRACTICE_HASHTAG = '#오늘의실천';

type MissionShareCardProps = {
    missionTitle: string;
    practiceCount: number;
    shopName: string;
    dateLabel: string;
    onPressShare: () => void;
};

function pineTreeEquivalent(count: number): string {
    const trees = Math.max(0.1, Math.round((count / 60) * 10) / 10);
    return `소나무 ${trees}그루가 1년간 하는 일과 같아요`;
}

/** Figma `12 미션결과 - SNS 인증카드(안)` (193:204) */
export function MissionShareCard({
    missionTitle,
    practiceCount,
    shopName,
    dateLabel,
    onPressShare,
}: MissionShareCardProps) {
    const photoSource = toBrandImageSource(BRAND_ASSET.shareCardPhoto);
    return (
        <View style={styles.polaroid}>
            <ImageBackground
                source={photoSource ?? undefined}
                style={styles.photo}
                imageStyle={styles.photoImage}
            >
                <View style={styles.heroGlass}>
                    <Txt typography="t1" fontWeight="bold" color="white" style={styles.heroCount}>
                        {practiceCount}
                    </Txt>
                    <Txt typography="t7" fontWeight="semibold" color="white" style={styles.heroLabel}>
                        개의 일회용품을 아꼈어요
                    </Txt>
                    <Txt typography="st11" color="white" style={styles.heroSub}>
                        {pineTreeEquivalent(practiceCount)}
                    </Txt>
                </View>

                <Pressable
                    style={styles.shareFab}
                    onPress={onPressShare}
                    accessibilityLabel="결과 공유하기"
                    accessibilityRole="button"
                >
                    <Txt typography="t5" fontWeight="bold" color="grey800">
                        ↗
                    </Txt>
                </Pressable>

                <Txt typography="t7" color="white" style={styles.photoPlaceholder}>
                    인증 사진
                </Txt>

                <View style={styles.dataGlass}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                오늘 완료 미션
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white" numberOfLines={1}>
                                {missionTitle}
                            </Txt>
                        </View>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                획득 에코잼
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white">
                                에코잼
                            </Txt>
                        </View>
                    </View>
                    <View style={styles.gridRow}>
                        <View style={styles.gridCell}>
                            <Txt typography="st11" color="white" style={styles.gridLabel}>
                                누적 실천
                            </Txt>
                            <Txt typography="t7" fontWeight="semibold" color="white">
                                {practiceCount}번째 실천
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
            </ImageBackground>

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
        backgroundColor: colors.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 13,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
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
    },
    photoImage: {
        borderRadius: 16,
        resizeMode: 'cover',
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
    shareFab: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 2,
    },
    photoPlaceholder: {
        position: 'absolute',
        alignSelf: 'center',
        top: '48%',
        opacity: 0.6,
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
