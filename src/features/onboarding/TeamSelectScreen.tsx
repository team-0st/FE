import { mockTeams } from '@api/mock';
import { Button, ListRow, Top } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { AnimalTeamId } from '../../shared/constants/animalTeams';
import { Screen } from '../../shared/ui/Screen';
import { TeamAvatar } from '../../shared/ui/TeamAvatar';

type TeamSelectScreenProps = {
    onPressComplete: () => void;
};

export function TeamSelectScreen({ onPressComplete }: TeamSelectScreenProps) {
    const [selectedId, setSelectedId] = useState(mockTeams[0]?.id ?? '');

    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>동물 팀 선택</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            12개 동물 팀 중 하나예요. 신규·기존 사용자가 함께 활동하도록 구성돼
                            있어요. 원하시면 나중에 바꿀 수 있어요.
                        </Top.SubtitleParagraph>
                    }
                />
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {mockTeams.map((team) => (
                        <ListRow
                            key={team.id}
                            onPress={() => setSelectedId(team.id)}
                            left={
                                <TeamAvatar
                                    animalId={team.id as AnimalTeamId}
                                    emoji={team.emoji}
                                    size="small"
                                />
                            }
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={`${team.name} 팀`}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={`주간 ${team.weeklyPoints}P · ${team.memberCount}명`}
                                />
                            }
                            right={
                                selectedId === team.id ? (
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top="선택됨"
                                        topProps={{ color: 'blue500' }}
                                    />
                                ) : undefined
                            }
                        />
                    ))}
                </ScrollView>
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" onPress={onPressComplete}>
                    선택 완료
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    cta: {
        padding: 20,
    },
});
