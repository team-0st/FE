/** 공동 미션 UI 헬퍼 — API 변환 재노출 */

export {
    communityMissionRouteId,
    communityProgressStatus,
    communityToCoopMission,
    getCachedCommunityMission,
    parseCommunityMissionRouteId,
} from '../../api/communityMissions';

export function isCommunityMissionId(id: string): boolean {
    return /^community-\d+$/.test(id);
}
