/** 미션 인증 — 상세에서 촬영 후 verify 화면으로 넘기는 임시 보관 (라우트에 base64 안 실음) */

export type MissionVerifyPhoto = {
    missionId: string;
    photoId: string;
    /** RN Image `uri` (data URI) */
    previewUri: string;
    /** 업로드용 페이로드 (openCamera base64:true 시 prefix 없는 base64) */
    uploadPayload: string;
};

let pending: MissionVerifyPhoto | null = null;

export function setPendingMissionVerifyPhoto(photo: MissionVerifyPhoto): void {
    pending = photo;
}

export function peekPendingMissionVerifyPhoto(missionId: string): MissionVerifyPhoto | null {
    if (pending == null || pending.missionId !== missionId) {
        return null;
    }
    return pending;
}

export function clearPendingMissionVerifyPhoto(missionId?: string): void {
    if (missionId != null && pending?.missionId !== missionId) {
        return;
    }
    pending = null;
}
