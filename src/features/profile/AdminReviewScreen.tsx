import { ApiClientError } from '@api/client';
import {
    getAdminCommunityProofsPending,
    getAdminCommunityProofsReviewed,
    getAdminMissionCompletionsPending,
    getAdminMissionCompletionsReviewed,
    postAdminCommunityProofReview,
    postAdminMissionCompletionReview,
    resolveCommunityReviewPhotoUris,
    resolveDailyReviewPhotoUri,
    type AdminCommunityProofPendingItem,
    type AdminCommunityProofReviewedItem,
    type AdminMissionPendingItem,
    type AdminMissionReviewedItem,
    type AdminReviewStatus,
} from '@api/adminMissionReview';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { Screen } from '../../shared/ui/Screen';
import { CenterLoader } from '../../shared/ui/CenterLoader';
import { colors } from '../../shared/theme/colors';

type ReviewTab = 'daily' | 'community' | 'completed';

type CompletedRow =
    | { kind: 'daily'; item: AdminMissionReviewedItem }
    | { kind: 'community'; item: AdminCommunityProofReviewedItem };

type PhotoPreview = {
    title: string;
    uris: string[];
    hint?: string;
};

function formatSubmittedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return iso;
    }
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
}

/**
 * 관리자 미션 검수 화면 — 목록(오래된 순) + 행 옆 승인/반려 + 탭 시 사진.
 */
