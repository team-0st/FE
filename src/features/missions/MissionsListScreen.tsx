import { formatMissionIngredientReward } from '@api/mock/ingredients';
import {
    COOP_MISSIONS,
    DAILY_MISSIONS,
    missionStatusLabel,
    SPECIAL_MISSIONS,
} from '@api/mock/missions';
import type { CoopMission, Mission } from '@api/mock';
import { isApiEnabled } from '@api/client';
import {
    communityProgressStatus,
    communityToCoopMission,
    getCommunityMissions,
} from '@api/communityMissions';
import {
    getDailyMissionSections,
    missionFromBeSummary,
    resolveMissionSlugFromBe,
    type MissionTodayStatus,
} from '@api/missions';
import { Badge, Border, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { missionStatusFromBeAndLocal, missionStatusFor } from '../user/selectors';
import type { MissionProgressStatus } from '../user/types';
import { coopDifficultyStars, coopUnlockHint, isCoopMissionUnlocked } from './coopMissionLogic';
import { MissionCompletedPanel } from './MissionCompletedPanel';
import { MissionRewardsPanel } from './MissionRewardsPanel';
import { RecipeListRowShell } from '../recipes/RecipeCompletedStamp';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { getMissionImageSource } from '../../shared/constants/missionAssets';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { colors } from '../../shared/theme/colors';
import { CenterLoader } from '../../shared/ui/CenterLoader';

type MissionsListScreenProps = {
    onPressMission: (id: string) => void;
};

type MissionsListTab = 'missions' | 'rewards' | 'completed';

type BeMissionFlags = {
    rewardClaimable: boolean;
    rewardClaimed: boolean;
    todayStatus: MissionTodayStatus;
};

type CommunityListItem = {
    mission: CoopMission;
    unlocked: boolean;
    status: MissionProgressStatus;
};

type StatusBadgeType = 'green' | 'blue' | 'elephant' | 'red';

function statusBadgeType(status: MissionProgressStatus): StatusBadgeType {
    if (status === 'completed') {
        return 'green';
    }
    if (status === 'claimable') {
        return 'green';
    }
    if (status === 'pending_review') {
        return 'elephant';
    }
    if (status === 'rejected') {
        return 'red';
    }
    return 'blue';
}

/**
 * TDS ListHeader의 title/right 정렬이 기기에서 어긋나는 문제가 있어,
 * 제목·개수·설명을 직접 배치해요. 제목과 "N개"는 반드시 같은 줄에 있어야 해요.
 */
function MissionSectionHeader({
    title,
    count,
    description,
    rewardBadge,
}: {
    title: string;
    count: number;
    description?: string;
    rewardBadge?: string;
}) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
                <Txt typography="t5" fontWeight="semibold" color="grey800">
                    {title}
                </Txt>
                <Txt typography="t7" color={colors.textSecondary}>
                    {`${count}개`}
                </Txt>
            </View>
            {description != null ? (
                <Txt typography="t7" color="grey600" style={styles.sectionHeaderDesc}>
                    {description}
                </Txt>
            ) : null}
            {rewardBadge != null ? (
                <Badge
                    size="small"
                    badgeStyle="weak"
                    type="blue"
                    style={styles.sectionHeaderBadge}
                >
                    {rewardBadge}
                </Badge>
            ) : null}
        </View>
    );
}

function MissionRow({
    mission,
    status,
    onPress,
    showReward = true,
}: {
    mission: Mission;
    status: MissionProgressStatus;
    onPress: () => void;
    /** 섹션 전체 보상이 동일할 때(일반 미션)는 행마다 반복 표시하지 않아요. */
    showReward?: boolean;
}) {
    const isCompleted = status === 'completed';
    const rightLabel =
        status === 'available' ? formatMissionIngredientReward(mission.id) : missionStatusLabel(status);
    const showBadge = !isCompleted && (status !== 'available' || showReward);

    return (
        <RecipeListRowShell done={isCompleted}>
            <ListRow
                onPress={onPress}
                left={
                    <BrandEmojiImage
                        source={getMissionImageSource(mission.id, mission.title)}
                        size={48}
                        containerStyle={styles.rowIcon}
                        accessibilityLabel={`${mission.title} 아이콘`}
                    />
                }
                contents={
                    <ListRow.Texts
                        type="2RowTypeA"
                        top={mission.title}
                        topProps={{ numberOfLines: 1 }}
                        bottom={mission.description}
                        bottomProps={{ numberOfLines: 2 }}
                    />
                }
                withArrow
                right={
                    showBadge ? (
                        <Badge size="small" badgeStyle="weak" type={statusBadgeType(status)}>
                            {rightLabel}
                        </Badge>
                    ) : undefined
                }
            />
        </RecipeListRowShell>
    );
}

