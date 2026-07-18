// 10 주변 상점 — 리스트 + OSM 스타일 지도 (이모지 핀 없음)
const K = {
  screen: '9612e0670433830876d4e649fe2afad6c5e17f3a',
  list: '4d729ac3583b00c8e112c209a856967097a778ae',
};
const BG = { r: 0.9686, g: 0.9608, b: 0.9804 };
const SU = { r: 1, g: 1, b: 1 };
const BD = { r: 0.9, g: 0.9, b: 0.92 };
const TX = { r: 0.12, g: 0.12, b: 0.14 };
const MU = { r: 0.45, g: 0.45, b: 0.5 };
const BR = { r: 0.486, g: 0.361, b: 0.749 };
const BL = { r: 0.2, g: 0.45, b: 0.95 };
const LIGHT = { r: 0.929, g: 0.906, b: 0.965 };
const PIN_SHOP = { r: 0.486, g: 0.361, b: 0.749 };
const PIN_USER = { r: 0.898, g: 0.224, b: 0.208 };
const MAP_BG = { r: 0.91, g: 0.933, b: 0.949 };
const PAD = 20;
const FW = 375;
const FH = 812;

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
const listSet = await figma.importComponentSetByKeyAsync(K.list);

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

function placeText(parent, text, x, y, w, size, bold = false, color = TX, center = false) {
  const t = mkText(text, size, bold, color);
  if (center) t.textAlignHorizontal = 'CENTER';
  t.resize(w, size + 16);
  parent.appendChild(t);
  t.x = x; t.y = y;
  return t;
}

function addRect(parent, x, y, w, h, color, radius = 0, stroke = null) {
  const r = figma.createRectangle();
  r.x = x; r.y = y; r.resize(w, h);
  r.cornerRadius = radius;
  r.fills = [{ type: 'SOLID', color }];
  if (stroke) { r.strokes = [{ type: 'SOLID', color: stroke }]; r.strokeWeight = 1; }
  parent.appendChild(r);
  return r;
}

function createTeardropPin(color, isUser = false) {
  const wrap = figma.createFrame();
  wrap.name = isUser ? 'UserPin' : 'ShopPin';
  wrap.resize(28, 38);
  wrap.fills = [];
  const pin = figma.createVector();
  pin.vectorPaths = [{
    windingRule: 'NONZERO',
    data: 'M 14 0 C 6.268 0 0 6.268 0 14 C 0 23.5 14 38 14 38 C 14 38 28 23.5 28 14 C 28 6.268 21.732 0 14 0 Z',
  }];
  pin.resize(28, 38);
  pin.x = 0; pin.y = 0;
  pin.fills = [{ type: 'SOLID', color }];
  pin.strokes = [{ type: 'SOLID', color: SU }];
  pin.strokeWeight = 2;
  wrap.appendChild(pin);
  if (isUser) {
    const dot = figma.createEllipse();
    dot.resize(8, 8);
    dot.x = 10; dot.y = 8;
    dot.fills = [{ type: 'SOLID', color: SU }];
    wrap.appendChild(dot);
  } else {
    const dot = figma.createEllipse();
    dot.resize(6, 6);
    dot.x = 11; dot.y = 10;
    dot.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.85 } }];
    dot.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.5 } }];
    dot.strokeWeight = 0.5;
    wrap.appendChild(dot);
  }
  return wrap;
}

function placePin(parent, x, y, color, isUser = false) {
  const pin = createTeardropPin(color, isUser);
  parent.appendChild(pin);
  pin.x = x - 14;
  pin.y = y - 36;
  return pin;
}

