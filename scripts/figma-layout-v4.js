// Figma v4 — 결과 화면 절대 배치 + 리스트 화면 auto-layout 개선
const K = {
  screen: '9612e0670433830876d4e649fe2afad6c5e17f3a',
  button: 'a5340855b4249457e5196c886d17074319ad639e',
  list: '4d729ac3583b00c8e112c209a856967097a778ae',
  tab: 'd94c1d658d5586ef8f5c2ac4f82042b073a91327',
};
const BG = { r: 0.9686, g: 0.9608, b: 0.9804 };
const SU = { r: 1, g: 1, b: 1 };
const BD = { r: 0.9, g: 0.9, b: 0.92 };
const TX = { r: 0.12, g: 0.12, b: 0.14 };
const MU = { r: 0.45, g: 0.45, b: 0.5 };
const BR = { r: 0.486, g: 0.361, b: 0.749 };
const BL = { r: 0.2, g: 0.45, b: 0.95 };
const LIGHT = { r: 0.929, g: 0.906, b: 0.965 };
const SAFE_TOP = 94;
const TAB_H = 84;
const BTN_H = 56;
const BTN_M = 48;
const PAD = 20;
const TARGETS = ['04 홈', '06 가챠', '09 미션 목록', '10 주변 상점', '11 스프 결과', '12 미션 결과'];

async function loadFonts() {
  async function F(style = 'Regular') {
    for (const f of [{ family: 'Pretendard', style }, { family: 'Inter', style }]) {
      try { await figma.loadFontAsync(f); return f; } catch (_) {}
    }
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    return { family: 'Inter', style: 'Regular' };
  }
  const fR = await F('Regular');
  const fB = await F('Semi Bold');
  for (const f of [
    { family: 'SF Pro', style: 'Regular' }, { family: 'SF Pro', style: 'Bold' },
    { family: 'SF Pro', style: 'Medium' }, { family: 'SF Pro Text', style: 'Regular' },
    { family: 'SF Pro Text', style: 'Bold' },
  ]) { try { await figma.loadFontAsync(f); } catch (_) {} }
  return { fR, fB };
}
const { fR, fB } = await loadFonts();
function walk(n, fn) { fn(n); if ('children' in n) n.children.forEach((c) => walk(c, fn)); }

const screenComp = await figma.importComponentByKeyAsync(K.screen);
const buttonSet = await figma.importComponentSetByKeyAsync(K.button);
const listSet = await figma.importComponentSetByKeyAsync(K.list);
const tabSet = await figma.importComponentSetByKeyAsync(K.tab);

function mkText(text, size, bold = false, color = TX) {
  const t = figma.createText();
  t.fontName = bold ? fB : fR;
  t.fontSize = size;
  t.characters = text;
  t.fills = [{ type: 'SOLID', color }];
  t.textAutoResize = 'HEIGHT';
  return t;
}

async function setNavTitle(screen, title) {
  const texts = [];
  walk(screen, (n) => { if (n.type === 'TEXT' && n.name === 'Name') texts.push(n); });
  for (const t of texts) { try { await figma.loadFontAsync(t.fontName); } catch (_) {} t.characters = title; }
}

function placeCenteredText(frame, text, y, size, bold = false, color = TX, lineH = null) {
  const t = mkText(text, size, bold, color);
  t.textAlignHorizontal = 'CENTER';
  t.resize(335, lineH || size + 12);
  frame.appendChild(t);
  t.x = PAD;
  t.y = y;
  return t;
}

async function placeBtn(frame, label, y, weak = false, size = 'L') {
  const b = buttonSet.defaultVariant.createInstance();
  b.setProperties({ Size: size, Color: 'Brand', Variant: weak ? 'Weak' : 'Fill', Disabled: 'False', '*States': 'Default' });
  const texts = [];
  walk(b, (n) => { if (n.type === 'TEXT') texts.push(n); });
  for (const t of texts) { try { await figma.loadFontAsync(t.fontName); } catch (_) {} t.characters = label; }
  frame.appendChild(b);
  b.x = PAD;
  b.y = y;
  b.resize(335, b.height);
  return b;
}

async function addListRow(parent, top, bottom, right = '', muted = false) {
  const lr = listSet.defaultVariant.createInstance();
  lr.setProperties({ 'Show Left Acc': 'True', 'Show Right Acc': right ? 'True' : 'False', 'Vertical Padding': 'M' });
  const nodes = {};
  walk(lr, (n) => {
    if (n.type !== 'TEXT') return;
    if (n.name === 'Title') nodes.title = n;
    if (n.name === 'Subtext 1') nodes.sub = n;
    if (n.name === '15 Regular') nodes.right = n;
  });
  for (const n of Object.values(nodes)) { try { await figma.loadFontAsync(n.fontName); } catch (_) {} }
  if (nodes.title) nodes.title.characters = top;
  if (nodes.sub) nodes.sub.characters = bottom;
  if (nodes.right && right) nodes.right.characters = right;
  if (muted) for (const n of Object.values(nodes)) n.fills = [{ type: 'SOLID', color: MU }];
  parent.appendChild(lr);
  lr.layoutSizingHorizontal = 'FILL';
  lr.resize(375, lr.height);
  return lr;
}

