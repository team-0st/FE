// Figma FE 파일럿 v2 — auto-layout + ListRow 이름 기반 텍스트
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

async function loadFonts() {
  async function F(style = 'Regular') {
    for (const f of [
      { family: 'Pretendard', style },
      { family: 'Inter', style },
    ]) {
      try {
        await figma.loadFontAsync(f);
        return f;
      } catch (_) {}
    }
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    return { family: 'Inter', style: 'Regular' };
  }
  const fR = await F('Regular');
  const fB = await F('Semi Bold');
  for (const f of [
    { family: 'SF Pro', style: 'Regular' },
    { family: 'SF Pro', style: 'Bold' },
    { family: 'SF Pro', style: 'Medium' },
    { family: 'SF Pro Text', style: 'Regular' },
    { family: 'SF Pro Text', style: 'Bold' },
  ]) {
    try {
      await figma.loadFontAsync(f);
    } catch (_) {}
  }
  return { fR, fB };
}
const { fR, fB } = await loadFonts();

function walk(n, fn) {
  fn(n);
  if ('children' in n) n.children.forEach((c) => walk(c, fn));
}

async function setNavTitle(screen, title) {
  const texts = [];
  walk(screen, (n) => {
    if (n.type === 'TEXT' && n.name === 'Name') texts.push(n);
  });
  for (const t of texts) {
    try {
      await figma.loadFontAsync(t.fontName);
    } catch (_) {}
    t.characters = title;
  }
}

function clearPage(page) {
  for (const c of [...page.children]) c.remove();
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
  return t;
}

function mkPadded(parent, gap = 8) {
  const f = figma.createFrame();
  f.name = 'Section';
  f.layoutMode = 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(375, 48);
  f.paddingLeft = 20;
  f.paddingRight = 20;
  f.paddingTop = 0;
  f.paddingBottom = 0;
  f.itemSpacing = gap;
  f.fills = [];
  parent.appendChild(f);
  f.layoutSizingHorizontal = 'FILL';
  return f;
}

function addLabel(parent, text, size = 15, bold = false, color = TX) {
  const t = mkText(text, size, bold, color);
  parent.appendChild(t);
  t.layoutSizingHorizontal = 'FILL';
  return t;
}

function addSpacer(parent, h) {
  const s = figma.createFrame();
  s.resize(1, h);
  s.fills = [];
  parent.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  return s;
}

