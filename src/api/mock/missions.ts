import type { Mission } from '@api/mock/types';

export const DAILY_MISSIONS: Mission[] = [
    {
        id: 'tumbler',
        title: '텀블러 사용 인증',
        description: '외출 전 텀블러를 챙겨요.',
        points: 20,
        emoji: '☕️',
        authHint: '텀블러 사진 1장',
    },
    {
        id: 'bag',
        title: '장바구니 사용 인증',
        description: '마트·편의점에서 장바구니를 사용해요.',
        points: 20,
        emoji: '🛍️',
        authHint: '장바구니 사용 사진 1장',
    },
    {
        id: 'reusable',
        title: '다회용기 사용 인증',
        description: '일회용 대신 다회용기를 사용해요.',
        points: 20,
        emoji: '🥡',
        authHint: '다회용기 사용 사진 1장',
    },
    {
        id: 'recycle',
        title: '분리배출 인증',
        description: '올바르게 분리수거해요.',
        points: 30,
        emoji: '♻️',
        authHint: '분리수거 사진 1장',
    },
    {
        id: 'transit',
        title: '대중교통 이용 인증',
        description: '가까운 거리는 대중교통으로 이동해요.',
        points: 25,
        emoji: '🚌',
        authHint: '교통카드·탑승 인증 사진 1장',
    },
    {
        id: 'pickup-not-delivery',
        title: '배달 대신 포장하기',
        description: '배달 대신 직접 가거나 포장해 와요.',
        points: 25,
        emoji: '🚶',
        authHint: '포장·방문 인증 사진 1장',
    },
];

export const SPECIAL_MISSIONS: Mission[] = [
    {
        id: 'almang-visit',
        title: '알맹상점 방문',
        description: '알맹상점을 방문하고 인증해요.',
        points: 40,
        emoji: '🏪',
        authHint: '매장 방문 사진 1장',
    },
    {
        id: 'refill-station',
        title: '리필스테이션 이용',
        description: '리필스테이션에서 용기를 채워요.',
        points: 35,
        emoji: '♻️',
        authHint: '리필 이용 사진 1장',
    },
    {
        id: 'plogging',
        title: '플로깅 인증',
        description: '걸으며 쓰레기를 줍는 플로깅을 해요.',
        points: 40,
        emoji: '🌿',
        authHint: '플로깅 사진 1장',
    },
];

export const ALL_MISSIONS: Mission[] = [...DAILY_MISSIONS, ...SPECIAL_MISSIONS];

export function getMissionById(id: string): Mission | undefined {
    return ALL_MISSIONS.find((mission) => mission.id === id);
}

import type { MissionProgressStatus } from '../../features/user/types';

export function missionStatusLabel(status: MissionProgressStatus): string {
    switch (status) {
        case 'completed':
            return '완료';
        case 'pending_review':
            return '검수 중';
        case 'rejected':
            return '반려됨';
        default:
            return '미완료';
    }
}
