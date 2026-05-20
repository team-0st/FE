import { mockTeams } from '@api/mock';
import { Button, ListRow, Top } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ZodiacId } from '../../shared/constants/zodiac';
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
                    title={<Top.TitleParagraph size={22}>띠 팀을 선택해 주세요</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            십이지신 동물 팀 중 하나에 합류해요. 주간 활동은 선택한 팀 기준으로 집계됩니다.
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
                                zodiacId={team.id as ZodiacId}
                                emoji={team.emoji}
                                size="small"
                            />
                        }
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={`${team.name}띠`}
                                topProps={{ fontWeight: 'bold' }}
                                bottom={`주간 ${team.weeklyPoints}P · ${team.memberCount}명`}
                            />
                        }
                        right={
                            selectedId === team.id ? (
                                <ListRow.RightTexts type="1RowTypeA" top="선택됨" topProps={{ color: 'blue500' }} />
                            ) : undefined
                        }
                    />
                ))}
                </ScrollView>
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" onPress={onPressComplete}>
                    홈으로 가기
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
