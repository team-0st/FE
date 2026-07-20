import { BottomSheet, Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import {
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
} from 'react-native';
import {
    PRIVACY_POLICY_LABELS,
    PRIVACY_POLICY_META,
} from '../../shared/constants/privacyPolicy';
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

/** 개인정보 처리방침 — TDS BottomSheet */
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

    const closeLabel =
        isConsent && requiredAgreed
            ? PRIVACY_POLICY_LABELS.confirmRead
            : PRIVACY_POLICY_LABELS.close;

    return (
        <BottomSheet.Root
            open={visible}
            onClose={onClose}
            onDimmerClick={onClose}
            header={<BottomSheet.Header>{PRIVACY_POLICY_META.title}</BottomSheet.Header>}
            cta={
                <BottomSheet.CTA size="large" type="dark" style="weak" onPress={onClose}>
                    {closeLabel}
                </BottomSheet.CTA>
            }
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
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
                {isConsent ? (
                    <Txt typography="t7" color="grey600" style={styles.hint}>
                        {requiredAgreed ? '동의 화면으로 돌아가려면 아래 버튼을 눌러 주세요.' : '닫으려면 아래 버튼을 눌러 주세요.'}
                    </Txt>
                ) : null}
            </ScrollView>
        </BottomSheet.Root>
    );
}

const styles = StyleSheet.create({
    scroll: {
        maxHeight: 420,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    hint: {
        marginTop: 12,
        lineHeight: 20,
    },
});