function buildOsmStyleMap(parent, w, h) {
  parent.fills = [{ type: 'SOLID', color: MAP_BG }];
  const blocks = [
    { x: 12, y: 18, w: 72, h: 52, c: { r: 0.96, g: 0.95, b: 0.93 } },
    { x: 92, y: 18, w: 58, h: 52, c: { r: 0.97, g: 0.97, b: 0.97 } },
    { x: 158, y: 18, w: 80, h: 52, c: { r: 0.95, g: 0.96, b: 0.94 } },
    { x: 248, y: 18, w: 75, h: 52, c: { r: 0.96, g: 0.95, b: 0.93 } },
    { x: 12, y: 78, w: 58, h: 48, c: { r: 0.97, g: 0.97, b: 0.97 } },
    { x: 248, y: 78, w: 75, h: 48, c: { r: 0.95, g: 0.96, b: 0.94 } },
    { x: 12, y: 196, w: 68, h: 50, c: { r: 0.96, g: 0.95, b: 0.93 } },
    { x: 248, y: 196, w: 75, h: 50, c: { r: 0.97, g: 0.97, b: 0.97 } },
    { x: 12, y: 256, w: 90, h: 36, c: { r: 0.95, g: 0.96, b: 0.94 } },
    { x: 220, y: 256, w: 103, h: 36, c: { r: 0.96, g: 0.95, b: 0.93 } },
  ];
  for (const b of blocks) addRect(parent, b.x, b.y, b.w, b.h, b.c, 2);
  addRect(parent, 78, 78, 160, 110, { r: 0.78, g: 0.9, b: 0.78 }, 4);
  addRect(parent, 0, 132, w, 14, SU);
  addRect(parent, 0, 132, w, 2, { r: 1, g: 0.84, b: 0 });
  addRect(parent, 148, 0, 14, h, SU);
  addRect(parent, 0, 218, w, 10, SU);
  addRect(parent, 52, 0, 8, h, { r: 0.94, g: 0.94, b: 0.94 });
  addRect(parent, 228, 0, 8, h, { r: 0.94, g: 0.94, b: 0.94 });
  placePin(parent, 92, 108, PIN_SHOP, false);
  placePin(parent, 248, 98, PIN_SHOP, false);
  placePin(parent, 188, 168, PIN_SHOP, false);
  placePin(parent, 278, 188, PIN_SHOP, false);
  const ring = figma.createEllipse();
  ring.resize(36, 36);
  ring.x = 152; ring.y = 142;
  ring.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.45, b: 0.95, a: 0.15 } }];
  ring.strokes = [{ type: 'SOLID', color: BL }];
  ring.strokeWeight = 2;
  parent.appendChild(ring);
  placePin(parent, 168, 168, PIN_USER, true);
  const zoom = figma.createFrame();
  zoom.name = 'ZoomControl';
  zoom.x = w - 38; zoom.y = 12;
  zoom.resize(30, 62);
  zoom.fills = [{ type: 'SOLID', color: SU }];
  zoom.strokes = [{ type: 'SOLID', color: BD }];
  zoom.strokeWeight = 1;
  zoom.cornerRadius = 4;
  zoom.layoutMode = 'VERTICAL';
  zoom.primaryAxisAlignItems = 'CENTER';
  zoom.counterAxisAlignItems = 'CENTER';
  const plus = mkText('+', 18, true, TX);
  plus.textAlignHorizontal = 'CENTER';
  plus.resize(28, 22);
  zoom.appendChild(plus);
  const line = figma.createRectangle();
  line.resize(22, 1);
  line.fills = [{ type: 'SOLID', color: BD }];
  zoom.appendChild(line);
  const minus = mkText('−', 18, true, TX);
  minus.textAlignHorizontal = 'CENTER';
  minus.resize(28, 22);
  zoom.appendChild(minus);
  parent.appendChild(zoom);
  const badge = figma.createFrame();
  badge.x = 10; badge.y = 10;
  badge.resize(108, 24);
  badge.cornerRadius = 12;
  badge.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.92 } }];
  badge.strokes = [{ type: 'SOLID', color: BD }];
  badge.strokeWeight = 1;
  const bt = mkText('가까운 4곳', 11, true, BR);
  bt.textAlignHorizontal = 'CENTER';
  bt.resize(108, 16);
  bt.x = 0; bt.y = 4;
  badge.appendChild(bt);
  parent.appendChild(badge);
  const attrBg = figma.createRectangle();
  attrBg.x = 0; attrBg.y = h - 22;
  attrBg.resize(w, 22);
  attrBg.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.85 } }];
  parent.appendChild(attrBg);
  placeText(parent, '© OpenStreetMap contributors', 8, h - 18, w - 16, 9, false, MU);
}

