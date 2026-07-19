import { Button, Txt } from '@toss/tds-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    PRIVACY_POLICY_LABELS,
    PRIVACY_POLICY_META,
} from '../../shared/constants/privacyPolicy';
import { colors } from '../../shared/theme/colors';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';

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

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {PRIVACY_POLICY_META.title}
                    </Txt>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
                        <PrivacyPolicyContent
                            consentActions={
                                isConsent
                                    ? {
                                          requiredAgreed,
                                          optionalAgreed,
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
    },
    cancel: {
        textAlign: 'center',
        paddingVertical: 8,
    },
});
