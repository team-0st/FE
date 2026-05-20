import { getMissionById } from '@api/mock';
import { createRoute } from '@granite-js/react-native';
import { MissionResultScreen } from '../../../src/features/missions/MissionResultScreen';
import { useUser } from '../../../src/features/user/UserProvider';
import { ROUTES } from '../../../src/shared/constants/routes';
import { Txt } from '@toss/tds-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Screen } from '../../../src/shared/ui/Screen';

export const Route = createRoute('/missions/:id/result', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): { id: string } => ({
        id: String((params as { id?: string } | undefined)?.id ?? ''),
    }),
});

function Page() {
    const { id } = Route.useParams();
    const navigation = Route.useNavigation();
    const { approveMissionDemo } = useUser();
    const mission = getMissionById(id);

    const onApproved = useCallback(() => {
        if (mission != null) {
            void approveMissionDemo(mission.id, mission.points);
        }
    }, [approveMissionDemo, mission]);

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
        <MissionResultScreen
            mission={mission}
            onApproved={onApproved}
            onPressHome={() => navigation.navigate(ROUTES.home)}
        />
    );
}