async function addListRow(parent, top, sub, right = '', muted = false, width = 335) {
  const lr = listSet.defaultVariant.createInstance();
  lr.setProperties({ 'Show Left Acc': 'False', 'Show Right Acc': right ? 'True' : 'False', 'Vertical Padding': 'M' });
  const nodes = {};
  walk(lr, (n) => {
    if (n.type !== 'TEXT') return;
    if (n.name === 'Title') nodes.title = n;
    if (n.name === 'Subtext 1') nodes.sub = n;
    if (n.name === '15 Regular') nodes.right = n;
  });
  for (const n of Object.values(nodes)) { try { await figma.loadFontAsync(n.fontName); } catch (_) {} }
  if (nodes.title) nodes.title.characters = top;
  if (nodes.sub) nodes.sub.characters = sub;
  if (nodes.right && right) { nodes.right.characters = right; nodes.right.fills = [{ type: 'SOLID', color: BL }]; }
  if (muted) for (const n of Object.values(nodes)) n.fills = [{ type: 'SOLID', color: MU }];
  parent.appendChild(lr);
  lr.resize(width, lr.height);
  return lr;
}

function addChipRow(frame, y, labels, active = 0) {
  const row = figma.createFrame();
  row.name = 'Chips';
  row.x = PAD; row.y = y;
  row.resize(335, 36);
  row.fills = [];
  row.clipsContent = true;
  let x = 0;
  for (let i = 0; i < labels.length; i++) {
    const chip = figma.createFrame();
    chip.cornerRadius = 18;
    const on = i === active;
    chip.fills = [{ type: 'SOLID', color: on ? LIGHT : SU }];
    chip.strokes = [{ type: 'SOLID', color: on ? BR : BD }];
    chip.strokeWeight = 1;
    const t = mkText(labels[i], 12, on, on ? BR : TX);
    chip.appendChild(t);
    chip.x = x; chip.y = 0;
    chip.resize(t.width + 24, 32);
    t.x = 12; t.y = 7;
    row.appendChild(chip);
    x += chip.width + 8;
  }
  frame.appendChild(row);
  return row;
}

function addModeToggle(frame, y, active = 'list') {
  const row = figma.createFrame();
  row.name = 'ModeToggle';
  row.x = PAD; row.y = y;
  row.resize(335, 40);
  row.fills = [];
  for (let i = 0; i < 2; i++) {
    const label = i === 0 ? '리스트' : '지도';
    const on = (active === 'list' && i === 0) || (active === 'map' && i === 1);
    const chip = figma.createFrame();
    chip.resize(163, 40);
    chip.x = i * 171; chip.y = 0;
    chip.cornerRadius = 12;
    chip.fills = [{ type: 'SOLID', color: on ? LIGHT : SU }];
    chip.strokes = [{ type: 'SOLID', color: on ? BR : BD }];
    chip.strokeWeight = 1;
    const t = mkText(label, 14, on, on ? BR : TX);
    t.textAlignHorizontal = 'CENTER';
    t.resize(163, 20);
    chip.appendChild(t);
    t.x = 0; t.y = 10;
    row.appendChild(chip);
  }
  frame.appendChild(row);
  return row;
}

