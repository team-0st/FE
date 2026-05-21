import type { AppUserState } from '../../features/user/types';
import { isCheckedInToday } from '../../features/user/userStateLogic';
import { resolveTeamName } from '../../features/user/selectors';

export function getHomeGuideMessage(state: AppUserState): string {
    const checkedIn = isCheckedInToday(state);
    const teamName = resolveTeamName(state.teamId);
    if (!checkedIn) {
        return '오늘 출석하고 미션을 하면 포인트가 쌓여요. 같이 시작해볼까요?';
    }
    if (state.weeklyMissionDone >= state.weeklyMissionTotal) {
        return `이번 주 미션을 모두 채웠어요. ${teamName} 팀에도 기여하고 있어요.`;
    }
    return `오늘도 잘하고 있어요. ${teamName} 팀과 함께 이번 주 ${state.weeklyMissionDone}/${state.weeklyMissionTotal}을 채워볼까요?`;
}

export const ONBOARDING_GUIDE = {
    intro: '안녕하세요. 저는 새싹이에요. 짧은 질문으로 맞춤 안내를 준비할게요.',
    practitioner: '제로웨이스트를 실천하고 계신가요? 편하게 골라주세요.',
    experience: '실천하고 계신 분이시군요. 지금 상황에 가장 가까운 것을 골라주세요.',
    interest: '관심이 있으시군요. 지금 상황에 가장 가까운 것을 골라주세요.',
    complete: '설문이 끝났어요. 이제 오늘의 미션부터 시작해볼까요?',
} as const;

export function getMissionCompleteMessage(points: number): string {
    return `미션을 완료했어요. +${points}P를 받았어요.`;
}

export function getMissionVerifyMessage(authHint: string): string {
    return `${authHint} 사진을 올려주세요.`;
}