async function newFrame(page, name, navTitle) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(375, 812);
  frame.fills = [{ type: 'SOLID', color: BG }];
  page.appendChild(frame);
  const screen = screenComp.createInstance();
  frame.appendChild(screen);
  screen.x = 0; screen.y = 0;
  await setNavTitle(screen, navTitle);
  return frame;
}

function addScrollBody(frame, top = SAFE_TOP, bottom = 0) {
  const body = figma.createFrame();
  body.name = 'Body';
  body.layoutMode = 'VERTICAL';
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.itemSpacing = 6;
  body.resize(375, 812 - top - bottom);
  body.x = 0; body.y = top;
  body.fills = [];
  body.clipsContent = false;
  frame.appendChild(body);
  return body;
}

function addRowText(body, text, size = 15, bold = false, color = TX, py = 6) {
  const wrap = figma.createFrame();
  wrap.fills = [];
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'FIXED';
  wrap.paddingLeft = PAD; wrap.paddingRight = PAD;
  wrap.paddingTop = py; wrap.paddingBottom = py;
  const t = mkText(text, size, bold, color);
  wrap.appendChild(t);
  t.layoutSizingHorizontal = 'FILL';
  t.resize(335, Math.max(size + 8, 22));
  body.appendChild(wrap);
  wrap.layoutSizingHorizontal = 'FILL';
  wrap.resize(375, wrap.height);
  return wrap;
}

function addCardWrap(body, build) {
  const wrap = figma.createFrame();
  wrap.fills = [];
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'FIXED';
  wrap.paddingLeft = PAD; wrap.paddingRight = PAD;
  wrap.paddingTop = 8; wrap.paddingBottom = 8;
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(335, 60);
  card.fills = [{ type: 'SOLID', color: SU }];
  card.strokes = [{ type: 'SOLID', color: BD }];
  card.strokeWeight = 1;
  card.cornerRadius = 16;
  card.paddingLeft = 16; card.paddingRight = 16;
  card.paddingTop = 14; card.paddingBottom = 14;
  card.itemSpacing = 8;
  build(card);
  wrap.appendChild(card);
  card.layoutSizingHorizontal = 'FILL';
  body.appendChild(wrap);
  wrap.layoutSizingHorizontal = 'FILL';
  wrap.resize(375, wrap.height);
  return card;
}

// 완전 삭제
for (const name of TARGETS) {
  const page = figma.root.children.find((p) => p.name === name);
  if (!page) continue;
  await figma.setCurrentPageAsync(page);
  while (page.children.length > 0) page.children[0].remove();
}

const built = [];

// 11 스프 결과 — 절대 배치 (온보딩 패턴)
{
  const page = figma.root.children.find((p) => p.name === '11 스프 결과');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '11 스프 결과', '스프 완성!');
  placeCenteredText(frame, '🍲', 200, 64, false, TX, 72);
  placeCenteredText(frame, '오리지널 스프', 284, 22, true, TX, 32);
  const card = figma.createFrame();
  card.name = 'RewardCard';
  card.x = PAD; card.y = 340;
  card.resize(335, 132);
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'CENTER';
  card.counterAxisAlignItems = 'CENTER';
  card.paddingTop = 24; card.paddingBottom = 24;
  card.paddingLeft = 20; card.paddingRight = 20;
  card.itemSpacing = 10;
  card.fills = [{ type: 'SOLID', color: LIGHT }];
  card.strokes = [{ type: 'SOLID', color: BR }];
  card.strokeWeight = 1;
  card.cornerRadius = 20;
  frame.appendChild(card);
  const l1 = mkText('에코잼 획득', 14, true, BR);
  l1.textAlignHorizontal = 'CENTER'; l1.resize(295, 20);
  card.appendChild(l1);
  const l2 = mkText('+30 잼', 32, true, TX);
  l2.textAlignHorizontal = 'CENTER'; l2.resize(295, 40);
  card.appendChild(l2);
  await placeBtn(frame, '공유하고 에코잼 30개 받기', 716 - BTN_H - BTN_M - 16, true, 'M');
  await placeBtn(frame, '확인', 716);
  built.push('11 스프 결과');
}

