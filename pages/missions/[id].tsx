import { getMissionForUi } from '@api/missions';
import {
    communityProgressStatus,
    communityToCoopMission,
    getCommunityMissionDetail,
    parseCommunityMissionRouteId,
} from '@api/communityMissions';
import { isCoopMission } from '@api/mock/types';
import { createRoute } from '@granite-js/react-native';
import { useCallback, useEffect, useState } from 'react';
import { Txt } from '@toss/tds-react-native';
import { View } from 'react-native';
import { CameraConsentModal } from '../../src/features/legal/CameraConsentModal';
import { captureMissionVerifyPhoto } from '../../src/features/missions/captureMissionVerifyPhoto';
import { MissionDetailScreen } from '../../src/features/missions/MissionDetailScreen';
import { setPendingMissionVerifyPhoto } from '../../src/features/missions/missionVerifyPhotoStore';
import { isCoopMissionUnlocked } from '../../src/features/missions/coopMissionLogic';
import { useUser } from '../../src/features/user/UserProvider';
import { missionStatusFor } from '../../src/features/user/selectors';
import type { MissionProgressStatus } from '../../src/features/user/types';
import { CAMERA_CONSENT_NEEDED_MESSAGE } from '../../src/shared/constants/cameraPolicy';
import { navigateMissionVerify } from '../../src/shared/constants/routes';
import { useAppToast } from '../../src/shared/feedback/useAppToast';
import { Screen } from '../../src/shared/ui/Screen';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import type { Mission } from '@api/mock';

export const Route = createRoute('/missions/:id', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): { id: string } => ({
        id: String((params as { id?: string } | undefined)?.id ?? ''),
    }),
});

function Page() {
    const { id } = Route.useParams();
    const navigation = Route.useNavigation();
    const { state, setCameraConsent, claimMissionReward } = useUser();
    const toast = useAppToast();
    const [openingCamera, setOpeningCamera] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [cameraConsentVisible, setCameraConsentVisible] = useState(false);
    const communityBeId = parseCommunityMissionRouteId(id);
    const [mission, setMission] = useState<Mission | undefined>(() => getMissionForUi(id));
    const [communityStatus, setCommunityStatus] = useState<MissionProgressStatus | null>(null);
    const [communityLocked, setCommunityLocked] = useState(false);
    const [loadingCommunity, setLoadingCommunity] = useState(communityBeId != null);

    useEffect(() => {
        if (communityBeId == null) {
            setMission(getMissionForUi(id));
            setLoadingCommunity(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const detail = await getCommunityMissionDetail(communityBeId);
                if (cancelled) {
                    return;
                }
                if (detail != null) {
                    setMission(communityToCoopMission(detail));
                    setCommunityStatus(communityProgressStatus(detail));
                    setCommunityLocked(!detail.unlocked);
                } else {
                    setMission(getMissionForUi(id));
                }
            } catch {
                if (!cancelled) {
                    setMission(getMissionForUi(id));
                }
            } finally {
                if (!cancelled) {
                    setLoadingCommunity(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [communityBeId, id]);

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

    const handleClaim = useCallback(async () => {
        if (mission == null || claimLoading) {
            return;
        }
        setClaimLoading(true);
        try {
            const result = await claimMissionReward(mission.id);
            if (!result.ok) {
                toast.showError('보상을 받지 못했어요. 잠시 후 다시 시도해 주세요.');
                return;
            }
            toast.showSuccess('재료 보상을 받았어요!');
            if (communityBeId != null) {
                setCommunityStatus('completed');
            }
        } finally {
            setClaimLoading(false);
        }
    }, [claimLoading, claimMissionReward, communityBeId, mission, toast]);

    if (loadingCommunity) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    if (mission == null) {
        return (
            <Screen>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Txt typography="t5">미션을 찾을 수 없어요.</Txt>
                </View>
            </Screen>
        );
    }

    const status =
        communityStatus ?? missionStatusFor(state, mission.id);
    const locked =
        communityBeId != null
            ? communityLocked
            : isCoopMission(mission) && !isCoopMissionUnlocked(state, mission);
    const claimedRewardIngredientId =
        state.missionProgress[mission.id]?.rewardIngredientId ?? null;
    const claimedRewardIngredientName =
        state.missionProgress[mission.id]?.rewardIngredientName ?? null;
    const claimedRewardIngredientImageUrl =
        state.missionProgress[mission.id]?.rewardIngredientImageUrl ?? null;

    return (
        <>
            <MissionDetailScreen
                mission={mission}
                status={status}
                locked={locked}
                verifyLoading={openingCamera}
                claimLoading={claimLoading}
                claimedRewardIngredientId={claimedRewardIngredientId}
                claimedRewardIngredientName={claimedRewardIngredientName}
                claimedRewardIngredientImageUrl={claimedRewardIngredientImageUrl}
                onPressVerify={handleVerify}
                onPressClaim={() => {
                    void handleClaim();
                }}
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
