import { Button, Txt } from '@toss/tds-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    LOCATION_POLICY_LABELS,
    LOCATION_POLICY_META,
    LOCATION_POLICY_SECTIONS,
} from '../../shared/constants/locationPolicy';
import { colors } from '../../shared/theme/colors';

type LocationConsentModalProps = {
    visible: boolean;
    onClose: () => void;
    onAgree: () => void;
    onDecline: () => void;
};

export function LocationConsentModal({ visible, onClose, onAgree, onDecline }: LocationConsentModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {LOCATION_POLICY_META.title}
                    </Txt>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
                        {LOCATION_POLICY_SECTIONS.map((section) => (
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
                        {LOCATION_POLICY_LABELS.agree}
                    </Button>
                    <Button size="medium" type="dark" style="weak" display="block" onPress={onDecline}>
                        {LOCATION_POLICY_LABELS.decline}
                    </Button>
                    <Pressable onPress={onClose} accessibilityRole="button">
                        <Txt typography="t7" color="grey600" style={styles.cancel}>
                            {LOCATION_POLICY_LABELS.close}
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
