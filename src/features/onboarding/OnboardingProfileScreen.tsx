import { Button, Checkbox, TextField, Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { AlmangPayoutConsent } from '../user/types';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { ONBOARDING_PROFILE_GUIDE } from '../../shared/constants/guideCopy';
import {
    ONBOARDING_PRIVACY_CHECKBOX,
    PHONE_CONSENT_SUMMARY,
    PRIVACY_POLICY_LABELS,
    SERVICE_CONSENT_SUMMARY,
} from '../../shared/constants/privacyPolicy';
import { ALMANG_COMPLIANCE } from '../../shared/constants/almangComplianceCopy';
import { colors } from '../../shared/theme/colors';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { useAttentionPulse } from '../../shared/hooks/useAttentionPulse';
import {
    normalizePhoneDigits,
    validateNickname,
    validatePhoneBody,
} from './onboardingProfileLogic';

export type OnboardingProfilePayload = {
    nickname: string;
    phoneMasked: string | null;
    /** BE용 `010XXXXXXXX` digits. 스킵 시 null */
    phoneDigits: string | null;
    almangPayoutConsent: AlmangPayoutConsent;
    /** 서비스 개인정보 동의 시각 (필수 단계 완료) */
    privacyConsentAt: string;
    /** 알맹 지급용 전화 동의 시각. 스킵 시 null */
    consentAt: string | null;
};

type OnboardingProfileScreenProps = {
    initialNickname?: string;
    onComplete: (payload: OnboardingProfilePayload) => void;
};

type Step = 'nickname' | 'privacy' | 'phone';

export function OnboardingProfileScreen({
    initialNickname = '',
    onComplete,
}: OnboardingProfileScreenProps) {
    const [step, setStep] = useState<Step>('nickname');
    const [nickname, setNickname] = useState(initialNickname);
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [privacyError, setPrivacyError] = useState<string | null>(null);
    const [phoneBody, setPhoneBody] = useState('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
    const [policyChecked, setPolicyChecked] = useState(false);
    const [serviceChecked, setServiceChecked] = useState(false);
    const [phoneConsentChecked, setPhoneConsentChecked] = useState(false);
    const [policyModalVisible, setPolicyModalVisible] = useState(false);
    const [skipConfirmVisible, setSkipConfirmVisible] = useState(false);
    const [policyButtonPulse, setPolicyButtonPulse] = useState(false);
    const [privacyConsentAt, setPrivacyConsentAt] = useState<string | null>(null);
    const policyButtonOpacity = useAttentionPulse(policyButtonPulse);

    useEffect(() => {
        if (policyAcknowledged) {
            setPolicyButtonPulse(false);
        }
    }, [policyAcknowledged]);

    const nudgeReadPolicy = () => {
        setPrivacyError(PRIVACY_POLICY_LABELS.mustReadBeforeConsent);
        setPolicyButtonPulse(true);
    };

    const submitNickname = () => {
        const result = validateNickname(nickname);
        if (!result.ok) {
            setNicknameError(result.message);
            return;
        }
        setNicknameError(null);
        setStep('privacy');
    };

    const submitPrivacy = () => {
        if (!policyAcknowledged) {
            nudgeReadPolicy();
            return;
        }
        if (!policyChecked || !serviceChecked) {
            setPrivacyError('필수 동의 항목에 모두 체크해 주세요.');
            return;
        }
        setPrivacyError(null);
        setPrivacyConsentAt(new Date().toISOString());
        setStep('phone');
    };

    const requireValidNickname = (): string | null => {
        const nick = validateNickname(nickname);
        if (!nick.ok) {
            setStep('nickname');
            setNicknameError(nick.message);
            return null;
        }
        return nick.nickname;
    };

    const finishWithPhone = () => {
        const nick = requireValidNickname();
        if (nick == null) {
            return;
        }
        if (privacyConsentAt == null) {
            setStep('privacy');
            setPrivacyError('개인정보 동의를 먼저 완료해 주세요.');
            return;
        }
        if (!phoneConsentChecked) {
            setPhoneError(
                '매장 포인트 연동에 동의해 주세요. 원하지 않으면 「나중에 할게요」를 눌러 주세요.',
            );
            return;
        }
        const phoneResult = validatePhoneBody(phoneBody);
        if (!phoneResult.ok) {
            setPhoneError(phoneResult.message);
            return;
        }
        onComplete({
            nickname: nick,
            phoneMasked: phoneResult.masked,
            phoneDigits: phoneResult.digits,
            almangPayoutConsent: 'granted',
            privacyConsentAt,
            consentAt: new Date().toISOString(),
        });
    };

    const finishSkipped = () => {
        const nick = requireValidNickname();
        if (nick == null) {
            return;
        }
        if (privacyConsentAt == null) {
            setStep('privacy');
            setPrivacyError('개인정보 동의를 먼저 완료해 주세요.');
            setSkipConfirmVisible(false);
            return;
        }
        onComplete({
            nickname: nick,
            phoneMasked: null,
            phoneDigits: null,
            almangPayoutConsent: 'declined',
            privacyConsentAt,
            consentAt: null,
        });
        setSkipConfirmVisible(false);
    };

    const agreeRequiredFromPolicy = () => {
        setPolicyAcknowledged(true);
        setPolicyChecked(true);
        setServiceChecked(true);
        setPrivacyError(null);
        setPolicyButtonPulse(false);
    };

    const agreeOptionalFromPolicy = () => {
        setPhoneConsentChecked(true);
        setPhoneError(null);
    };

    const declineOptionalFromPolicy = () => {
        setPhoneConsentChecked(false);
        setPhoneError(null);
    };

    const handleRequiredConsentChange = (
        kind: 'policy' | 'service',
        checked: boolean,
    ) => {
        if (!policyAcknowledged) {
            nudgeReadPolicy();
            return;
        }
        if (kind === 'policy') {
            setPolicyChecked(checked);
        } else {
            setServiceChecked(checked);
        }
        setPrivacyError(null);
    };

    const handlePhoneConsentChange = (checked: boolean) => {
        setPhoneConsentChecked(checked);
        setPhoneError(null);
    };

    const policyModal = (
        <PrivacyPolicyModal
            visible={policyModalVisible}
            onClose={() => setPolicyModalVisible(false)}
            mode="consent"
            requiredAgreed={policyChecked && serviceChecked && policyAcknowledged}
            optionalAgreed={phoneConsentChecked}
            onAgreeRequired={agreeRequiredFromPolicy}
            onAgreeOptional={agreeOptionalFromPolicy}
            onDeclineOptional={declineOptionalFromPolicy}
        />
    );

    if (step === 'nickname') {
        return (
            <Screen>
                <View style={styles.body}>
                    <GuideHero
                        message={ONBOARDING_PROFILE_GUIDE.nicknameTitle}
                        align="start"
                        size="large"
                        animate
                        compact
                    />
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        {ONBOARDING_PROFILE_GUIDE.nicknameSubtitle}
                    </Txt>
                    <TextField
                        variant="line"
                        label="닉네임"
                        placeholder={ONBOARDING_PROFILE_GUIDE.nicknamePlaceholder}
                        value={nickname}
                        onChangeText={(value) => {
                            setNickname(value);
                            setNicknameError(null);
                        }}
                        autoFocus
                        maxLength={12}
                    />
                    {nicknameError != null ? (
                        <Txt typography="t7" color="red500">
                            {nicknameError}
                        </Txt>
                    ) : null}
                </View>
                <View style={styles.footer}>
                    <Button size="large" type="primary" display="block" onPress={submitNickname}>
                        다음
                    </Button>
                </View>
            </Screen>
        );
    }

    if (step === 'privacy') {
        return (
            <Screen>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <GuideHero
                        message={ONBOARDING_PROFILE_GUIDE.privacyTitle}
                        align="start"
                        size="large"
                        compact
                    />
                    <View style={styles.summaryBlock}>
                        <Txt typography="t7" fontWeight="semibold" color="grey700">
                            {PRIVACY_POLICY_LABELS.requiredSection}
                        </Txt>
                        <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                            {`목적  ${SERVICE_CONSENT_SUMMARY.purpose}`}
                        </Txt>
                        <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                            {`항목  ${SERVICE_CONSENT_SUMMARY.items}`}
                        </Txt>
                        <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                            {`보유  ${SERVICE_CONSENT_SUMMARY.retention}`}
                        </Txt>
                        <Animated.View style={{ opacity: policyButtonOpacity }}>
                            <Pressable
                                onPress={() => {
                                    setPolicyButtonPulse(false);
                                    setPolicyModalVisible(true);
                                }}
                                accessibilityRole="link"
                                accessibilityLabel={PRIVACY_POLICY_LABELS.viewFull}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            >
                                <Txt typography="t7" color="blue500" style={styles.policyLink}>
                                    {PRIVACY_POLICY_LABELS.viewFullLink}
                                </Txt>
                            </Pressable>
                        </Animated.View>
                        <Txt typography="t7" color="grey500" style={styles.softHint}>
                            {policyAcknowledged
                                ? PRIVACY_POLICY_LABELS.policyConfirmed
                                : PRIVACY_POLICY_LABELS.mustReadHint}
                        </Txt>
                        <Txt typography="t7" color="grey500" style={styles.softHint}>
                            선택 항목(휴대전화)은 다음 단계에서 따로 진행해요.
                        </Txt>
                    </View>
                    <View style={styles.checklist}>
                        <Checkbox.Line
                            checked={policyChecked}
                            onCheckedChange={(checked) => handleRequiredConsentChange('policy', checked)}
                        >
                            <Txt typography="t6" color="grey800" style={styles.consentLabel}>
                                {ONBOARDING_PRIVACY_CHECKBOX.policy}
                            </Txt>
                        </Checkbox.Line>
                        <View style={styles.checklistItem}>
                            <Checkbox.Line
                                checked={serviceChecked}
                                onCheckedChange={(checked) =>
                                    handleRequiredConsentChange('service', checked)
                                }
                            >
                                <Txt typography="t6" color="grey800" style={styles.consentLabel}>
                                    {ONBOARDING_PRIVACY_CHECKBOX.service}
                                </Txt>
                            </Checkbox.Line>
                            <Txt typography="t7" color="grey500" style={styles.serviceHint}>
                                {ONBOARDING_PRIVACY_CHECKBOX.serviceHint}
                            </Txt>
                        </View>
                    </View>
                    {privacyError != null ? (
                        <Txt typography="t7" color="red500">
                            {privacyError}
                        </Txt>
                    ) : null}
                </ScrollView>
                <View style={styles.footer}>
                    <Button size="large" type="primary" display="block" onPress={submitPrivacy}>
                        동의하고 다음
                    </Button>
                    <Button
                        size="medium"
                        type="dark"
                        style="weak"
                        display="block"
                        onPress={() => setStep('nickname')}
                    >
                        이전
                    </Button>
                </View>
                {policyModal}
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <GuideHero
                    message={ONBOARDING_PROFILE_GUIDE.phoneTitle}
                    align="start"
                    size="large"
                    compact
                />
                <View style={styles.summaryBlock}>
                    <Txt typography="t7" fontWeight="semibold" color="grey700">
                        {PRIVACY_POLICY_LABELS.optionalSection}
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                        {`목적  ${PHONE_CONSENT_SUMMARY.purpose}`}
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                        {`항목  ${PHONE_CONSENT_SUMMARY.items}`}
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.noticeLine}>
                        {`보유  ${PHONE_CONSENT_SUMMARY.retention}`}
                    </Txt>
                    <Pressable
                        onPress={() => setPolicyModalVisible(true)}
                        accessibilityRole="link"
                        accessibilityLabel={PRIVACY_POLICY_LABELS.viewFull}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                        <Txt typography="t7" color="blue500" style={styles.policyLink}>
                            {PRIVACY_POLICY_LABELS.viewFullLink}
                        </Txt>
                    </Pressable>
                    <Txt typography="t7" color="grey500" style={styles.softHint}>
                        {ALMANG_COMPLIANCE.noCashInAppOneLine}
                    </Txt>
                    <Txt typography="t7" color="grey500" style={styles.softHint}>
                        {ONBOARDING_PROFILE_GUIDE.payoutHint}
                    </Txt>
                </View>
                <View style={styles.checklist}>
                    <View style={styles.checklistItem}>
                        <Checkbox.Line
                            checked={phoneConsentChecked}
                            onCheckedChange={handlePhoneConsentChange}
                        >
                            <Txt typography="t6" color="grey800" style={styles.consentLabel}>
                                {ONBOARDING_PRIVACY_CHECKBOX.phone}
                            </Txt>
                        </Checkbox.Line>
                        <Txt typography="t7" color="grey500" style={styles.serviceHint}>
                            {ONBOARDING_PRIVACY_CHECKBOX.phoneHint}
                        </Txt>
                    </View>
                </View>
                <TextField
                    variant="line"
                    label="휴대전화번호"
                    placeholder={ONBOARDING_PROFILE_GUIDE.phonePlaceholder}
                    value={phoneBody}
                    onChangeText={(value) => {
                        setPhoneBody(normalizePhoneDigits(value));
                        setPhoneError(null);
                    }}
                    keyboardType="phone-pad"
                    maxLength={11}
                    help={ONBOARDING_PROFILE_GUIDE.phoneHelp}
                />
                {phoneError != null ? (
                    <Txt typography="t7" color="red500">
                        {phoneError}
                    </Txt>
                ) : null}
            </ScrollView>
            <View style={styles.footer}>
                <Button size="large" type="primary" display="block" onPress={finishWithPhone}>
                    동의하고 계속
                </Button>
                <Button
                    size="large"
                    type="dark"
                    style="weak"
                    display="block"
                    onPress={() => setSkipConfirmVisible(true)}
                >
                    나중에 할게요
                </Button>
                <Button
                    size="medium"
                    type="dark"
                    style="weak"
                    display="block"
                    onPress={() => setStep('privacy')}
                >
                    이전
                </Button>
            </View>
            {skipConfirmVisible ? (
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Txt typography="t5" fontWeight="bold">
                            {ONBOARDING_PROFILE_GUIDE.skipModalTitle}
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.modalBody}>
                            {ONBOARDING_PROFILE_GUIDE.skipModalBody}
                        </Txt>
                        <Button size="medium" type="primary" display="block" onPress={finishSkipped}>
                            확인했어요
                        </Button>
                        <Button
                            size="medium"
                            type="dark"
                            style="weak"
                            display="block"
                            onPress={() => setSkipConfirmVisible(false)}
                        >
                            돌아가기
                        </Button>
                    </View>
                </View>
            ) : null}
            {policyModal}
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 12,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
    },
    sub: {
        marginBottom: 4,
        lineHeight: 20,
    },
    summaryBlock: {
        gap: 6,
        marginBottom: 4,
    },
    noticeLine: {
        lineHeight: 20,
    },
    policyLink: {
        marginTop: 4,
        textDecorationLine: 'underline',
    },
    softHint: {
        marginTop: 2,
        lineHeight: 18,
    },
    checklist: {
        gap: 14,
        marginTop: 4,
    },
    checklistItem: {
        gap: 4,
    },
    consentLabel: {
        flex: 1,
        lineHeight: 22,
        paddingLeft: 4,
    },
    serviceHint: {
        lineHeight: 18,
        paddingLeft: 32,
    },
    footer: {
        padding: 20,
        gap: 10,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        borderRadius: 16,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
    },
    modalBody: {
        lineHeight: 22,
    },
});
