import { readAccessTokenRole } from '@api/accessTokenRole';
import { getAuthSession } from '@api/authSession';
import { Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type AdminReviewEntryProps = {
    onPress: () => void;
};

/**
 * ADMIN 전용 — 마이에서 검수 화면으로 들어가는 진입 행.
 */
export function AdminReviewEntry({ onPress }: AdminReviewEntryProps) {
    const [ready, setReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const session = await getAuthSession();
                const role = readAccessTokenRole(session?.accessToken);
                if (!cancelled) {
                    setIsAdmin(role === 'ADMIN');
                }
            } finally {
                if (!cancelled) {
                    setReady(true);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!ready || !isAdmin) {
        return null;
    }

    return (
        <View style={styles.wrap} testID="admin-review-entry">
            <Txt typography="t5" fontWeight="bold">
                관리
            </Txt>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="미션 검수 열기"
                style={styles.row}
            >
                <View style={styles.rowText}>
                    <Txt typography="t6" fontWeight="bold">
                        미션 검수
                    </Txt>
                    <Txt typography="t7" color="grey600">
                        일일·공동 인증을 승인하거나 반려해요.
                    </Txt>
                </View>
                <Txt typography="t6" color="blue500">
                    열기
                </Txt>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: 10,
        marginTop: 24,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#F3F0E8',
    },
    rowText: {
        flex: 1,
        gap: 4,
    },
});
