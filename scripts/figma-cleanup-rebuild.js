// Figma 정리 + v3 재빌드 (단일 실행)
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
async function setNavTitle(screen, title) {
  const texts = [];
  walk(screen, (n) => { if (n.type === 'TEXT' && n.name === 'Name') texts.push(n); });
  for (const t of texts) { try { await figma.loadFontAsync(t.fontName); } catch (_) {} t.characters = title; }
}
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
  t.resize(335, 24);
  return t;
}
function addText(parent, text, size = 15, bold = false, color = TX) {
  const wrap = figma.createFrame();
  wrap.fills = [];
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'FIXED';
  wrap.paddingLeft = 20;
  wrap.paddingRight = 20;
  wrap.paddingTop = 4;
  wrap.paddingBottom = 4;
  const t = mkText(text, size, bold, color);
  wrap.appendChild(t);
  t.layoutSizingHorizontal = 'FILL';
  parent.appendChild(wrap);
  wrap.layoutSizingHorizontal = 'FILL';
  wrap.resize(375, wrap.height);
  return wrap;
}
function addGap(parent, h = 8) {
  const g = figma.createFrame();
  g.resize(375, h);
  g.fills = [];
  parent.appendChild(g);
  g.layoutSizingHorizontal = 'FILL';
}
function mkCard() {
  const c = figma.createFrame();
  c.name = 'Card';
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(335, 80);
  c.fills = [{ type: 'SOLID', color: SU }];
  c.strokes = [{ type: 'SOLID', color: BD }];
  c.strokeWeight = 1;
  c.cornerRadius = 16;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.paddingTop = 14;
  c.paddingBottom = 14;
  c.itemSpacing = 8;
  return c;
}
function addCard(parent) {
  const wrap = figma.createFrame();
  wrap.fills = [];
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'FIXED';
  wrap.paddingLeft = 20;
  wrap.paddingRight = 20;
  wrap.paddingTop = 6;
  wrap.paddingBottom = 6;
  const card = mkCard();
  wrap.appendChild(card);
  card.layoutSizingHorizontal = 'FILL';
  parent.appendChild(wrap);
  wrap.layoutSizingHorizontal = 'FILL';
  wrap.resize(375, wrap.height);
  return card;
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
async function addBtn(frame, label, y, weak = false, size = 'L') {
  const b = buttonSet.defaultVariant.createInstance();
  b.setProperties({ Size: size, Color: 'Brand', Variant: weak ? 'Weak' : 'Fill', Disabled: 'False', '*States': 'Default' });
  const texts = [];
  walk(b, (n) => { if (n.type === 'TEXT') texts.push(n); });
  for (const t of texts) { try { await figma.loadFontAsync(t.fontName); } catch (_) {} t.characters = label; }
  frame.appendChild(b);
  b.x = 20; b.y = y; b.resize(335, b.height);
  return b;
}
async function createShell(page, name, navTitle, opts = {}) {
  const { withTab = false, withBtn = false } = opts;
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(375, 812);
  frame.fills = [{ type: 'SOLID', color: BG }];
  page.appendChild(frame);
  const screen = screenComp.createInstance();
  frame.appendChild(screen);
  screen.x = 0; screen.y = 0;
  await setNavTitle(screen, navTitle);
  const bottomReserve = withTab ? TAB_H : 0;
  const btnReserve = withBtn ? BTN_H + 12 : 0;
  const body = figma.createFrame();
  body.name = 'Body';
  body.layoutMode = 'VERTICAL';
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.resize(375, 812 - SAFE_TOP - bottomReserve - btnReserve);
  body.x = 0; body.y = SAFE_TOP;
  body.fills = [];
  body.clipsContent = false;
  frame.appendChild(body);
  if (withTab) {
    const tab = tabSet.defaultVariant.createInstance();
    frame.appendChild(tab);
    tab.x = 0; tab.y = 812 - TAB_H; tab.resize(375, TAB_H);
  }
  return { frame, body };
}

// 1) 완전 삭제
for (const name of TARGETS) {
  const page = figma.root.children.find((p) => p.name === name);
  if (!page) continue;
  await figma.setCurrentPageAsync(page);
  while (page.children.length > 0) page.children[0].remove();
}

const built = [];

// 09 미션 목록
{
  const page = figma.root.children.find((p) => p.name === '09 미션 목록');
  await figma.setCurrentPageAsync(page);
  const { body, frame } = await createShell(page, '09 미션 목록', '오늘의 미션');
  addText(body, '오늘의 미션', 22, true);
  addText(body, '미션을 완료하면 재료가 쌓여요.', 14, false, MU);
  addText(body, '텀블러, 장바구니, 대중교통처럼 일상에서 할 수 있는 미션이에요.', 13, false, MU);
  addGap(body, 8);
  addText(body, '공동 미션', 18, true);
  addText(body, '⭐부터 차례로 해금돼요. 파일럿에서는 ⭐ 미션부터 시작해요.', 13, false, MU);
  await addListRow(body, '📸 첫 실천 인증', '제로 실천 사진 1장', '⭐ · 랜덤 재료');
  await addListRow(body, '🔒 🧾 제로웨이스트 영수증', '이전 미션 완료 후', '🔒 ⭐⭐', true);
  await addListRow(body, '🔒 🌱 7일 함께 실천', '7일 출석 · 1·4·7일차 인증', '🔒 ⭐⭐⭐', true);
  addGap(body, 12);
  addText(body, '일반 미션', 18, true);
  await addListRow(body, '☕️ 텀블러 사용 인증', '외출 전 텀블러를 챙겨요.', '랜덤 재료');
  await addListRow(body, '🛍️ 장바구니 사용 인증', '마트·편의점에서 장바구니 사용', '랜덤 재료');
  await addListRow(body, '🥡 다회용기 사용 인증', '일회용 대신 다회용기 사용', '랜덤 재료');
  addGap(body, 12);
  addText(body, '특별 미션 (히든 재료)', 18, true);
  await addListRow(body, '🏪 알맹상점 방문', '알맹상점 방문 인증', '랜덤 재료');
  built.push({ page: '09 미션 목록', bodyCount: body.children.length, frameCount: page.children.length });
}

// 10 주변 상점
{
  const page = figma.root.children.find((p) => p.name === '10 주변 상점');
  await figma.setCurrentPageAsync(page);
  const { body } = await createShell(page, '10 주변 상점', '주변 상점');
  addText(body, '리스트 · 지도', 14, false, MU);
  addText(body, '화면 중심 기준 가까운 4곳만 지도에 표시해요.', 13, false, MU);
  const mapCard = addCard(body);
  mapCard.appendChild(mkText('지도 미리보기', 15, true));
  mapCard.appendChild(mkText('● ● ● ●   + 내 위치', 22, false, BR));
  mapCard.appendChild(mkText('드래그하면 가까운 4핀 갱신', 12, false, MU));
  await addListRow(body, '♻️ 알맹상점', '서울 마포구 · 포인트 연동', '약 2.1km');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '약 45km');
  await addListRow(body, '🏪 알맹 리필스테이션', '서울 종로 · 리필', '약 5km');
  addText(body, '카카오맵 341곳 · 좌표는 구·군 단위 대략값', 12, false, MU);
  built.push({ page: '10 주변 상점', bodyCount: body.children.length, frameCount: page.children.length });
}

