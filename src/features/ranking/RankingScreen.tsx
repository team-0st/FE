import { buildPersonalRanking, mockRanking, mockTeams } from '@api/mock';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import { useUser } from '../user/UserProvider';
import { resolveTeamName } from '../user/selectors';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { Screen } from '../../shared/ui/Screen';
import { TeamAvatar } from '../../shared/ui/TeamAvatar';
import { colors } from '../../shared/theme/colors';

type RankingTab = 'team' | 'personal';

export function RankingScreen() {
    const { state } = useUser();
    const [tab, setTab] = useState<RankingTab>('team');
    const myTeamId = state.teamId;

    const teamRanking = useMemo(
        () =>
            mockRanking.map((entry) => {
                const team = mockTeams.find((t) => t.name === entry.teamName);
                const isMyTeam = team?.id === myTeamId;
                return { ...entry, isMyTeam };
            }),
        [myTeamId],
    );

    const personalRanking = useMemo(
        () =>
            buildPersonalRanking({
                nickname: state.nickname,
                teamId: state.teamId,
                weeklyPoints: state.totalPoints,
            }),
        [state.nickname, state.teamId, state.totalPoints],
    );

    const myPersonalRank = personalRanking.find((entry) => entry.isMe)?.rank;
    const guideMessage =
        tab === 'team'
            ? '동물 팀별로 이번 주 포인트 순위를 볼 수 있어요.'
            : '개인별로 이번 주 누적 포인트 순위를 볼 수 있어요.';

    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>주간 랭킹</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>
                        {tab === 'team'
                            ? '동물 팀 · 이번 주 포인트 순위'
                            : '개인 · 이번 주 누적 포인트 순위'}
                    </Top.SubtitleParagraph>
                }
            />
            <GuideDialogue message={guideMessage} compact />
            <View style={styles.tabs}>
                <Pressable
                    onPress={() => setTab('team')}
                    style={[styles.tab, tab === 'team' && styles.tabActive]}
                >
                    <Txt typography="t6" fontWeight={tab === 'team' ? 'bold' : 'regular'}>
                        팀
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setTab('personal')}
                    style={[styles.tab, tab === 'personal' && styles.tabActive]}
                >
                    <Txt typography="t6" fontWeight={tab === 'personal' ? 'bold' : 'regular'}>
                        개인
                    </Txt>
                </Pressable>
            </View>
            {tab === 'personal' && myPersonalRank != null ? (
                <View style={styles.myRankBanner}>
                    <Txt typography="t6" color="grey600">
                        내 순위
                    </Txt>
                    <Txt typography="t4" fontWeight="bold" color="blue500">
                        {`${myPersonalRank}위 · ${state.totalPoints}P · ${resolveTeamName(state.teamId)} 팀`}
                    </Txt>
                </View>
            ) : null}
            {tab === 'team'
                ? teamRanking.map((entry) => {
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
                  })
                : personalRanking.map((entry) => (
                      <ListRow
                          key={`${entry.rank}-${entry.nickname}`}
                          left={
                              <TeamAvatar
                                  animalId={entry.teamId as AnimalTeamId}
                                  emoji={mockTeams.find((t) => t.id === entry.teamId)?.emoji ?? '🌿'}
                                  size="small"
                              />
                          }
                          contents={
                              <ListRow.Texts
                                  type="2RowTypeA"
                                  top={`${entry.rank}위 ${entry.nickname}`}
                                  topProps={{ fontWeight: entry.isMe ? 'bold' : 'medium' }}
                                  bottom={`${entry.teamName} 팀`}
                              />
                          }
                          right={
                              <ListRow.RightTexts
                                  type="1RowTypeA"
                                  top={`${entry.points}P`}
                                  topProps={{ color: entry.isMe ? 'blue500' : 'grey600' }}
                              />
                          }
                      />
                  ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    tabs: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabActive: {
        borderColor: colors.primary,
        backgroundColor: '#E8F3FF',
    },
    myRankBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
    },
});
