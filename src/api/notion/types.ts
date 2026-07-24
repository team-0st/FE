/** Notion DB/API 명세와 동일한 wire 타입 (BE 연동 시 그대로 사용) */

export type IngredientCatalogType = 'COMMON' | 'HIDDEN';

export type RecipeCatalogType = 'TRASH' | 'COMMON' | 'HIDDEN' | 'LEGENDARY';

export type SoupCraftResult = 'SUCCESS' | 'FAIL' | 'DUPLICATE';

export type RewardCatalogType = 'ECO_JAM' | 'REAL_ITEM' | 'TRASH_ITEM' | 'ALMANG_POINT';

export type GachaResultType = 'FAIL' | 'ECO_JAM' | 'INGREDIENT' | 'ALMANG_POINT';

export type EcoJamSourceType = 'SOUP' | 'GACHA' | 'MISSION' | 'CHECKIN';

export type IngredientDto = {
    id: number;
    name: string;
    type: IngredientCatalogType;
    imageUrl: string | null;
};

export type ShopDto = {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
};

/** FE·mock용. BE status는 `{ checkedIn }` → 파사드에서 이 형태로 정규화 */
export type CheckInResponse = {
    alreadyChecked: boolean;
    rewardedIngredient?: IngredientDto;
};

/** BE `POST /api/v1/check-in` data */
export type BeCheckInResponse = {
    rewardedIngredient: IngredientDto;
};

/** BE `GET /api/v1/check-in/status` data */
export type BeCheckInStatusResponse = {
    checkedIn: boolean;
};

export type RegisterUserResponse = {
    userId: number;
    onboardingCompleted: boolean;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
};

export type MissionVerifyPendingResponse = {
    completionId: number;
    status: 'PENDING';
};

export type MissionVerifyApprovedResponse = {
    completionId: number;
    status: 'APPROVED';
    rewardedIngredient: IngredientDto;
};

export type MissionRewardedIngredientDto = {
    id: number;
    name: string;
    imageUrl: string | null;
};

export type MissionCompletionItem = {
    completionId: number;
    missionId: number;
    missionTitle: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rewardClaimable: boolean;
    rewardClaimed: boolean;
    rewardedIngredient?: MissionRewardedIngredientDto;
    submittedAt: string;
    reviewedAt?: string;
    rewardClaimedAt?: string;
};

export type MissionRewardClaimResponse = {
    completionId: number;
    missionId: number;
    rewardedIngredient: MissionRewardedIngredientDto;
    rewardClaimedAt: string;
};

/** GET /api/v1/rewards */
export type RewardsSummaryDto = {
    totalPendingRewardCount: number;
    pendingEcoJam: number;
    pendingPoint: number;
    pendingCommonIngredientCount: number;
    pendingHiddenIngredientCount: number;
};

export type RewardEntryDto = {
    rewardType: 'INGREDIENT' | 'ECO_JAM' | 'POINT' | string;
    ingredientType?: string | null;
    ingredientId?: number | null;
    ingredientName?: string | null;
    quantity: number;
    imageUrl?: string | null;
};

export type RewardBundleDto = {
    rewardId: number;
    rewardSourceType: 'MISSION' | 'COMMUNITY_MISSION' | string;
    sourceId: number;
    sourceTitle: string;
    rewardStatus: 'CLAIMABLE' | 'CLAIMED' | string;
    earnedAt: string;
    claimedAt?: string | null;
    rewards: RewardEntryDto[];
};

export type RewardsTabDto = {
    summary: RewardsSummaryDto;
    items: RewardBundleDto[];
};

export type ClaimRewardDto = {
    rewardId: number;
    claimedAt: string;
};

export type ClaimAllRewardsDto = {
    claimedRewardCount: number;
    claimedAt: string;
};

export type MissionVerifyResponse = MissionVerifyPendingResponse | MissionVerifyApprovedResponse;

/** FE 스프 보상 등급 (노션 리롤: 꽝~대박) */
export type SoupRewardGradeWire = 'FAIL' | 'INGREDIENT' | 'SMALL' | 'MEDIUM' | 'JACKPOT';

export type SoupCraftResponse = {
    soupId: number;
    result: SoupCraftResult;
    recipeName?: string;
    rewardType?: RewardCatalogType;
    rewardAmount?: number;
    rewardDescription?: string;
    /** FE — 리롤·표시용 등급 */
    rewardGrade?: SoupRewardGradeWire;
    /** FE — 재료 지급 등급일 때 slug */
    rewardIngredientId?: string;
    /** BE brew — 에코잼·포인트를 동시에 줄 수 있음 */
    rewardEcoJam?: number;
    rewardPoint?: number;
    /**
     * true면 BE `POST /soups/brew`가 성공해 서버에 재료 차감·보상이 반영됨.
     * false/undefined면 mock 등 로컬 결과 — 서버 재고로 덮어쓰면 안 됨.
     */
    persistedOnServer?: boolean;
};

