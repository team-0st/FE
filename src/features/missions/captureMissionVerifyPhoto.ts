import {
    openCamera,
    OpenCameraPermissionError,
} from '@apps-in-toss/framework';
import type { MissionVerifyPhoto } from './missionVerifyPhotoStore';

export type CaptureMissionVerifyPhotoResult =
    | {
          ok: true;
          photo: Omit<MissionVerifyPhoto, 'missionId'>;
      }
    | {
          ok: false;
          reason: 'permission_denied' | 'cancelled_or_failed';
          message: string;
      };

function toPreviewUri(dataUri: string): string {
    if (dataUri.startsWith('data:')) {
        return dataUri;
    }
    return `data:image/jpeg;base64,${dataUri}`;
}

/** 앨범 없이 카메라만 — Apps in Toss `openCamera` */
export async function captureMissionVerifyPhoto(): Promise<CaptureMissionVerifyPhotoResult> {
    try {
        const { id, dataUri } = await openCamera({
            base64: true,
            maxWidth: 1024,
        });
        return {
            ok: true,
            photo: {
                photoId: id,
                previewUri: toPreviewUri(dataUri),
                uploadPayload: dataUri,
            },
        };
    } catch (error) {
        if (error instanceof OpenCameraPermissionError) {
            return {
                ok: false,
                reason: 'permission_denied',
                message: '카메라 권한이 필요해요.\n설정에서 허용해 주세요.',
            };
        }
        return {
            ok: false,
            reason: 'cancelled_or_failed',
            message: '촬영을 취소했거나 카메라를 열 수 없어요.',
        };
    }
}
