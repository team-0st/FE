import { getMissionById } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { createRoute } from '@granite-js/react-native';
import { MissionDetailScreen } from '../../src/features/missions/MissionDetailScreen';
import { isCoopMissionUnlocked } from '../../src/features/missions/coopMissionLogic';
import { useUser } from '../../src/features/user/UserProvider';
import { missionStatusFor } from '../../src/features/user/selectors';
import { navigateMissionVerify } from '../../src/shared/constants/routes';
import { Txt } from '@toss/tds-react-native';
import { View } from 'react-native';
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
    const mission = getMissionById(id);

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
            onPressVerify={() => navigateMissionVerify(navigation, mission.id)}
        />
    );
}