// 11 스프 결과
{
  const page = figma.root.children.find((p) => p.name === '11 스프 결과');
  await figma.setCurrentPageAsync(page);
  const { body, frame } = await createShell(page, '11 스프 결과', '스프 완성!', { withBtn: true });
  addGap(body, 32);
  addText(body, '🍲', 56);
  addText(body, '오리지널 스프', 22, true);
  const card = addCard(body);
  card.appendChild(mkText('에코잼 획득', 14, true, BR));
  card.appendChild(mkText('+30 잼', 28, true));
  await addBtn(frame, '결과 공유하기 #제로스트', 812 - BTN_H - BTN_H - 20, true, 'M');
  await addBtn(frame, '확인', 812 - BTN_H - 12);
  built.push({ page: '11 스프 결과', bodyCount: body.children.length, frameCount: page.children.length });
}

// 12 미션 결과
{
  const page = figma.root.children.find((p) => p.name === '12 미션 결과');
  await figma.setCurrentPageAsync(page);
  const { body, frame } = await createShell(page, '12 미션 결과', '미션 완료', { withBtn: true });
  addGap(body, 48);
  addText(body, '📸 첫 실천 인증', 22, true);
  addText(body, '미션을 완료했어요!', 15, false, MU);
  addText(body, '🥕 당근 재료를 받았어요', 18, true, BR);
  await addBtn(frame, '결과 공유하기 #제로스트', 812 - BTN_H - BTN_H - 20, true, 'M');
  await addBtn(frame, '홈으로', 812 - BTN_H - 12);
  built.push({ page: '12 미션 결과', bodyCount: body.children.length, frameCount: page.children.length });
}

// 04 홈
{
  const page = figma.root.children.find((p) => p.name === '04 홈');
  await figma.setCurrentPageAsync(page);
  const { body, frame } = await createShell(page, '04 홈', '제로스트', { withTab: true, withBtn: true });
  const stat = addCard(body);
  stat.appendChild(mkText('오늘 출석 X  ·  에코잼 10잼  ·  알맹 0P', 13, false, MU));
  const goal = addCard(body);
  goal.appendChild(mkText('이번 주 함께 실천  ·  42%', 16, true));
  goal.appendChild(mkText('42회 / 목표 100회', 13, false, MU));
  addText(body, '이번 주 미션', 16, true);
  addText(body, '월  화  수  목  금  ·  미션 O/X 2/5', 14, false, MU);
  addGap(body, 4);
  addText(body, '내 주변 상점', 16, true);
  await addListRow(body, '♻️ 알맹상점', '망원 · 서울 마포구', '지도 안내');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '지도 안내');
  addText(body, '주변 상점 전체 보기 →', 14, false, BL);
  const hint = addCard(body);
  hint.appendChild(mkText('오늘의 레시피 힌트', 14, true, BR));
  hint.appendChild(mkText('텀블러 재료가 잘 어울려요', 15));
  await addBtn(frame, '오늘 미션 하고 재료 받기', 812 - TAB_H - BTN_H - 12);
  built.push({ page: '04 홈', bodyCount: body.children.length, frameCount: page.children.length });
}

// 06 가챠
{
  const page = figma.root.children.find((p) => p.name === '06 가챠');
  await figma.setCurrentPageAsync(page);
  const { body, frame } = await createShell(page, '06 가챠', '가챠', { withTab: true, withBtn: true });
  addText(body, '보유 에코잼 10개', 15, false, MU);
  addText(body, '🎁', 56);
  const res = addCard(body);
  res.appendChild(mkText('직전 결과', 13, false, MU));
  res.appendChild(mkText('에코잼 2개', 20, true));
  res.appendChild(mkText('에코잼 2개를 받았어요!', 15));
  await addBtn(frame, '뽑기 결과 공유', 812 - TAB_H - BTN_H - BTN_H - 8, true, 'M');
  await addBtn(frame, '에코잼 100개로 뽑기', 812 - TAB_H - BTN_H - 12);
  built.push({ page: '06 가챠', bodyCount: body.children.length, frameCount: page.children.length });
}

return { built };