export type GachaResponse = {
    gachaId: number;
    costEcoJam: number;
    resultType: GachaResultType;
    resultAmount?: number;
    resultIngredient?: IngredientDto;
    remainingEcoJam: number;
};

export type OnboardingCompleteResponse = {
    userId: number;
    nickname: string;
    phoneNumber: string;
    shopId: number;
};

export type UserIngredientResponse = {
    ingredientId: number;
    name: string;
    type: IngredientCatalogType | string;
    imageUrl: string | null;
    quantity: number;
};

export type MissionSummaryDto = {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    todayStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    rewardClaimable: boolean;
    rewardClaimed: boolean;
    rewardClaimedAt?: string | null;
};

/** BE `GET /api/v1/missions` */
export type DailyMissionSectionsDto = {
    generalMissions: MissionSummaryDto[];
    specialMission: MissionSummaryDto | null;
};

export type ProfileResponse = {
    nickname: string;
    shopName: string;
    ecoJam: number;
    totalSoups: number;
    ingredients: Array<{
        ingredientId: number;
        name: string;
        type: IngredientCatalogType;
        imageUrl: string | null;
        quantity: number;
    }>;
    completedMissionsThisWeek: number;
};

export type EcoJamHistoryItem = {
    id: number;
    amount: number;
    sourceType: EcoJamSourceType;
    description: string;
    createdAt: string;
};

/** BE `GET /api/v1/community-missions` 항목 */
export type CommunityMissionProgressDto = {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    difficulty: string;
    stage: number;
    /** 목표 달성 비율(%) */
    targetRatio: number;
    /** 현재 달성 비율(%) — 온보딩 완료 유저 기준 집계 */
    achievementRatio: number;
    participantCount: number;
    totalUserCount: number;
    succeeded: boolean;
    unlocked: boolean;
    completed: boolean;
    requiredProofCount: number;
    submittedProofCount: number;
    approvedProofCount: number;
    readyToComplete: boolean;
};

/** BE 실제 prefix는 `/api/v1` */
export const API_PATHS = {
    usersRegister: '/api/v1/users/register',
    authLogin: '/api/v1/auth/login',
    shops: '/api/v1/shops',
    onboardingComplete: '/api/v1/onboarding/complete',
    checkIn: '/api/v1/check-in',
    checkInStatus: '/api/v1/check-in/status',
    missions: '/api/v1/missions',
    missionDetail: (id: number) => `/api/v1/missions/${id}`,
    missionVerify: (id: number) => `/api/v1/missions/${id}/verify`,
    missionCompletions: '/api/v1/missions/completions',
    missionRewardClaim: (completionId: number) =>
        `/api/v1/missions/completions/${completionId}/claim`,
    rewards: '/api/v1/rewards',
    rewardClaim: (rewardId: number) => `/api/v1/rewards/${rewardId}/claim`,
    rewardsClaimAll: '/api/v1/rewards/claim-all',
    filesUpload: '/api/v1/files/upload',
    ingredients: '/api/v1/ingredients',
    recipes: '/api/v1/recipes',
    recipeDetail: (id: number) => `/api/v1/recipes/${id}`,
    recipesUnlockHidden: '/api/v1/recipes/unlock/hidden',
    soupsBrew: '/api/v1/soups/brew',
    soupReroll: (soupId: number) => `/api/v1/soups/${soupId}/reroll`,
    gachasDraw: '/api/v1/gachas/draw',
    gachasHistories: '/api/v1/gachas/histories',
    myPage: '/api/v1/my-page',
    ecoJamHistories: '/api/v1/histories/eco-jams',
    pointHistories: '/api/v1/histories/points',
    home: '/api/v1/home',
    communityMissions: '/api/v1/community-missions',
    communityMissionDetail: (id: number) => `/api/v1/community-missions/${id}`,
    communityMissionProof: (missionId: number, requirementId: number) =>
        `/api/v1/community-missions/${missionId}/proofs/${requirementId}`,
    communityMissionComplete: (id: number) =>
        `/api/v1/community-missions/${id}/complete`,
    filesUploadCommunity: '/api/v1/files/upload/community-missions',
    testerLinkCurrent: '/api/v1/tester-link/current',
    adminTesterLink: '/api/v1/admin/tester-link',
    adminUsers: '/api/v1/admin/users',
    adminAssetsGrant: '/api/v1/admin/assets/grant',
    adminMissionCompletionsPending: '/api/v1/admin/missions/completions/pending',
    adminMissionCompletionsReviewed: '/api/v1/admin/missions/completions/reviewed',
    adminMissionCompletionReview: (completionId: number) =>
        `/api/v1/admin/missions/completions/${completionId}/review`,
    adminCommunityProofsPending: '/api/v1/admin/community-missions/proofs/pending',
    adminCommunityProofsReviewed: '/api/v1/admin/community-missions/proofs/reviewed',
    adminCommunityProofReview: (proofId: number) =>
        `/api/v1/admin/community-missions/proofs/${proofId}/review`,
} as const;
