import { BottomSheet, Txt } from '@toss/tds-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    TERMS_OF_SERVICE_LABELS,
    TERMS_OF_SERVICE_META,
    TERMS_OF_SERVICE_SECTIONS,
} from '../../shared/constants/termsOfService';

type TermsOfServiceModalProps = {
    visible: boolean;
    onClose: () => void;
};

/** 이용약관 열람 — TDS BottomSheet */
export function TermsOfServiceModal({ visible, onClose }: TermsOfServiceModalProps) {
    if (!visible) {
        return null;
    }

    return (
        <BottomSheet.Root
            open
            onClose={onClose}
            onDimmerClick={onClose}
            header={<BottomSheet.Header>{TERMS_OF_SERVICE_META.title}</BottomSheet.Header>}
            cta={
                <BottomSheet.CTA size="large" type="dark" style="weak" onPress={onClose}>
                    {TERMS_OF_SERVICE_LABELS.close}
                </BottomSheet.CTA>
            }
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
            >
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
    section: {
        gap: 8,
        marginBottom: 16,
    },
    line: {
        lineHeight: 22,
    },
});
