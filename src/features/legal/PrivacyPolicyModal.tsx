import { Button, Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import {
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    PRIVACY_POLICY_LABELS,
    PRIVACY_POLICY_META,
} from '../../shared/constants/privacyPolicy';
import { colors } from '../../shared/theme/colors';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';

const SCROLL_END_THRESHOLD = 48;

type PrivacyPolicyModalProps = {
    visible: boolean;
    onClose: () => void;
    /**
     * consent: 필수/선택 각각 동의 가능 (온보딩)
     * read: 열람만 (마이 등)
     */
    mode?: 'read' | 'consent';
    requiredAgreed?: boolean;
    optionalAgreed?: boolean;
    onAgreeRequired?: () => void;
    onAgreeOptional?: () => void;
    onDeclineOptional?: () => void;
};

export function PrivacyPolicyModal({
    visible,
    onClose,
    mode = 'read',
    requiredAgreed = false,
    optionalAgreed = false,
    onAgreeRequired,
    onAgreeOptional,
    onDeclineOptional,
}: PrivacyPolicyModalProps) {
    const isConsent = mode === 'consent';
    const [readToEnd, setReadToEnd] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (visible) {
            setReadToEnd(false);
            setViewportHeight(0);
            setContentHeight(0);
        }
    }, [visible]);

    useEffect(() => {
        if (!isConsent || readToEnd) {
            return;
        }
        if (viewportHeight > 0 && contentHeight > 0 && contentHeight <= viewportHeight + SCROLL_END_THRESHOLD) {
            setReadToEnd(true);
        }
    }, [contentHeight, isConsent, readToEnd, viewportHeight]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isConsent || readToEnd) {
            return;
        }
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const distanceFromBottom =
            contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceFromBottom <= SCROLL_END_THRESHOLD) {
            setReadToEnd(true);
        }
    };

    const onScrollLayout = (event: LayoutChangeEvent) => {
        setViewportHeight(event.nativeEvent.layout.height);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {PRIVACY_POLICY_META.title}
                    </Txt>
                    <ScrollView
                        style={styles.scroll}
                        showsVerticalScrollIndicator
                        onScroll={isConsent ? onScroll : undefined}
                        scrollEventThrottle={16}
                        onLayout={isConsent ? onScrollLayout : undefined}
                        onContentSizeChange={
                            isConsent
                                ? (_w, height) => {
                                      setContentHeight(height);
                                  }
                                : undefined
                        }
                    >
                        <PrivacyPolicyContent
                            consentActions={
                                isConsent
                                    ? {
                                          requiredAgreed,
                                          optionalAgreed,
                                          canAgreeRequired: readToEnd,
                                          onAgreeRequired: () => onAgreeRequired?.(),
                                          onAgreeOptional: () => onAgreeOptional?.(),
                                          onDeclineOptional: () => {
                                              onDeclineOptional?.();
                                          },
                                      }
                                    : undefined
                            }
                        />
                    </ScrollView>
                    <Button size="large" type="dark" style="weak" display="block" onPress={onClose}>
                        {isConsent && requiredAgreed
                            ? PRIVACY_POLICY_LABELS.confirmRead
                            : PRIVACY_POLICY_LABELS.close}
                    </Button>
                    {isConsent ? (
                        <Pressable onPress={onClose} accessibilityRole="button">
                            <Txt typography="t7" color="grey600" style={styles.cancel}>
                                {requiredAgreed ? '동의 화면으로' : '닫기'}
                            </Txt>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '92%',
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
        gap: 12,
    },
    title: {
        marginBottom: 4,
    },
    scroll: {
        flexGrow: 0,
        flexShrink: 1,
    },
    cancel: {
        textAlign: 'center',
        paddingVertical: 8,
    },
});
