import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { segmentLabel } from '../onboarding/surveyOptions';
import { useUser } from '../user/UserProvider';
import { resolveTeamName } from '../user/selectors';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
    const { state } = useUser();
    const teamName = resolveTeamName(state.teamId);
    const segmentSummary =
        state.onboarding != null
            ? segmentLabel({
                  practitioner: state.onboarding.practitioner,
                  practitionerSegment: state.onboarding.practitionerSegment,
                  interestSegment: state.onboarding.interestSegment,
              })
            : '설문 전';
    const stampCount = Object.values(state.missionProgress).filter((p) => p.status === 'completed').length;

    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>프로필</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>제로스트 활동 정보</Top.SubtitleParagraph>}
            />
            <GuideDialogue
                message={`지금까지 ${stampCount}개의 미션을 완료했어요. 계속 실천하면 스탬프가 더 쌓여요.`}
                mood="happy"
                compact
            />
            <View style={styles.card}>
                <Txt typography="t4" fontWeight="bold" style={styles.nickname}>
                    {state.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {`${teamName} 팀`}
                </Txt>
                <View style={styles.stats}>
                    <Txt typography="t6">연속 {state.streakDays}일</Txt>
                    <Txt typography="t6">누적 {state.totalPoints}P</Txt>
                </View>
            </View>
            <View style={styles.stampRow}>
                <View style={styles.stamp}>
                    <Txt typography="t3">🌱</Txt>
                    <Txt typography="t7" color="grey600">
                        실천 스탬프
                    </Txt>
                    <Txt typography="t5" fontWeight="bold">
                        {stampCount}개
                    </Txt>
                </View>
                <View style={styles.stamp}>
                    <Txt typography="t3">🔥</Txt>
                    <Txt typography="t7" color="grey600">
                        연속 출석
                    </Txt>
                    <Txt typography="t5" fontWeight="bold">
                        {state.streakDays}일
                    </Txt>
                </View>
            </View>
            <ListRow
                contents={
                    <ListRow.Texts type="2RowTypeA" top="시작 설문 결과" bottom={segmentSummary} />
                }
            />
            <ListRow
                contents={
                    <ListRow.Texts type="2RowTypeA" top="알림 설정" bottom="하루 1회 요약" />
                }
                right={<ListRow.RightTexts type="1RowTypeA" top="ON" />}
            />
            <ListRow
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top="계정"
                        bottom="토스 로그인 없이 앱인토스 식별·저장소로 이용해요 (MVP)"
                    />
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    nickname: {
        marginTop: 4,
    },
    stats: {
        marginTop: 16,
        gap: 4,
        alignItems: 'center',
    },
    stampRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    stamp: {
        flex: 1,
        backgroundColor: colors.sproutTint,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
