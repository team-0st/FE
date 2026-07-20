import type { Mission } from '@api/mock';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';
import { captureMissionVerifyPhoto } from './captureMissionVerifyPhoto';
import {
    clearPendingMissionVerifyPhoto,
    peekPendingMissionVerifyPhoto,
    setPendingMissionVerifyPhoto,
    type MissionVerifyPhoto,
} from './missionVerifyPhotoStore';

type MissionVerifyScreenProps = {
    mission: Mission;
    onSubmit: (photo: MissionVerifyPhoto) => void | Promise<void>;
    onMissingPhoto: () => void;
    onCaptureError: (message: string) => void;
};

export function MissionVerifyScreen({
    mission,
    onSubmit,
    onMissingPhoto,
    onCaptureError,
}: MissionVerifyScreenProps) {
    const [photo, setPhoto] = useState<MissionVerifyPhoto | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const pending = peekPendingMissionVerifyPhoto(mission.id);
        if (pending == null) {
            onMissingPhoto();
            return;
        }
        setPhoto(pending);
    }, [mission.id, onMissingPhoto]);

    const handleRetake = useCallback(async () => {
        if (capturing || submitting) {
            return;
        }
        setCapturing(true);
        try {
            const result = await captureMissionVerifyPhoto();
            if (!result.ok) {
                onCaptureError(result.message);
                return;
            }
            const next: MissionVerifyPhoto = {
                missionId: mission.id,
                ...result.photo,
            };
            setPendingMissionVerifyPhoto(next);
            setPhoto(next);
        } finally {
            setCapturing(false);
        }
    }, [capturing, mission.id, onCaptureError, submitting]);

    const handleSubmit = useCallback(async () => {
        if (photo == null || submitting) {
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(photo);
            clearPendingMissionVerifyPhoto(mission.id);
        } finally {
            setSubmitting(false);
        }
    }, [mission.id, onSubmit, photo, submitting]);

    return (
        <Screen>
            <View style={styles.body}>
                <GuideHero message={getMissionVerifyMessage(mission.authHint)} align="start" compact />
                <View style={styles.previewCard}>
                    {photo != null ? (
                        <Image
                            source={{ uri: photo.previewUri }}
                            style={styles.previewImage}
                            resizeMode="cover"
                            accessibilityLabel="인증 촬영 사진"
                        />
                    ) : (
                        <ActivityIndicator color={colors.primary} />
                    )}
                </View>
                <Txt typography="t7" color="grey600" style={styles.hint}>
                    {photo != null
                        ? '방금 찍은 사진이에요.\n다시 찍거나 제출할 수 있어요.'
                        : '사진을 불러오는 중이에요.'}
                </Txt>
                <Button
                    size="medium"
                    type="dark"
                    style="weak"
                    display="block"
                    disabled={capturing || submitting || photo == null}
                    loading={capturing}
                    onPress={() => void handleRetake()}
                    accessibilityLabel="다시 찍기"
                >
                    다시 찍기
                </Button>
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={photo == null || capturing || submitting}
                    loading={submitting}
                    onPress={() => void handleSubmit()}
                    accessibilityLabel="제출하기"
                >
                    제출하기
                </Button>
            </View>
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
    previewCard: {
        marginTop: 8,
        width: '100%',
        aspectRatio: 3 / 4,
        maxHeight: 360,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    hint: {
        textAlign: 'center',
    },
    cta: {
        padding: 20,
    },
});
