import { Button, Checkbox, TextField, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { AlmangPayoutConsent } from '../user/types';
import { colors } from '../../shared/theme/colors';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { validateNickname, validatePhone } from './onboardingProfileLogic';

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

const PRIVACY_NOTICE =
    '수집 목적: 알맹상점 포인트 지급·본인 확인\n' +
    '수집 항목: 휴대전화번호\n' +
    '보유 기간: 회원 탈퇴 또는 최종 지급 완료 후 3년\n' +
    '거부 시 불이익: 적립은 가능하나 자동 지급 불가, 알맹상점 방문 후 지급';

export function OnboardingProfileScreen({
    initialNickname = '',
    onComplete,
}: OnboardingProfileScreenProps) {
    const [step, setStep] = useState<Step>('nickname');
    const [nickname, setNickname] = useState(initialNickname);
    const [nicknameError, setNicknameError] = useState<string | null>(null);
    const [phone, setPhone] = useState('');
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
        const phoneResult = validatePhone(phone);
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
                        message="처음에 뭐라고 불러줄까?"
                        align="start"
                        size="large"
                        animate
                        compact
                    />
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        앱에서 쓸 닉네임이에요. 실명은 필요 없어요.
                    </Txt>
                    <TextField
                        variant="line"
                        label="닉네임"
                        placeholder="예) 펭귄탐험가"
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
                    message="전화번호 알려줄래?"
                    align="start"
                    size="large"
                    compact
                />
                <Txt typography="t7" color="grey600" style={styles.sub}>
                    알맹상점 포인트를 받을 때 필요해요. 나중에 해도 돼요.
                </Txt>
                <TextField
                    variant="line"
                    label="휴대전화번호"
                    placeholder="01012345678"
                    value={phone}
                    onChangeText={(value) => {
                        setPhone(value);
                        setPhoneError(null);
                    }}
                    keyboardType="phone-pad"
                    maxLength={13}
                />
                <View style={styles.noticeBox}>
                    <Txt typography="t7" color="grey700">
                        {PRIVACY_NOTICE}
                    </Txt>
                </View>
                    <Checkbox.Line checked={consentChecked} onCheckedChange={setConsentChecked}>
                        개인정보 수집·이용에 동의해요 (알맹 포인트 지급 목적)
                    </Checkbox.Line>
                {phoneError != null ? (
                    <Txt typography="t7" color="red500">
                        {phoneError}
                    </Txt>
                ) : null}
                <Txt typography="t7" color="grey500" style={styles.payoutHint}>
                    동의하지 않으면 포인트는 적립되지만 지급받을 수 없어요. 지급은 알맹상점 방문이
                    필요해요.
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
                    나중에 할게
                </Button>
            </View>
            {skipConfirmVisible ? (
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Txt typography="t5" fontWeight="bold">
                            나중에 해도 괜찮아요
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.modalBody}>
                            알맹상점 포인트는 게임에서 쌓일 수 있어요. 다만 지급을 받으려면 알맹상점에
                            직접 방문해 주세요. 매장에서 본인 확인 후 지급해 드려요.
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
