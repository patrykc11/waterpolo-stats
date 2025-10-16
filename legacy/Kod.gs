const SHEETS = {
  settings: "Settings",
  users: "Users",
  players: "Players",
  matches: "Matches",
  events: "Events",
  roster: "Match_Roster",
};

// Minimal required headers – reszta kolumn może istnieć (np. wszystkie is_*)
const REQUIRED_HEADERS = {
  Settings: ["ActiveMatch", "Quarter", "EditorPIN"],
  Users: ["email", "role"],
  Players: ["player_id", "number", "name", "team"],
  Matches: ["match_id", "date", "opponent"],
  Match_Roster: ["match_id", "player_id", "number", "name", "team"],
  Events: [
    "timestamp",
    "match_id",
    "quarter",
    "team",
    "player_id",
    "player_name",
    "event_type",
    "subtype",
    "value",
    "note",
  ],
};

const SCORE_COLS = [
  "q1_my",
  "q1_opp",
  "q2_my",
  "q2_opp",
  "q3_my",
  "q3_opp",
  "q4_my",
  "q4_opp",
  "final_my",
  "final_opp",
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("WTS Stats")
    .addItem("Otwórz aplikację", "openWebAppDialog")
    .addItem("Odśwież Index", "refreshIndexSheet")
    .addToUi();
  // Auto-ensure kolumn w Events
  try {
    ensureEventColumns();
  } catch (e) {}
}

function openWebAppDialog() {
  const html = HtmlService.createHtmlOutputFromFile("index")
    .setWidth(1100)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, "WTS Stats");
}

function doGet() {
  try {
    ensureEventColumns();
  } catch (e) {}
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("WTS Stats")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- bootstrap ---------- */

function getBootstrap() {
  try {
    ensureEventColumns();
  } catch (e) {}
  return {
    settings: getSettings(),
    players: getPlayers(),
    matches: getMatches(),
    user: getUser(),
    rosterActive: getRoster(getSettings().ActiveMatch || ""),
  };
}

/* ---------- Ensure Events columns (no backward-compat needed) ---------- */

function ensureEventColumns() {
  const required = [
    "phase",
    "location",
    "shot_zone",
    "is_goal_from_play",
    "is_goal_from_center",
    "is_goal_putback",
    "is_goal_5m",
    "is_assist",
    "is_excl_drawn",
    "excl_drawn_location",
    "is_excl_committed",
    "excl_committed_location",
    "is_penalty_drawn",
    "penalty_drawn_location",
    "is_penalty_committed",
    "penalty_committed_location",
    "is_turnover",
    "is_turnover_1v1",
    "is_shot_saved_gk",
    "is_shot_miss_turnover",
    "is_shot_miss_reset30",
    "is_bad_pass_turnover",
    "is_bad_pass_no_turnover",
    "is_shot_clock_violation",
    "is_steal",
    "is_block_hand",
    "is_no_block",
    "is_no_return",
  ];
  const sh = getOrCreateEventsTemplate();
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  const have = new Set(hdr);
  const toAdd = required.filter((k) => !have.has(k));
  if (!toAdd.length) return;
  // append columns at the end
  toAdd.forEach(() => sh.insertColumnAfter(sh.getLastColumn()));
  const newHdr = hdr.concat(toAdd);
  sh.getRange(1, 1, 1, newHdr.length).setValues([newHdr]);
}

function getSettings() {
  const sh = getSheet(SHEETS.settings);
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  const vals = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  const map = {};
  hdr.forEach((h, i) => (map[h] = vals[i]));
  return {
    ActiveMatch: map.ActiveMatch || "",
    Quarter: Number(map.Quarter || 1),
  };
}

function canEditWithPin(pin) {
  const sh = getSheet(SHEETS.settings);
  const idx = headerIndexMap(sh);
  const col = idx.EditorPIN;
  const expected = col ? sh.getRange(2, col).getValue() : "";
  return String(pin || "") === String(expected || "");
}

function validatePin(pin) {
  return { ok: canEditWithPin(pin) };
}

// Resolve current user and role from Users sheet (by email)
function getUser() {
  const email = Session.getActiveUser().getEmail() || "";
  let role = "viewer";
  try {
    const sh = getSheet(SHEETS.users);
    const idx = headerIndexMap(sh);
    const rows = readRows(sh);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const em = String(r[idx.email - 1] || "")
        .trim()
        .toLowerCase();
      if (em && email && em === email.toLowerCase()) {
        role = String(r[idx.role - 1] || "viewer").trim();
        break;
      }
    }
  } catch (e) {
    // If Users sheet missing, default stays 'viewer'
  }
  return { email, role };
}