// 12 미션 결과 — 절대 배치
{
  const page = figma.root.children.find((p) => p.name === '12 미션 결과');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '12 미션 결과', '미션 완료');
  placeCenteredText(frame, '미션을 완료했어요!', 120, 15, false, MU, 24);
  placeCenteredText(frame, '📸', 168, 48, false, TX, 56);
  placeCenteredText(frame, '첫 실천 인증', 232, 22, true, TX, 32);
  const card = figma.createFrame();
  card.name = 'RewardCard';
  card.x = PAD; card.y = 300;
  card.resize(335, 120);
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'CENTER';
  card.counterAxisAlignItems = 'CENTER';
  card.paddingTop = 24; card.paddingBottom = 24;
  card.itemSpacing = 12;
  card.fills = [{ type: 'SOLID', color: SU }];
  card.strokes = [{ type: 'SOLID', color: BD }];
  card.strokeWeight = 1;
  card.cornerRadius = 16;
  frame.appendChild(card);
  const r1 = mkText('🥕 당근', 36, false, TX);
  r1.textAlignHorizontal = 'CENTER'; r1.resize(295, 44);
  card.appendChild(r1);
  const r2 = mkText('재료를 받았어요', 15, false, MU);
  r2.textAlignHorizontal = 'CENTER'; r2.resize(295, 22);
  card.appendChild(r2);
  const r3 = mkText('재료는 제작 탭에서 스프를 끓일 때 사용해요.', 13, false, MU);
  r3.textAlignHorizontal = 'CENTER'; r3.resize(295, 36);
  card.appendChild(r3);
  await placeBtn(frame, '공유하고 에코잼 30개 받기', 716 - BTN_H - BTN_M - 16, true, 'M');
  await placeBtn(frame, '홈으로', 716);
  built.push('12 미션 결과');
}

// 09 미션 목록
{
  const page = figma.root.children.find((p) => p.name === '09 미션 목록');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '09 미션 목록', '오늘의 미션');
  const body = addScrollBody(frame);
  addRowText(body, '오늘의 미션', 22, true, TX, 8);
  addRowText(body, '미션을 완료하면 재료가 쌓여요.', 14, false, MU, 4);
  addRowText(body, '텀블러, 장바구니, 대중교통처럼 일상에서 할 수 있는 미션이에요.', 13, false, MU, 4);
  addRowText(body, '공동 미션', 18, true, TX, 10);
  addRowText(body, '⭐부터 차례로 해금돼요. 파일럿에서는 ⭐ 미션부터 시작해요.', 13, false, MU, 4);
  await addListRow(body, '📸 첫 실천 인증', '제로 실천 사진 1장', '⭐ · 랜덤 재료');
  await addListRow(body, '🔒 🧾 제로웨이스트 영수증', '이전 미션 완료 후', '🔒 ⭐⭐', true);
  await addListRow(body, '🔒 🌱 7일 함께 실천', '7일 출석 · 1·4·7일차 인증', '🔒 ⭐⭐⭐', true);
  addRowText(body, '일반 미션', 18, true, TX, 12);
  await addListRow(body, '☕️ 텀블러 사용 인증', '외출 전 텀블러를 챙겨요.', '랜덤 재료');
  await addListRow(body, '🛍️ 장바구니 사용 인증', '마트·편의점에서 장바구니 사용', '랜덤 재료');
  await addListRow(body, '🥡 다회용기 사용 인증', '일회용 대신 다회용기 사용', '랜덤 재료');
  addRowText(body, '특별 미션 (히든 재료)', 18, true, TX, 12);
  await addListRow(body, '🏪 알맹상점 방문', '알맹상점 방문 인증', '랜덤 재료');
  built.push('09 미션 목록');
}

// 10 주변 상점
{
  const page = figma.root.children.find((p) => p.name === '10 주변 상점');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '10 주변 상점', '주변 상점');
  const body = addScrollBody(frame);
  addRowText(body, '리스트 · 지도', 14, false, MU, 8);
  addRowText(body, '화면 중심 기준 가까운 4곳만 지도에 표시해요.', 13, false, MU, 4);
  addCardWrap(body, (card) => {
    const t1 = mkText('지도 미리보기', 15, true); t1.resize(303, 22); card.appendChild(t1); t1.layoutSizingHorizontal = 'FILL';
    const t2 = mkText('● ● ● ●   + 내 위치', 22, false, BR); t2.resize(303, 30); card.appendChild(t2); t2.layoutSizingHorizontal = 'FILL';
    const t3 = mkText('드래그하면 가까운 4핀 갱신', 12, false, MU); t3.resize(303, 18); card.appendChild(t3); t3.layoutSizingHorizontal = 'FILL';
  });
  await addListRow(body, '♻️ 알맹상점 마포점', '알맹 직영 · 서울 마포구 망원동', '포인트 연동');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '약 45km');
  await addListRow(body, '🏪 알맹 리필스테이션', '서울 종로 · 리필', '약 5km');
  addRowText(body, '카카오맵 341곳 · 좌표는 구·군 단위 대략값', 12, false, MU, 8);
  built.push('10 주변 상점');
}

