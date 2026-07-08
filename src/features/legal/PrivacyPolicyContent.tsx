import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import {
    PHONE_CONSENT_NOTICE,
    PRIVACY_POLICY_META,
    PRIVACY_POLICY_SECTIONS,
} from '../../shared/constants/privacyPolicy';

type PrivacyPolicyContentProps = {
    showSummary?: boolean;
};

export function PrivacyPolicyContent({ showSummary = true }: PrivacyPolicyContentProps) {
    return (
        <View style={styles.root}>
            <Txt typography="t6" color="grey600">
                {`시행일: ${PRIVACY_POLICY_META.updatedAt} · ${PRIVACY_POLICY_META.operator}`}
            </Txt>
            {showSummary ? (
                <View style={styles.summaryBox}>
                    <Txt typography="t6" fontWeight="semibold">
                        휴대전화번호 수집·이용 요약
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.line}>
                        {`· 목적: ${PHONE_CONSENT_NOTICE.purpose}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.line}>
                        {`· 항목: ${PHONE_CONSENT_NOTICE.items}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.line}>
                        {`· 보유: ${PHONE_CONSENT_NOTICE.retention}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.line}>
                        {`· 거부 시: ${PHONE_CONSENT_NOTICE.refuse}`}
                    </Txt>
                </View>
            ) : null}
            {PRIVACY_POLICY_SECTIONS.map((section) => (
                <View key={section.heading} style={styles.section}>
                    <Txt typography="t5" fontWeight="bold">
                        {section.heading}
                    </Txt>
                    {section.paragraphs.map((paragraph) => (
                        <Txt key={paragraph.slice(0, 24)} typography="t6" color="grey700" style={styles.line}>
                            {paragraph}
                        </Txt>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        gap: 16,
        paddingBottom: 8,
    },
    summaryBox: {
        gap: 6,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F5F5F8',
    },
    section: {
        gap: 8,
    },
    line: {
        lineHeight: 22,
    },
});
