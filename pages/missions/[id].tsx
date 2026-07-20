import { getMissionById } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { createRoute } from '@granite-js/react-native';
import { useCallback, useState } from 'react';
import { Txt } from '@toss/tds-react-native';
import { View } from 'react-native';
import { captureMissionVerifyPhoto } from '../../src/features/missions/captureMissionVerifyPhoto';
import { MissionDetailScreen } from '../../src/features/missions/MissionDetailScreen';
import { setPendingMissionVerifyPhoto } from '../../src/features/missions/missionVerifyPhotoStore';
import { isCoopMissionUnlocked } from '../../src/features/missions/coopMissionLogic';
import { useUser } from '../../src/features/user/UserProvider';
import { missionStatusFor } from '../../src/features/user/selectors';
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
    const { state } = useUser();
    const toast = useAppToast();
    const [openingCamera, setOpeningCamera] = useState(false);
    const mission = getMissionById(id);

    const handleVerify = useCallback(async () => {
        if (mission == null || openingCamera) {
            return;
        }
        setOpeningCamera(true);
        try {
            const result = await captureMissionVerifyPhoto();
            if (!result.ok) {
                if (result.reason === 'permission_denied') {
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
        <MissionDetailScreen
            mission={mission}
            status={missionStatusFor(state, mission.id)}
            locked={isCoopMission(mission) && !isCoopMissionUnlocked(state, mission)}
            verifyLoading={openingCamera}
            onPressVerify={() => void handleVerify()}
        />
    );
}
