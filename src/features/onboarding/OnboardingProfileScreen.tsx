import { Button, Checkbox, TextField, Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { AlmangPayoutConsent } from '../user/types';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from '../legal/TermsOfServiceModal';
import { ONBOARDING_PROFILE_GUIDE } from '../../shared/constants/guideCopy';
import {
    ONBOARDING_PRIVACY_CHECKBOX,
    PHONE_CONSENT_SUMMARY,
    PRIVACY_POLICY_LABELS,
    SERVICE_CONSENT_SUMMARY,
} from '../../shared/constants/privacyPolicy';
import { TERMS_OF_SERVICE_LABELS } from '../../shared/constants/termsOfService';
import { ALMANG_COMPLIANCE } from '../../shared/constants/almangComplianceCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { useAttentionPulse } from '../../shared/hooks/useAttentionPulse';
import {
    normalizePhoneDigits,
    validateNickname,
    validatePassword,
    validatePhoneBody,
} from './onboardingProfileLogic';

export type OnboardingProfilePayload = {
    nickname: string;
    phoneMasked: string;
    /** BE용 `010XXXXXXXX` digits */
    phoneDigits: string;
    /** BE 온보딩 완료 요청에만 사용하고 앱 상태에는 저장하지 않음 */
    password: string;
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
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
    const [policyChecked, setPolicyChecked] = useState(false);
    const [serviceChecked, setServiceChecked] = useState(false);
    const [phoneConsentChecked, setPhoneConsentChecked] = useState(false);
    const [policyModalVisible, setPolicyModalVisible] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [policyButtonPulse, setPolicyButtonPulse] = useState(false);
    /** 선택(전화) 단계에서 별도로 처리방침을 끝까지 확인했는지 — 필수 단계의 확인을 재사용하지 않는다 */
    const [optionalPolicyAcknowledged, setOptionalPolicyAcknowledged] = useState(false);
    const [optionalPolicyButtonPulse, setOptionalPolicyButtonPulse] = useState(false);
    const [privacyConsentAt, setPrivacyConsentAt] = useState<string | null>(null);
    const policyButtonOpacity = useAttentionPulse(policyButtonPulse);
    const optionalPolicyButtonOpacity = useAttentionPulse(optionalPolicyButtonPulse);

    useEffect(() => {
        if (policyAcknowledged) {
            setPolicyButtonPulse(false);
        }
    }, [policyAcknowledged]);

    useEffect(() => {
        if (optionalPolicyAcknowledged) {
            setOptionalPolicyButtonPulse(false);
        }
    }, [optionalPolicyAcknowledged]);

    const nudgeReadPolicy = () => {
        setPrivacyError(PRIVACY_POLICY_LABELS.mustReadBeforeConsent);
        setPolicyButtonPulse(true);
    };

    const nudgeReadOptionalPolicy = () => {
        setPhoneError(PRIVACY_POLICY_LABELS.mustReadBeforeConsent);
        setOptionalPolicyButtonPulse(true);
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
        const phoneResult = validatePhoneBody(phoneBody);
        if (!phoneResult.ok) {
            setPhoneError(phoneResult.message);
            return;
        }
        const passwordResult = validatePassword(password);
        if (!passwordResult.ok) {
            setPasswordError(passwordResult.message);
            return;
        }
        onComplete({
            nickname: nick,
            phoneMasked: phoneResult.masked,
            phoneDigits: phoneResult.digits,
            password: passwordResult.password,
            almangPayoutConsent: phoneConsentChecked ? 'granted' : 'declined',
            privacyConsentAt,
            consentAt: phoneConsentChecked ? new Date().toISOString() : null,
        });
    };

    const agreeRequiredFromPolicy = () => {
        setPolicyAcknowledged(true);
        setPolicyChecked(true);
        setServiceChecked(true);
        setPrivacyError(null);
        setPolicyButtonPulse(false);
    };

    const agreeOptionalFromPolicy = () => {
        setOptionalPolicyAcknowledged(true);
        setPhoneConsentChecked(true);
        setPhoneError(null);
        setOptionalPolicyButtonPulse(false);
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
        if (checked && !optionalPolicyAcknowledged) {
            nudgeReadOptionalPolicy();
            return;
        }
        setPhoneConsentChecked(checked);
        setPhoneError(null);
    };

    const policyModal =
        step === 'privacy' ? (
            <PrivacyPolicyModal
                visible={policyModalVisible}
                onClose={() => setPolicyModalVisible(false)}
                mode="consent"
                consentScope="required"
                requiredAgreed={policyChecked && serviceChecked && policyAcknowledged}
                onAgreeRequired={agreeRequiredFromPolicy}
            />
        ) : (
            <PrivacyPolicyModal
                visible={policyModalVisible}
                onClose={() => setPolicyModalVisible(false)}
                mode="consent"
                consentScope="optional"
                optionalAgreed={phoneConsentChecked}
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
                                <Txt
                                    typography="t5"
                                    fontWeight="bold"
                                    color={policyButtonPulse ? 'red500' : 'blue500'}
                                    style={styles.policyLink}
                                >
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
                        <Pressable
                            onPress={() => setTermsModalVisible(true)}
                            accessibilityRole="link"
                            accessibilityLabel={TERMS_OF_SERVICE_LABELS.viewFull}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Txt typography="t7" color="grey600" style={styles.termsLink}>
                                {TERMS_OF_SERVICE_LABELS.viewFullLink}
                            </Txt>
                        </Pressable>
                    </View>
                    <View style={styles.checklist}>
                        <Checkbox.Line
                            checked={policyChecked}
                            accessibilityLabel={ONBOARDING_PRIVACY_CHECKBOX.policy}
                            onCheckedChange={(checked) => handleRequiredConsentChange('policy', checked)}
                        >
                            <Txt typography="t6" color="grey800" style={styles.consentLabel}>
                                {ONBOARDING_PRIVACY_CHECKBOX.policy}
                            </Txt>
                        </Checkbox.Line>
                        <View style={styles.checklistItem}>
                            <Checkbox.Line
                                checked={serviceChecked}
                                accessibilityLabel={ONBOARDING_PRIVACY_CHECKBOX.service}
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
                <TermsOfServiceModal
                    visible={termsModalVisible}
                    onClose={() => setTermsModalVisible(false)}
                />
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
                    <Animated.View style={{ opacity: optionalPolicyButtonOpacity }}>
                        <Pressable
                            onPress={() => {
                                setOptionalPolicyButtonPulse(false);
                                setPolicyModalVisible(true);
                            }}
                            accessibilityRole="link"
                            accessibilityLabel={PRIVACY_POLICY_LABELS.viewFull}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Txt
                                typography="t7"
                                fontWeight="bold"
                                color={optionalPolicyButtonPulse ? 'red500' : 'blue500'}
                                style={styles.policyLink}
                            >
                                {PRIVACY_POLICY_LABELS.viewFullLink}
                            </Txt>
                        </Pressable>
                    </Animated.View>
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
                            accessibilityLabel={ONBOARDING_PRIVACY_CHECKBOX.phone}
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
                <TextField
                    variant="line"
                    label="비밀번호"
                    placeholder="8자 이상 입력해 주세요"
                    value={password}
                    onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError(null);
                    }}
                    secureTextEntry
                    maxLength={64}
                    help="로그인할 때 사용할 비밀번호예요."
                />
                {passwordError != null ? (
                    <Txt typography="t7" color="red500">
                        {passwordError}
                    </Txt>
                ) : null}
            </ScrollView>
            <View style={styles.footer}>
                <Button size="large" type="primary" display="block" onPress={finishWithPhone}>
                    계정 만들고 계속
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
        marginTop: 8,
        textDecorationLine: 'underline',
        textAlign: 'left',
    },
    softHint: {
        marginTop: 2,
        lineHeight: 18,
    },
    termsLink: {
        marginTop: 8,
        textDecorationLine: 'underline',
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
});
