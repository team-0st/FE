import { Button, Txt } from '@toss/tds-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    CAMERA_POLICY_LABELS,
    CAMERA_POLICY_META,
    CAMERA_POLICY_SECTIONS,
} from '../../shared/constants/cameraPolicy';
import { colors } from '../../shared/theme/colors';

type CameraConsentModalProps = {
    visible: boolean;
    onClose: () => void;
    onAgree: () => void;
    onDecline: () => void;
};

export function CameraConsentModal({ visible, onClose, onAgree, onDecline }: CameraConsentModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {CAMERA_POLICY_META.title}
                    </Txt>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
                        {CAMERA_POLICY_SECTIONS.map((section) => (
                            <View key={section.heading} style={styles.block}>
                                <Txt typography="t6" fontWeight="semibold">
                                    {section.heading}
                                </Txt>
                                <Txt typography="t7" color="grey700" style={styles.body}>
                                    {section.body}
                                </Txt>
                            </View>
                        ))}
                    </ScrollView>
                    <Button size="large" type="primary" display="block" onPress={onAgree}>
                        {CAMERA_POLICY_LABELS.agree}
                    </Button>
                    <Button size="medium" type="dark" style="weak" display="block" onPress={onDecline}>
                        {CAMERA_POLICY_LABELS.decline}
                    </Button>
                    <Pressable onPress={onClose} accessibilityRole="button">
                        <Txt typography="t7" color="grey600" style={styles.cancel}>
                            {CAMERA_POLICY_LABELS.close}
                        </Txt>
                    </Pressable>
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
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
        gap: 10,
    },
    title: {
        marginBottom: 4,
    },
    scroll: {
        maxHeight: 320,
        marginBottom: 8,
    },
    block: {
        marginBottom: 14,
        gap: 4,
    },
    body: {
        lineHeight: 20,
    },
    cancel: {
        textAlign: 'center',
        paddingVertical: 8,
    },
});
