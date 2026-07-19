import { getShopById } from '@api/mock/shops';
import { getIngredientById } from '@api/mock/ingredients';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    CHECK_IN_ALREADY_MESSAGE,
    NETWORK_ERROR_MESSAGE,
    USER_NOT_FOUND_MESSAGE,
} from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { LocationConsentModal } from '../legal/LocationConsentModal';
import { ShopDetailSheet } from '../shop/ShopDetailSheet';
import { useUser } from '../user/UserProvider';
import { isUserCheckedInToday } from '../user/selectors';
import { HOME_DECOR } from '../../shared/constants/homeDecorAssets';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { CommunityGoalSection } from '../../shared/ui/CommunityGoalSection';
import { NearbyShopsSection } from '../../shared/ui/NearbyShopsSection';
import { WeeklyMissionOxRow } from '../../shared/ui/WeeklyMissionOxRow';
import { colors } from '../../shared/theme/colors';

type WitchSoupHomeScreenProps = {
    onPressMissions: () => void;
    onPressPartnerShops: () => void;
};

export function WitchSoupHomeScreen({ onPressMissions, onPressPartnerShops }: WitchSoupHomeScreenProps) {
    const { state, checkInToday, setLocationConsent } = useUser();
    const { showSuccess, showError, show } = useAppToast();
    const checkedIn = isUserCheckedInToday(state);
    const [todayRewardLabel, setTodayRewardLabel] = useState<string | null>(null);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [consentModalVisible, setConsentModalVisible] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

    const locationConsentGranted = state.locationConsent === 'granted';
    const selectedShop = useMemo(
        () => (selectedShopId != null ? getShopById(selectedShopId) : null),
        [selectedShopId],
    );

    const handleCheckIn = useCallback(async () => {
        if (checkedIn || checkInLoading) {
            return;
        }
        setCheckInLoading(true);
        try {
            const result = await checkInToday();
            if (result.ok) {
                const ingredient = getIngredientById(result.data.ingredientId);
                if (ingredient != null) {
                    setTodayRewardLabel(ingredient.name);
                    showSuccess(`${ingredient.name} 재료를 받았어요.`);
                } else {
                    showSuccess('오늘의 재료를 받았어요.');
                }
                return;
            }
            if (result.code === 'ALREADY_CHECKED_IN') {
                show(CHECK_IN_ALREADY_MESSAGE);
                return;
            }
            if (result.code === 'USER_NOT_FOUND') {
                showError(USER_NOT_FOUND_MESSAGE);
                return;
            }
            showError(NETWORK_ERROR_MESSAGE);
        } finally {
            setCheckInLoading(false);
        }
    }, [checkInLoading, checkInToday, checkedIn, show, showError, showSuccess]);

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topWrap}>
                    <Top title={<Top.TitleParagraph size={22}>제로스트</Top.TitleParagraph>} />
                    {!checkedIn ? (
                        <Pressable
                            onPress={() => {
                                void handleCheckIn();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="오늘 출석하기"
                            style={styles.checkInLink}
                        >
                            <Txt typography="t7" color="blue500">
                                {checkInLoading
                                    ? '출석 중…'
                                    : (todayRewardLabel ?? '오늘 출석하고 재료 받기')}
                            </Txt>
                        </Pressable>
                    ) : null}
                    <View style={styles.heroMascot} pointerEvents="none">
                        <BrandEmojiImage
                            source={HOME_DECOR.homeHero}
                            size={64}
                            containerStyle={styles.heroImage}
                            accessibilityLabel="제로와 스티"
                        />
                    </View>
                </View>
                <CommunityGoalSection />
                <WeeklyMissionOxRow state={state} />
                <NearbyShopsSection
                    locationConsentGranted={locationConsentGranted}
                    onPressViewAll={onPressPartnerShops}
                    onPressRequestConsent={() => setConsentModalVisible(true)}
                    onPressShop={setSelectedShopId}
                />
            </ScrollView>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    onPress={onPressMissions}
                    accessibilityLabel="오늘 미션 하고 재료 받기"
                >
                    오늘 미션 하고 재료 받기
                </Button>
            </View>
            <LocationConsentModal
                visible={consentModalVisible}
                onClose={() => setConsentModalVisible(false)}
                onAgree={() => {
                    void (async () => {
                        await setLocationConsent('granted');
                        setConsentModalVisible(false);
                        showSuccess('위치 동의했어요. 가까운 상점을 보여드릴게요.');
                    })();
                }}
                onDecline={() => {
                    void (async () => {
                        await setLocationConsent('declined');
                        setConsentModalVisible(false);
                        show('위치 동의 없이 상점 목록만 볼 수 있어요.');
                    })();
                }}
            />
            <ShopDetailSheet
                shop={selectedShop ?? null}
                visible={selectedShop != null}
                onClose={() => setSelectedShopId(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
    },
    body: {
        flex: 1,
    },
    bodyContent: {
        paddingTop: 8,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 12,
        paddingBottom: 12,
    },
    topWrap: {
        position: 'relative',
        paddingRight: 72,
        minHeight: 72,
        justifyContent: 'center',
    },
    checkInLink: {
        marginTop: 4,
        paddingRight: 8,
        alignSelf: 'flex-start',
    },
    heroMascot: {
        position: 'absolute',
        right: 0,
        bottom: 8,
        opacity: 0.92,
    },
    heroImage: {
        marginRight: 0,
    },
    footer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingTop: 8,
        paddingBottom: 8,
    },
});