async function buildShell(page, frameName, pageX = 0) {
  const frame = figma.createFrame();
  frame.name = frameName;
  frame.resize(FW, FH);
  frame.x = pageX; frame.y = 0;
  frame.fills = [{ type: 'SOLID', color: BG }];
  page.appendChild(frame);
  const screen = screenComp.createInstance();
  frame.appendChild(screen);
  screen.x = 0; screen.y = 0;
  await setNavTitle(screen, '주변 상점');
  return frame;
}

function addHeader(frame, startY = 100) {
  let y = startY;
  placeText(frame, '주변 상점', PAD, y, 335, 22, true);
  y += 34;
  placeText(frame, '직선 거리 가까운 순이에요. 거리는 직선 기준이에요.', PAD, y, 335, 13, false, MU);
  y += 36;
  placeText(frame, '제로웨이스트 샵·샵앤샵·재사용 매장·제웨 숙소를 함께 보여줘요.', PAD, y, 335, 12, false, MU);
  y += 32;
  addChipRow(frame, y, ['전체', '알맹', '제로웨이스트', '샵앤샵', '재사용'], 0);
  y += 44;
  return y;
}

const page = figma.root.children.find((p) => p.name === '10 주변 상점');
await figma.setCurrentPageAsync(page);
while (page.children.length > 0) page.children[0].remove();

{
  const frame = await buildShell(page, '10 주변 상점 · 리스트', 0);
  let y = addHeader(frame, 100);
  addModeToggle(frame, y, 'list');
  y += 52;
  const listCard = figma.createFrame();
  listCard.name = 'ListCard';
  listCard.x = PAD; listCard.y = y;
  listCard.resize(335, 280);
  listCard.layoutMode = 'VERTICAL';
  listCard.fills = [{ type: 'SOLID', color: SU }];
  listCard.strokes = [{ type: 'SOLID', color: BD }];
  listCard.strokeWeight = 1;
  listCard.cornerRadius = 16;
  listCard.clipsContent = true;
  frame.appendChild(listCard);
  await addListRow(listCard, '♻️ 알맹상점 마포점', '알맹 직영 · 서울 마포구 망원동', '포인트 연동', false, 335);
  await addListRow(listCard, '🌿 틈새상점', '재사용 · 충남 공주시', '약 45km', false, 335);
  await addListRow(listCard, '🏪 알맹 리필스테이션', '제로웨이스트 · 서울 종로구', '약 5.3km', false, 335);
  await addListRow(listCard, '🛏️ 에코스테이 숙소', '제웨 숙소 · 강원 평창', '약 120km', false, 335);
  placeText(frame, '데이터: 알맹 카카오맵 341곳 · 지도 핀은 가까운 4곳만 · 좌표는 구·군 단위 대략값', PAD, 680, 335, 11, false, MU, true);
}

{
  const frame = await buildShell(page, '10 주변 상점 · 지도', 415);
  let y = addHeader(frame, 100);
  addModeToggle(frame, y, 'map');
  y += 52;
  const mapWrap = figma.createFrame();
  mapWrap.name = 'MapView';
  mapWrap.x = PAD; mapWrap.y = y;
  mapWrap.resize(335, 300);
  mapWrap.cornerRadius = 16;
  mapWrap.clipsContent = true;
  mapWrap.strokes = [{ type: 'SOLID', color: BD }];
  mapWrap.strokeWeight = 1;
  frame.appendChild(mapWrap);
  buildOsmStyleMap(mapWrap, 335, 300);
  placeText(frame, '핀을 탭하면 상점 정보를 볼 수 있어요.', PAD, y + 316, 335, 13, false, MU);
  placeText(frame, '데이터: 알맹 카카오맵 341곳 · 지도 핀은 가까운 4곳만 · 좌표는 구·군 단위 대략값', PAD, 680, 335, 11, false, MU, true);
}

return {
  page: page.name,
  frames: page.children.map((f) => ({
    name: f.name,
    mapPins: f.children.find((c) => c.name === 'MapView')?.children.filter((c) => c.name === 'ShopPin' || c.name === 'UserPin').length,
  })),
};
