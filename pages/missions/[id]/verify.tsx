import { getMissionById } from '@api/mock';
import { createRoute } from '@granite-js/react-native';
import { useCallback } from 'react';
import { MissionVerifyScreen } from '../../../src/features/missions/MissionVerifyScreen';
import { useUser } from '../../../src/features/user/UserProvider';
import { navigateMissionResult } from '../../../src/shared/constants/routes';
import { useAppToast } from '../../../src/shared/feedback/useAppToast';
import { Txt } from '@toss/tds-react-native';
import { View } from 'react-native';
import { Screen } from '../../../src/shared/ui/Screen';

export const Route = createRoute('/missions/:id/verify', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): { id: string } => ({
        id: String((params as { id?: string } | undefined)?.id ?? ''),
    }),
});

function Page() {
    const { id } = Route.useParams();
    const navigation = Route.useNavigation();
    const { verifyMission } = useUser();
    const toast = useAppToast();
    const mission = getMissionById(id);

    const handleMissingPhoto = useCallback(() => {
        toast.showError('인증 사진이 없어요.\n다시 촬영해 주세요.');
        navigation.navigate('/missions/:id', { id });
    }, [id, navigation, toast]);

    const handleCaptureError = useCallback(
        (message: string) => {
            toast.showError(message);
        },
        [toast],
    );

    if (mission == null) {
        return (
            <Screen>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Txt typography="t5">미션을 찾을 수 없어요.</Txt>
                </View>
            </Screen>
        );
    }

    return (
        <MissionVerifyScreen
            mission={mission}
            onMissingPhoto={handleMissingPhoto}
            onCaptureError={handleCaptureError}
            onSubmit={async (photo) => {
                const result = await verifyMission(mission.id, photo);
                if (result.ok) {
                    navigateMissionResult(navigation, mission.id);
                    return;
                }
                if (result.code === 'MISSION_UNDER_REVIEW') {
                    toast.showError('이미 검수 중인 미션이에요.');
                    return;
                }
                if (result.code === 'MISSION_ALREADY_COMPLETED') {
                    toast.showError('오늘은 이미 완료한 미션이에요.');
                    return;
                }
                if (result.code === 'INVALID_FILE_TYPE') {
                    toast.showError('이 사진 형식은 올릴 수 없어요.\n다시 촬영해 주세요.');
                    return;
                }
                if (result.code === 'FILE_TOO_LARGE') {
                    toast.showError('사진이 너무 커요.\n다시 촬영해 주세요.');
                    return;
                }
                if (result.code === 'INVALID_PHOTO') {
                    toast.showError('사진을 준비하지 못했어요.\n다시 촬영해 주세요.');
                    return;
                }
                if (result.code === 'NOT_FOUND') {
                    toast.showError(
                        '이 미션은 아직 서버에서 인증할 수 없어요.\n일일 미션으로 시도해 주세요.',
                    );
                    return;
                }
                toast.showError('제출에 실패했어요.\n다시 시도해 주세요.');
            }}
        />
    );
}
