import { mockRanking, mockTeams } from '@api/mock';
import { ListRow, Top } from '@toss/tds-react-native';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import { Screen } from '../../shared/ui/Screen';
import { TeamAvatar } from '../../shared/ui/TeamAvatar';

export function RankingScreen() {
    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>주간 팀 랭킹</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>동물 팀 · 이번 주 포인트 순위</Top.SubtitleParagraph>}
            />
            {mockRanking.map((entry) => {
                const team = mockTeams.find((t) => t.name === entry.teamName);
                return (
                    <ListRow
                        key={entry.rank}
                        left={
                            team != null ? (
                                <TeamAvatar
                                    animalId={team.id as AnimalTeamId}
                                    emoji={team.emoji}
                                    size="small"
                                />
                            ) : undefined
                        }
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={`${entry.rank}위 ${entry.teamName} 팀`}
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
                );
            })}
        </Screen>
    );
}