function CoopMissionRow({
    mission,
    status,
    unlocked,
    onPress,
}: {
    mission: CoopMission;
    status: MissionProgressStatus;
    unlocked: boolean;
    onPress: () => void;
}) {
    // 뱃지는 짧게 유지 — 보상/상태만. 별 태그는 제목 줄과 분리된 캡션 줄로 — 제목에 붙이면 폭이 눌려 "..."로 잘려요.
    const isCompleted = unlocked && status === 'completed';
    const rightLabel = unlocked
        ? status === 'available'
            ? '재료 1종'
            : missionStatusLabel(status)
        : '잠금';

    return (
        <RecipeListRowShell done={isCompleted}>
            <ListRow
                onPress={onPress}
                left={
                    unlocked ? (
                        <BrandEmojiImage
                            source={getMissionImageSource(mission.id, mission.title)}
                            size={48}
                            containerStyle={styles.rowIcon}
                            accessibilityLabel={`${mission.title} 아이콘`}
                        />
                    ) : (
                        <ListRow.Icon name={TDS_ICON.missionLock} color={colors.textSecondary} />
                    )
                }
                contents={
                    <View>
                        <Txt typography="t7" color={unlocked ? 'grey600' : 'grey500'} style={styles.difficultyStars}>
                            {coopDifficultyStars(mission.difficulty)}
                        </Txt>
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={mission.title}
                            topProps={{ color: unlocked ? undefined : 'grey500', numberOfLines: 1 }}
                            bottom={
                                unlocked ? mission.description : (coopUnlockHint(mission) ?? mission.description)
                            }
                            bottomProps={{ color: unlocked ? undefined : 'grey500', numberOfLines: 3 }}
                        />
                    </View>
                }
                withArrow={unlocked}
                right={
                    isCompleted ? undefined : (
                        <Badge size="small" badgeStyle="weak" type={unlocked ? statusBadgeType(status) : 'elephant'}>
                            {rightLabel}
                        </Badge>
                    )
                }
            />
        </RecipeListRowShell>
    );
}

