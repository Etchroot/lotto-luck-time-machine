// 집계 로직 검증. 실행: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze, TICKET_PRICE } from './analyze.js';

const { draws } = JSON.parse(readFileSync(new URL('../../data/lotto.json', import.meta.url), 'utf8'));

test('1000회 당첨번호를 고르면 1000회가 1등으로 집계됨', () => {
  const r = analyze([2, 8, 19, 22, 32, 42], draws);
  const w = r.wins.find(w => w.draw.round === 1000);
  assert.equal(w.rank, 1);
  assert.equal(r.bestRank, 1);
});

test('집계 값이 서로 맞음: 등수별 횟수 합 = 당첨 횟수, 금액 합 = 총 당첨금', () => {
  const r = analyze([1, 7, 13, 25, 33, 44], draws);
  assert.equal(Object.values(r.counts).reduce((a, b) => a + b, 0), r.wins.length);
  assert.equal(r.wins.reduce((a, w) => a + w.amount, 0), r.totalPrize);
  assert.equal(r.spent, draws.length * TICKET_PRICE);
  assert.equal(r.net, r.totalPrize - r.spent);
});

test('당첨 기록은 최신 회차가 먼저 나옴', () => {
  const r = analyze([1, 2, 3, 4, 5, 6], draws);
  for (let i = 1; i < r.wins.length; i++) assert.ok(r.wins[i - 1].draw.round > r.wins[i].draw.round);
});
