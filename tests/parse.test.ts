import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCombatRecord, parseMatchScreen, hasUsableStats, looksLikeMatchScreen } from "../src/ocr/parse.js";
import { findMap } from "../src/psn/maps.js";

test("parses a BO2 combat record screen", () => {
  const text = `
    CALL OF DUTY BLACK OPS II
    COMBAT RECORD
    KILLS 41,323
    DEATHS 29,881
    K/D RATIO 1.38
    WINS 1,204
    LOSSES 986
    WIN % 55.0
    SCORE 5,412,900
    ACCURACY 18.4%
    HEADSHOTS 4,102
    TIME PLAYED 21d 4h 33m
  `;
  const s = parseCombatRecord(text);
  assert.equal(s.game, "BO2");
  assert.equal(s.kills, 41323);
  assert.equal(s.deaths, 29881);
  assert.equal(s.kdRatio, 1.38);
  assert.equal(s.wins, 1204);
  assert.equal(s.losses, 986);
  assert.equal(s.winPct, 55.0);
  assert.equal(s.score, 5412900);
  assert.equal(s.accuracy, 18.4);
  assert.equal(s.headshots, 4102);
  assert.ok(s.timePlayed?.includes("21d"));
  assert.ok(hasUsableStats(s));
});

test("parses a BO1 screen and derives missing ratios", () => {
  const text = `
    CALL OF DUTY BLACK OPS
    KILLS: 15000
    DEATHS: 10000
    WINS 500
    LOSSES 500
  `;
  const s = parseCombatRecord(text);
  assert.equal(s.game, "BO1");
  assert.equal(s.kdRatio, 1.5);
  assert.equal(s.winPct, 50);
});

test("classifies BO2 when OCR mangles the II", () => {
  for (const title of ["BLACK OPS Il", "BLACK OPS ll", "BLACK OPS 11", "BLACK OPS II"]) {
    const s = parseCombatRecord(`${title}\nKILLS 10`);
    assert.equal(s.game, "BO2", title);
  }
});

test("tolerates noisy OCR punctuation", () => {
  const text = "BLACK OPS ii .. kills.. 1.234  deaths - 567";
  const s = parseCombatRecord(text);
  assert.equal(s.game, "BO2");
  assert.equal(s.kills, 1234);
  assert.equal(s.deaths, 567);
});

test("parses an end-of-match MP scoreboard", () => {
  const text = `
    VICTORY
    TEAM DEATHMATCH - NUKETOWN 2025
    SixDotRixx  KILLS 38  DEATHS 21
  `;
  const m = parseMatchScreen(text);
  assert.equal(m.map, "Nuketown 2025");
  assert.equal(m.game, "BO2");
  assert.equal(m.mode, "Team Deathmatch");
  assert.equal(m.kills, 38);
  assert.equal(m.deaths, 21);
  assert.equal(m.result, "win");
  assert.ok(looksLikeMatchScreen(parseCombatRecord(text), m));
});

test("parses a zombies game-over screen with round", () => {
  const text = "GAME OVER\nYou survived 31 rounds? ROUND 31\nKINO DER TOTEN\nKILLS 412";
  const m = parseMatchScreen(text);
  assert.equal(m.map, "Kino der Toten");
  assert.equal(m.game, "BO1");
  assert.equal(m.mapCategory, "zombies");
  assert.equal(m.round, 31);
});

test("findMap prefers longest names and respects game hint", () => {
  assert.equal(findMap("welcome to nuketown 2025 lobby")?.map, "Nuketown 2025");
  assert.equal(findMap("nuketown", "BO1")?.map, "Nuketown");
  assert.equal(findMap("summit loading screen")?.game, "BO1");
  assert.equal(findMap("no map here"), null);
});

test("lifetime record is not misclassified as a match screen", () => {
  const text = "BLACK OPS COMBAT RECORD KILLS 100 DEATHS 50 WINS 10 LOSSES 5 WIN % 66 TIME PLAYED 2d";
  const record = parseCombatRecord(text);
  const m = parseMatchScreen(text);
  assert.ok(!looksLikeMatchScreen(record, m));
});

test("returns nulls and unusable flag for unrelated text", () => {
  const s = parseCombatRecord("main menu options exit");
  assert.equal(s.kills, null);
  assert.ok(!hasUsableStats(s));
});
