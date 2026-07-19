import { Button, Txt } from '@toss/tds-react-native';
import { type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import {
    PHONE_CONSENT_NOTICE,
    PRIVACY_POLICY_EXTERNAL_LINKS,
    PRIVACY_POLICY_LABELS,
    PRIVACY_POLICY_META,
    PRIVACY_POLICY_SECTIONS,
    SERVICE_CONSENT_NOTICE,
} from '../../shared/constants/privacyPolicy';
import { colors } from '../../shared/theme/colors';

type PrivacyPolicyContentProps = {
    showSummary?: boolean;
    /** 온보딩: 요약 아래에 필수/선택 동의 액션 */
    consentActions?: {
        requiredAgreed: boolean;
        optionalAgreed: boolean;
        onAgreeRequired: () => void;
        onAgreeOptional: () => void;
        onDeclineOptional: () => void;
    };
};

function ConsentSummaryCard({
    title,
    purpose,
    items,
    retention,
    refuse,
    footer,
}: {
    title: string;
    purpose: string;
    items: string;
    retention: string;
    refuse?: string;
    footer?: ReactNode;
}) {
    return (
        <View style={styles.summaryBox}>
            <Txt typography="t6" fontWeight="semibold">
                {title}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`· 목적: ${purpose}`}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`· 항목: ${items}`}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`· 보유: ${retention}`}
            </Txt>
            {refuse != null ? (
                <Txt typography="t7" color="grey600" style={styles.line}>
                    {`· 거부 시: ${refuse}`}
                </Txt>
            ) : null}
            {footer}
        </View>
    );
}

export function PrivacyPolicyContent({
    showSummary = true,
    consentActions,
}: PrivacyPolicyContentProps) {
    return (
        <View style={styles.root}>
            <Txt typography="t6" color="grey600">
                {`시행일: ${PRIVACY_POLICY_META.updatedAt}`}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`개인정보처리자: ${PRIVACY_POLICY_META.operator}`}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`서비스명: ${PRIVACY_POLICY_META.serviceName}`}
            </Txt>
            <Txt typography="t7" color="grey700" style={styles.line}>
                {`개인정보 보호책임자: ${PRIVACY_POLICY_META.dpoName}`}
            </Txt>
            <Pressable
                onPress={() => {
                    void Linking.openURL(`mailto:${PRIVACY_POLICY_META.contactEmail}`);
                }}
                accessibilityRole="link"
                accessibilityLabel={`문의 이메일 ${PRIVACY_POLICY_META.contactEmail}`}
            >
                <Txt typography="t7" color="blue500" style={styles.link}>
                    {`문의: ${PRIVACY_POLICY_META.contactEmail}`}
                </Txt>
            </Pressable>
            {showSummary ? (
                <>
                    <ConsentSummaryCard
                        title={PRIVACY_POLICY_LABELS.requiredSection}
                        purpose={SERVICE_CONSENT_NOTICE.purpose}
                        items={SERVICE_CONSENT_NOTICE.items}
                        retention={SERVICE_CONSENT_NOTICE.retention}
                        refuse={SERVICE_CONSENT_NOTICE.refuse}
                        footer={
                            consentActions != null ? (
                                <View style={styles.actionWrap}>
                                    {consentActions.requiredAgreed ? (
                                        <Txt typography="t7" color={colors.success} fontWeight="semibold">
                                            {`✓ ${PRIVACY_POLICY_LABELS.requiredAgreed}`}
                                        </Txt>
                                    ) : (
                                        <Button
                                            size="medium"
                                            type="primary"
                                            display="block"
                                            onPress={consentActions.onAgreeRequired}
                                        >
                                            {PRIVACY_POLICY_LABELS.agreeRequired}
                                        </Button>
                                    )}
                                </View>
                            ) : null
                        }
                    />
                    <ConsentSummaryCard
                        title={PRIVACY_POLICY_LABELS.optionalSection}
                        purpose={PHONE_CONSENT_NOTICE.purpose}
                        items={PHONE_CONSENT_NOTICE.items}
                        retention={PHONE_CONSENT_NOTICE.retention}
                        refuse={PHONE_CONSENT_NOTICE.refuse}
                        footer={
                            consentActions != null ? (
                                <View style={styles.actionWrap}>
                                    {consentActions.optionalAgreed ? (
                                        <Txt typography="t7" color={colors.success} fontWeight="semibold">
                                            {`✓ ${PRIVACY_POLICY_LABELS.optionalAgreed}`}
                                        </Txt>
                                    ) : (
                                        <>
                                            <Button
                                                size="medium"
                                                type="primary"
                                                style="weak"
                                                display="block"
                                                onPress={consentActions.onAgreeOptional}
                                            >
                                                {PRIVACY_POLICY_LABELS.agreeOptional}
                                            </Button>
                                            <Button
                                                size="medium"
                                                type="dark"
                                                style="weak"
                                                display="block"
                                                onPress={consentActions.onDeclineOptional}
                                            >
                                                {PRIVACY_POLICY_LABELS.declineOptional}
                                            </Button>
                                        </>
                                    )}
                                </View>
                            ) : null
                        }
                    />
                </>
            ) : null}
            {PRIVACY_POLICY_SECTIONS.map((section) => (
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
            <View style={styles.section}>
                <Txt typography="t5" fontWeight="bold">
                    참고 링크
                </Txt>
                {PRIVACY_POLICY_EXTERNAL_LINKS.map((link) => (
                    <Pressable
                        key={link.url}
                        onPress={() => {
                            void Linking.openURL(link.url);
                        }}
                        accessibilityRole="link"
                        accessibilityLabel={link.label}
                    >
                        <Txt typography="t6" color="blue500" style={styles.link}>
                            {link.label}
                        </Txt>
                    </Pressable>
                ))}
            </View>
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
        backgroundColor: colors.slotEmpty,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionWrap: {
        marginTop: 8,
        gap: 8,
    },
    section: {
        gap: 8,
    },
    line: {
        lineHeight: 22,
    },
    link: {
        lineHeight: 22,
        textDecorationLine: 'underline',
    },
});
