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

function errorText(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name} ${error.message}`.toLowerCase();
    }
    return String(error).toLowerCase();
}

function isPermissionError(error: unknown): boolean {
    if (error instanceof OpenCameraPermissionError) {
        return true;
    }
    const text = errorText(error);
    return (
        text.includes('permission') ||
        text.includes('not_allowed') ||
        text.includes('no_permission') ||
        text.includes('권한')
    );
}

function isCancelledError(error: unknown): boolean {
    const text = errorText(error);
    return (
        text.includes('cancel') ||
        text.includes('cancelled') ||
        text.includes('canceled') ||
        text.includes('user_denied') ||
        text.includes('취소')
    );
}

/**
 * 앨범 없이 카메라만 — Apps in Toss `openCamera`
 * 권한 미확정/거부 시 `openPermissionDialog`로 먼저 요청한다.
 */
export async function captureMissionVerifyPhoto(): Promise<CaptureMissionVerifyPhotoResult> {
    try {
        try {
            const status = await openCamera.getPermission();
            if (status !== 'allowed') {
                const next = await openCamera.openPermissionDialog();
                if (next !== 'allowed') {
                    return {
                        ok: false,
                        reason: 'permission_denied',
                        message: '카메라 권한이 필요해요.\n설정에서 허용해 주세요.',
                    };
                }
            }
        } catch (permissionProbeError) {
            // getPermission 자체가 막히는 환경도 있음 → openCamera로 진행
            if (__DEV__) {
                console.warn('[captureMissionVerifyPhoto] permission probe', permissionProbeError);
            }
        }

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
        if (__DEV__) {
            console.warn('[captureMissionVerifyPhoto] openCamera failed', error);
        }
        if (isPermissionError(error)) {
            return {
                ok: false,
                reason: 'permission_denied',
                message: '카메라 권한이 필요해요.\n설정에서 허용해 주세요.',
            };
        }
        if (isCancelledError(error)) {
            return {
                ok: false,
                reason: 'cancelled_or_failed',
                message: '촬영을 취소했어요.\n다시 시도해 주세요.',
            };
        }
        return {
            ok: false,
            reason: 'cancelled_or_failed',
            message: '카메라를 열 수 없어요.\n토스 앱 설정에서 카메라 권한을 허용한 뒤 다시 시도해 주세요.',
        };
    }
}
