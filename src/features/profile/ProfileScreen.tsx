import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { segmentLabel } from '../onboarding/surveyOptions';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
    const { state } = useUser();
    const shopName = resolveShopName(state.shopId);
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
                title={<Top.TitleParagraph size={22}>기록</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>내 실천과 설문 상태</Top.SubtitleParagraph>}
            />
            <GuideDialogue
                message={`${stampCount}개의 미션을 완료했어요. 시작·종료 설문으로 변화를 확인해요.`}
                mood="happy"
                compact
            />
            <View style={styles.card}>
                <Txt typography="t4" fontWeight="bold">
                    {state.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {shopName}
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
                        완료 미션
                    </Txt>
                    <Txt typography="t5" fontWeight="bold">
                        {stampCount}개
                    </Txt>
                </View>
                <View style={styles.stamp}>
                    <Txt typography="t3">📋</Txt>
                    <Txt typography="t7" color="grey600">
                        설문
                    </Txt>
                    <Txt typography="t5" fontWeight="bold">
                        {state.preSurveyDone ? '사전 완료' : '사전 미완료'}
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
                    <ListRow.Texts
                        type="2RowTypeA"
                        top="사후 설문"
                        bottom={state.postSurveyDone ? '완료' : '기간 종료 후 진행'}
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
