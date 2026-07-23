import { getMissionById } from '@api/mock/missions';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { CenterLoader } from '../../shared/ui/CenterLoader';

type ClaimableItem = {
    missionId: string;
    title: string;
    submittedAt?: string;
};

/**
 * 승인됐지만 아직 수령하지 않은 미션 보상 목록.
 * (오늘·이전 포함 — BE completions 동기화 기준)
 */
export function MissionRewardsPanel() {
    const { state, claimMissionReward, syncMissionCompletions } = useUser();
    const toast = useAppToast();
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            await syncMissionCompletions();
        } finally {
            setLoading(false);
        }
    }, [syncMissionCompletions]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const items = useMemo((): ClaimableItem[] => {
        const rows: ClaimableItem[] = [];
        for (const [missionId, progress] of Object.entries(state.missionProgress)) {
            if (progress.status !== 'claimable') {
                continue;
            }
            const mission = getMissionById(missionId);
            rows.push({
                missionId,
                title: mission?.title ?? missionId,
                submittedAt: progress.submittedAt,
            });
        }
        rows.sort((a, b) => {
            const at = a.submittedAt ?? '';
            const bt = b.submittedAt ?? '';
            return bt.localeCompare(at);
        });
        return rows;
    }, [state.missionProgress]);

    const onClaim = useCallback(
        (missionId: string) => {
            void (async () => {
                setClaimingId(missionId);
                try {
                    const result = await claimMissionReward(missionId);
                    if (!result.ok) {
                        if (result.code === 'MISSION_REWARD_ALREADY_CLAIMED') {
                            toast.showError('이미 받은 보상이에요.');
                        } else if (result.code === 'MISSION_REWARD_CLAIM_NOT_AVAILABLE') {
                            toast.showError('아직 받을 수 없어요. 검수를 확인해 주세요.');
                        } else {
                            toast.showError('보상 수령에 실패했어요.\n잠시 후 다시 시도해 주세요.');
                        }
                        await syncMissionCompletions();
                        return;
                    }
                    toast.showSuccess('보상을 받았어요.');
                    await syncMissionCompletions();
                } finally {
                    setClaimingId(null);
                }
            })();
        },
        [claimMissionReward, syncMissionCompletions, toast],
    );

    if (loading && items.length === 0) {
        return (
            <View style={styles.loaderWrap}>
                <CenterLoader />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Txt typography="t6" color="grey600" style={styles.emptyText}>
                    받을 보상이 없어요.{'\n'}미션 검수가 끝나면 여기에 나타나요.
                </Txt>
                <Button
                    size="medium"
                    type="dark"
                    style="weak"
                    display="block"
                    onPress={() => void refresh()}
                >
                    새로고침
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.list} testID="mission-rewards-panel">
            <Txt typography="t7" color="grey600" style={styles.hint}>
                검수 완료 후 아직 받지 않은 보상이에요. (오늘·이전 포함)
            </Txt>
            {items.map((item) => {
                const busy = claimingId === item.missionId;
                return (
                    <View key={item.missionId} style={styles.card}>
                        <View style={styles.cardText}>
                            <Txt typography="t6" fontWeight="bold">
                                {item.title}
                            </Txt>
                            {item.submittedAt != null ? (
                                <Txt typography="t7" color="grey500">
                                    {formatSubmittedAt(item.submittedAt)}
                                </Txt>
                            ) : null}
                        </View>
                        <Button
                            size="medium"
                            type="primary"
                            loading={busy}
                            disabled={claimingId != null}
                            onPress={() => onClaim(item.missionId)}
                        >
                            수령
                        </Button>
                    </View>
                );
            })}
        </View>
    );
}

function formatSubmittedAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return iso;
    }
    return `${d.getMonth() + 1}/${d.getDate()} 제출`;
}

const styles = StyleSheet.create({
    loaderWrap: {
        minHeight: 160,
        justifyContent: 'center',
    },
    empty: {
        gap: 16,
        paddingVertical: 24,
        paddingHorizontal: 4,
    },
    emptyText: {
        lineHeight: 22,
        textAlign: 'center',
    },
    list: {
        gap: 12,
        paddingBottom: 24,
    },
    hint: {
        lineHeight: 20,
        marginBottom: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F3F0E8',
    },
    cardText: {
        flex: 1,
        gap: 4,
    },
});
