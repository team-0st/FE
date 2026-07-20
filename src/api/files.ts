import { apiRequest, isApiEnabled } from './client';
import { API_PATHS } from './notion/types';

export type FileUploadResponse = {
    fileUrl: string;
    fileKey: string;
};

export type MissionVerifyUploadInput = {
    previewUri: string;
    uploadPayload: string;
};

/**
 * POST /api/v1/files/upload?missionId=
 * multipart `file` + query `missionId`
 */
export async function uploadMissionVerifyPhoto(
    missionNumericId: number,
    photo: MissionVerifyUploadInput,
): Promise<FileUploadResponse> {
    if (!isApiEnabled()) {
        return {
            fileKey: `mock/missions/${missionNumericId}/${Date.now()}.jpg`,
            fileUrl: photo.previewUri,
        };
    }

    const formData = new FormData();
    const uri = photo.previewUri.startsWith('data:')
        ? photo.previewUri
        : `data:image/jpeg;base64,${photo.uploadPayload}`;

    // React Native FormData 파일 파트 (Blob 아님)
    formData.append('file', {
        uri,
        name: `mission-${missionNumericId}.jpg`,
        type: 'image/jpeg',
    } as unknown as Blob);

    return apiRequest<FileUploadResponse>(
        `${API_PATHS.filesUpload}?missionId=${missionNumericId}`,
        {
            method: 'POST',
            formData,
        },
    );
}
