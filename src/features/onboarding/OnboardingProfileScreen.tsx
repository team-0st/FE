import { Button, Checkbox, TextField, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { AlmangPayoutConsent } from '../user/types';
import { colors } from '../../shared/theme/colors';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { ONBOARDING_PROFILE_GUIDE } from '../../shared/constants/guideCopy';
import {
    normalizePhoneBody,
    PHONE_PREFIX,
    validateNickname,
    validatePhoneBody,
} from './onboardingProfileLogic';

export type OnboardingProfilePayload = {
    nickname: string;
    phoneMasked: string | null;
    almangPayoutConsent: AlmangPayoutConsent;
    consentAt: string | null;
};

type OnboardingProfileScreenProps = {
    initialNickname?: string;
    onComplete: (payload: OnboardingProfilePayload) => void;
};

type Step = 'nickname' | 'phone';

export function OnboardingProfileScreen({
    initialNickname = '',
    onComplete,
}: OnboardingProfileScreenProps) {
    const [step, setStep] = useState<Step>('nickname');
    const [nickname, setNickname] = useState(initialNickname);
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [phoneBody, setPhoneBody] = useState('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [consentChecked, setConsentChecked] = useState(false);
    const [skipConfirmVisible, setSkipConfirmVisible] = useState(false);

    const submitNickname = () => {
        const result = validateNickname(nickname);
        if (!result.ok) {
            setNicknameError(result.message);
            return;
        }
        setNicknameError(null);
        setStep('phone');
    };

    const finishWithConsent = () => {
        const nick = validateNickname(nickname);
        if (!nick.ok) {
            setStep('nickname');
            setNicknameError(nick.message);
            return;
        }
        const phoneResult = validatePhoneBody(phoneBody);
        if (!phoneResult.ok) {
            setPhoneError(phoneResult.message);
            return;
        }
        if (!consentChecked) {
            setPhoneError('포인트 지급을 위해 개인정보 수집·이용에 동의해 주세요.');
            return;
        }
        onComplete({
            nickname: nick.nickname,
            phoneMasked: phoneResult.masked,
            almangPayoutConsent: 'granted',
            consentAt: new Date().toISOString(),
        });
    };

    const finishSkipped = () => {
        const nick = validateNickname(nickname);
        if (!nick.ok) {
            setStep('nickname');
            setNicknameError(nick.message);
            return;
        }
        onComplete({
            nickname: nick.nickname,
            phoneMasked: null,
            almangPayoutConsent: 'declined',
            consentAt: null,
        });
        setSkipConfirmVisible(false);
    };

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

    return (
        <Screen>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <GuideHero
                    message={ONBOARDING_PROFILE_GUIDE.phoneTitle}
                    align="start"
                    size="large"
                    compact
                />
                <Txt typography="t7" color="grey600" style={styles.sub}>
                    {ONBOARDING_PROFILE_GUIDE.phoneSubtitle}
                </Txt>
                <TextField
                    variant="line"
                    label="휴대전화번호"
                    prefix={PHONE_PREFIX}
                    placeholder={ONBOARDING_PROFILE_GUIDE.phoneBodyPlaceholder}
                    value={phoneBody}
                    onChangeText={(value) => {
                        setPhoneBody(normalizePhoneBody(value));
                        setPhoneError(null);
                    }}
                    keyboardType="phone-pad"
                    maxLength={8}
                />
                <View style={styles.noticeBox}>
                    <Txt typography="t7" fontWeight="semibold" color="grey800">
                        개인정보 수집·이용 안내
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.noticeLine}>
                        {`· 수집·이용 목적: ${ONBOARDING_PROFILE_GUIDE.phoneConsentNotice.purpose}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.noticeLine}>
                        {`· 수집 항목: ${ONBOARDING_PROFILE_GUIDE.phoneConsentNotice.items}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.noticeLine}>
                        {`· 보유·이용 기간: ${ONBOARDING_PROFILE_GUIDE.phoneConsentNotice.retention}`}
                    </Txt>
                    <Txt typography="t7" color="grey700" style={styles.noticeLine}>
                        {`· 동의 거부 권리 및 불이익: ${ONBOARDING_PROFILE_GUIDE.phoneConsentNotice.refuse}`}
                    </Txt>
                    <Txt typography="t7" color="grey500" style={styles.policyHint}>
                        {ONBOARDING_PROFILE_GUIDE.phoneConsentPolicyHint}
                    </Txt>
                </View>
                <Checkbox.Line checked={consentChecked} onCheckedChange={setConsentChecked}>
                    {ONBOARDING_PROFILE_GUIDE.phoneConsentCheckbox}
                </Checkbox.Line>
                {phoneError != null ? (
                    <Txt typography="t7" color="red500">
                        {phoneError}
                    </Txt>
                ) : null}
                <Txt typography="t7" color="grey500" style={styles.payoutHint}>
                    {ONBOARDING_PROFILE_GUIDE.payoutHint}
                </Txt>
            </ScrollView>
            <View style={styles.footer}>
                <Button size="large" type="primary" display="block" onPress={finishWithConsent}>
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
    },
    noticeBox: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 14,
        gap: 6,
    },
    noticeLine: {
        lineHeight: 20,
    },
    policyHint: {
        marginTop: 4,
        lineHeight: 18,
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    consentLabel: {
        flex: 1,
    },
    payoutHint: {
        lineHeight: 20,
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