// Main gate: allow if user has editor role OR valid PIN provided
function canEdit(pin) {
  try {
    const user = getUser();
    if (String(user.role).toLowerCase() === "editor") return true;
  } catch (e) {
    // ignore
  }
  return canEditWithPin(pin);
}

/* ---------- read data ---------- */

function getPlayers() {
  const sh = getSheet(SHEETS.players);
  const idx = headerIndexMap(sh);
  return readRows(sh)
    .map((r) => ({
      player_id: String(r[idx.player_id - 1] || ""),
      number: Number(r[idx.number - 1] || 0),
      name: String(r[idx.name - 1] || ""),
      team: String(r[idx.team - 1] || "my"),
    }))
    .filter((p) => p.player_id && p.name)
    .sort((a, b) => a.number - b.number);
}

function getMatches() {
  const sh = getSheet(SHEETS.matches);
  const idx = headerIndexMap(sh);
  return readRows(sh)
    .map((r) => ({
      match_id: String(r[idx.match_id - 1] || ""),
      date: r[idx.date - 1] ? String(r[idx.date - 1]) : "", // unikamy zwracania Date
      opponent: String(r[idx.opponent - 1] || ""),
      place: idx.place ? String(r[idx.place - 1] || "") : "",
    }))
    .filter((m) => m.match_id);
}

/* ---------- roster per match (read-only from sheet) ---------- */

function getRoster(matchId) {
  if (!matchId) return [];
  let sh;
  try {
    sh = getSheet(SHEETS.roster);
  } catch (e) {
    return [];
  }
  const idx = headerIndexMap(sh);
  return readRows(sh)
    .filter((r) => String(r[idx.match_id - 1] || "") === String(matchId))
    .map((r) => ({
      match_id: String(r[idx.match_id - 1] || ""),
      player_id: String(r[idx.player_id - 1] || ""),
      number: Number(r[idx.number - 1] || 0),
      name: String(r[idx.name - 1] || ""),
      team: String(r[idx.team - 1] || "my"),
    }))
    .filter((p) => p.player_id)
    .sort((a, b) => a.number - b.number);
}

/* ---------- write actions (PIN required) ---------- */

function setQuarter(q, pin) {
  if (!canEdit(pin)) throw new Error("Brak uprawnień (editor/PIN)");
  const sh = getSheet(SHEETS.settings);
  const idx = headerIndexMap(sh);
  sh.getRange(2, idx.Quarter).setValue(Number(q));
  return getSettings();
}

function setActiveMatch(matchId, pin) {
  if (!canEdit(pin)) throw new Error("Brak uprawnień (editor/PIN)");
  const sh = getSheet(SHEETS.settings);
  const idx = headerIndexMap(sh);
  sh.getRange(2, idx.ActiveMatch).setValue(matchId || "");
  return getSettings();
}

function appendEvent(ev, pin) {
  return appendEvents([ev], pin);
}

function appendEvents(events, pin) {
  if (!canEdit(pin)) throw new Error("Brak uprawnień (editor/PIN)");

  const settings = getSettings();
  const targetMatchId = String(
    (events && events[0] && events[0].match_id) || settings.ActiveMatch || ""
  );
  const sh = getOrCreateEventsSheet(targetMatchId);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

  const rows = events.map((ev) => {
    const base = {
      timestamp: new Date(),
      match_id: ev.match_id || settings.ActiveMatch || "",
      quarter: Number(ev.quarter || settings.Quarter || 1),
      team: ev.team || "my",
      player_id: ev.player_id || "",
      player_name: ev.player_name || "",
      event_type: ev.event_type || "",
      subtype: ev.subtype || "",
      value: ev.value || "",
      note: ev.note || "",
    };

    const isGoal = ev.event_type === "goal";
    const flags = {
      is_goal_from_play: isGoal && ev.subtype === "from_play" ? 1 : 0,
      is_goal_counter: isGoal && ev.subtype === "counter" ? 1 : 0,
      is_goal_putback: isGoal && ev.subtype === "rebound" ? 1 : 0,
      is_goal_man_up: isGoal && ev.subtype === "advantage" ? 1 : 0,
      is_goal_5m: isGoal && ev.subtype === "penalty_5m" ? 1 : 0,
      is_assist: ev.event_type === "assist" ? 1 : 0,
      is_excl_drawn: ev.event_type === "exclusion_drawn" ? 1 : 0,
      is_excl_committed: ev.event_type === "exclusion_caused" ? 1 : 0,
      is_bad_pass_2m: ev.event_type === "bad_ball_2m" ? 1 : 0,
      is_shot_out: ev.event_type === "shot_off" ? 1 : 0,
      is_turnover: ev.event_type === "turnover" ? 1 : 0,
      is_steal: ev.event_type === "steal" ? 1 : 0,
      is_block_hand: ev.event_type === "block_hand" ? 1 : 0,
      is_press_win: ev.event_type === "press_win" ? 1 : 0,
      is_interception: ev.event_type === "interception" ? 1 : 0,
      is_no_return: ev.event_type === "no_return" ? 1 : 0,
    };

    const obj = { ...base, ...flags };
    return headers.map((h) =>
      h in obj ? obj[h] : String(h).startsWith("is_") ? 0 : ""
    );
  });

  if (rows.length) {
    const start = sh.getLastRow() + 1;
    sh.getRange(start, 1, rows.length, headers.length).setValues(rows);
  }

  return { ok: true, count: rows.length };
}

