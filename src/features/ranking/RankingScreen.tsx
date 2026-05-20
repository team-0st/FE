import { mockRanking } from '@api/mock';
import { ListRow, Top } from '@toss/tds-react-native';
import { Screen } from '../../shared/ui/Screen';

export function RankingScreen() {
    return (
        <Screen>
            <Top
                title={<Top.TitleParagraph size={22}>주간 팀 랭킹</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>이번 주 월요일 00시 기준 (mock)</Top.SubtitleParagraph>}
            />
            {mockRanking.map((entry) => (
                <ListRow
                    key={entry.rank}
                    contents={
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={`${entry.rank}위 ${entry.teamName}`}
                            topProps={{ fontWeight: entry.isMyTeam ? 'bold' : 'medium' }}
                            bottom={entry.isMyTeam ? '내 팀' : '다른 팀'}
                        />
                    }
                    right={
                        <ListRow.RightTexts
                            type="1RowTypeA"
                            top={`${entry.points}P`}
                            topProps={{ color: entry.isMyTeam ? 'blue500' : 'grey600' }}
                        />
                    }
                />
            ))}
        </Screen>
    );
}