export function MissionsListScreen({ onPressMission }: MissionsListScreenProps) {
    const { state, syncMissionCompletions } = useUser();
    const toast = useAppToast();
    const [listTab, setListTab] = useState<MissionsListTab>('missions');
    const [generalMissions, setGeneralMissions] = useState<Mission[]>(DAILY_MISSIONS);
    const [specialMissions, setSpecialMissions] = useState<Mission[]>(SPECIAL_MISSIONS);
    const [communityItems, setCommunityItems] = useState<CommunityListItem[]>(() =>
        COOP_MISSIONS.map((mission) => ({
            mission,
            unlocked: isCoopMissionUnlocked(state, mission),
            status: missionStatusFor(state, mission.id),
        })),
    );
    const [beFlagsBySlug, setBeFlagsBySlug] = useState<Record<string, BeMissionFlags>>({});
    const [loadingBe, setLoadingBe] = useState(isApiEnabled());
    const [pendingRewardCount, setPendingRewardCount] = useState(0);

    const statusForMission = (missionId: string): MissionProgressStatus =>
        missionStatusFromBeAndLocal(state, missionId, beFlagsBySlug[missionId]);

    const localClaimableCount = Object.values(state.missionProgress).filter(
        (p) => p.status === 'claimable',
    ).length;
    const beClaimableCount = Object.values(beFlagsBySlug).filter(
        (f) => f.rewardClaimable && !f.rewardClaimed,
    ).length;
    const communityClaimableCount = communityItems.filter(
        (item) => item.unlocked && item.status === 'claimable',
    ).length;
    const claimableCount = Math.max(
        pendingRewardCount,
        localClaimableCount,
        beClaimableCount + communityClaimableCount,
    );

    useEffect(() => {
        if (!isApiEnabled()) {
            setLoadingBe(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const [sections, community] = await Promise.all([
                    getDailyMissionSections(),
                    getCommunityMissions(),
                ]);
                if (cancelled) {
                    return;
                }
                if (sections != null) {
                    setGeneralMissions(
                        sections.generalMissions.map(missionFromBeSummary),
                    );
                    setSpecialMissions(
                        sections.specialMission != null
                            ? [missionFromBeSummary(sections.specialMission)]
                            : [],
                    );
                    const flags: Record<string, BeMissionFlags> = {};
                    for (const dto of sections.generalMissions) {
                        const slug = resolveMissionSlugFromBe(dto);
                        flags[slug] = {
                            rewardClaimable: dto.rewardClaimable,
                            rewardClaimed: dto.rewardClaimed,
                            todayStatus: dto.todayStatus,
                        };
                    }
                    if (sections.specialMission != null) {
                        const dto = sections.specialMission;
                        const slug = resolveMissionSlugFromBe(dto);
                        flags[slug] = {
                            rewardClaimable: dto.rewardClaimable,
                            rewardClaimed: dto.rewardClaimed,
                            todayStatus: dto.todayStatus,
                        };
                    }
                    setBeFlagsBySlug(flags);
                }
                if (community != null && community.length > 0) {
                    setCommunityItems(
                        community.map((dto) => ({
                            mission: communityToCoopMission(dto),
                            unlocked: dto.unlocked,
                            status: communityProgressStatus(dto),
                        })),
                    );
                }
                await syncMissionCompletions();
            } catch {
                // mock 유지
            } finally {
                if (!cancelled) {
                    setLoadingBe(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [syncMissionCompletions]);

    const handleCoopPress = (item: CommunityListItem) => {
        if (!item.unlocked) {
            toast.show(coopUnlockHint(item.mission) ?? '이전 미션을 먼저 완료해 주세요.');
            return;
        }
        onPressMission(item.mission.id);
    };

    if (loadingBe) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>오늘의 미션</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>미션을 완료하면 재료가 쌓여요.</Top.SubtitleParagraph>
                }
            />

            <View style={styles.tabRow}>
                <Pressable
                    onPress={() => setListTab('missions')}
                    style={[styles.tab, listTab === 'missions' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: listTab === 'missions' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={listTab === 'missions' ? 'white' : 'grey700'}
                    >
                        미션
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setListTab('rewards')}
                    style={[styles.tab, listTab === 'rewards' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: listTab === 'rewards' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={listTab === 'rewards' ? 'white' : 'grey700'}
                    >
                        {claimableCount > 0 ? `보상 (${claimableCount})` : '보상'}
                    </Txt>
                </Pressable>
                <Pressable
                    onPress={() => setListTab('completed')}
                    style={[styles.tab, listTab === 'completed' && styles.tabActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: listTab === 'completed' }}
                >
                    <Txt
                        typography="t7"
                        fontWeight="bold"
                        color={listTab === 'completed' ? 'white' : 'grey700'}
                    >
                        완료
                    </Txt>
                </Pressable>
            </View>

            {listTab === 'rewards' ? (
                <View style={styles.rewardsWrap}>
                    <MissionRewardsPanel onPendingCountChange={setPendingRewardCount} />
                </View>
            ) : listTab === 'completed' ? (
                <View style={styles.rewardsWrap}>
                    <MissionCompletedPanel />
                </View>
            ) : (
                <>
            <GuideHero
                message={'텀블러, 장바구니, 대중교통처럼\n일상에서 할 수 있는 미션이에요.'}
                align="start"
                compact
            />

            <MissionSectionHeader
                title="공동 미션"
                count={communityItems.length}
                description={'난이도 1부터 차례로 해금돼요.\n사진 인증 후 검수가 끝나면 보상을 받아요.'}
            />
            <View style={styles.sectionCard}>
                {communityItems.map((item) => (
                    <CoopMissionRow
                        key={item.mission.id}
                        mission={item.mission}
                        status={item.status}
                        unlocked={item.unlocked}
                        onPress={() => handleCoopPress(item)}
                    />
                ))}
            </View>

            <Border type="height16" style={styles.sectionBorder} />

            <MissionSectionHeader
                title="일반 미션"
                count={generalMissions.length}
                rewardBadge="랜덤 일반 재료 1종"
            />
            <View style={styles.sectionCard}>
                {generalMissions.map((mission) => (
                    <MissionRow
                        key={mission.id}
                        mission={mission}
                        status={statusForMission(mission.id)}
                        onPress={() => onPressMission(mission.id)}
                        showReward={false}
                    />
                ))}
            </View>

            {specialMissions.length > 0 ? (
                <>
                    <Border type="height16" style={styles.sectionBorder} />
                    <MissionSectionHeader
                        title="특별 미션 (히든 재료)"
                        count={specialMissions.length}
                    />
                    <View style={styles.sectionCard}>
                        {specialMissions.map((mission) => (
                            <MissionRow
                                key={mission.id}
                                mission={mission}
                                status={statusForMission(mission.id)}
                                onPress={() => onPressMission(mission.id)}
                            />
                        ))}
                    </View>
                </>
            ) : null}
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 4,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.border,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    rewardsWrap: {
        marginTop: 12,
    },
    sectionHeader: {
        marginTop: 24,
        marginBottom: 8,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderDesc: {
        marginTop: 4,
        lineHeight: 20,
    },
    sectionHeaderBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    sectionBorder: {
        borderRadius: 8,
        marginVertical: 4,
        overflow: 'hidden',
    },
    difficultyStars: {
        marginBottom: 2,
        letterSpacing: 1,
    },
    rowIcon: {
        marginRight: 8,
    },
});
