/**
 * 제로스트 개인정보 처리방침
 * - 구조: 토스 개인정보 처리방침(https://toss.im/privacy-policy?id=50459) 목차 참고
 * - 앱인토스 주의사항·토스인증 암호화 안내 반영
 * 법무 검토 전 운영 초안 — 실제 출시 전 검토·갱신 필요
 */

export const PRIVACY_POLICY_META = {
    title: '개인정보 처리방침',
    updatedAt: '2026-07-20',
    version: '2026-07-20',
    /** 개인정보처리자 */
    operator: '제로스트 프로젝트팀',
    /** 서비스명 (이용자 표기) */
    serviceName: '제로스트(0st)',
    /** 앱 식별용 (앱인토스 appName 등) */
    appName: '0st',
    /** 개인정보 보호책임자 */
    dpoName: '윤나래',
    contactEmail: 'zerost.team@gmail.com',
} as const;

/** 외부 참고 링크 (토스·앱인토스) */
export const PRIVACY_POLICY_EXTERNAL_LINKS = [
    {
        label: '토스 개인정보 처리방침',
        url: 'https://toss.im/privacy-policy?id=50459',
    },
    {
        label: '앱인토스 서비스별 주의사항',
        url: 'https://developers-apps-in-toss.toss.im/intro/caution.html',
    },
    {
        label: '토스 인증 계약·안내',
        url: 'https://developers-apps-in-toss.toss.im/tossauth/contract.html',
    },
    {
        label: '토스 인증 개인정보 암복호화',
        url: 'https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%9D%B8%EC%A6%9D/tosscertEncrypt.html',
    },
] as const;

/** 서비스 필수 수집 (온보딩 개인정보 동의) — 전문·정책용 */
export const SERVICE_CONSENT_NOTICE = {
    purpose:
        '제로스트 미니앱 서비스 제공, 회원 식별, 미션·출석·가챠·스프 제작 진행, 제휴 샵 연결, 고객 문의 대응',
    items:
        '닉네임, 기기 식별값(Device ID), 단골·제휴 샵 선택 정보, 미션·출석·가챠·스프·재료 등 이용 기록, 미션 인증을 위해 업로드한 사진, 앱 이용 과정에서 생성되는 로그·오류 정보',
    retention: '회원 탈퇴 시까지(관련 법령에 따른 보관이 필요한 경우 해당 기간)',
    refuse: '동의를 거부하면 제로스트 서비스를 이용할 수 없어요.',
} as const;

/** 온보딩 요약 박스용 — 짧게 */
export const SERVICE_CONSENT_SUMMARY = {
    purpose: '서비스 제공, 회원 식별, 미션·문의 대응',
    items: '닉네임, 기기 식별값, 이용 기록, 인증 사진 등',
    retention: '회원 탈퇴 시까지 (법령 보관 시 해당 기간)',
} as const;

/** 휴대전화 — 선택 (알맹상점 매장 포인트 연동) */
export const PHONE_CONSENT_NOTICE = {
    purpose: '알맹상점 매장 본인 확인 및 제휴 매장 포인트 연동',
    items: '휴대전화번호',
    retention: '회원 탈퇴 또는 매장 포인트 연동 종료 후 3년(관련 법령이 더 긴 경우 그 기간)',
    refuse:
        '동의를 거부할 수 있어요.\n거부 시에도 앱 이용·포인트 적립은 가능해요.\n다만 매장에서 포인트를 이용하려면 알맹상점 방문과 본인 확인이 필요해요.',
} as const;

/** 온보딩 선택 동의 요약 박스용 — 짧게 */
export const PHONE_CONSENT_SUMMARY = {
    purpose: '매장 본인 확인·포인트 연동',
    items: '휴대전화번호',
    retention: '탈퇴 또는 연동 종료 후 3년 (법령 시 더 길 수 있음)',
} as const;

/** 위치 — 별도 동의(홈·주변 상점). 처리방침에 고지 */
export const LOCATION_CONSENT_SUMMARY = {
    purpose: '내 주변 제휴 상점 안내, 직선 거리 정렬, 지도 표시',
    items: '기기 위치정보(위도·경도) — 조회 시점에 한함',
    note: '위치정보는 별도 동의 후에만 이용하며, 서버에 좌표를 상시 저장하지 않아요.',
} as const;

