import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCombatRecord, hasUsableStats } from "../src/ocr/parse.js";

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

test("returns nulls and unusable flag for unrelated text", () => {
  const s = parseCombatRecord("main menu options exit");
  assert.equal(s.kills, null);
  assert.ok(!hasUsableStats(s));
});
