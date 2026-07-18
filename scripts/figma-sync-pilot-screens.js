// FE 파일럿 변경사항 → Figma (제로스트 TDS 초안) 단일 스크립트
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
const fM = await F('Medium');
const fB = await F('Semi Bold');
for (const f of [
  { family: 'SF Pro', style: 'Regular' },
  { family: 'SF Pro', style: 'Bold' },
  { family: 'SF Pro', style: 'Medium' },
  { family: 'SF Pro Text', style: 'Regular' },
  { family: 'SF Pro Text', style: 'Bold' },
]) {
  try { await figma.loadFontAsync(f); } catch (_) {}
}

function W(n, fn) {
  fn(n);
  if ('children' in n) n.children.forEach((c) => W(c, fn));
}
async function setNavTitle(screen, title) {
  const texts = [];
  W(screen, (n) => {
    if (n.type === 'TEXT' && n.name === 'Title') texts.push(n);
  });
  for (const t of texts) {
    try { await figma.loadFontAsync(t.fontName); } catch (_) {}
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

async function mkBtn(parent, y, label, weak = false, size = 'L') {
  const b = buttonSet.defaultVariant.createInstance();
  b.setProperties({
    Size: size,
    Color: 'Brand',
    Variant: weak ? 'Weak' : 'Fill',
    Disabled: 'False',
    '*States': 'Default',
  });
  const texts = [];
  W(b, (n) => { if (n.type === 'TEXT') texts.push(n); });
  for (const t of texts) {
    try { await figma.loadFontAsync(t.fontName); } catch (_) {}
    t.characters = label;
  }
  parent.appendChild(b);
  b.x = 20;
  b.y = y;
  b.resize(335, b.height);
  return b;
}

async function mkList(parent, y, top, bottom, right, muted = false) {
  const lr = listSet.defaultVariant.createInstance();
  lr.setProperties({
    'Show Left Acc': 'True',
    'Show Right Acc': 'False',
    'Vertical Padding': 'M',
  });
  const texts = [];
  W(lr, (n) => {
    if (n.type === 'TEXT') texts.push(n);
  });
  for (const t of texts) {
    try { await figma.loadFontAsync(t.fontName); } catch (_) {}
  }
  if (texts[0]) texts[0].characters = top;
  if (texts[1]) texts[1].characters = bottom;
  if (texts[2] && right) texts[2].characters = right;
  if (muted) {
    for (const t of texts) {
      t.fills = [{ type: 'SOLID', color: MU }];
    }
  }
  parent.appendChild(lr);
  lr.x = 0;
  lr.y = y;
  lr.resize(375, lr.height);
  return lr;
}

function mkCard(parent, y, h) {
  const c = figma.createFrame();
  c.name = 'Card';
  c.resize(335, h);
  c.x = 20;
  c.y = y;
  c.fills = [{ type: 'SOLID', color: SU }];
  c.strokes = [{ type: 'SOLID', color: BD }];
  c.strokeWeight = 1;
  c.cornerRadius = 16;
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'FIXED';
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.paddingTop = 14;
  c.paddingBottom = 14;
  c.itemSpacing = 8;
  parent.appendChild(c);
  return c;
}

function mkLabel(parent, text, size = 15, bold = false, color = TX) {
  const t = figma.createText();
  t.fontName = bold ? fB : fR;
  t.fontSize = size;
  t.characters = text;
  t.fills = [{ type: 'SOLID', color }];
  t.textAutoResize = 'HEIGHT';
  t.resize(303, 20);
  parent.appendChild(t);
  return t;
}

async function mkScreen(page, name, navTitle) {
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

  const content = figma.createFrame();
  content.name = 'Content';
  content.resize(375, 812);
  content.x = 0;
  content.y = 0;
  content.fills = [];
  content.clipsContent = false;
  frame.appendChild(content);
  return { frame, screen, content };
}

function mkTab(content) {
  const tab = tabSet.defaultVariant.createInstance();
  content.appendChild(tab);
  tab.x = 0;
  tab.y = 812 - tab.height;
  tab.resize(375, tab.height);
  return tab;
}

function getOrCreatePage(name) {
  let page = figma.root.children.find((p) => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  return page;
}

const built = [];

// 04 홈
{
  const page = getOrCreatePage('04 홈');
  const { content } = await mkScreen(page, '04 홈', '제로스트');
  let y = 110;
  const stats = mkCard(content, y, 88);
  mkLabel(stats, '오늘 출석 X  ·  에코잼 10잼  ·  알맹 0P', 13, false, MU);
  y += 100;

  const goal = mkCard(content, y, 108);
  mkLabel(goal, '이번 주 함께 실천', 16, true, TX);
  mkLabel(goal, '42%', 16, true, BL);
  const barBg = figma.createRectangle();
  barBg.resize(303, 8);
  barBg.cornerRadius = 4;
  barBg.fills = [{ type: 'SOLID', color: LIGHT }];
  goal.appendChild(barBg);
  const barFill = figma.createRectangle();
  barFill.resize(127, 8);
  barFill.cornerRadius = 4;
  barFill.fills = [{ type: 'SOLID', color: BR }];
  goal.appendChild(barFill);
  mkLabel(goal, '42회 / 목표 100회', 13, false, MU);
  y += 120;

  mkLabel(content, '이번 주 미션', 16, true, TX);
  y += 28;
  await mkList(content, y, '월 화 수 목 금', '미션 O/X', '2/5');
  y += 72;

  mkLabel(content, '내 주변 상점', 16, true, TX);
  y += 28;
  await mkList(content, y, '♻️ 알맹상점', '망원 · 서울 마포구', '지도 안내');
  y += 72;
  await mkList(content, y, '🌿 틈싹', '충남 공주 · 제로웨이스트', '지도 안내');
  y += 72;
  mkLabel(content, '주변 상점 전체 보기', 14, false, BL);
  y += 28;

  const hint = mkCard(content, y, 72);
  mkLabel(hint, '오늘의 레시피 힌트', 14, true, BR);
  mkLabel(hint, '텀블러 재료가 잘 어울려요', 15, false, TX);
  y += 84;

  await mkBtn(content, 716, '오늘 미션 하고 재료 받기');
  mkTab(content);
  built.push('04 홈');
}

// 09 미션 목록
{
  const page = getOrCreatePage('09 미션 목록');
  const { content } = await mkScreen(page, '09 미션 목록', '오늘의 미션');
  let y = 110;
  mkLabel(content, '공동 미션', 18, true, TX);
  y += 30;
  mkLabel(content, '⭐부터 차례로 해금돼요', 13, false, MU);
  y += 24;
  await mkList(content, y, '📸 첫 실천 인증', '사진 1장', '⭐ · 랜덤 재료');
  y += 72;
  await mkList(content, y, '🔒 🧾 제로웨이스트 영수증', '이전 미션 완료 후', '⭐⭐', true);
  y += 72;
  await mkList(content, y, '🔒 🌱 7일 함께 실천', '이전 미션 완료 후', '⭐⭐⭐', true);
  y += 84;
  mkLabel(content, '일반 미션', 18, true, TX);
  y += 30;
  await mkList(content, y, '☕️ 텀블러 사용 인증', '외출 전 텀블러', '랜덤 재료');
  y += 72;
  await mkList(content, y, '🛍️ 장바구니 사용 인증', '마트·편의점', '랜덤 재료');
  built.push('09 미션 목록');
}

// 10 주변 상점
{
  const page = getOrCreatePage('10 주변 상점');
  const { content } = await mkScreen(page, '10 주변 상점', '주변 상점');
  let y = 110;
  mkLabel(content, '리스트 · 지도', 14, false, MU);
  y += 24;
  const map = mkCard(content, y, 180);
  mkLabel(map, '지도 (가까운 4핀만)', 15, true, TX);
  mkLabel(map, '화면 중심 기준 가까운 4곳만 표시', 13, false, MU);
  mkLabel(map, '● ● ● ●  + 내 위치', 20, false, BR);
  y += 192;
  await mkList(content, y, '♻️ 알맹상점', '서울 마포구 · 포인트 연동', '직선 약 2.1km');
  y += 72;
  mkLabel(content, '데이터: 카카오맵 341곳 · 좌표 대략값', 12, false, MU);
  built.push('10 주변 상점');
}

// 11 스프 결과
{
  const page = getOrCreatePage('11 스프 결과');
  const { content } = await mkScreen(page, '11 스프 결과', '스프 완성!');
  let y = 180;
  mkLabel(content, '🍲', 48, false, TX);
  y += 64;
  mkLabel(content, '오리지널 스프', 22, true, TX);
  y += 40;
  const reward = mkCard(content, y, 96);
  mkLabel(reward, '에코잼 획득', 14, true, BR);
  mkLabel(reward, '+30 잼', 24, true, TX);
  y += 110;
  await mkBtn(content, y, '결과 공유하기 #제로스트', true, 'M');
  y += 56;
  await mkBtn(content, 716, '확인');
  built.push('11 스프 결과');
}

// 12 미션 결과
{
  const page = getOrCreatePage('12 미션 결과');
  const { content } = await mkScreen(page, '12 미션 결과', '미션 완료');
  let y = 150;
  mkLabel(content, '📸 첫 실천 인증', 22, true, TX);
  y += 40;
  mkLabel(content, '🥕 당근 재료를 받았어요', 16, false, TX);
  y += 48;
  await mkBtn(content, y, '결과 공유하기 #제로스트', true, 'M');
  y += 56;
  await mkBtn(content, 716, '홈으로');
  built.push('12 미션 결과');
}

// 06 가챠 업데이트
{
  const page = getOrCreatePage('06 가챠');
  const { content } = await mkScreen(page, '06 가챠', '가챠');
  let y = 110;
  mkLabel(content, '보유 에코잼 10개', 15, false, MU);
  y += 80;
  mkLabel(content, '🎁', 48, false, TX);
  y += 64;
  const result = mkCard(content, y, 120);
  mkLabel(result, '직전 결과', 13, false, MU);
  mkLabel(result, '에코잼', 18, true, TX);
  mkLabel(result, '에코잼 2개를 받았어요!', 15, false, TX);
  y += 132;
  await mkBtn(content, y, '뽑기 결과 공유', true, 'M');
  await mkBtn(content, 716, '에코잼 100개로 뽑기');
  mkTab(content);
  built.push('06 가챠');
}

return { built, pages: figma.root.children.map((p) => p.name) };