function mkCardFrame() {
  const c = figma.createFrame();
  c.name = 'Card';
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(335, 48);
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

async function addListRow(parent, top, bottom, right = '', muted = false) {
  const lr = listSet.defaultVariant.createInstance();
  lr.setProperties({
    'Show Left Acc': 'True',
    'Show Right Acc': right ? 'True' : 'False',
    'Vertical Padding': 'M',
  });
  const nodes = {};
  walk(lr, (n) => {
    if (n.type !== 'TEXT') return;
    if (n.name === 'Title') nodes.title = n;
    if (n.name === 'Subtext 1') nodes.sub = n;
    if (n.name === '15 Regular') nodes.right = n;
  });
  for (const n of Object.values(nodes)) {
    try {
      await figma.loadFontAsync(n.fontName);
    } catch (_) {}
  }
  if (nodes.title) nodes.title.characters = top;
  if (nodes.sub) nodes.sub.characters = bottom;
  if (nodes.right && right) nodes.right.characters = right;
  if (muted) {
    for (const n of Object.values(nodes)) {
      n.fills = [{ type: 'SOLID', color: MU }];
    }
  }
  parent.appendChild(lr);
  lr.layoutSizingHorizontal = 'FILL';
  lr.resize(375, lr.height);
  return lr;
}

async function addBtn(frame, label, weak = false, size = 'L', withTab = false) {
  const b = buttonSet.defaultVariant.createInstance();
  b.setProperties({
    Size: size,
    Color: 'Brand',
    Variant: weak ? 'Weak' : 'Fill',
    Disabled: 'False',
    '*States': 'Default',
  });
  const texts = [];
  walk(b, (n) => {
    if (n.type === 'TEXT') texts.push(n);
  });
  for (const t of texts) {
    try {
      await figma.loadFontAsync(t.fontName);
    } catch (_) {}
    t.characters = label;
  }
  frame.appendChild(b);
  b.x = 20;
  b.y = 812 - (withTab ? TAB_H : 0) - BTN_H - 12;
  b.resize(335, b.height);
  return b;
}

async function createShell(page, name, navTitle, opts = {}) {
  const { withTab = false, withBtn = false } = opts;
  clearPage(page);
  await figma.setCurrentPageAsync(page);

  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(375, 812);
  frame.fills = [{ type: 'SOLID', color: BG }];
  page.appendChild(frame);

  const screen = screenComp.createInstance();
  frame.appendChild(screen);
  screen.x = 0;
  screen.y = 0;
  await setNavTitle(screen, navTitle);

  const bottomReserve = withTab ? TAB_H : 0;
  const btnReserve = withBtn ? BTN_H + 12 : 0;
  const bodyH = 812 - SAFE_TOP - bottomReserve - btnReserve;

  const body = figma.createFrame();
  body.name = 'Body';
  body.layoutMode = 'VERTICAL';
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.resize(375, bodyH);
  body.x = 0;
  body.y = SAFE_TOP;
  body.itemSpacing = 0;
  body.fills = [];
  body.clipsContent = false;
  frame.appendChild(body);

  if (withTab) {
    const tab = tabSet.defaultVariant.createInstance();
    frame.appendChild(tab);
    tab.x = 0;
    tab.y = 812 - TAB_H;
    tab.resize(375, TAB_H);
  }

  return { frame, body };
}

function getPage(name) {
  return figma.root.children.find((p) => p.name === name);
}

const TARGETS = ['04 홈', '06 가챠', '09 미션 목록', '10 주변 상점', '11 스프 결과', '12 미션 결과'];

function cleanupPages() {
  for (const name of TARGETS) {
    const page = figma.root.children.find((p) => p.name === name);
    if (!page) continue;
    for (const c of [...page.children]) c.remove();
  }
}

cleanupPages();

const built = [];

// 04 홈
{
  const page = getPage('04 홈');
  const { body, frame } = await createShell(page, '04 홈', '제로스트', { withTab: true, withBtn: true });

  const stats = mkPadded(body, 12);
  const statCard = mkCardFrame();
  addLabel(statCard, '오늘 출석 X  ·  에코잼 10잼  ·  알맹 0P', 13, false, MU);
  stats.appendChild(statCard);
  statCard.layoutSizingHorizontal = 'FILL';
  statCard.resize(335, statCard.height);

  const goalSec = mkPadded(body, 12);
  const goal = mkCardFrame();
  const goalHead = figma.createFrame();
  goalHead.layoutMode = 'HORIZONTAL';
  goalHead.primaryAxisSizingMode = 'AUTO';
  goalHead.counterAxisSizingMode = 'AUTO';
  goalHead.fills = [];
  goalHead.itemSpacing = 8;
  const gt = mkText('이번 주 함께 실천', 16, true);
  const gp = mkText('42%', 16, true, BL);
  goalHead.appendChild(gt);
  goalHead.appendChild(gp);
  goal.appendChild(goalHead);
  const track = figma.createFrame();
  track.resize(303, 8);
  track.cornerRadius = 4;
  track.fills = [{ type: 'SOLID', color: LIGHT }];
  track.clipsContent = true;
  const fill = figma.createRectangle();
  fill.resize(127, 8);
  fill.fills = [{ type: 'SOLID', color: BR }];
  track.appendChild(fill);
  goal.appendChild(track);
  addLabel(goal, '42회 / 목표 100회', 13, false, MU);
  goalSec.appendChild(goal);
  goal.layoutSizingHorizontal = 'FILL';
  goal.resize(335, goal.height);

  const missionSec = mkPadded(body, 8);
  addLabel(missionSec, '이번 주 미션', 16, true);
  addLabel(missionSec, '월  화  수  목  금', 14, false, MU);
  addLabel(missionSec, '미션 O/X · 2/5', 14, false, BL);

  addSpacer(body, 8);
  const shopSec = mkPadded(body, 4);
  addLabel(shopSec, '내 주변 상점', 16, true);
  await addListRow(body, '♻️ 알맹상점', '망원 · 서울 마포구', '지도 안내');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '지도 안내');
  const link = mkPadded(body, 8);
  addLabel(link, '주변 상점 전체 보기 →', 14, false, BL);

  const hintSec = mkPadded(body, 12);
  const hint = mkCardFrame();
  addLabel(hint, '오늘의 레시피 힌트', 14, true, BR);
  addLabel(hint, '텀블러 재료가 잘 어울려요', 15);
  hintSec.appendChild(hint);
  hint.layoutSizingHorizontal = 'FILL';
  hint.resize(335, hint.height);

  await addBtn(frame, '오늘 미션 하고 재료 받기', false, 'L', true);
  built.push('04 홈');
}

