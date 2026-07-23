/** 공동 미션 라우트 id: `community-{beId}` */

export {
    communityMissionRouteId,
    parseCommunityMissionRouteId,
} from '../../api/communityMissions';

export function isCommunityMissionRouteId(id: string): boolean {
    return /^community-\d+$/.test(id);
}
