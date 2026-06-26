import { getMissionById } from '@api/mock';
import { createRoute } from '@granite-js/react-native';
import { MissionVerifyScreen } from '../../../src/features/missions/MissionVerifyScreen';
import { useUser } from '../../../src/features/user/UserProvider';
import { navigateMissionResult } from '../../../src/shared/constants/routes';
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
        <MissionVerifyScreen
            mission={mission}
            onSubmit={async () => {
                const result = await verifyMission(mission.id);
                if (result.ok) {
                    navigateMissionResult(navigation, mission.id);
                }
            }}
        />
    );
}
