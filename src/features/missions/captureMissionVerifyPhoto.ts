import {
    openCamera,
    OpenCameraPermissionError,
} from '@apps-in-toss/framework';
import { CAMERA_OS_DENIED_MESSAGE } from '../../shared/constants/cameraPolicy';
import type { MissionVerifyPhoto } from './missionVerifyPhotoStore';

export type CaptureMissionVerifyPhotoResult =
    | {
          ok: true;
          photo: Omit<MissionVerifyPhoto, 'missionId'>;
      }
    | {
          ok: false;
          reason: 'permission_denied' | 'cancelled_or_failed' | 'os_permission_denied';
          message: string;
      };

const PERMISSION_DENIED_MESSAGE = '카메라 권한이 필요해요.\n설정에서 허용해 주세요.';

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

function isOsPermissionDeniedStatus(status: string): boolean {
    const normalized = status.toLowerCase().replace(/[_-]/g, '');
    return (
        normalized === 'ospermissiondenied' ||
        normalized.includes('ospermissiondenied') ||
        normalized.includes('systemdenied')
    );
}

type EnsureCameraResult =
    | { ok: true }
    | { ok: false; reason: 'permission_denied' | 'os_permission_denied'; message: string };

/**
 * Android: 토스 앱 설정에서 카메라 OFF면 getPermission이 `osPermissionDenied`를 반환할 수 있음.
 * (앱인토스 openCamera 문서)
 * 그 경우 다이얼로그로는 풀리지 않으니 설정 안내를 띄운다.
 */
async function ensureCameraPermission(): Promise<EnsureCameraResult> {
    try {
        const status = await openCamera.getPermission();
        if (status === 'allowed') {
            return { ok: true };
        }
        if (typeof status === 'string' && isOsPermissionDeniedStatus(status)) {
            return {
                ok: false,
                reason: 'os_permission_denied',
                message: CAMERA_OS_DENIED_MESSAGE,
            };
        }
    } catch {
        // getPermission NO_PERMISSION 등 — 다이얼로그로 진행
    }

    try {
        const next = await openCamera.openPermissionDialog();
        if (next === 'allowed') {
            return { ok: true };
        }
        if (typeof next === 'string' && isOsPermissionDeniedStatus(next)) {
            return {
                ok: false,
                reason: 'os_permission_denied',
                message: CAMERA_OS_DENIED_MESSAGE,
            };
        }
        return {
            ok: false,
            reason: 'permission_denied',
            message: PERMISSION_DENIED_MESSAGE,
        };
    } catch (error) {
        const text = errorText(error);
        if (isOsPermissionDeniedStatus(text) || text.includes('ospermission')) {
            return {
                ok: false,
                reason: 'os_permission_denied',
                message: CAMERA_OS_DENIED_MESSAGE,
            };
        }
        return {
            ok: false,
            reason: 'permission_denied',
            message: PERMISSION_DENIED_MESSAGE,
        };
    }
}

async function takePhoto(): Promise<Omit<MissionVerifyPhoto, 'missionId'>> {
    // nginx 413(~1MB) 대비. 1024px는 ~1.2MB로 실패함.
    const { id, dataUri } = await openCamera({
        base64: true,
        maxWidth: 512,
    });
    const rawBase64 = dataUri.startsWith('data:')
        ? dataUri.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
        : dataUri;
    // 미리보기는 jpeg로 가정하되, 업로드는 magic으로 jpeg/png 판별
    const previewUri = dataUri.startsWith('data:')
        ? dataUri
        : `data:image/jpeg;base64,${rawBase64}`;
    return {
        photoId: id,
        previewUri,
        uploadPayload: rawBase64,
    };
}

/**
 * 앨범 없이 카메라만 — Apps in Toss `openCamera`
 * - OS 권한 거부(osPermissionDenied): 토스 설정 안내
 * - 그 외: 권한 다이얼로그 → 재시도
 */
export async function captureMissionVerifyPhoto(): Promise<CaptureMissionVerifyPhotoResult> {
    const permission = await ensureCameraPermission();
    if (!permission.ok) {
        return {
            ok: false,
            reason: permission.reason,
            message: permission.message,
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
            const retried = await ensureCameraPermission();
            if (retried.ok) {
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
            } else {
                return {
                    ok: false,
                    reason: retried.reason,
                    message: retried.message,
                };
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