function undoLastEvent(windowMinutes, pin) {
  if (!canEdit(pin)) throw new Error("Brak uprawnień (editor/PIN)");
  const minutes = Number(windowMinutes || 3);
  const settings = getSettings();
  const sh = getOrCreateEventsSheet(settings.ActiveMatch);
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return { ok: false, reason: "Brak zdarzeń" };

  const hdr = values[0];
  const idx = {};
  hdr.forEach((h, i) => (idx[h] = i));

  for (let r = values.length - 1; r >= 1; r--) {
    const row = values[r];
    const ts = row[idx.timestamp];
    const ageMin = ts
      ? (Date.now() - new Date(ts).getTime()) / 60000
      : minutes + 1;
    if (ageMin <= minutes) {
      sh.deleteRow(r + 1);
      return { ok: true };
    }
    break;
  }
  return { ok: false, reason: "Nie znaleziono zdarzenia w ostatnich minutach" };
}

/* ---------- scores (PIN required for write) ---------- */

function ensureScoreColumns(sh) {
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  let changed = false;
  SCORE_COLS.forEach((col) => {
    if (!hdr.includes(col)) {
      sh.insertColumnAfter(sh.getLastColumn());
      sh.getRange(1, sh.getLastColumn()).setValue(col);
      changed = true;
    }
  });
  if (changed && sh.getLastRow() > 1) {
    // nothing else needed; new cells are blank
  }
}

function setQuarterScore(matchId, quarter, myScore, oppScore, pin) {
  if (!canEditWithPin(pin)) throw new Error("Brak uprawnień (PIN)");
  const sh = getSheet(SHEETS.matches);
  ensureScoreColumns(sh);
  const idx = headerIndexMap(sh);
  const data = readRows(sh);
  let rowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][idx.match_id - 1] || "") === String(matchId || "")) {
      rowIndex = i + 2;
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Nie znaleziono meczu");

  let myCol, oppCol;
  if (String(quarter) === "final") {
    myCol = idx.final_my;
    oppCol = idx.final_opp;
  } else {
    const q = Number(quarter || 1);
    myCol = idx[`q${q}_my`];
    oppCol = idx[`q${q}_opp`];
  }
  if (!myCol || !oppCol) throw new Error("Brak kolumn wyników (q*_my/q*_opp)");
  sh.getRange(rowIndex, myCol).setValue(Number(myScore));
  sh.getRange(rowIndex, oppCol).setValue(Number(oppScore));
  return getMatchScores(matchId);
}

function getMatchScores(matchId) {
  const sh = getSheet(SHEETS.matches);
  const idx = headerIndexMap(sh);
  const rows = readRows(sh);
  for (const r of rows) {
    if (String(r[idx.match_id - 1] || "") === String(matchId || "")) {
      const get = (k) => (idx[k] ? r[idx[k] - 1] || "" : "");
      return {
        1: { my: Number(get("q1_my") || 0), opp: Number(get("q1_opp") || 0) },
        2: { my: Number(get("q2_my") || 0), opp: Number(get("q2_opp") || 0) },
        3: { my: Number(get("q3_my") || 0), opp: Number(get("q3_opp") || 0) },
        4: { my: Number(get("q4_my") || 0), opp: Number(get("q4_opp") || 0) },
        final: {
          my: Number(get("final_my") || 0),
          opp: Number(get("final_opp") || 0),
        },
      };
    }
  }
  return {
    1: { my: 0, opp: 0 },
    2: { my: 0, opp: 0 },
    3: { my: 0, opp: 0 },
    4: { my: 0, opp: 0 },
    final: { my: 0, opp: 0 },
  };
}

/* ---------- stats (read-only) ---------- */

