import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = join(
    process.env.HOME,
    'Library/CloudStorage/OneDrive-가천대학교/Extracurricular Activities/NSI_글로벌리더십_제로스트/FE/screenshots',
);

const screens = [
    { id: '01-onboarding', route: '/onboarding', title: '온보딩 인트로', body: ['안녕하세요.', '저는 새싹이에요.', '함께 제로웨이스트 실천,', '천천히 시작해 볼까요?'], cta: '시작하기', tabs: false },
    { id: '02-onboarding-shop', route: '/onboarding/shop', title: '샵 선택', body: ['함께 실천할 샵을 골라주세요', '알맹상점 (파일럿)', '알맹상점 (성수)'], cta: '선택 완료', tabs: false },
    { id: '03-home', route: '/', title: '홈', stats: ['출석 미완료', '에코잼 10', '알맹P 0'], body: ['이번 주 미션 0/5', '마녀의 주방', '힌트: 향긋한 게 좋대요.'], cta: '오늘 미션 하고 재료 받기', tabs: true, active: '홈' },
    { id: '04-ingredients', route: '/ingredients', title: '제작 · 스프 끓이기', body: ['슬롯: 허브 · 이슬 · -', '제로 허브 x2', '당근 조각 x1'], cta: '끓이기', tabs: true, active: '제작' },
    { id: '05-gacha', route: '/gacha', title: '가챠', body: ['100 에코잼/회', '꽝35% · 잼30% · 재료28% · P7%'], cta: '에코잼 100개로 뽑기', tabs: true, active: '가챠' },
    { id: '06-recipes', route: '/recipes', title: '레시피', body: ['입문: 따뜻한 입문 스프', '이번주: 차분한 허브 스프', '??? 히든 (4슬롯)'], tabs: true, active: '레시피' },
    { id: '07-profile', route: '/profile', title: '마이', body: ['사용자 · 알맹상점', '에코잼 10 · 알맹P 0', '이번 주 미션 0/5'], tabs: true, active: '마이' },
    { id: '08-home-checkin', route: '/ (출석 완료)', title: '홈 · 출석 완료', stats: ['출석 완료', '에코잼 10', '알맹P 0'], body: ['제로 허브 재료를 받았어요.'], tabs: true, active: '홈' },
    { id: '09-missions', route: '/missions', title: '미션 목록', body: ['텀블러 챙기기', '장바구니 사용하기', '대중교통 이용하기', '분리수거하기 (완료)'], tabs: false },
    { id: '10-mission-detail', route: '/missions/:id', title: '미션 상세', body: ['텀블러 챙기기', '사진 1장 · verify 즉시', '풀: 허브·잎·이슬·씨앗'], cta: '인증하기', tabs: false },
    { id: '11-mission-verify', route: '/missions/:id/verify', title: '미션 인증', body: ['텀블러 사진 1장을 올려주세요.', '[ 사진 선택 영역 ]'], cta: '제출하기', tabs: false },
    { id: '12-mission-result', route: '/missions/:id/result', title: '미션 완료', body: ['미션을 완료했어요.', '제로 허브 재료를 받았어요.'], cta: '홈으로', tabs: false },
    { id: '13-soup-success', route: '/soup/result', title: '스프 성공', body: ['스프 완성!', '차분한 허브 스프', '에코잼 +32 잼'], cta: '확인', tabs: false },
    { id: '14-soup-fail', route: '/soup/result', title: '스프 실패', body: ['스프 완성!', '실패 (확률)', '쓰레기 봉투'], cta: '확인', tabs: false },
    { id: '15-shop', route: '/shop', title: '내 샵', body: ['알맹상점', '일상에서 작은 실천 (파일럿)'], cta: '샵 바꾸기', tabs: false },
    { id: '16-shop-select', route: '/shop/select', title: '샵 변경', body: ['알맹상점 (파일럿) 선택됨', '알맹상점 (성수)'], cta: '선택 완료', tabs: false },
    { id: '17-login', route: '/login', title: '로그인', body: ['토스 로그인 (BE 연동 예정)'], cta: '홈으로', tabs: false },
    { id: '18-404', route: '/_404', title: '404', body: ['404 Not Found'], tabs: false },
];

