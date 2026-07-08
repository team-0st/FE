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
    /** true면 「확인했어요」로 전문 확인 처리 (온보딩 동의 전) */
    requireAcknowledge?: boolean;
    onAcknowledge?: () => void;
};

export function PrivacyPolicyModal({
    visible,
    onClose,
    requireAcknowledge = false,
    onAcknowledge,
}: PrivacyPolicyModalProps) {
    const handleAcknowledge = () => {
        onAcknowledge?.();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {PRIVACY_POLICY_META.title}
                    </Txt>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
                        <PrivacyPolicyContent />
                    </ScrollView>
                    {requireAcknowledge ? (
                        <Button size="large" type="primary" display="block" onPress={handleAcknowledge}>
                            {PRIVACY_POLICY_LABELS.confirmRead}
                        </Button>
                    ) : (
                        <Button size="large" type="dark" style="weak" display="block" onPress={onClose}>
                            {PRIVACY_POLICY_LABELS.close}
                        </Button>
                    )}
                    {requireAcknowledge ? (
                        <Pressable onPress={onClose} accessibilityRole="button">
                            <Txt typography="t7" color="grey600" style={styles.cancel}>
                                닫기
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
