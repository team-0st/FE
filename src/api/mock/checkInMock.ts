import type { CheckInRequestContext, CheckInResult, CheckInSuccessDto } from '../checkIn';

const MOCK_WEIGHTS: { id: string; weight: number }[] = [
    { id: 'herb', weight: 4 },
    { id: 'leaf', weight: 4 },
    { id: 'drop', weight: 3 },
    { id: 'carrot', weight: 3 },
    { id: 'mushroom', weight: 2 },
    { id: 'seed', weight: 2 },
    { id: 'star', weight: 1 },
    { id: 'crystal', weight: 1 },
    { id: 'wind', weight: 1 },
    { id: 'ember', weight: 1 },
];

function pickMockRewardId(): string {
    const total = MOCK_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of MOCK_WEIGHTS) {
        roll -= item.weight;
        if (roll <= 0) {
            return item.id;
        }
    }
    return 'herb';
}

function yesterdayKey(today: string): string {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export async function mockPostCheckIn(ctx: CheckInRequestContext): Promise<CheckInResult> {
    await new Promise((r) => setTimeout(r, 80));
    if (ctx.lastCheckInDate === ctx.today) {
        return { ok: false, code: 'ALREADY_CHECKED_IN' };
    }
    const ingredientId = pickMockRewardId();
    const prev = ctx.ingredientInventory[ingredientId] ?? 0;
    const ingredientInventory = {
        ...ctx.ingredientInventory,
        [ingredientId]: prev + 1,
    };
    const streakDays =
        ctx.lastCheckInDate === yesterdayKey(ctx.today) ? ctx.streakDays + 1 : 1;
    const data: CheckInSuccessDto = {
        streakDays,
        reward: { ingredientId, quantity: 1 },
        ingredientInventory,
        gachaTicketsGranted: 1,
    };
    return { ok: true, data };
}