function getMatchStats(matchId) {
  const evSh = getOrCreateEventsSheet(matchId);
  const hdr = evSh.getRange(1, 1, 1, evSh.getLastColumn()).getValues()[0];
  const idx = {};
  hdr.forEach((h, i) => (idx[h] = i));
  const flagCols = hdr.filter((h) => /^is_/.test(h));

  const rows = evSh.getDataRange().getValues().slice(1);

  const quarters = ["1", "2", "3", "4"];
  const zeroFlags = () => {
    const o = {};
    flagCols.forEach((f) => (o[f] = 0));
    return o;
  };

  const totalsAll = zeroFlags();
  const totalsByQ = {
    1: zeroFlags(),
    2: zeroFlags(),
    3: zeroFlags(),
    4: zeroFlags(),
  };

  const perPlayerAll = {};
  const perPlayerByQ = { 1: {}, 2: {}, 3: {}, 4: {} };

  for (const r of rows) {
    const q = String(Number(r[idx.quarter] || 0));
    const pid = String(r[idx.player_id] || "");
    flagCols.forEach((f) => {
      const v = Number(r[idx[f]] || 0);
      totalsAll[f] += v;
      if (quarters.includes(q)) totalsByQ[q][f] += v;

      if (!perPlayerAll[pid]) perPlayerAll[pid] = zeroFlags();
      perPlayerAll[pid][f] += v;

      if (quarters.includes(q)) {
        if (!perPlayerByQ[q][pid]) perPlayerByQ[q][pid] = zeroFlags();
        perPlayerByQ[q][pid][f] += v;
      }
    });
  }

  const roster = getRoster(matchId);
  const players = roster && roster.length ? roster : getPlayers(); // includes id, number, name
  const scores = getMatchScores(matchId);

  return {
    flags: flagCols,
    players,
    perPlayerAll,
    perPlayerByQ,
    totalsAll,
    totalsByQ,
    scores,
  };
}

/* ---------- events sheet per match ---------- */

function sanitizeSheetNamePart(text) {
  let s = String(text || "").trim();
  if (!s) s = "unknown";
  // Forbid characters not allowed in sheet names
  s = s.replace(/[:\/\\?*\[\]]/g, "-");
  if (s.length > 80) s = s.substring(0, 80);
  return s;
}

function getEventsSheetName(matchId) {
  return "Events_" + sanitizeSheetNamePart(matchId);
}

function getEventsHeadersTemplate() {
  const tpl = getOrCreateEventsTemplate();
  return tpl.getRange(1, 1, 1, tpl.getLastColumn()).getValues()[0];
}

function getEventsSheetForMatch(matchId) {
  const name = getEventsSheetName(matchId);
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function getOrCreateEventsSheet(matchId) {
  const ss = SpreadsheetApp.getActive();
  const name = getEventsSheetName(matchId);
  let sh = ss.getSheetByName(name);
  if (sh) return sh;
  // Create and seed headers from template 'Events'
  sh = ss.insertSheet(name);
  const headers = getEventsHeadersTemplate();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  return sh;
}

// Ensure the template 'Events' sheet exists with base headers and ensured extended columns
function getOrCreateEventsTemplate() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEETS.events);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.events);
    // Seed minimal required base headers
    const base = REQUIRED_HEADERS.Events;
    sh.getRange(1, 1, 1, base.length).setValues([base]);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- create/update match and roster ---------- */

function ensureMatchesOptionalColumns(sh) {
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  if (!hdr.includes("place")) {
    sh.insertColumnAfter(sh.getLastColumn());
    sh.getRange(1, sh.getLastColumn()).setValue("place");
  }
}

function getOrCreateRosterSheet() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEETS.roster);
  if (sh) return sh;
  sh = ss.insertSheet(SHEETS.roster);
  const headers = ["match_id", "player_id", "number", "name", "team"];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  return sh;
}

