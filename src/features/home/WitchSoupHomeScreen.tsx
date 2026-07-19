import { getShopById } from '@api/mock/shops';
import { getIngredientById } from '@api/mock/ingredients';
import { getTodayRecipeHint } from '@api/mock/recipes';
import { BottomCTA, Top, Txt } from '@toss/tds-react-native';
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
import {
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { CommunityGoalSection } from '../../shared/ui/CommunityGoalSection';
import { HomeNudgeBanner } from '../../shared/ui/HomeNudgeBanner';
import { NearbyShopsSection } from '../../shared/ui/NearbyShopsSection';
import { WeeklyMissionOxRow } from '../../shared/ui/WeeklyMissionOxRow';
import { colors } from '../../shared/theme/colors';

type WitchSoupHomeScreenProps = {
    onPressMissions: () => void;
    onPressPartnerShops: () => void;
};

function checkInDisplayValue(checkedIn: boolean, loading: boolean): string {
    if (loading) {
        return '…';
    }
    return checkedIn ? 'O' : 'X';
}

export function WitchSoupHomeScreen({ onPressMissions, onPressPartnerShops }: WitchSoupHomeScreenProps) {
    const { state, checkInToday, setLocationConsent } = useUser();
    const { showSuccess, showError, show } = useAppToast();
    const hint = getTodayRecipeHint();
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
                    const label = ingredient.name;
                    setTodayRewardLabel(label);
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

    const summaryLine = `오늘 출석 ${checkInDisplayValue(checkedIn, checkInLoading)}  ·  에코잼 ${state.ecoJam}잼  ·  알맹 ${state.totalPoints}P`;

    const weeklyNudge =
        state.weeklyMissionDone < state.weeklyMissionTotal
            ? '미션을 완료하면 재료가 쌓여요.'
            : !checkedIn
              ? '출석하고 랜덤 재료를 받아 보세요.'
              : null;

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                <Top
                    title={<Top.TitleParagraph size={22}>제로스트</Top.TitleParagraph>}
                    subtitle2={
                        <Pressable
                            onPress={() => {
                                void handleCheckIn();
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="오늘 출석하기"
                        >
                            <Top.SubtitleParagraph>{summaryLine}</Top.SubtitleParagraph>
                            {!checkedIn ? (
                                <Txt typography="t7" color="blue500" style={styles.checkInHint}>
                                    {todayRewardLabel ?? '탭하면 재료 1개'}
                                </Txt>
                            ) : null}
                        </Pressable>
                    }
                />
                {weeklyNudge != null ? <HomeNudgeBanner message={weeklyNudge} /> : null}
                <CommunityGoalSection />
                <WeeklyMissionOxRow state={state} />
                <NearbyShopsSection
                    locationConsentGranted={locationConsentGranted}
                    onPressViewAll={onPressPartnerShops}
                    onPressRequestConsent={() => setConsentModalVisible(true)}
                    onPressShop={setSelectedShopId}
                />
                <View style={styles.hintBox}>
                    <View style={styles.hintTitleRow}>
                        <Txt typography="t7" fontWeight="semibold" style={{ color: colors.primary }}>
                            오늘의 레시피 힌트
                        </Txt>
                        <ProbabilityInfoButton
                            title={SOUP_WEEKLY_PROBABILITY_TITLE}
                            lines={SOUP_WEEKLY_PROBABILITY_LINES}
                        />
                    </View>
                    <Txt typography="t6" color="grey700" style={styles.hintText}>
                        {hint}
                    </Txt>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <BottomCTA.Single
                    size="large"
                    type="primary"
                    display="block"
                    onPress={onPressMissions}
                    accessibilityLabel="오늘 미션 하고 재료 받기"
                >
                    오늘 미션 하고 재료 받기
                </BottomCTA.Single>
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
        paddingBottom: 8,
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
        paddingBottom: 8,
    },
    checkInHint: {
        marginTop: 4,
    },
    hintTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hintBox: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 6,
    },
    hintText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        marginTop: 4,
    },
});
