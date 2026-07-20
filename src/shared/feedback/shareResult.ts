import { Share } from 'react-native';
import { APP_SCHEME } from '../constants/app';

export const ZEROST_SHARE_HASHTAG = '#제로스트';

export async function shareZerostResult(body: string): Promise<boolean> {
    const message = `${body}\n\n${ZEROST_SHARE_HASHTAG}\n${APP_SCHEME}`;
    const result = await Share.share({ message });
    return result.action === Share.sharedAction;
}

export function buildSoupShareMessage(recipeName: string, rewardLabel: string): string {
    return `제로스트에서 ${recipeName} 스프를 끓였어요!\n${rewardLabel}`;
}

export function buildMissionShareMessage(missionTitle: string, rewardLabel: string): string {
    return `제로스트에서 「${missionTitle}」 미션을 완료했어요!\n${rewardLabel}`;
}

export function buildGachaShareMessage(rewardLabel: string): string {
    return `제로스트 가챠에서 ${rewardLabel}을(를) 뽑았어요!`;
}
