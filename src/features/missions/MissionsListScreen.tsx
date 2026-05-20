import { mockMissions } from '@api/mock';
import { ListRow, Top } from '@toss/tds-react-native';
import { Screen } from '../../shared/ui/Screen';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
};

export function MissionsListScreen({ onPressMission }: MissionsListScreenProps) {
    return (
        <Screen>
            <Top
                title={<Top.TitleParagraph size={22}>오늘의 미션</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>완료하면 포인트와 팀 기여도가 쌓여요.</Top.SubtitleParagraph>}
            />
            {mockMissions.map((mission) => (
                <ListRow
                    key={mission.id}
                    onPress={() => onPressMission(mission.id)}
                    left={<ListRow.Icon name="icon-leaf-mono" />}
                    contents={
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={`${mission.emoji} ${mission.title}`}
                            topProps={{ fontWeight: 'bold' }}
                            bottom={mission.description}
                        />
                    }
                    right={
                        <ListRow.RightTexts
                            type="1RowTypeA"
                            top={mission.completed ? '완료' : `+${mission.points}P`}
                            topProps={{ color: mission.completed ? 'green500' : 'blue500' }}
                        />
                    }
                />
            ))}
        </Screen>
    );
}
