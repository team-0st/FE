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

const PERMISSION_DENIED_MESSAGE = '카메라 권한이 필요해요.\n설정에서 허용해 주세요.';

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
 * Android 등에서 getPermission이 NO_PERMISSION throw를 내는 경우가 있어,
 * 조회 실패 시에도 openPermissionDialog로 한 번 더 요청한다.
 */
async function ensureCameraPermission(): Promise<'allowed' | 'denied'> {
    try {
        const status = await openCamera.getPermission();
        if (status === 'allowed') {
            return 'allowed';
        }
    } catch {
        // getPermission NO_PERMISSION 등 — 다이얼로그로 진행
    }

    try {
        const next = await openCamera.openPermissionDialog();
        return next === 'allowed' ? 'allowed' : 'denied';
    } catch {
        return 'denied';
    }
}

async function takePhoto(): Promise<Omit<MissionVerifyPhoto, 'missionId'>> {
    const { id, dataUri } = await openCamera({
        base64: true,
        maxWidth: 1024,
    });
    return {
        photoId: id,
        previewUri: toPreviewUri(dataUri),
        uploadPayload: dataUri,
    };
}

/**
 * 앨범 없이 카메라만 — Apps in Toss `openCamera`
 * Android NO_PERMISSION: 권한 다이얼로그 → 재시도
 */
export async function captureMissionVerifyPhoto(): Promise<CaptureMissionVerifyPhotoResult> {
    const permission = await ensureCameraPermission();
    if (permission !== 'allowed') {
        return {
            ok: false,
            reason: 'permission_denied',
            message: PERMISSION_DENIED_MESSAGE,
        };
    }

    try {
        const photo = await takePhoto();
        return { ok: true, photo };
    } catch (error) {
        if (isCancelledError(error) && !isPermissionError(error)) {
            return {
                ok: false,
                reason: 'cancelled_or_failed',
                message: '촬영을 취소했어요.\n다시 시도해 주세요.',
            };
        }

        if (isPermissionError(error)) {
            // openCamera 직전 허용됐어도 브릿지/OS 타이밍으로 실패할 수 있음 → 다이얼로그 후 1회 재시도
            const retried = await ensureCameraPermission();
            if (retried === 'allowed') {
                try {
                    const photo = await takePhoto();
                    return { ok: true, photo };
                } catch (retryError) {
                    if (isPermissionError(retryError)) {
                        return {
                            ok: false,
                            reason: 'permission_denied',
                            message: PERMISSION_DENIED_MESSAGE,
                        };
                    }
                    if (isCancelledError(retryError)) {
                        return {
                            ok: false,
                            reason: 'cancelled_or_failed',
                            message: '촬영을 취소했어요.\n다시 시도해 주세요.',
                        };
                    }
                }
            }
            return {
                ok: false,
                reason: 'permission_denied',
                message: PERMISSION_DENIED_MESSAGE,
            };
        }

        return {
            ok: false,
            reason: 'cancelled_or_failed',
            message:
                '카메라를 열 수 없어요.\n토스 앱 설정에서 카메라 권한을 허용한 뒤 다시 시도해 주세요.',
        };
    }
}
