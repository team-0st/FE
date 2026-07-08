/** 개인정보 처리방침 전문 (법무 검토 후 갱신) */

export const PRIVACY_POLICY_META = {
    title: '개인정보 처리방침',
    updatedAt: '2026-07-08',
    operator: '제로스트(0st) 운영팀',
} as const;

export const PHONE_CONSENT_NOTICE = {
    purpose: '알맹상점 포인트 지급, 본인 확인, 지급 내역 연동',
    items: '휴대전화번호',
    retention: '회원 탈퇴 또는 최종 포인트 지급 완료 후 3년 (법무 확정 전)',
    refuse:
        '동의를 거부할 수 있어요. 거부 시에도 앱 이용·포인트 적립은 가능하지만, 포인트 지급·전환은 할 수 없으며 알맹상점 방문 후 본인 확인을 거쳐 지급받을 수 있어요.',
} as const;

export type PrivacyPolicySection = {
    heading: string;
    paragraphs: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
    {
        heading: '1. 개인정보의 수집·이용',
        paragraphs: [
            '제로스트(0st)는 알맹상점 포인트 지급 및 본인 확인을 위해 아래와 같이 개인정보를 수집·이용해요.',
            `· 수집·이용 목적: ${PHONE_CONSENT_NOTICE.purpose}`,
            `· 수집 항목: ${PHONE_CONSENT_NOTICE.items}`,
            `· 보유·이용 기간: ${PHONE_CONSENT_NOTICE.retention}`,
            `· 동의 거부 권리 및 불이익: ${PHONE_CONSENT_NOTICE.refuse}`,
        ],
    },
    {
        heading: '2. 개인정보의 파기',
        paragraphs: [
            '보유 기간이 경과하거나 처리 목적이 달성되면 지체 없이 해당 개인정보를 파기해요.',
            '전자적 파일 형태는 복구·재생이 불가능한 방법으로 삭제하고, 그 밖의 기록물은 분쇄하거나 소각해요.',
        ],
    },
    {
        heading: '3. 이용자의 권리',
        paragraphs: [
            '이용자는 언제든지 개인정보 열람·정정·삭제·처리 정지를 요청할 수 있어요.',
            '마이페이지 또는 운영팀 문의를 통해 요청해 주세요.',
        ],
    },
    {
        heading: '4. 문의',
        paragraphs: [
            '개인정보 관련 문의는 앱 내 문의 또는 운영팀 이메일로 연락해 주세요. (연락처는 법무 확정 후 기재)',
        ],
    },
];

export const PRIVACY_POLICY_LABELS = {
    viewFull: '개인정보 처리방침 전문 보기',
    mustReadHint: '전문을 확인한 후에만 동의할 수 있어요.',
    confirmRead: '확인했어요',
    close: '닫기',
    myPageEntry: '개인정보 처리방침',
} as const;
