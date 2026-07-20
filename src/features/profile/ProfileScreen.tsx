import { findRecipeInCatalog } from '@api/mock/recipeCatalog';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from '../legal/TermsOfServiceModal';
import { PRIVACY_POLICY_LABELS } from '../../shared/constants/privacyPolicy';
import { TERMS_OF_SERVICE_LABELS } from '../../shared/constants/termsOfService';
import { BRAND_EMOJI } from '../../shared/constants/brandAssets';
import { getSoupImageSource } from '../../shared/constants/soupAssets';
import { formatCarbonGrams } from '../missions/carbonReduction';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { formatLedgerDelta } from '../user/ecoJamLedger';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { ALMANG_UI_COPY } from '../../shared/constants/almangComplianceCopy';
import { DEV_TEST_TOOLS_ENABLED } from '../../shared/dev/devTestFlags';
import { ECO_JAM_TEST_GRANT } from '../../shared/constants/ecoJamPolicy';
import { useAppToast } from '../../shared/feedback/useAppToast';
import {
    ProfileLedgerRow,
    ProfileListModal,
    ProfileSoupRow,
} from './ProfileListSection';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type ProfileScreenProps = {
    onPressChangeShop?: () => void;
    onPressRestartOnboarding?: () => void;
};

type DetailModal = 'ecoJam' | 'almang' | 'soups' | null;

/** 한 줄 = 한 문장 */
const ALMANG_STORE_INFO_LINES = [
    '포인트가 앱에 적립됐어요.',
    '앱에서 현금으로 바꾸거나 환불할 수 없어요.',
    '알맹상점에 방문해 본인 확인 후 매장 포인트로 이용해 주세요.',
    '앱 안에서는 현금으로 바꾸거나 환불·출금할 수 없어요.',
    '알맹 포인트는 제휴 매장(알맹상점)에서만 이용해요.',
];

function formatLedgerTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ProfileScreen({ onPressChangeShop, onPressRestartOnboarding }: ProfileScreenProps) {
    const { state, grantTestEcoJam, unlockAllRecipesForTest } = useUser();
    const { showSuccess } = useAppToast();
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);
    const [restartConfirmVisible, setRestartConfirmVisible] = useState(false);
    const [detailModal, setDetailModal] = useState<DetailModal>(null);
    const shopName = resolveShopName(state.shopId);
    const completed = state.completedRecipeIds.length;
    const ecoJamEntries = state.ecoJamLedger;
    const almangEntries = state.almangPointsLedger;

    const completedSoups = useMemo(
        () =>
            state.completedRecipeIds.map((id) => {
                const recipe = findRecipeInCatalog(id);
                return {
                    id,
                    name: recipe?.name ?? '완성한 스프',
                    imageSource: getSoupImageSource(id),
                };
            }),
        [state.completedRecipeIds],
    );

    return (
        <Screen scrollable>
            <Top title={<Top.TitleParagraph size={22}>마이</Top.TitleParagraph>} />
            <View style={styles.hero}>
                <Txt typography="t2" fontWeight="bold">
                    {state.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {shopName}
                </Txt>
                {onPressChangeShop != null ? (
                    <Txt
                        typography="t7"
                        color="blue500"
                        onPress={onPressChangeShop}
                        accessibilityRole="button"
                        accessibilityLabel="단골 샵 변경"
                    >
                        단골 샵 변경
                    </Txt>
                ) : null}
            </View>
            <View style={styles.row}>
                <Pressable
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                    onPress={() => setDetailModal('ecoJam')}
                    accessibilityRole="button"
                    accessibilityLabel={`에코잼 ${state.ecoJam}, 내역 보기`}
                >
                    <BrandEmojiImage
                        source={BRAND_EMOJI.ecoJam}
                        size={48}
                        containerStyle={styles.cardIcon}
                        accessibilityLabel="에코잼"
                    />
                    <Txt typography="t7" color="grey600">
                        에코잼
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {state.ecoJam}
                    </Txt>
                    <Txt typography="t7" color="blue500">
                        내역 보기
                    </Txt>
                </Pressable>
                <View style={styles.card}>
                    <BrandEmojiImage
                        source={BRAND_EMOJI.almangPoint}
                        size={48}
                        containerStyle={styles.cardIcon}
                        accessibilityLabel="알맹 포인트"
                    />
                    <View style={styles.almangLabelRow}>
                        <Txt typography="t7" color="grey600" style={styles.almangLabelText}>
                            알맹 포인트
                        </Txt>
                        <View style={styles.almangInfoAnchor}>
                            <ProbabilityInfoButton
                                title={ALMANG_UI_COPY.bannerTitle}
                                lines={ALMANG_STORE_INFO_LINES}
                                footnote={null}
                            />
                        </View>
                    </View>
                    <Pressable
                        onPress={() => setDetailModal('almang')}
                        accessibilityRole="button"
                        accessibilityLabel={`알맹 포인트 ${state.totalPoints}P, 내역 보기`}
                        style={({ pressed }) => [
                            styles.almangTapArea,
                            pressed && styles.cardPressed,
                        ]}
                    >
                        <Txt typography="t4" fontWeight="bold">
                            {state.totalPoints}P
                        </Txt>
                        {state.almangPayoutConsent === 'declined' ? (
                            <Txt typography="t7" color="grey600">
                                매장 연동 대기
                            </Txt>
                        ) : null}
                        <Txt typography="t7" color="blue500">
                            내역 보기
                        </Txt>
                    </Pressable>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                    onPress={() => setDetailModal('soups')}
                    accessibilityRole="button"
                    accessibilityLabel={`완성 스프 ${completed}개, 목록 보기`}
                >
                    <BrandEmojiImage
                        source={BRAND_EMOJI.completedSoups}
                        size={48}
                        containerStyle={styles.cardIcon}
                        accessibilityLabel="완성 스프"
                    />
                    <Txt typography="t7" color="grey600">
                        완성 스프
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {completed}개
                    </Txt>
                    <Txt typography="t7" color="blue500">
                        목록 보기
                    </Txt>
                </Pressable>
                <View style={styles.card}>
                    <BrandEmojiImage
                        source={BRAND_EMOJI.sprout}
                        size={48}
                        containerStyle={styles.cardIcon}
                        accessibilityLabel="탄소 절감량"
                    />
                    <Txt typography="t7" color="grey600">
                        탄소 절감량
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {formatCarbonGrams(state.totalCo2ReductionGrams)}
                    </Txt>
                </View>
            </View>
            {state.pendingRealRewards.length > 0 ? (
                <View style={styles.section}>
                    <Txt typography="t5" fontWeight="semibold" style={styles.sectionTitle}>
                        실물 리워드 안내
                    </Txt>
                    {state.pendingRealRewards.map((item) => (
                        <View key={item.id} style={styles.pendingCard}>
                            <Txt typography="t6" fontWeight="bold">
                                {item.label}
                            </Txt>
                            <Txt typography="t7" color="grey600">
                                팀에서 확인 후 연락드릴게요. (수령 대기)
                            </Txt>
                        </View>
                    ))}
                </View>
            ) : null}
            <View style={styles.legalLinkRow}>
                <Txt
                    typography="t6"
                    color="blue500"
                    style={styles.policyLink}
                    onPress={() => setPrivacyVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel={PRIVACY_POLICY_LABELS.myPageEntry}
                >
                    {PRIVACY_POLICY_LABELS.myPageEntry}
                </Txt>
                <Txt
                    typography="t6"
                    color="blue500"
                    style={styles.policyLink}
                    onPress={() => setTermsVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel={TERMS_OF_SERVICE_LABELS.myPageEntry}
                >
                    {TERMS_OF_SERVICE_LABELS.myPageEntry}
                </Txt>
            </View>
            {DEV_TEST_TOOLS_ENABLED ? (
                <View style={styles.devBox}>
                    <Txt typography="t7" fontWeight="semibold" color="grey700">
                        [테스트] 출시 전 제거 · `devTestFlags.ts`
                    </Txt>
                    <Button
                        size="medium"
                        type="dark"
                        style="weak"
                        display="block"
                        onPress={() => {
                            void (async () => {
                                await unlockAllRecipesForTest();
                                showSuccess('모든 레시피를 열람 해금했어요. (완성 처리는 아님)');
                            })();
                        }}
                    >
                        모든 레시피 열람 해금
                    </Button>
                    <Button
                        size="medium"
                        type="dark"
                        style="weak"
                        display="block"
                        onPress={() => {
                            void (async () => {
                                await grantTestEcoJam(ECO_JAM_TEST_GRANT);
                                showSuccess(`테스트 에코잼 +${ECO_JAM_TEST_GRANT}`);
                            })();
                        }}
                    >
                        {`에코잼 +${ECO_JAM_TEST_GRANT}`}
                    </Button>
                </View>
            ) : null}
            {onPressRestartOnboarding != null ? (
                <Txt
                    typography="t7"
                    color="blue500"
                    style={styles.restartOnboarding}
                    onPress={() => setRestartConfirmVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="처음부터 다시 시작"
                >
                    처음부터 다시 시작
                </Txt>
            ) : null}
            <Modal
                visible={restartConfirmVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRestartConfirmVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Txt typography="t5" fontWeight="bold">
                            처음부터 다시 시작할까요?
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.modalBody}>
                            온보딩을 다시 진행해요. 지금까지 모은 알맹 포인트, 에코잼, 재료가 모두
                            사라지고 되돌릴 수 없어요.
                        </Txt>
                        <Button
                            size="medium"
                            type="primary"
                            display="block"
                            onPress={() => {
                                setRestartConfirmVisible(false);
                                onPressRestartOnboarding?.();
                            }}
                        >
                            사라지고 다시 시작
                        </Button>
                        <Button
                            size="medium"
                            type="dark"
                            style="weak"
                            display="block"
                            onPress={() => setRestartConfirmVisible(false)}
                        >
                            취소
                        </Button>
                    </View>
                </View>
            </Modal>
            <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
            <TermsOfServiceModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
            <ProfileListModal
                visible={detailModal === 'ecoJam'}
                title="에코잼 내역"
                emptyMessage="아직 내역이 없어요."
                itemCount={ecoJamEntries.length}
                onClose={() => setDetailModal(null)}
            >
                {ecoJamEntries.map((entry) => (
                    <ProfileLedgerRow
                        key={entry.id}
                        label={entry.label}
                        time={formatLedgerTime(entry.at)}
                        deltaLabel={formatLedgerDelta(entry.delta)}
                        deltaPositive={entry.delta >= 0}
                        large
                    />
                ))}
            </ProfileListModal>
            <ProfileListModal
                visible={detailModal === 'almang'}
                title="알맹 포인트 내역"
                emptyMessage="아직 내역이 없어요."
                itemCount={almangEntries.length}
                onClose={() => setDetailModal(null)}
            >
                {almangEntries.map((entry) => (
                    <ProfileLedgerRow
                        key={entry.id}
                        label={entry.label}
                        time={formatLedgerTime(entry.at)}
                        deltaLabel={`${formatLedgerDelta(entry.delta)}P`}
                        deltaPositive={entry.delta >= 0}
                        large
                    />
                ))}
            </ProfileListModal>
            <ProfileListModal
                visible={detailModal === 'soups'}
                title="완성 스프"
                emptyMessage="아직 완성한 스프가 없어요."
                itemCount={completedSoups.length}
                onClose={() => setDetailModal(null)}
            >
                {completedSoups.map((soup) => (
                    <ProfileSoupRow key={soup.id} name={soup.name} imageSource={soup.imageSource} />
                ))}
            </ProfileListModal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        marginBottom: 20,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        marginBottom: 12,
    },
    card: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardPressed: {
        opacity: 0.85,
        borderColor: colors.primary,
    },
    cardIcon: {
        marginRight: 0,
        marginBottom: 2,
    },
    almangLabelRow: {
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 20,
    },
    almangLabelText: {
        textAlign: 'center',
        width: '100%',
    },
    almangInfoAnchor: {
        position: 'absolute',
        left: '50%',
        marginLeft: 40,
        top: 1,
    },
    almangTapArea: {
        alignItems: 'center',
        gap: 2,
        width: '100%',
    },
    section: {
        width: '100%',
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    pendingCard: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.warningBg,
        borderWidth: 1,
        borderColor: colors.warningBorder,
        marginBottom: 8,
        gap: 4,
    },
    restartOnboarding: {
        marginTop: 24,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    devBox: {
        marginTop: 20,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.warningBorder,
        backgroundColor: colors.warningBg,
        gap: 10,
    },
    legalLinkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
    },
    policyLink: {
        textDecorationLine: 'underline',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 24,
        zIndex: 20,
    },
    modalCard: {
        borderRadius: 16,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
    },
    modalBody: {
        lineHeight: 22,
    },
});
