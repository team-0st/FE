import { readAccessTokenRole } from '@api/accessTokenRole';
import { getAuthSession } from '@api/authSession';
import { ApiClientError } from '@api/client';
import {
    getAdminUsers,
    postAdminAssetGrant,
    type AdminAssetType,
    type AdminUserSummary,
} from '@api/adminAssets';
import { Button, TextField, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { colors } from '../../shared/theme/colors';

/**
 * ADMIN 전용 — 선택한 유저에게 에코잼 또는 알맹 포인트를 지급.
 */
export function AdminAssetGrantSection() {
    const { showSuccess, showError } = useAppToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [ready, setReady] = useState(false);
    const [users, setUsers] = useState<AdminUserSummary[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [assetType, setAssetType] = useState<AdminAssetType>('ECO_JAM');
    const [amountText, setAmountText] = useState('500');
    const [loading, setLoading] = useState(false);
    const [apiReady, setApiReady] = useState(true);

    const loadUsers = useCallback(async () => {
        try {
            const list = await getAdminUsers();
            if (list == null) {
                setIsAdmin(false);
                setUsers([]);
                return;
            }
            setIsAdmin(true);
            setUsers(list);
            setApiReady(true);
        } catch (error) {
            setUsers([]);
            const missing =
                error instanceof ApiClientError &&
                (error.status === 404 || error.code === 'RESOURCE_NOT_FOUND');
            setApiReady(!missing);
            if (!missing && error instanceof ApiClientError) {
                showError(error.message);
            }
        }
    }, [showError]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const session = await getAuthSession();
                const role = readAccessTokenRole(session?.accessToken);
                if (cancelled) {
                    return;
                }
                if (role !== 'ADMIN') {
                    setIsAdmin(false);
                    return;
                }
                setIsAdmin(true);
                await loadUsers();
            } finally {
                if (!cancelled) {
                    setReady(true);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [loadUsers]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const toggleUser = (userId: number) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
        );
    };

    const onGrant = useCallback(() => {
        void (async () => {
            const amount = Number.parseInt(amountText.replace(/\D/g, ''), 10);
            if (!Number.isFinite(amount) || amount <= 0) {
                showError('지급 수량을 1 이상 입력해 주세요.');
                return;
            }
            if (selectedIds.length === 0) {
                showError('지급할 사용자를 선택해 주세요.');
                return;
            }
            setLoading(true);
            try {
                const result = await postAdminAssetGrant({
                    userIds: selectedIds,
                    assetType,
                    amount,
                });
                showSuccess(
                    `${result.grantedUserCount}명에게 ${assetType === 'ECO_JAM' ? '에코잼' : '알맹P'} ${result.totalGrantedAmount} 지급했어요.`,
                );
                setSelectedIds([]);
                await loadUsers();
            } catch (error) {
                if (error instanceof ApiClientError) {
                    showError(error.message);
                } else {
                    showError('지급에 실패했어요. 잠시 후 다시 시도해 주세요.');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [amountText, assetType, loadUsers, selectedIds, showError, showSuccess]);

    if (!ready || !isAdmin) {
        return null;
    }

    return (
        <View style={styles.wrap} testID="admin-asset-grant-section">
            <Txt typography="t5" fontWeight="bold">
                에코잼·알맹P 지급
            </Txt>
            <Txt typography="t7" color="grey600" style={styles.hint}>
                사용자를 선택하고 지급할 자산과 수량을 정한 뒤 지급해요.
            </Txt>
            {!apiReady ? (
                <Txt typography="t7" color="grey500">
                    서버 API 배포 전이면 잠시 후 다시 열어 주세요.
                </Txt>
            ) : null}
            <View style={styles.typeRow}>
                <Pressable
                    onPress={() => setAssetType('ECO_JAM')}
                    style={[styles.typeChip, assetType === 'ECO_JAM' && styles.typeChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: assetType === 'ECO_JAM' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="semibold"
                        color={assetType === 'ECO_JAM' ? 'blue500' : 'grey700'}
                    >
                        에코잼
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setAssetType('POINT')}
                    style={[styles.typeChip, assetType === 'POINT' && styles.typeChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: assetType === 'POINT' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="semibold"
                        color={assetType === 'POINT' ? 'blue500' : 'grey700'}
                    >
                        알맹 포인트
                    </Txt>
                </Pressable>
            </View>
            <TextField
                variant="box"
                label="지급 수량"
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="number-pad"
                placeholder="500"
            />
            <Txt typography="t7" color="grey600">
                전체 {users.length}명 · 선택 {selectedIds.length}명
            </Txt>
            <ScrollView
                style={styles.userList}
                contentContainerStyle={styles.userListContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
            >
                {users.map((user) => {
                    const selected = selectedSet.has(user.userId);
                    const label =
                        user.nickname?.trim() ||
                        user.phoneNumber ||
                        `유저 #${user.userId}`;
                    return (
                        <Pressable
                            key={user.userId}
                            onPress={() => toggleUser(user.userId)}
                            style={[styles.userRow, selected && styles.userRowSelected]}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: selected }}
                        >
                            <Txt typography="t6" color="grey800" fontWeight={selected ? 'bold' : 'medium'}>
                                {selected ? '✓ ' : ''}
                                {label}
                            </Txt>
                            <Txt typography="t7" color="grey500">
                                #{user.userId} · 잼 {user.ecoJam} · P {user.point}
                                {user.onboardingCompleted ? '' : ' · 미완료'}
                            </Txt>
                        </Pressable>
                    );
                })}
            </ScrollView>
            <Button display="block" loading={loading} disabled={loading || !apiReady} onPress={onGrant}>
                지급하기
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: 10,
        marginTop: 24,
        marginBottom: 8,
    },
    hint: {
        lineHeight: 20,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    typeChipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    userList: {
        maxHeight: 360,
    },
    userListContent: {
        gap: 6,
        paddingBottom: 4,
    },
    userRow: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 2,
    },
    userRowSelected: {
        borderColor: colors.primary,
    },
});
