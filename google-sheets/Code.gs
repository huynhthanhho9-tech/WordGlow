/**
 * WordGlow – Bảng xếp hạng cả lớp (Google Apps Script)
 * Dán toàn bộ mã này vào Extensions > Apps Script của Google Sheet, rồi Deploy > New deployment > Web app.
 */
const SHEET_SCORES = 'Điểm';
const SHEET_RANK = 'Xếp hạng';
const SHEET_ARCHIVE = 'Lưu trữ';
const HEADERS = ['Thời gian', 'Tên học sinh', 'Lớp', 'Bài học', 'Trò chơi', 'Điểm trong game', 'Điểm thành tích'];
const CLASSES = { ielts: 'IELTS', b1: 'B1' };
const GAMES = { quiz: 'Kiểm tra', path: 'Đường Ánh Sáng', egg: 'Gà Con Săn Trứng' };
const MAX_XP = 200;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('WordGlow')
    .addItem('Cập nhật bảng xếp hạng', 'updateRankSheet')
    .addItem('Tổng kết đợt này và bắt đầu đợt mới', 'closeRound')
    .addToUi();
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) { sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold'); }
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** App gửi điểm về đây */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const name = String(d.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const game = GAMES[d.game] ? d.game : null;
    const xp = Math.round(Number(d.xp));
    const cls = CLASSES[d.cls] ? CLASSES[d.cls] : '';
    if (!name || !cls || !game || !isFinite(xp) || xp < 0 || xp > MAX_XP) return json_({ ok: false, error: 'invalid' });
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_(SHEET_SCORES, HEADERS).appendRow([
        new Date(d.at || Date.now()), name, cls, String(d.lesson || '').slice(0, 80), GAMES[game],
        Math.round(Number(d.raw) || 0), xp
      ]);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** App đọc bảng xếp hạng ở đây */
function doGet(e) {
  const cls = CLASSES[e && e.parameter && e.parameter.cls] || '';
  return json_({ ok: true, since: roundStart_(), cls: cls, rows: cls ? ranking_(cls) : [] });
}

function ranking_(cls) {
  const sh = sheet_(SHEET_SCORES, HEADERS);
  const values = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues() : [];
  const map = {};
  values.forEach(r => {
    const name = String(r[1]).trim(), c = String(r[2]).trim(); if (!name || (cls && c !== cls)) return;
    const key = c + '|' + name.toLowerCase().replace(/\s+/g, ' ');
    const m = map[key] || (map[key] = { name: name, cls: c, total: 0, plays: 0, last: null });
    m.total += Number(r[6]) || 0; m.plays++;
    const t = new Date(r[0]); if (!m.last || t > m.last) m.last = t;
  });
  const all = Object.keys(map).map(k => map[k]).sort((a, b) => a.cls.localeCompare(b.cls) || b.total - a.total || b.plays - a.plays);
  const rankIn = {};
  return all.map(m => { rankIn[m.cls] = (rankIn[m.cls] || 0) + 1;
    return { rank: rankIn[m.cls], name: m.name, cls: m.cls, total: m.total, plays: m.plays, last: m.last ? m.last.toISOString() : null }; });
}

function roundStart_() {
  return PropertiesService.getScriptProperties().getProperty('roundStart') || null;
}

/** Menu: ghi bảng xếp hạng hiện tại vào tab "Xếp hạng" */
function updateRankSheet() {
  writeRank_(sheet_(SHEET_RANK), 'Bảng xếp hạng (cập nhật ' + fmt_(new Date()) + ')');
}

function writeRank_(sh, title) {
  const rows = ranking_();
  sh.clear();
  sh.getRange(1, 1).setValue(title).setFontWeight('bold').setFontSize(13);
  const head = ['Lớp', 'Hạng', 'Tên học sinh', 'Tổng điểm thành tích', 'Số lần chơi'];
  sh.getRange(3, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#ffd84d');
  if (rows.length) sh.getRange(4, 1, rows.length, 5).setValues(rows.map(r => [r.cls, r.rank, r.name, r.total, r.plays]));
  sh.autoResizeColumns(1, 5);
  return rows.length;
}

/** Menu: tổng kết đợt, lưu bảng xếp hạng thành tab riêng, chuyển điểm sang Lưu trữ, bắt đầu đợt mới */
function closeRound() {
  const ui = SpreadsheetApp.getUi();
  const ok = ui.alert('Tổng kết đợt này?', 'Bảng xếp hạng hiện tại sẽ được lưu thành một tab mới. Điểm của học sinh sẽ chuyển sang tab "Lưu trữ" và bảng xếp hạng trong app bắt đầu lại từ 0.', ui.ButtonSet.OK_CANCEL);
  if (ok !== ui.Button.OK) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = 'Tổng kết ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH.mm');
  const n = writeRank_(ss.insertSheet(name), name + (roundStart_() ? ' (từ ' + fmt_(new Date(roundStart_())) + ')' : ''));
  const sc = sheet_(SHEET_SCORES, HEADERS), ar = sheet_(SHEET_ARCHIVE, HEADERS);
  if (sc.getLastRow() > 1) {
    const data = sc.getRange(2, 1, sc.getLastRow() - 1, 7).getValues();
    ar.getRange(ar.getLastRow() + 1, 1, data.length, 7).setValues(data);
    sc.deleteRows(2, data.length);
  }
  PropertiesService.getScriptProperties().setProperty('roundStart', new Date().toISOString());
  updateRankSheet();
  ui.alert('Xong! Đã lưu bảng tổng kết của ' + n + ' học sinh vào tab "' + name + '".');
}

function fmt_(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'); }
