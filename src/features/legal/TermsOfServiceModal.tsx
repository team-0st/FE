import { Button, Txt } from '@toss/tds-react-native';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
    TERMS_OF_SERVICE_LABELS,
    TERMS_OF_SERVICE_META,
    TERMS_OF_SERVICE_SECTIONS,
} from '../../shared/constants/termsOfService';
import { colors } from '../../shared/theme/colors';

type TermsOfServiceModalProps = {
    visible: boolean;
    onClose: () => void;
};

/** 열람 전용 — PrivacyPolicyModal의 read 모드 스타일을 따름 */
export function TermsOfServiceModal({ visible, onClose }: TermsOfServiceModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Txt typography="t4" fontWeight="bold" style={styles.title}>
                        {TERMS_OF_SERVICE_META.title}
                    </Txt>
                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
                        <Txt typography="t6" color="grey600" style={styles.line}>
                            {`시행일: ${TERMS_OF_SERVICE_META.updatedAt}`}
                        </Txt>
                        <Txt typography="t7" color="grey700" style={styles.line}>
                            {`서비스명: ${TERMS_OF_SERVICE_META.serviceName}`}
                        </Txt>
                        {TERMS_OF_SERVICE_SECTIONS.map((section) => (
                            <View key={section.heading} style={styles.section}>
                                <Txt typography="t5" fontWeight="bold">
                                    {section.heading}
                                </Txt>
                                {section.paragraphs.map((paragraph) => (
                                    <Txt
                                        key={`${section.heading}:${paragraph.slice(0, 32)}`}
                                        typography="t6"
                                        color="grey700"
                                        style={styles.line}
                                    >
                                        {paragraph}
                                    </Txt>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                    <Button size="large" type="dark" style="weak" display="block" onPress={onClose}>
                        {TERMS_OF_SERVICE_LABELS.close}
                    </Button>
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
    section: {
        gap: 8,
        marginBottom: 16,
    },
    line: {
        lineHeight: 22,
    },
});
