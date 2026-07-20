/**
 * 제로스트 이용약관 (최소 버전)
 * - 법무 검토 전 운영 초안. 실제 출시 전 검토·갱신 필요 (코드 주석, UI 미노출)
 */
import { PRIVACY_POLICY_META } from './privacyPolicy';

export const TERMS_OF_SERVICE_META = {
    title: '이용약관',
    updatedAt: PRIVACY_POLICY_META.updatedAt,
    version: PRIVACY_POLICY_META.version,
    operator: PRIVACY_POLICY_META.operator,
    serviceName: PRIVACY_POLICY_META.serviceName,
    contactEmail: PRIVACY_POLICY_META.contactEmail,
} as const;

export type TermsOfServiceSection = {
    heading: string;
    paragraphs: string[];
};

export const TERMS_OF_SERVICE_SECTIONS: TermsOfServiceSection[] = [
    {
        heading: '1. 서비스 이용',
        paragraphs: [
            `${TERMS_OF_SERVICE_META.serviceName}는 미션 인증, 재료 수집, 스프 제작 등 앱 안에서 즐길 수 있는 기능을 제공해요.`,
            '에코잼은 앱 안에서만 쓰이는 재화이며, 현금이나 알맹 포인트로 교환되지 않아요.',
            '알맹 포인트는 알맹상점 등 제휴 매장에서만 이용할 수 있고, 앱에서 현금으로 바꾸거나 환불·출금할 수 없어요.',
            '이용자는 실제와 다른 정보로 미션을 인증하거나 서비스를 부정하게 이용하지 않아야 해요.',
        ],
    },
    {
        heading: '2. 서비스의 변경·중단',
        paragraphs: [
            '팀은 서비스 운영상·기술상 필요에 따라 기능의 일부를 변경하거나 중단할 수 있어요.',
            '중요한 변경이 있으면 앱 내 공지 등을 통해 미리 알리려고 노력해요.',
        ],
    },
    {
        heading: '3. 면책',
        paragraphs: [
            `${TERMS_OF_SERVICE_META.operator}은 관련 법령에서 정한 경우를 제외하고, 무료로 제공되는 서비스 이용과 관련해 발생한 손해에 대해 책임을 지지 않아요.`,
            '천재지변, 정전, 통신 장애 등 팀이 통제할 수 없는 사유로 서비스가 중단된 경우 책임이 제한될 수 있어요.',
        ],
    },
    {
        heading: '4. 문의',
        paragraphs: [
            '이용약관에 대한 문의는 아래 이메일로 접수할 수 있어요.',
            `이메일: ${TERMS_OF_SERVICE_META.contactEmail}`,
        ],
    },
    {
        heading: '5. 약관의 변경',
        paragraphs: [
            `본 약관은 ${TERMS_OF_SERVICE_META.updatedAt}부터 적용돼요. (버전 ${TERMS_OF_SERVICE_META.version})`,
            '내용이 변경되면 앱 내 공지 또는 본 약관의 시행일·버전을 통해 안내해요.',
        ],
    },
];

export const TERMS_OF_SERVICE_LABELS = {
    viewFull: '이용약관 보기',
    viewFullLink: '이용약관 보기 →',
    close: '닫기',
    myPageEntry: '이용약관',
} as const;
