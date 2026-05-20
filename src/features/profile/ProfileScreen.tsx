import { mockUser } from '@api/mock';
import { getOnboardingResult } from '@api/mock/onboardingState';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { segmentLabel } from '../onboarding/surveyOptions';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
    const onboarding = getOnboardingResult();
    const segmentSummary =
        onboarding != null
            ? segmentLabel({
                  practitioner: onboarding.practitioner,
                  practitionerSegment: onboarding.practitionerSegment,
                  interestSegment: onboarding.interestSegment,
              })
            : '설문 전';

    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>프로필</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>제로스트 활동 정보</Top.SubtitleParagraph>}
            />
            <View style={styles.card}>
                <Txt typography="t4" fontWeight="bold" style={styles.nickname}>
                    {mockUser.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {`${mockUser.teamName} 팀`}
                </Txt>
                <View style={styles.stats}>
                    <Txt typography="t6">연속 {mockUser.streakDays}일</Txt>
                    <Txt typography="t6">누적 {mockUser.totalPoints}P</Txt>
                </View>
            </View>
            <ListRow
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top="시작 설문 결과"
                        bottom={segmentSummary}
                    />
                }
            />
            <ListRow
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top="알림 설정"
                        bottom="하루 1회 요약"
                    />
                }
                right={<ListRow.RightTexts type="1RowTypeA" top="ON" />}
            />
            <ListRow
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top="계정"
                        bottom="토스 로그인 없이 앱인토스 식별·저장소로 이용 (MVP)"
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
        marginBottom: 20,
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
});
