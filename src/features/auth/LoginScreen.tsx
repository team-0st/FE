import { Button, TextField, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { Image, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { LOGIN_GUIDE } from '../../shared/constants/guideCopy';
import { loginCauldronSource } from '../../shared/constants/loginCauldronUri';
import { Screen } from '../../shared/ui/Screen';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';
import {
    normalizePhoneDigits,
    PHONE_DIGITS_LENGTH,
    validatePassword,
    validatePhoneBody,
} from '../onboarding/onboardingProfileLogic';

export type LoginFormPayload = {
    phoneDigits: string;
    password: string;
};

type LoginScreenProps = {
    submitting?: boolean;
    onSubmit: (payload: LoginFormPayload) => void;
    onPressSignUp: () => void;
};

export function LoginScreen({ submitting = false, onSubmit, onPressSignUp }: LoginScreenProps) {
    const [phoneBody, setPhoneBody] = useState('');
    const [password, setPassword] = useState('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const heroSource = toBrandImageSource(loginCauldronSource());

    const handleSubmit = () => {
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
        Keyboard.dismiss();
        onSubmit({
            phoneDigits: phoneResult.digits,
            password: passwordResult.password,
        });
    };

    return (
        <Screen>
            <View style={styles.body}>
                <View style={styles.heroBlock}>
                    {heroSource != null ? (
                        <Image
                            source={heroSource}
                            style={styles.hero}
                            resizeMode="contain"
                            accessibilityLabel={LOGIN_GUIDE.characterLabel}
                        />
                    ) : null}
                    <Txt typography="t4" fontWeight="bold" color="grey800" style={styles.title}>
                        {LOGIN_GUIDE.title}
                    </Txt>
                </View>
                <TextField
                    variant="line"
                    label={LOGIN_GUIDE.phoneLabel}
                    placeholder={LOGIN_GUIDE.phonePlaceholder}
                    value={phoneBody}
                    onChangeText={(value) => {
                        const next = normalizePhoneDigits(value);
                        setPhoneBody(next);
                        setPhoneError(null);
                        if (next.length >= PHONE_DIGITS_LENGTH) {
                            Keyboard.dismiss();
                        }
                    }}
                    keyboardType="phone-pad"
                    maxLength={PHONE_DIGITS_LENGTH}
                />
                {phoneError != null ? (
                    <Txt typography="t7" color="red500">
                        {phoneError}
                    </Txt>
                ) : null}
                <TextField
                    variant="line"
                    label={LOGIN_GUIDE.passwordLabel}
                    placeholder={LOGIN_GUIDE.passwordPlaceholder}
                    value={password}
                    onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError(null);
                    }}
                    secureTextEntry
                    maxLength={64}
                />
                {passwordError != null ? (
                    <Txt typography="t7" color="red500">
                        {passwordError}
                    </Txt>
                ) : null}
            </View>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    loading={submitting}
                    disabled={submitting}
                    onPress={handleSubmit}
                >
                    {LOGIN_GUIDE.submit}
                </Button>
                <Pressable
                    onPress={onPressSignUp}
                    accessibilityRole="link"
                    accessibilityLabel={LOGIN_GUIDE.signUp}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.signUpPressable}
                >
                    <Txt typography="t6" color="grey700" style={styles.signUp}>
                        {LOGIN_GUIDE.signUp}
                    </Txt>
                </Pressable>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        gap: 12,
    },
    heroBlock: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    hero: {
        width: 180,
        height: 180,
    },
    title: {
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        gap: 16,
        alignItems: 'center',
    },
    signUpPressable: {
        paddingVertical: 4,
    },
    signUp: {
        textDecorationLine: 'underline',
    },
});