function html(s) {
    const tabs = ['제작', '가챠', '홈', '레시피', '마이'];
    const tabHtml = s.tabs
        ? `<div class="tabs">${tabs.map((t) => `<div class="tab ${s.active === t ? 'on' : ''}">${t}</div>`).join('')}</div>`
        : '';
    const statsHtml = s.stats
        ? `<div class="stats">${s.stats.map((x, i) => `<div class="stat"><small>${['출석', '에코잼', '알맹P'][i] || 'stat'}</small>${x.replace(/^[^ ]+ /, '')}</div>`).join('')}</div>`
        : '';
    const bodyHtml = s.body.map((line) => `<div class="line">${line}</div>`).join('');
    const ctaHtml = s.cta ? `<div class="cta">${s.cta}</div>` : '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
*{box-sizing:border-box}body{margin:0;background:#191f28;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif}
.wrap{width:390px;height:844px;background:#f9fafb;border-radius:0;overflow:hidden;display:flex;flex-direction:column}
.status{padding:10px 20px 6px;display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:#191f28}
.appbar{padding:8px 16px 12px;font-size:20px;font-weight:700;color:#191f28;background:#fff;border-bottom:1px solid #e5e8eb}
.hero{margin:12px 16px;padding:20px 16px;background:linear-gradient(135deg,#e8f3ff,#f3fbf6);border-radius:16px;text-align:center}
.hero .sub{font-size:12px;color:#6b7684;margin-top:6px}
.meta{padding:0 16px 4px;font-size:11px;color:#8b95a1}
.title{padding:0 16px 10px;font-size:17px;font-weight:700;color:#191f28}
.stats{display:flex;gap:8px;padding:0 16px 10px}
.stat{flex:1;background:#fff;border:1px solid #e5e8eb;border-radius:12px;padding:10px 8px;font-size:12px;font-weight:600;color:#333d4b}
.stat small{display:block;color:#8b95a1;font-size:10px;font-weight:500;margin-bottom:4px}
.content{flex:1;padding:0 16px 8px;overflow:hidden}
.line{padding:14px 12px;margin-bottom:8px;background:#fff;border:1px solid #e5e8eb;border-radius:12px;font-size:14px;color:#333d4b}
.cta{margin:8px 16px 12px;padding:15px;background:#3182f6;color:#fff;text-align:center;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(49,130,246,.25)}
.tabs{display:flex;border-top:1px solid #e5e8eb;background:#fff;padding-bottom:8px}
.tab{flex:1;text-align:center;padding:10px 2px;font-size:10px;color:#adb5bd}
.tab.on{color:#3182f6;font-weight:700}
</style></head><body><div class="wrap">
<div class="status"><span>9:41</span><span>●●●</span></div>
<div class="appbar">제로스트</div>
<div class="meta">${s.route}</div>
<div class="title">${s.title}</div>
${statsHtml}
<div class="content">${s.id.includes('home') ? '<div class="hero"><div>🍲 마녀의 주방</div><div class="sub">오늘의 레시피 힌트</div></div>' : ''}${bodyHtml}</div>
${ctaHtml}
${tabHtml}
</div></body></html>`;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const urls = [];

for (const s of screens) {
    const filePath = join(OUT, `${s.id}.png`);
    await page.setContent(html(s), { waitUntil: 'networkidle' });
    await page.screenshot({ path: filePath, type: 'png' });
    urls.push({ ...s, filePath });
}

await browser.close();
await writeFile(join(OUT, 'manifest.json'), JSON.stringify(urls, null, 2));
console.log(`Generated ${urls.length} screenshots in ${OUT}`);
