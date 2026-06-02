/** MVP mock: BE 미션 검수 전까지 자동 승인 (샌드박스·데모용) */
export function isDemoAutoApproveMission(): boolean {
    const raw = process.env.EXPO_PUBLIC_DEMO_AUTO_APPROVE;
    if (raw === 'false') {
        return false;
    }
    return true;
}
