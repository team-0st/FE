import { mockUser } from '@api/mock';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type ProfileScreenProps = {
    onPressLogin: () => void;
};

export function ProfileScreen({ onPressLogin }: ProfileScreenProps) {
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
                    {`${mockUser.teamName}띠 팀`}
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
                        top="알림 설정"
                        bottom="하루 1회 요약 (MVP UI)"
                    />
                }
                right={<ListRow.RightTexts type="1RowTypeA" top="ON" />}
            />
            <ListRow
                contents={
                    <ListRow.Texts type="2RowTypeA" top="토스 로그인" bottom="사업자 등록 후 연동 예정" />
                }
                onPress={onPressLogin}
            />
            <Button size="medium" type="dark" style="weak" onPress={onPressLogin}>
                로그인 플레이스홀더
            </Button>
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
        marginTop: 12,
    },
    stats: {
        marginTop: 16,
        gap: 4,
        alignItems: 'center',
    },
});
