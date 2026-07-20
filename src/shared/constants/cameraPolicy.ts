/** 미션 인증 촬영 — OS 카메라 권한 요청 전 앱 내 고지·동의 */
export const CAMERA_POLICY_META = {
    title: '카메라 이용 동의',
    version: '2026-07-20',
} as const;

export const CAMERA_POLICY_SECTIONS = [
    {
        heading: '이용 목적',
        body: '미션 실천을 사진으로 인증하기 위해 카메라를 사용해요.',
    },
    {
        heading: '수집 항목',
        body: '미션 인증을 위해 촬영한 사진.\n사진첩에서 고른 사진은 쓰지 않아요.',
    },
    {
        heading: '보유·이용 기간',
        body: '인증·검수에 필요한 기간 동안 보관해요.\n관련 법령에 따른 보관이 필요하면 그 기간을 따릅니다.',
    },
    {
        heading: '동의 거부 권리',
        body: '동의하지 않아도 앱의 다른 기능은 이용할 수 있어요.\n다만 사진 인증이 필요한 미션은 완료할 수 없어요.',
    },
] as const;

export const CAMERA_POLICY_LABELS = {
    agree: '동의하고 촬영하기',
    decline: '동의하지 않음',
    close: '닫기',
} as const;

/** OS(토스 앱)에서 카메라가 꺼져 있을 때 — Android에서 자주 발생 */
export const CAMERA_OS_DENIED_MESSAGE =
    '토스 앱 설정에서 카메라가 꺼져 있어요.\n설정 → 토스 → 카메라 허용 후 다시 시도해 주세요.';

export const CAMERA_CONSENT_NEEDED_MESSAGE =
    '미션 인증을 위해 카메라 이용에 동의해 주세요.';