export function AdminReviewScreen() {
    const { showSuccess, showError } = useAppToast();
    const [tab, setTab] = useState<ReviewTab>('daily');
    const [dailyItems, setDailyItems] = useState<AdminMissionPendingItem[]>([]);
    const [communityItems, setCommunityItems] = useState<AdminCommunityProofPendingItem[]>(
        [],
    );
    const [reviewedDaily, setReviewedDaily] = useState<AdminMissionReviewedItem[]>([]);
    const [reviewedCommunity, setReviewedCommunity] = useState<
        AdminCommunityProofReviewedItem[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);
    const [actingId, setActingId] = useState<string | null>(null);
    const [preview, setPreview] = useState<PhotoPreview | null>(null);
    const [imageFailed, setImageFailed] = useState(false);

    const completedRows = useMemo((): CompletedRow[] => {
        const rows: CompletedRow[] = [
            ...reviewedDaily.map((item) => ({ kind: 'daily' as const, item })),
            ...reviewedCommunity.map((item) => ({ kind: 'community' as const, item })),
        ];
        rows.sort((a, b) => {
            const aKey = a.item.reviewedAt ?? a.item.submittedAt;
            const bKey = b.item.reviewedAt ?? b.item.submittedAt;
            return bKey.localeCompare(aKey);
        });
        return rows;
    }, [reviewedCommunity, reviewedDaily]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [daily, community, dailyDone, communityDone] = await Promise.all([
                getAdminMissionCompletionsPending(),
                getAdminCommunityProofsPending({ page: 0, size: 50 }),
                getAdminMissionCompletionsReviewed(),
                getAdminCommunityProofsReviewed({ page: 0, size: 50 }),
            ]);
            if (daily == null || community == null) {
                setForbidden(true);
                setDailyItems([]);
                setCommunityItems([]);
                setReviewedDaily([]);
                setReviewedCommunity([]);
                return;
            }
            setForbidden(false);
            setDailyItems(daily);
            setCommunityItems(community.items ?? []);
            setReviewedDaily(dailyDone ?? []);
            setReviewedCommunity(communityDone?.items ?? []);
        } catch (error) {
            setDailyItems([]);
            setCommunityItems([]);
            setReviewedDaily([]);
            setReviewedCommunity([]);
            if (error instanceof ApiClientError) {
                showError(error.message);
            } else {
                showError('검수 목록을 불러오지 못했어요.');
            }
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const reviewDaily = useCallback(
        (completionId: number, status: AdminReviewStatus) => {
            void (async () => {
                const actionKey = `d-${completionId}`;
                setActingId(actionKey);
                try {
                    await postAdminMissionCompletionReview(completionId, status);
                    showSuccess(status === 'APPROVED' ? '승인했어요.' : '반려했어요.');
                    await refresh();
                } catch (error) {
                    if (error instanceof ApiClientError) {
                        showError(error.message);
                    } else {
                        showError('검수 처리에 실패했어요.');
                    }
                } finally {
                    setActingId(null);
                }
            })();
        },
        [refresh, showError, showSuccess],
    );

    const reviewCommunity = useCallback(
        (proofId: number, status: AdminReviewStatus) => {
            void (async () => {
                const actionKey = `c-${proofId}`;
                setActingId(actionKey);
                try {
                    await postAdminCommunityProofReview(proofId, status);
                    showSuccess(status === 'APPROVED' ? '승인했어요.' : '반려했어요.');
                    await refresh();
                } catch (error) {
                    if (error instanceof ApiClientError) {
                        showError(error.message);
                    } else {
                        showError('검수 처리에 실패했어요.');
                    }
                } finally {
                    setActingId(null);
                }
            })();
        },
        [refresh, showError, showSuccess],
    );

    const openDailyPhoto = (item: AdminMissionPendingItem | AdminMissionReviewedItem) => {
        const uri = resolveDailyReviewPhotoUri(item);
        setImageFailed(false);
        setPreview({
            title: item.missionTitle,
            uris: uri != null ? [uri] : [],
            hint: item.photoUrl == null ? item.photoKey : undefined,
        });
    };

    const openCommunityPhoto = (
        item: AdminCommunityProofPendingItem | AdminCommunityProofReviewedItem,
    ) => {
        const uris = resolveCommunityReviewPhotoUris(item);
        setImageFailed(false);
        setPreview({
            title: item.communityMissionTitle,
            uris,
            hint:
                (item.imageUrls == null || item.imageUrls.length === 0) &&
                item.imageKeys.length > 0
                    ? item.imageKeys.join(', ')
                    : undefined,
        });
    };

    if (loading && dailyItems.length === 0 && communityItems.length === 0) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    if (forbidden) {
        return (
            <Screen>
                <Top title={<Top.TitleParagraph size={22}>미션 검수</Top.TitleParagraph>} />
                <Txt typography="t6" color="grey600" style={styles.pad}>
                    관리자만 이용할 수 있어요.
                </Txt>
            </Screen>
        );
    }

    return (
        <Screen>
            <Top
                title={<Top.TitleParagraph size={22}>미션 검수</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>
                        오래된 제출이 위에 보여요. 줄을 누르면 사진을 봐요.
                    </Top.SubtitleParagraph>
                }
            />

            <View style={styles.tabRow}>
                <Pressable
                    onPress={() => setTab('daily')}
                    style={[styles.tab, tab === 'daily' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: tab === 'daily' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={tab === 'daily' ? 'white' : 'grey700'}
                    >
                        {`일일 (${dailyItems.length})`}
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setTab('community')}
                    style={[styles.tab, tab === 'community' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: tab === 'community' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={tab === 'community' ? 'white' : 'grey700'}
                    >
                        {`공동 (${communityItems.length})`}
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setTab('completed')}
                    style={[styles.tab, tab === 'completed' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: tab === 'completed' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={tab === 'completed' ? 'white' : 'grey700'}
                    >
                        {`완료 (${completedRows.length})`}
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => void refresh()}
                    disabled={loading || actingId != null}
                    accessibilityRole="button"
                    style={styles.refresh}
                >
                    <Txt typography="t7" color="blue500">
                        새로고침
                    </Txt>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {tab === 'daily' && dailyItems.length === 0 ? (
                    <Txt typography="t7" color="grey500">
                        대기 중인 일일 미션이 없어요.
                    </Txt>
                ) : null}
                {tab === 'daily'
                    ? dailyItems.map((item) => {
                          const busy = actingId === `d-${item.completionId}`;
                          return (
                              <View key={item.completionId} style={styles.row}>
                                  <Pressable
                                      style={styles.rowMain}
                                      onPress={() => openDailyPhoto(item)}
                                      accessibilityRole="button"
                                      accessibilityLabel="인증 사진 보기"
                                  >
                                      <Txt typography="t6" fontWeight="bold" numberOfLines={1}>
                                          {item.missionTitle}
                                      </Txt>
                                      <Txt typography="t7" color="grey600" numberOfLines={1}>
                                          {`${item.userNickname ?? `유저 ${item.userId}`} · ${formatSubmittedAt(item.submittedAt)}`}
                                      </Txt>
                                  </Pressable>
                                  <View style={styles.rowActions}>
                                      <Button
                                          size="tiny"
                                          loading={busy}
                                          disabled={actingId != null}
                                          onPress={() =>
                                              reviewDaily(item.completionId, 'APPROVED')
                                          }
                                      >
                                          승인
                                      </Button>
                                      <Button
                                          size="tiny"
                                          type="dark"
                                          style="weak"
                                          loading={busy}
                                          disabled={actingId != null}
                                          onPress={() =>
                                              reviewDaily(item.completionId, 'REJECTED')
                                          }
                                      >
                                          반려
                                      </Button>
                                  </View>
                              </View>
                          );
                      })
                    : null}

                {tab === 'community' && communityItems.length === 0 ? (
                    <Txt typography="t7" color="grey500">
                        대기 중인 공동 미션이 없어요.
                    </Txt>
                ) : null}
                {tab === 'community'
                    ? communityItems.map((item) => {
                          const busy = actingId === `c-${item.proofId}`;
                          return (
                              <View key={item.proofId} style={styles.row}>
                                  <Pressable
                                      style={styles.rowMain}
                                      onPress={() => openCommunityPhoto(item)}
                                      accessibilityRole="button"
                                      accessibilityLabel="인증 사진 보기"
                                  >
                                      <Txt typography="t6" fontWeight="bold" numberOfLines={1}>
                                          {item.communityMissionTitle}
                                      </Txt>
                                      <Txt typography="t7" color="grey600" numberOfLines={2}>
                                          {`${item.requirementTitle ?? `${item.proofOrder}단계`} · ${item.nickname ?? `유저 ${item.userId}`} · ${formatSubmittedAt(item.submittedAt)}`}
                                      </Txt>
                                  </Pressable>
                                  <View style={styles.rowActions}>
                                      <Button
                                          size="tiny"
                                          loading={busy}
                                          disabled={actingId != null}
                                          onPress={() =>
                                              reviewCommunity(item.proofId, 'APPROVED')
                                          }
                                      >
                                          승인
                                      </Button>
                                      <Button
                                          size="tiny"
                                          type="dark"
                                          style="weak"
                                          loading={busy}
                                          disabled={actingId != null}
                                          onPress={() =>
                                              reviewCommunity(item.proofId, 'REJECTED')
                                          }
                                      >
                                          반려
                                      </Button>
                                  </View>
                              </View>
                          );
                      })
                    : null}

                {tab === 'completed' && completedRows.length === 0 ? (
                    <Txt typography="t7" color="grey500">
                        검수 완료된 제출이 없어요.
                    </Txt>
                ) : null}
                {tab === 'completed'
                    ? completedRows.map((row) => {
                          if (row.kind === 'daily') {
                              const item = row.item;
                              const statusLabel =
                                  item.status === 'APPROVED' ? '승인' : '반려';
                              return (
                                  <Pressable
                                      key={`rd-${item.completionId}`}
                                      style={styles.row}
                                      onPress={() => openDailyPhoto(item)}
                                      accessibilityRole="button"
                                      accessibilityLabel="검수 완료 사진 보기"
                                  >
                                      <View style={styles.rowMain}>
                                          <Txt
                                              typography="t6"
                                              fontWeight="bold"
                                              numberOfLines={1}
                                          >
                                              {`[일일] ${item.missionTitle}`}
                                          </Txt>
                                          <Txt typography="t7" color="grey600" numberOfLines={2}>
                                              {`${statusLabel} · ${item.userNickname ?? `유저 ${item.userId}`} · ${formatSubmittedAt(item.reviewedAt ?? item.submittedAt)}`}
                                          </Txt>
                                      </View>
                                  </Pressable>
                              );
                          }
                          const item = row.item;
                          const statusLabel = item.status === 'APPROVED' ? '승인' : '반려';
                          return (
                              <Pressable
                                  key={`rc-${item.proofId}`}
                                  style={styles.row}
                                  onPress={() => openCommunityPhoto(item)}
                                  accessibilityRole="button"
                                  accessibilityLabel="검수 완료 사진 보기"
                              >
                                  <View style={styles.rowMain}>
                                      <Txt typography="t6" fontWeight="bold" numberOfLines={1}>
                                          {`[공동] ${item.communityMissionTitle}`}
                                      </Txt>
                                      <Txt typography="t7" color="grey600" numberOfLines={2}>
                                          {`${statusLabel} · ${item.requirementTitle ?? `${item.proofOrder}단계`} · ${item.nickname ?? `유저 ${item.userId}`} · ${formatSubmittedAt(item.reviewedAt ?? item.submittedAt)}`}
                                      </Txt>
                                  </View>
                              </Pressable>
                          );
                      })
                    : null}
            </ScrollView>

            <Modal
                visible={preview != null}
                transparent
                animationType="fade"
                onRequestClose={() => setPreview(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setPreview(null)}>
                    <View
                        style={styles.modalSheet}
                        onStartShouldSetResponder={() => true}
                    >
                        <Txt typography="t5" fontWeight="bold" style={styles.modalTitle}>
                            {preview?.title ?? '인증 사진'}
                        </Txt>
                        {preview != null && preview.uris.length > 0 && !imageFailed ? (
                            preview.uris.map((uri) => (
                                <Image
                                    key={uri}
                                    source={{ uri }}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                    onError={() => setImageFailed(true)}
                                    accessibilityLabel="인증 사진"
                                />
                            ))
                        ) : (
                            <Txt typography="t6" color="grey600" style={styles.modalHint}>
                                사진을 불러올 수 없어요.{'\n'}
                                서버에서 photoUrl(또는 서명 URL)이 필요해요.
                            </Txt>
                        )}
                        {preview?.hint != null ? (
                            <Txt typography="t7" color="grey500" numberOfLines={3}>
                                {preview.hint}
                            </Txt>
                        ) : null}
                        <Button
                            display="block"
                            type="dark"
                            style="weak"
                            onPress={() => setPreview(null)}
                        >
                            닫기
                        </Button>
                    </View>
                </Pressable>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    pad: {
        padding: 16,
        lineHeight: 22,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.border,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    refresh: {
        marginLeft: 'auto',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F3F0E8',
    },
    rowMain: {
        flex: 1,
        gap: 4,
        minWidth: 0,
    },
    rowActions: {
        gap: 6,
        alignItems: 'stretch',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 20,
    },
    modalSheet: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    modalTitle: {
        marginBottom: 4,
    },
    modalHint: {
        lineHeight: 22,
    },
    previewImage: {
        width: '100%',
        height: 320,
        backgroundColor: '#eee',
        borderRadius: 10,
    },
});
