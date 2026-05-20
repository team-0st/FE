import { mockTeams } from '@api/mock';
import { Button, ListRow, Top } from '@toss/tds-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';

type TeamSelectScreenProps = {
    onPressComplete: () => void;
};

export function TeamSelectScreen({ onPressComplete }: TeamSelectScreenProps) {
    const [selectedId, setSelectedId] = useState(mockTeams[0]?.id ?? '');

    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>어느 팀에 합류할까요?</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            나중에 변경할 수 있어요. 지금은 분위기만 골라볼게요.
                        </Top.SubtitleParagraph>
                    }
                />
                {mockTeams.map((team) => (
                    <ListRow
                        key={team.id}
                        onPress={() => setSelectedId(team.id)}
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={team.name}
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
    cta: {
        padding: 20,
    },
});