// 04 홈
{
  const page = figma.root.children.find((p) => p.name === '04 홈');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '04 홈', '제로스트');
  const body = addScrollBody(frame, SAFE_TOP, TAB_H + BTN_H + 20);
  addCardWrap(body, (c) => { const t = mkText('오늘 출석 X  ·  에코잼 10잼  ·  알맹 0P', 13, false, MU); t.resize(303, 20); c.appendChild(t); t.layoutSizingHorizontal = 'FILL'; });
  addCardWrap(body, (c) => {
    const h = mkText('이번 주 함께 실천  ·  42%', 16, true); h.resize(303, 22); c.appendChild(h); h.layoutSizingHorizontal = 'FILL';
    const m = mkText('42회 / 목표 100회', 13, false, MU); m.resize(303, 18); c.appendChild(m); m.layoutSizingHorizontal = 'FILL';
  });
  addRowText(body, '이번 주 미션', 16, true, TX, 8);
  addRowText(body, '월  화  수  목  금  ·  미션 O/X 2/5', 14, false, MU, 4);
  addRowText(body, '내 주변 상점', 16, true, TX, 10);
  await addListRow(body, '♻️ 알맹상점 마포점', '망원 · 포인트 연동', '지도 안내');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '지도 안내');
  addRowText(body, '주변 상점 전체 보기 →', 14, false, BL, 6);
  addCardWrap(body, (c) => {
    const a = mkText('오늘의 레시피 힌트', 14, true, BR); a.resize(303, 20); c.appendChild(a); a.layoutSizingHorizontal = 'FILL';
    const b = mkText('텀블러 재료가 잘 어울려요', 15); b.resize(303, 22); c.appendChild(b); b.layoutSizingHorizontal = 'FILL';
  });
  const tab = tabSet.defaultVariant.createInstance();
  frame.appendChild(tab); tab.x = 0; tab.y = 812 - TAB_H; tab.resize(375, TAB_H);
  await placeBtn(frame, '오늘 미션 하고 재료 받기', 812 - TAB_H - BTN_H - 12);
  built.push('04 홈');
}

// 06 가챠
{
  const page = figma.root.children.find((p) => p.name === '06 가챠');
  await figma.setCurrentPageAsync(page);
  const frame = await newFrame(page, '06 가챠', '가챠');
  placeCenteredText(frame, '보유 에코잼 10개', 120, 15, false, MU, 22);
  placeCenteredText(frame, '🎁', 200, 72, false, TX, 80);
  const card = figma.createFrame();
  card.x = PAD; card.y = 320;
  card.resize(335, 120);
  card.layoutMode = 'VERTICAL';
  card.primaryAxisAlignItems = 'CENTER';
  card.itemSpacing = 8;
  card.paddingTop = 20; card.paddingBottom = 20;
  card.fills = [{ type: 'SOLID', color: SU }];
  card.strokes = [{ type: 'SOLID', color: BD }];
  card.strokeWeight = 1; card.cornerRadius = 16;
  frame.appendChild(card);
  const g1 = mkText('직전 결과', 13, false, MU); g1.textAlignHorizontal = 'CENTER'; g1.resize(295, 18); card.appendChild(g1);
  const g2 = mkText('에코잼 2개', 22, true); g2.textAlignHorizontal = 'CENTER'; g2.resize(295, 28); card.appendChild(g2);
  const g3 = mkText('에코잼 2개를 받았어요!', 15); g3.textAlignHorizontal = 'CENTER'; g3.resize(295, 22); card.appendChild(g3);
  const tab = tabSet.defaultVariant.createInstance();
  frame.appendChild(tab); tab.x = 0; tab.y = 812 - TAB_H; tab.resize(375, TAB_H);
  await placeBtn(frame, '공유하고 에코잼 30개 받기', 812 - TAB_H - BTN_H - BTN_M - 16, true, 'M');
  await placeBtn(frame, '에코잼 100개로 뽑기', 812 - TAB_H - BTN_H - 12);
  built.push('06 가챠');
}

return {
  built,
  verify: TARGETS.map((n) => {
    const p = figma.root.children.find((x) => x.name === n);
    const f = p.children[0];
    return { name: n, frames: p.children.length, children: f ? f.children.map((c) => ({ name: c.name, y: Math.round(c.y), h: Math.round(c.height) })) : [] };
  }),
};
