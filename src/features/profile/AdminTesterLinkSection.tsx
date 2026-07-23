import { readAccessTokenRole } from '@api/accessTokenRole';
import { getAuthSession } from '@api/authSession';
import { ApiClientError } from '@api/client';
import {
    getAdminTesterLink,
    putAdminTesterLink,
    type AdminTesterLink,
} from '@api/testerLink';
import { getTossShareLink } from '@apps-in-toss/framework';
import { Button, TextField, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Clipboard, Pressable, StyleSheet, View } from 'react-native';
import { useAppToast } from '../../shared/feedback/useAppToast';

const DEFAULT_SHARE_URL = 'https://zero-st.com/open';

const EMPTY_ADMIN_LINK: AdminTesterLink = {
    shareUrl: DEFAULT_SHARE_URL,
    deepLink: null,
    deploymentId: null,
    tossShareUrl: null,
    updatedAt: null,
};

/**
 * ADMIN 전용 — 콘솔 deep link를 붙여 고정 공유 URL을 최신화.
 * 저장 시 getTossShareLink로 토스 https 링크를 만들어 BE에 함께 저장한다.
 */
export function AdminTesterLinkSection() {
    const { showSuccess, showError } = useAppToast();
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLink, setAdminLink] = useState<AdminTesterLink>(EMPTY_ADMIN_LINK);
    const [deepLinkInput, setDeepLinkInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [apiReady, setApiReady] = useState(true);

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

                try {
                    const link = await getAdminTesterLink();
                    if (cancelled) {
                        return;
                    }
                    if (link != null) {
                        setAdminLink(link);
                        setDeepLinkInput(link.deepLink ?? '');
                        setApiReady(true);
                    } else {
                        setAdminLink(EMPTY_ADMIN_LINK);
                        setApiReady(false);
                    }
                } catch (error) {
                    if (cancelled) {
                        return;
                    }
                    setAdminLink(EMPTY_ADMIN_LINK);
                    setDeepLinkInput('');
                    const missing =
                        error instanceof ApiClientError &&
                        (error.status === 404 ||
                            error.code === 'RESOURCE_NOT_FOUND');
                    setApiReady(!missing);
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

    const onSave = useCallback(() => {
        void (async () => {
            const trimmed = deepLinkInput.trim();
            if (!trimmed.startsWith('intoss-private://')) {
                showError('intoss-private:// 로 시작하는 링크를 붙여넣어요.');
                return;
            }
            setLoading(true);
            try {
                const tossShareUrl = await getTossShareLink(trimmed);
                if (
                    typeof tossShareUrl !== 'string' ||
                    !tossShareUrl.startsWith('https://')
                ) {
                    showError(
                        '토스 공유 링크를 만들지 못했어요. 토스앱(샌드박스) 안에서 다시 시도해 주세요.',
                    );
                    return;
                }
                const next = await putAdminTesterLink({
                    deepLink: trimmed,
                    tossShareUrl,
                });
                setAdminLink(next);
                setDeepLinkInput(next.deepLink ?? trimmed);
                setApiReady(true);
                showSuccess('테스트 링크를 최신화했어요.');
            } catch (error) {
                if (error instanceof ApiClientError) {
                    if (
                        error.status === 404 ||
                        error.code === 'RESOURCE_NOT_FOUND'
                    ) {
                        showError(
                            '아직 서버에 테스트 링크 API가 없어요. BE 배포 후 다시 저장해 주세요.',
                        );
                    } else {
                        showError(error.message);
                    }
                } else {
                    showError(
                        '저장에 실패했어요. 토스앱 안에서 다시 시도해 주세요.',
                    );
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [deepLinkInput, showError, showSuccess]);

    const onCopyShareUrl = useCallback(() => {
        const url = adminLink.shareUrl || DEFAULT_SHARE_URL;
        Clipboard.setString(url);
        showSuccess('공유 URL을 복사했어요.');
    }, [adminLink.shareUrl, showSuccess]);

    if (!ready || !isAdmin) {
        return null;
    }

    return (
        <View style={styles.wrap} testID="admin-tester-link-section">
            <Txt typography="t5" fontWeight="bold">
                테스트 링크 최신화
            </Txt>
            <Txt typography="t7" color="grey600" style={styles.hint}>
                테스터에게는 고정 URL만 공유하고, 배포가 바뀌면 아래 deep link만
                갱신해요. 저장 시 토스 공유 링크도 함께 만들어 둡니다.
            </Txt>
            {!apiReady ? (
                <Txt typography="t7" color="grey500">
                    서버 API 배포 전이면 저장은 잠시 후 다시 시도해 주세요.
                </Txt>
            ) : null}
            <Pressable onPress={onCopyShareUrl} accessibilityRole="button">
                <Txt typography="t6" color="blue500" style={styles.shareUrl}>
                    {adminLink.shareUrl || DEFAULT_SHARE_URL}
                </Txt>
            </Pressable>
            {adminLink.updatedAt != null ? (
                <Txt typography="t7" color="grey500">
                    마지막 갱신 {adminLink.updatedAt}
                </Txt>
            ) : null}
            {adminLink.tossShareUrl != null ? (
                <Txt typography="t7" color="grey500" style={styles.hint}>
                    토스 공유 링크 준비됨
                </Txt>
            ) : null}
            <TextField
                variant="box"
                label="콘솔 deep link"
                value={deepLinkInput}
                onChangeText={setDeepLinkInput}
                placeholder="intoss-private://0st?_deploymentId=..."
                multiline
            />
            <Button
                display="block"
                loading={loading}
                disabled={loading}
                onPress={onSave}
            >
                저장
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
    shareUrl: {
        textDecorationLine: 'underline',
    },
});