// 09 미션 목록
{
  const page = getPage('09 미션 목록');
  const { body } = await createShell(page, '09 미션 목록', '오늘의 미션');

  const head = mkPadded(body, 6);
  addLabel(head, '오늘의 미션', 22, true);
  addLabel(head, '미션을 완료하면 재료가 쌓여요.', 14, false, MU);
  addLabel(head, '텀블러, 장바구니, 대중교통처럼 일상에서 할 수 있는 미션이에요.', 13, false, MU);

  const coop = mkPadded(body, 4);
  addLabel(coop, '공동 미션', 18, true);
  addLabel(coop, '⭐부터 차례로 해금돼요. 파일럿에서는 ⭐ 미션부터 시작해요.', 13, false, MU);

  await addListRow(body, '📸 첫 실천 인증', '제로 실천 사진 1장', '⭐ · 랜덤 재료');
  await addListRow(body, '🔒 🧾 제로웨이스트 영수증', '이전 미션 완료 후', '🔒 ⭐⭐', true);
  await addListRow(body, '🔒 🌱 7일 함께 실천', '7일 출석 · 1·4·7일차 인증', '🔒 ⭐⭐⭐', true);

  addSpacer(body, 8);
  const daily = mkPadded(body, 4);
  addLabel(daily, '일반 미션', 18, true);
  await addListRow(body, '☕️ 텀블러 사용 인증', '외출 전 텀블러를 챙겨요.', '랜덤 재료');
  await addListRow(body, '🛍️ 장바구니 사용 인증', '마트·편의점에서 장바구니 사용', '랜덤 재료');
  await addListRow(body, '🥡 다회용기 사용 인증', '일회용 대신 다회용기 사용', '랜덤 재료');

  addSpacer(body, 8);
  const special = mkPadded(body, 4);
  addLabel(special, '특별 미션 (히든 재료)', 18, true);
  await addListRow(body, '🏪 알맹상점 방문', '알맹상점 방문 인증', '랜덤 재료');

  built.push('09 미션 목록');
}

// 10 주변 상점
{
  const page = getPage('10 주변 상점');
  const { body } = await createShell(page, '10 주변 상점', '주변 상점');

  const head = mkPadded(body, 6);
  addLabel(head, '리스트 · 지도', 14, false, MU);
  addLabel(head, '화면 중심 기준 가까운 4곳만 지도에 표시해요.', 13, false, MU);

  const mapSec = mkPadded(body, 8);
  const map = mkCardFrame();
  map.resize(335, 160);
  map.primaryAxisSizingMode = 'FIXED';
  addLabel(map, '지도 미리보기', 15, true);
  addLabel(map, '● ● ● ●   + 내 위치', 22, false, BR);
  addLabel(map, '드래그하면 가까운 4핀 갱신', 12, false, MU);
  mapSec.appendChild(map);
  map.layoutSizingHorizontal = 'FILL';

  await addListRow(body, '♻️ 알맹상점', '서울 마포구 · 포인트 연동', '약 2.1km');
  await addListRow(body, '🌿 틈싹', '충남 공주 · 제로웨이스트', '약 45km');
  await addListRow(body, '🏪 알맹 리필스테이션', '서울 종로 · 리필', '약 5km');

  const meta = mkPadded(body, 8);
  addLabel(meta, '카카오맵 341곳 · 좌표는 구·군 단위 대략값', 12, false, MU);

  built.push('10 주변 상점');
}

