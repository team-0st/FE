import { findRecipeInCatalog } from '@api/mock/recipeCatalog';
import { Button, ListRow, TextField, Txt, useDialog } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { validateNickname } from '../onboarding/onboardingProfileLogic';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from '../legal/TermsOfServiceModal';
import { ABOUT_ZEROST_LABELS } from '../../shared/constants/aboutZerost';
import { PRIVACY_POLICY_LABELS } from '../../shared/constants/privacyPolicy';
import { TERMS_OF_SERVICE_LABELS } from '../../shared/constants/termsOfService';
import { BRAND_EMOJI } from '../../shared/constants/brandAssets';
import { getAvatarOption } from '../../shared/constants/avatarOptions';
import { AvatarCarouselPicker } from './AvatarCarouselPicker';
import { getSoupImageSource } from '../../shared/constants/soupAssets';
import { PROFILE_CARBON_FOOTPRINT_ICON } from '../../shared/constants/profileCarbonIcon';
import { formatCarbonGrams } from '../missions/carbonReduction';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { formatLedgerDelta } from '../user/ecoJamLedger';
import { useUser } from '../user/UserProvider';
import { ALMANG_UI_COPY } from '../../shared/constants/almangComplianceCopy';
import { DEV_TEST_TOOLS_ENABLED } from '../../shared/dev/devTestFlags';
import {
    ECO_JAM_GACHA_CONSOLATION,
    ECO_JAM_GACHA_PULL_COST,
    ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
    ECO_JAM_TEST_GRANT,
    ECO_JAM_WEEKLY_RECIPE_BASE,
} from '../../shared/constants/ecoJamPolicy';
import { useAppToast } from '../../shared/feedback/useAppToast';
import {
    ProfileLedgerRow,
    ProfileListModal,
    ProfileSoupRow,
} from './ProfileListSection';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type ProfileScreenProps = {
    onPressAbout?: () => void;
    onPressRestartOnboarding?: () => void;
};

type DetailModal = 'ecoJam' | 'almang' | 'soups' | null;

const ECO_JAM_INFO_TITLE = '에코잼 사용처';

/** 한 줄 = 한 문장 */
const ECO_JAM_INFO_LINES = [
    `가챠 뽑기 1회에 ${ECO_JAM_GACHA_PULL_COST}개를 사용해요.`,
    `히든 레시피 해금에 ${ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST}개를 사용해요.`,
    `이번주 레시피를 완성하면 ${ECO_JAM_WEEKLY_RECIPE_BASE}개를 받아요.`,
    `가챠가 꽝이어도 위로로 ${ECO_JAM_GACHA_CONSOLATION}개를 받아요.`,
];

/** 한 줄 = 한 문장 */
export const ALMANG_STORE_INFO_LINES = [
    '포인트가 앱에 적립됐어요.',
    '앱에서 현금으로 바꾸거나 환불할 수 없어요.',
    '알맹상점에 방문해 본인 확인 후 매장 포인트로 이용해 주세요.',
    '앱 안에서는 현금으로 바꾸거나 환불·출금할 수 없어요.',
];

function formatLedgerTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ProfileScreen({
    onPressAbout,
    onPressRestartOnboarding,
}: ProfileScreenProps) {
    const { state, grantTestEcoJam, unlockAllRecipesForTest, updateNickname, updateAvatar } = useUser();
    const { showSuccess } = useAppToast();
    const { openConfirm } = useDialog();
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);
    const [detailModal, setDetailModal] = useState<DetailModal>(null);
    const [nicknameEditVisible, setNicknameEditVisible] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
    const [avatarPreviewId, setAvatarPreviewId] = useState(state.avatarId);
    const avatarOption = getAvatarOption(state.avatarId);
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

    const handleRestartOnboarding = () => {
        if (onPressRestartOnboarding == null) {
            return;
        }
        void (async () => {
            const confirmed = await openConfirm({
                title: '처음부터 다시 시작할까요?',
                description:
                    '온보딩을 다시 진행해요.\n지금까지 모은 알맹 포인트, 에코잼, 재료가 모두 사라지고 되돌릴 수 없어요.',
                leftButton: '취소',
                rightButton: '사라지고 다시 시작',
                closeOnDimmerClick: true,
            });
            if (confirmed) {
                onPressRestartOnboarding();
            }
        })();
    };

    const handleOpenNicknameEdit = () => {
        setNicknameInput(state.nickname);
        setNicknameError(null);
        setNicknameEditVisible(true);
    };

    const handleSaveNickname = () => {
        const result = validateNickname(nicknameInput);
        if (!result.ok) {
            setNicknameError(result.message);
            return;
        }
        void (async () => {
            await updateNickname(result.nickname);
            setNicknameEditVisible(false);
            showSuccess('닉네임을 변경했어요.');
        })();
    };

    const handleOpenAvatarPicker = () => {
        setAvatarPreviewId(state.avatarId);
        setAvatarPickerVisible(true);
    };

    const handleConfirmAvatar = () => {
        void (async () => {
            await updateAvatar(avatarPreviewId);
            setAvatarPickerVisible(false);
        })();
    };

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <Pressable
                    onPress={handleOpenAvatarPicker}
                    accessibilityRole="button"
                    accessibilityLabel="프로필 이미지 변경"
                >
                    <BrandEmojiImage
                        source={avatarOption.source}
                        size={104}
                        containerStyle={styles.avatarCircle}
                        accessibilityLabel="프로필"
                    />
                </Pressable>
            </View>
            <View style={styles.infoCard}>
                <ListRow
                    onPress={handleOpenNicknameEdit}
                    contents={<ListRow.Texts type="1RowTypeA" top="닉네임" />}
                    right={
                        <Txt typography="t6" color="grey600">
                            {state.nickname}
                        </Txt>
                    }
                    withArrow
                />
            </View>
            <View style={styles.infoCard}>
                <ListRow
                    onPress={() => setDetailModal('ecoJam')}
                    left={
                        <BrandEmojiImage
                            source={BRAND_EMOJI.ecoJam}
                            size={32}
                            accessibilityLabel="에코잼"
                        />
                    }
                    contents={
                        <View style={styles.statLabelRow}>
                            <Txt typography="t6" fontWeight="bold">
                                에코잼
                            </Txt>
                            <ProbabilityInfoButton
                                title={ECO_JAM_INFO_TITLE}
                                lines={ECO_JAM_INFO_LINES}
                                footnote={null}
                            />
                        </View>
                    }
                    right={
                        <Txt typography="t6" color="grey600">
                            {state.ecoJam}
                        </Txt>
                    }
                    withArrow
                />
                <ListRow
                    onPress={() => setDetailModal('almang')}
                    left={
                        <BrandEmojiImage
                            source={BRAND_EMOJI.almangPoint}
                            size={32}
                            accessibilityLabel="알맹 포인트"
                        />
                    }
                    contents={
                        <View style={styles.statLabelRow}>
                            <Txt typography="t6" fontWeight="bold">
                                알맹 포인트
                            </Txt>
                            <ProbabilityInfoButton
                                title={ALMANG_UI_COPY.bannerTitle}
                                lines={ALMANG_STORE_INFO_LINES}
                                footnote={null}
                            />
                        </View>
                    }
                    right={
                        <View style={styles.statValueCol}>
                            <Txt typography="t6" color="grey600">
                                {state.totalPoints}P
                            </Txt>
                            {state.almangPayoutConsent === 'declined' ? (
                                <Txt typography="t7" color="grey500">
                                    매장 연동 대기
                                </Txt>
                            ) : null}
                        </View>
                    }
                    withArrow
                />
                <ListRow
                    onPress={() => setDetailModal('soups')}
                    left={
                        <BrandEmojiImage
                            source={BRAND_EMOJI.completedSoups}
                            size={32}
                            accessibilityLabel="완성 스프"
                        />
                    }
                    contents={<ListRow.Texts type="1RowTypeA" top="완성 스프" />}
                    right={
                        <Txt typography="t6" color="grey600">
                            {completed}개
                        </Txt>
                    }
                    withArrow
                />
                <ListRow
                    left={
                        <BrandEmojiImage
                            source={PROFILE_CARBON_FOOTPRINT_ICON}
                            size={32}
                            accessibilityLabel="탄소 절감량"
                        />
                    }
                    contents={<ListRow.Texts type="1RowTypeA" top="탄소 절감량" />}
                    right={
                        <Txt typography="t6" color="grey600">
                            {formatCarbonGrams(state.totalCo2ReductionGrams)}
                        </Txt>
                    }
                />
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
            {onPressAbout != null ? (
                <View style={styles.aboutLinkRow}>
                    <Txt
                        typography="t6"
                        color="blue500"
                        style={styles.policyLink}
                        onPress={onPressAbout}
                        accessibilityRole="button"
                        accessibilityLabel={ABOUT_ZEROST_LABELS.myPageEntry}
                    >
                        {ABOUT_ZEROST_LABELS.myPageEntry}
                    </Txt>
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
            {onPressRestartOnboarding != null ? (
                <Txt
                    typography="t7"
                    color="blue500"
                    style={styles.restartOnboarding}
                    onPress={handleRestartOnboarding}
                    accessibilityRole="button"
                    accessibilityLabel="처음부터 다시 시작"
                >
                    처음부터 다시 시작
                </Txt>
            ) : null}
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
            <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
            <TermsOfServiceModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
            <Modal
                visible={nicknameEditVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setNicknameEditVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setNicknameEditVisible(false)}>
                    <View style={styles.sheet} onStartShouldSetResponder={() => true}>
                        <Txt typography="t5" fontWeight="bold" style={styles.sheetTitle}>
                            닉네임 수정
                        </Txt>
                        <TextField
                            variant="line"
                            label="닉네임"
                            value={nicknameInput}
                            onChangeText={(value) => {
                                setNicknameInput(value);
                                setNicknameError(null);
                            }}
                            autoFocus
                            maxLength={12}
                        />
                        {nicknameError != null ? (
                            <Txt typography="t7" color="red500">
                                {nicknameError}
                            </Txt>
                        ) : null}
                        <Button
                            size="medium"
                            type="primary"
                            display="block"
                            onPress={handleSaveNickname}
                        >
                            저장
                        </Button>
                        <Button
                            size="medium"
                            type="dark"
                            style="weak"
                            display="block"
                            onPress={() => setNicknameEditVisible(false)}
                        >
                            취소
                        </Button>
                    </View>
                </Pressable>
            </Modal>
            <Modal
                visible={avatarPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAvatarPickerVisible(false)}
            >
                <View style={styles.overlay}>
                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setAvatarPickerVisible(false)}
                    />
                    <View style={styles.sheet}>
                        <Txt typography="t5" fontWeight="bold" style={styles.sheetTitle}>
                            프로필 이미지 선택
                        </Txt>
                        <AvatarCarouselPicker selectedId={avatarPreviewId} onChange={setAvatarPreviewId} />
                        <Button size="medium" type="primary" display="block" onPress={handleConfirmAvatar}>
                            선택
                        </Button>
                        <Button
                            size="medium"
                            type="dark"
                            style="weak"
                            display="block"
                            onPress={() => setAvatarPickerVisible(false)}
                        >
                            취소
                        </Button>
                    </View>
                </View>
            </Modal>
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
        marginBottom: 16,
        gap: 4,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.border,
    },
    infoCard: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        overflow: 'hidden',
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValueCol: {
        alignItems: 'flex-end',
        gap: 2,
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
    devBox: {
        marginTop: 20,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.warningBorder,
        backgroundColor: colors.warningBg,
        gap: 10,
    },
    aboutLinkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    legalLinkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
    },
    policyLink: {
        textDecorationLine: 'underline',
    },
    restartOnboarding: {
        marginTop: 24,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 20,
    },
    sheet: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sheetTitle: {
        marginBottom: 4,
    },
});