// match: { match_id, date, opponent, place }
// roster: Array<{ player_id, number, name, team }>
function addMatchAndRoster(match, roster, pin) {
  if (!canEdit(pin)) throw new Error("Brak uprawnień (editor/PIN)");

  if (!match || !match.match_id) throw new Error("Brak match_id");
  const shM = getSheet(SHEETS.matches);
  ensureMatchesOptionalColumns(shM);
  const idxM = headerIndexMap(shM);
  const rowsM = readRows(shM);
  let rowIndex = -1;
  for (let i = 0; i < rowsM.length; i++) {
    if (String(rowsM[i][idxM.match_id - 1] || "") === String(match.match_id)) {
      rowIndex = i + 2;
      break;
    }
  }
  const rowValues = [];
  const headersM = shM.getRange(1, 1, 1, shM.getLastColumn()).getValues()[0];
  const map = {
    match_id: match.match_id,
    date: match.date || "",
    opponent: match.opponent || "",
    place: match.place || "",
  };
  headersM.forEach((h) => rowValues.push(map[h] !== undefined ? map[h] : ""));
  if (rowIndex === -1) {
    shM.appendRow(rowValues);
  } else {
    shM.getRange(rowIndex, 1, 1, headersM.length).setValues([rowValues]);
  }

  // Save roster
  const shR = getOrCreateRosterSheet();
  const idxR = headerIndexMap(shR);
  // delete existing rows for this match (bottom-up)
  const valuesR = shR.getDataRange().getValues();
  for (let r = valuesR.length - 1; r >= 1; r--) {
    if (
      String(valuesR[r][idxR.match_id - 1] || "") === String(match.match_id)
    ) {
      shR.deleteRow(r + 1);
    }
  }
  if (roster && roster.length) {
    const headersR = shR.getRange(1, 1, 1, shR.getLastColumn()).getValues()[0];
    const rows = roster.map((p) => ({
      match_id: match.match_id,
      player_id: p.player_id,
      number: Number(p.number || 0),
      name: p.name || "",
      team: p.team || "my",
    }));
    const out = rows.map((obj) =>
      headersR.map((h) => (h in obj ? obj[h] : ""))
    );
    if (out.length) {
      const start = shR.getLastRow() + 1;
      shR.getRange(start, 1, out.length, headersR.length).setValues(out);
    }
  }

  // Pre-create events sheet for the match
  getOrCreateEventsSheet(match.match_id);

  return { matches: getMatches(), roster: getRoster(match.match_id) };
}

// Find previous match_id chronologicznie (ostatni wiersz w Matches przed podanym)
function getPreviousMatchRoster(matchId) {
  const sh = getSheet(SHEETS.matches);
  const idx = headerIndexMap(sh);
  const rows = readRows(sh);
  const order = rows.map((r) => ({
    id: String(r[idx.match_id - 1] || ""),
    date: r[idx.date - 1] ? new Date(r[idx.date - 1]) : null,
  }));
  let prevId = "";
  // sort by date then by index
  const sorted = order
    .map((o, i) => ({ ...o, i }))
    .sort((a, b) => {
      const ta = a.date ? a.date.getTime() : 0;
      const tb = b.date ? b.date.getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.i - b.i;
    });
  const pos = sorted.findIndex((x) => x.id === String(matchId));
  if (pos > 0) prevId = sorted[pos - 1].id;
  if (!prevId && sorted.length) prevId = sorted[sorted.length - 1].id;
  return getRoster(prevId);
}

/* ---------- Index sheet (helper) ---------- */

function refreshIndexSheet() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName("Index");
  if (!sh) sh = ss.insertSheet("Index");
  sh.clear();
  const headers = [
    "match_id",
    "date",
    "opponent",
    "place",
    "events_sheet",
    "open_events",
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  const url = ss.getUrl();
  const data = getMatches();
  const rows = data.map((m) => {
    const evName = getEventsSheetName(m.match_id);
    const ev = SpreadsheetApp.getActive().getSheetByName(evName);
    const gid = ev ? ev.getSheetId() : "";
    const link = gid ? `=HYPERLINK("${url}#gid=${gid}","Otwórz")` : "";
    return [
      m.match_id,
      m.date || "",
      m.opponent || "",
      m.place || "",
      evName,
      link,
    ];
  });
  if (rows.length)
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return sh.getSheetId();
}

function getIndexUrl() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName("Index");
  if (!sh) refreshIndexSheet();
  sh = ss.getSheetByName("Index");
  return { url: ss.getUrl() + "#gid=" + sh.getSheetId() };
}

function getEventsSheetLink(matchId) {
  const ss = SpreadsheetApp.getActive();
  const sh = getOrCreateEventsSheet(matchId);
  return { url: ss.getUrl() + "#gid=" + sh.getSheetId() };
}

/* ---------- helpers ---------- */

function getSheet(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error("Brak arkusza: " + name);
  const req = REQUIRED_HEADERS[name];
  if (req) {
    const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
    for (const h of req)
      if (!hdr.includes(h))
        throw new Error(`W arkuszu ${name} brakuje kolumny: ${h}`);
  }
  return sh;
}

function headerIndexMap(sh) {
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
  const map = {};
  hdr.forEach((h, i) => (map[h] = i + 1));
  return map;
}

function readRows(sh) {
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