// 11 스프 결과
{
  const page = getPage('11 스프 결과');
  const { body, frame } = await createShell(page, '11 스프 결과', '스프 완성!', { withBtn: true });

  addSpacer(body, 40);
  const center = mkPadded(body, 12);
  center.primaryAxisAlignItems = 'CENTER';
  addLabel(center, '🍲', 56);
  addLabel(center, '오리지널 스프', 22, true);
  const reward = mkCardFrame();
  addLabel(reward, '에코잼 획득', 14, true, BR);
  addLabel(reward, '+30 잼', 28, true);
  center.appendChild(reward);
  reward.layoutSizingHorizontal = 'FILL';
  reward.resize(335, reward.height);

  const share = mkPadded(body, 12);
  addLabel(share, ' ');

  const weakBtn = buttonSet.defaultVariant.createInstance();
  weakBtn.setProperties({ Size: 'M', Color: 'Brand', Variant: 'Weak', Disabled: 'False', '*States': 'Default' });
  const wtx = [];
  walk(weakBtn, (n) => { if (n.type === 'TEXT') wtx.push(n); });
  for (const t of wtx) { try { await figma.loadFontAsync(t.fontName); } catch(_){} t.characters = '결과 공유하기 #제로스트'; }
  frame.appendChild(weakBtn);
  weakBtn.x = 20;
  weakBtn.y = 812 - BTN_H - BTN_H - 20;
  weakBtn.resize(335, weakBtn.height);

  const mainBtn = buttonSet.defaultVariant.createInstance();
  mainBtn.setProperties({ Size: 'L', Color: 'Brand', Variant: 'Fill', Disabled: 'False', '*States': 'Default' });
  const btx = [];
  walk(mainBtn, (n) => { if (n.type === 'TEXT') btx.push(n); });
  for (const t of btx) { try { await figma.loadFontAsync(t.fontName); } catch(_){} t.characters = '확인'; }
  frame.appendChild(mainBtn);
  mainBtn.x = 20;
  mainBtn.y = 812 - BTN_H - 12;
  mainBtn.resize(335, mainBtn.height);

  built.push('11 스프 결과');
}

// 12 미션 결과
{
  const page = getPage('12 미션 결과');
  const { body, frame } = await createShell(page, '12 미션 결과', '미션 완료', { withBtn: true });

  addSpacer(body, 60);
  const center = mkPadded(body, 16);
  addLabel(center, '📸 첫 실천 인증', 22, true);
  addLabel(center, '미션을 완료했어요!', 15, false, MU);
  addLabel(center, '🥕 당근 재료를 받았어요', 18, true, BR);

  const weakBtn = buttonSet.defaultVariant.createInstance();
  weakBtn.setProperties({ Size: 'M', Color: 'Brand', Variant: 'Weak', Disabled: 'False', '*States': 'Default' });
  const wtx = [];
  walk(weakBtn, (n) => { if (n.type === 'TEXT') wtx.push(n); });
  for (const t of wtx) { try { await figma.loadFontAsync(t.fontName); } catch(_){} t.characters = '결과 공유하기 #제로스트'; }
  frame.appendChild(weakBtn);
  weakBtn.x = 20;
  weakBtn.y = 812 - BTN_H - BTN_H - 20;
  weakBtn.resize(335, weakBtn.height);

  const mainBtn = buttonSet.defaultVariant.createInstance();
  mainBtn.setProperties({ Size: 'L', Color: 'Brand', Variant: 'Fill', Disabled: 'False', '*States': 'Default' });
  const mtx = [];
  walk(mainBtn, (n) => { if (n.type === 'TEXT') mtx.push(n); });
  for (const t of mtx) { try { await figma.loadFontAsync(t.fontName); } catch(_){} t.characters = '홈으로'; }
  frame.appendChild(mainBtn);
  mainBtn.x = 20;
  mainBtn.y = 812 - BTN_H - 12;
  mainBtn.resize(335, mainBtn.height);

  built.push('12 미션 결과');
}

// 06 가챠
{
  const page = getPage('06 가챠');
  const { body, frame } = await createShell(page, '06 가챠', '가챠', { withTab: true, withBtn: true });

  const head = mkPadded(body, 12);
  addLabel(head, '보유 에코잼 10개', 15, false, MU);
  addLabel(head, '🎁', 56);
  const result = mkCardFrame();
  addLabel(result, '직전 결과', 13, false, MU);
  addLabel(result, '에코잼 2개', 20, true);
  addLabel(result, '에코잼 2개를 받았어요!', 15);
  head.appendChild(result);
  result.layoutSizingHorizontal = 'FILL';
  result.resize(335, result.height);

  const weakBtn = buttonSet.defaultVariant.createInstance();
  weakBtn.setProperties({ Size: 'M', Color: 'Brand', Variant: 'Weak', Disabled: 'False', '*States': 'Default' });
  const wtx = [];
  walk(weakBtn, (n) => { if (n.type === 'TEXT') wtx.push(n); });
  for (const t of wtx) { try { await figma.loadFontAsync(t.fontName); } catch(_){} t.characters = '뽑기 결과 공유'; }
  frame.appendChild(weakBtn);
  weakBtn.x = 20;
  weakBtn.y = 812 - TAB_H - BTN_H - BTN_H - 8;
  weakBtn.resize(335, weakBtn.height);

  await addBtn(frame, '에코잼 100개로 뽑기', false, 'L', true);
  built.push('06 가챠');
}

return {
  built,
  pages: figma.root.children.map((p) => ({ name: p.name, frames: p.children.length })),
};
