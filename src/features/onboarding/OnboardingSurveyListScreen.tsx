import { Button, ListRow } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { Screen } from '../../shared/ui/Screen';

type SurveyOption<T extends string> = {
    value: T;
    label: string;
    description: string;
};

type OnboardingSurveyListScreenProps<T extends string> = {
    guideMessage: string;
    options: SurveyOption<T>[];
    onSubmit: (value: T) => void;
};

export function OnboardingSurveyListScreen<T extends string>({
    guideMessage,
    options,
    onSubmit,
}: OnboardingSurveyListScreenProps<T>) {
    const [selected, setSelected] = useState<T | null>(null);

    return (
        <Screen>
            <View style={styles.body}>
                <GuideDialogue message={guideMessage} mood="think" />
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {options.map((option) => (
                        <ListRow
                            key={option.value}
                            onPress={() => setSelected(option.value)}
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={option.label}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={option.description}
                                />
                            }
                            right={
                                selected === option.value ? (
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top="선택"
                                        topProps={{ color: 'blue500' }}
                                    />
                                ) : undefined
                            }
                        />
                    ))}
                </ScrollView>
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={selected == null}
                    onPress={() => {
                        if (selected != null) {
                            onSubmit(selected);
                        }
                    }}
                >
                    다음
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingTop: 12,
    },
    list: {
        flex: 1,
    },
    cta: {
        padding: 20,
    },
});
