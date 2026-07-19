import { findRecipeInCatalog } from '@api/mock/recipeCatalog';
import { Top, Txt } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { PRIVACY_POLICY_LABELS } from '../../shared/constants/privacyPolicy';
import { BRAND_EMOJI } from '../../shared/constants/brandAssets';
import { getSoupImageSource } from '../../shared/constants/soupAssets';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { formatLedgerDelta } from '../user/ecoJamLedger';
import { listIngredientStock } from '../user/ingredientInventory';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { shouldShowAlmangPayoutBanner } from '../user/almangPayoutCopy';
import {
    ProfileIngredientRow,
    ProfileLedgerRow,
    ProfileListModal,
    ProfileListSection,
    ProfileSoupRow,
} from './ProfileListSection';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type ProfileScreenProps = {
    onPressChangeShop?: () => void;
    onPressRestartOnboarding?: () => void;
};

type DetailModal = 'ecoJam' | 'almang' | 'soups' | null;

function formatLedgerTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ProfileScreen({ onPressChangeShop, onPressRestartOnboarding }: ProfileScreenProps) {
    const { state } = useUser();
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [detailModal, setDetailModal] = useState<DetailModal>(null);
    const shopName = resolveShopName(state.shopId);
    const completed = state.completedRecipeIds.length;
    const ingredientRows = listIngredientStock(state.ingredientInventory);
    const ownedCount = ingredientRows.filter((row) => row.count > 0).length;
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
                    style={styles.card}
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
                </Pressable>
                <Pressable
                    style={styles.card}
                    onPress={() => setDetailModal('almang')}
                    accessibilityRole="button"
                    accessibilityLabel={`알맹 포인트 ${state.totalPoints}P, 내역 보기`}
                >
                    <BrandEmojiImage
                        source={BRAND_EMOJI.almangPoint}
                        size={48}
                        containerStyle={styles.cardIcon}
                        accessibilityLabel="알맹 포인트"
                    />
                    <Txt typography="t7" color="grey600">
                        알맹 포인트
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {state.totalPoints}P
                    </Txt>
                    {state.almangPayoutConsent === 'declined' ? (
                        <Txt typography="t7" color="grey600">
                            지급 대기
                        </Txt>
                    ) : null}
                </Pressable>
                <Pressable
                    style={styles.card}
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
                </Pressable>
            </View>
            {shouldShowAlmangPayoutBanner(state) ? (
                <View style={styles.payoutBanner}>
                    <Txt typography="t6" fontWeight="semibold">
                        알맹 포인트 지급 안내
                    </Txt>
                    <Txt typography="t7" color="grey700">
                        {'포인트는 적립됐어요.\n지급받으려면 알맹상점에 방문해 주세요.\n전화번호 동의 후 매장에서 본인 확인을 거쳐 드려요.'}
                    </Txt>
                </View>
            ) : null}
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
            <ProfileListSection
                title="보유 재료"
                hint={
                    ownedCount > 0
                        ? `보유 중 ${ownedCount}종 · 제작 탭에서 스프에 사용해요`
                        : '미션·출석을 완료하면 재료를 받을 수 있어요'
                }
                emptyMessage="보유한 재료가 없어요."
                expandLabel="크게 보기"
                itemCount={ingredientRows.length}
                expandedChildren={ingredientRows.map((item) => (
                    <ProfileIngredientRow
                        key={item.id}
                        name={item.name}
                        countLabel={`${item.count}개`}
                        hasStock={item.count > 0}
                        imageSource={item.imageSource}
                        large
                    />
                ))}
            >
                {ingredientRows.map((item) => (
                    <ProfileIngredientRow
                        key={item.id}
                        name={item.name}
                        countLabel={item.count > 0 ? `${item.count}개` : '0개'}
                        hasStock={item.count > 0}
                        imageSource={item.imageSource}
                    />
                ))}
            </ProfileListSection>
            <View style={styles.cardWide}>
                <Txt typography="t7" color="grey600">
                    이번 주 미션
                </Txt>
                <Txt typography="t5" fontWeight="bold">
                    {state.weeklyMissionDone}/{state.weeklyMissionTotal}
                </Txt>
            </View>
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
            {onPressRestartOnboarding != null ? (
                <Txt
                    typography="t7"
                    color="blue500"
                    style={styles.restartOnboarding}
                    onPress={onPressRestartOnboarding}
                    accessibilityRole="button"
                    accessibilityLabel="처음부터 다시 시작"
                >
                    처음부터 다시 시작
                </Txt>
            ) : null}
            <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
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
    cardIcon: {
        marginRight: 0,
        marginBottom: 2,
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
        backgroundColor: '#FFF8E7',
        borderWidth: 1,
        borderColor: '#FFB800',
        marginBottom: 8,
        gap: 4,
    },
    payoutBanner: {
        width: '100%',
        marginBottom: 16,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#FFF8E7',
        borderWidth: 1,
        borderColor: '#FFB800',
        gap: 6,
    },
    cardWide: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    restartOnboarding: {
        marginTop: 24,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    policyLink: {
        marginTop: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