export type PrivacyPolicySection = {
    heading: string;
    paragraphs: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacyPolicySection[] = [
    {
        heading: '0. 서문 및 적용 범위',
        paragraphs: [
            `${PRIVACY_POLICY_META.operator}은 서비스 ${PRIVACY_POLICY_META.serviceName}를 운영하면서 이용자의 개인정보를 소중하게 생각해요. 팀은 관련 법령을 준수하며, 서비스 이용 과정에서 어떤 개인정보를 왜 수집하고 어떻게 이용·보관하는지 이용자에게 명확하게 안내하고자 본 개인정보 처리방침을 마련했어요.`,
            `개인정보처리자: ${PRIVACY_POLICY_META.operator}`,
            `서비스명: ${PRIVACY_POLICY_META.serviceName}`,
            `개인정보 보호책임자: ${PRIVACY_POLICY_META.dpoName}`,
            `문의: ${PRIVACY_POLICY_META.contactEmail}`,
            '토스 앱·앱인토스 플랫폼이 처리하는 정보는 토스(㈜비바리퍼블리카)의 개인정보 처리방침이 적용돼요. 아래 「참고 링크」에서 확인할 수 있어요.',
            `${PRIVACY_POLICY_META.serviceName}는 앱인토스 미니앱으로 제공되며, 「개인정보 보호법」 등 관련 법령과 앱인토스 서비스별 주의사항(최소 수집·암호화·탈퇴 시 삭제 등)을 준수하도록 노력해요.`,
        ],
    },
    {
        heading: '1. 개인정보의 수집·이용',
        paragraphs: [
            '서비스 이용에 반드시 필요한 항목은 필수 동의로, 그 외는 선택 동의로 나눠 받아요. 목적 외 이용하지 않아요.',
            '【필수】 서비스 제공',
            `· 목적: ${SERVICE_CONSENT_NOTICE.purpose}`,
            `· 항목: ${SERVICE_CONSENT_NOTICE.items}`,
            `· 보유·이용 기간: ${SERVICE_CONSENT_NOTICE.retention}`,
            `· 거부 시: ${SERVICE_CONSENT_NOTICE.refuse}`,
            '【선택】 알맹상점 매장 포인트 연동',
            `· 목적: ${PHONE_CONSENT_NOTICE.purpose}`,
            `· 항목: ${PHONE_CONSENT_NOTICE.items}`,
            `· 보유·이용 기간: ${PHONE_CONSENT_NOTICE.retention}`,
            `· 거부 시: ${PHONE_CONSENT_NOTICE.refuse}`,
            '· 안내: 앱 안에서 현금으로 바꾸거나 환불·출금하는 기능은 없어요. 알맹 포인트는 제휴 매장에서만 이용해요. 에코잼은 게임 안 재화이며 알맹 포인트·현금과 교환되지 않아요.',
            '【별도 동의】 위치정보',
            `· 목적: ${LOCATION_CONSENT_SUMMARY.purpose}`,
            `· 항목: ${LOCATION_CONSENT_SUMMARY.items}`,
            `· ${LOCATION_CONSENT_SUMMARY.note}`,
            '수집 방법: 이용자 입력, 미션 인증 사진 업로드, 서비스 이용 과정에서 자동 생성(기기 식별값·이용 기록·오류 로그 등).',
        ],
    },
    {
        heading: '2. 제3자 제공·처리 위탁',
        paragraphs: [
            '제로스트는 원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지 않아요. 다만 다음의 경우 필요한 범위에서 제공·위탁할 수 있어요.',
            '· 알맹상점: 매장 본인 확인·제휴 매장 포인트 연동을 위해 동의한 휴대전화번호 등 (선택 동의 시에 한함). 앱 내 현금 지급·환전이 아님',
            '· 앱인토스/토스 플랫폼: 미니앱 실행·배포·기기 환경 제공에 필요한 범위 (토스 개인정보 처리방침 적용)',
            '· 클라우드·서버 운영 위탁: 서비스 호스팅·DB 운영 (위탁 시 계약으로 안전조치 의무화)',
            '법령에 따른 요청이 있는 경우 관련 법령이 정한 절차에 따라 제공할 수 있어요.',
        ],
    },
    {
        heading: '3. 보유 기간 및 파기',
        paragraphs: [
            '동의받은 보유 기간 또는 관련 법령에 따라 보관하며, 목적이 달성되거나 보유 기간이 지나면 지체 없이 파기해요.',
            '전자 파일은 복구·재생이 불가능한 방법으로 삭제하고, 종이 문서는 분쇄 또는 소각해요.',
            '회원 탈퇴 시 지체 없이 파기하는 것을 원칙으로 하되, 관련 법령에 보관 의무가 있으면 그 기간 동안 분리 보관해요.',
        ],
    },
    {
        heading: '4. 개인정보의 안전성 확보조치',
        paragraphs: [
            '전송 구간은 HTTPS 등 안전한 통신을 사용하도록 해요.',
            '서버에 저장되는 민감·고유식별에 가까운 정보(휴대전화번호 등)는 암호화 등 보호조치를 적용하는 것을 목표로 해요.',
            '접근 권한을 최소화하고, 로그·모니터링으로 무단 접근을 점검해요.',
            '토스 인증(본인확인)을 연동하는 경우, 이름·생년월일·휴대전화번호 등 인증 요청 개인정보는 토스 인증 SDK의 세션키 암복호화 절차를 따릅니다. (원터치 인증은 고객사→토스로의 개인정보 전달이 없어 암호화가 불필요할 수 있어요.)',
            '현재 제로스트가 직접 수집하는 휴대전화번호는 알맹상점 매장 포인트 연동·본인 확인 목적이며, 토스 인증 계약·연동 전에는 토스 인증 API로 전송하지 않아요. 앱에서 현금을 지급하거나 환전하지 않아요.',
        ],
    },
    {
        heading: '5. 개인위치정보에 관한 처리',
        paragraphs: [
            '주변 제휴 상점 안내를 위해 위치정보를 이용할 수 있어요.',
            '위치정보는 「위치정보의 보호 및 이용 등에 관한 법률」에 따라 별도 동의를 받은 뒤에만 이용해요.',
            '동의하지 않아도 앱 이용은 가능하며, 이 경우 거리·지도 기반 안내는 제한될 수 있어요.',
            '자세한 내용은 앱 내 「위치정보 이용 동의」 안내를 따릅니다.',
        ],
    },
    {
        heading: '6. 미성년자',
        paragraphs: [
            '만 14세 미만 아동의 개인정보는 법정대리인 동의 없이 수집하지 않아요. 해당 이용이 확인되면 지체 없이 삭제해요.',
        ],
    },
    {
        heading: '7. 이용자의 권리',
        paragraphs: [
            '이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의 철회를 요청할 수 있어요.',
            `관련 요청은 ${PRIVACY_POLICY_META.contactEmail}로 접수할 수 있으며, 팀은 본인 확인 후 관계 법령에 따라 필요한 조치를 진행해요.`,
            '법정대리인은 만 14세 미만 아동의 권리를 대리 행사할 수 있어요.',
        ],
    },
    {
        heading: '8. 문의 및 불만처리',
        paragraphs: [
            '개인정보 처리와 관련한 문의, 불만, 삭제 요청, 동의 철회 요청 등은 아래 이메일로 접수할 수 있어요.',
            `개인정보 보호책임자: ${PRIVACY_POLICY_META.dpoName}`,
            `이메일: ${PRIVACY_POLICY_META.contactEmail}`,
            '팀은 접수된 요청을 확인한 후 지체 없이 답변 및 처리할 수 있도록 노력해요.',
            `개인정보처리자: ${PRIVACY_POLICY_META.operator}`,
            `서비스명: ${PRIVACY_POLICY_META.serviceName}`,
        ],
    },
    {
        heading: '9. 방침의 변경',
        paragraphs: [
            `본 방침은 ${PRIVACY_POLICY_META.updatedAt}부터 적용돼요. (버전 ${PRIVACY_POLICY_META.version})`,
            '내용이 변경되면 앱 내 공지 또는 본 방침의 시행일·버전을 통해 안내해요.',
        ],
    },
];

export const PRIVACY_POLICY_LABELS = {
    viewFull: '개인정보 처리방침 보기',
    viewFullLink: '개인정보 처리방침 보기 →',
    mustReadHint: '처리방침을 확인한 뒤 동의할 수 있어요.',
    mustReadBeforeConsent: '개인정보 처리방침을 끝까지 확인해 주세요.',
    readToEndHint: '아래까지 모두 읽으면 동의할 수 있어요.',
    policyConfirmed: '처리방침을 확인했어요.',
    confirmRead: '확인했어요',
    close: '닫기',
    myPageEntry: '개인정보 처리방침',
    openExternal: '참고 문서 열기',
    requiredSection: '[필수] 서비스 제공',
    optionalSection: '[선택] 매장 포인트 연동(휴대전화)',
    agreeRequired: '필수 항목에 동의해요',
    agreeOptional: '선택 항목에 동의해요',
    declineOptional: '선택 항목은 나중에',
    requiredAgreed: '필수 항목에 동의했어요',
    optionalAgreed: '선택 항목에 동의했어요',
} as const;

/** 온보딩 동의 체크 문구 */
export const ONBOARDING_PRIVACY_CHECKBOX = {
    policy: '[필수] 개인정보 처리방침을 확인했어요',
    service: '[필수] 개인정보 수집·이용에 동의해요',
    serviceHint: '닉네임, 기기 식별값, 이용 기록, 인증 사진 등을 포함해요',
    phone: '[선택] 매장 포인트 연동을 위한 휴대전화번호 수집·이용에 동의해요',
    phoneHint: '원하지 않으면 「나중에 할게요」로 건너뛸 수 있어요',
} as const;
