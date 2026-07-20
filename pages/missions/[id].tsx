import { getMissionById } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { createRoute } from '@granite-js/react-native';
import { useCallback, useState } from 'react';
import { Txt } from '@toss/tds-react-native';
import { View } from 'react-native';
import { CameraConsentModal } from '../../src/features/legal/CameraConsentModal';
import { captureMissionVerifyPhoto } from '../../src/features/missions/captureMissionVerifyPhoto';
import { MissionDetailScreen } from '../../src/features/missions/MissionDetailScreen';
import { setPendingMissionVerifyPhoto } from '../../src/features/missions/missionVerifyPhotoStore';
import { isCoopMissionUnlocked } from '../../src/features/missions/coopMissionLogic';
import { useUser } from '../../src/features/user/UserProvider';
import { missionStatusFor } from '../../src/features/user/selectors';
import { CAMERA_CONSENT_NEEDED_MESSAGE } from '../../src/shared/constants/cameraPolicy';
import { navigateMissionVerify } from '../../src/shared/constants/routes';
import { useAppToast } from '../../src/shared/feedback/useAppToast';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/missions/:id', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): { id: string } => ({
        id: String((params as { id?: string } | undefined)?.id ?? ''),
    }),
});

function Page() {
    const { id } = Route.useParams();
    const navigation = Route.useNavigation();
    const { state, setCameraConsent } = useUser();
    const toast = useAppToast();
    const [openingCamera, setOpeningCamera] = useState(false);
    const [cameraConsentVisible, setCameraConsentVisible] = useState(false);
    const mission = getMissionById(id);

    const runCapture = useCallback(async () => {
        if (mission == null || openingCamera) {
            return;
        }
        setOpeningCamera(true);
        try {
            const result = await captureMissionVerifyPhoto();
            if (!result.ok) {
                if (
                    result.reason === 'permission_denied' ||
                    result.reason === 'os_permission_denied'
                ) {
                    toast.showError(result.message);
                } else {
                    toast.show(result.message);
                }
                return;
            }
            setPendingMissionVerifyPhoto({
                missionId: mission.id,
                ...result.photo,
            });
            navigateMissionVerify(navigation, mission.id);
        } finally {
            setOpeningCamera(false);
        }
    }, [mission, navigation, openingCamera, toast]);

    const handleVerify = useCallback(() => {
        if (mission == null || openingCamera) {
            return;
        }
        if (state.cameraConsent !== 'granted') {
            setCameraConsentVisible(true);
            return;
        }
        void runCapture();
    }, [mission, openingCamera, runCapture, state.cameraConsent]);

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
        <>
            <MissionDetailScreen
                mission={mission}
                status={missionStatusFor(state, mission.id)}
                locked={isCoopMission(mission) && !isCoopMissionUnlocked(state, mission)}
                verifyLoading={openingCamera}
                onPressVerify={handleVerify}
            />
            <CameraConsentModal
                visible={cameraConsentVisible}
                onClose={() => setCameraConsentVisible(false)}
                onAgree={() => {
                    void (async () => {
                        await setCameraConsent('granted');
                        setCameraConsentVisible(false);
                        await runCapture();
                    })();
                }}
                onDecline={() => {
                    void (async () => {
                        await setCameraConsent('declined');
                        setCameraConsentVisible(false);
                        toast.show(CAMERA_CONSENT_NEEDED_MESSAGE);
                    })();
                }}
            />
        </>
    );
}
