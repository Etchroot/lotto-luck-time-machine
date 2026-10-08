// 가상 당첨금 계산 검증. 기대값은 원본 데이터와 언론 보도에서 손으로 확인한 숫자다.
// 실행: node --test src/lib/prize.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rankOf, hypotheticalPrize } from './prize.js';

const { draws, firstRound } = JSON.parse(readFileSync(new URL('../../data/lotto.json', import.meta.url), 'utf8'));
const draw = round => draws[round - firstRound];

test('등수 판정: 1000회 당첨번호 2,8,19,22,32,42 + 보너스 39', () => {
  const d = draw(1000);
  assert.equal(rankOf([2, 8, 19, 22, 32, 42], d), 1);
  assert.equal(rankOf([2, 8, 19, 22, 32, 39], d), 2); // 5개 + 보너스
  assert.equal(rankOf([2, 8, 19, 22, 32, 45], d), 3);
  assert.equal(rankOf([2, 8, 19, 22, 44, 45], d), 4);
  assert.equal(rankOf([2, 8, 19, 43, 44, 45], d), 5);
  assert.equal(rankOf([2, 8, 39, 43, 44, 45], d), null); // 보너스는 2등 판정에만 쓰임
});

test('1000회 1등: 22명이 나눈 총액 27,430,031,640원을 23명이 나눔', () => {
  assert.deepEqual(hypotheticalPrize(draw(1000), 1), { amount: Math.floor(27430031640 / 23), basis: 'split' });
});

test('463회 1등 0명: 보도된 이월금 약 121억 4059만 원을 혼자 받음', () => {
  assert.deepEqual(hypotheticalPrize(draw(463), 1), { amount: 12140599125, basis: 'carryover' });
});

test('295회 1등 0명: 보도된 이월금 약 98억 2300만 원을 혼자 받음', () => {
  assert.deepEqual(hypotheticalPrize(draw(295), 1), { amount: 9823300500, basis: 'carryover' });
});

test('381회 1등: 총액이 비어 있어 1인당 565,738,895원 × 19명을 20명이 나눔', () => {
  assert.deepEqual(hypotheticalPrize(draw(381), 1), { amount: Math.floor(565738895 * 19 / 20), basis: 'split' });
});

test('4등: 400회는 나눠 갖고, 401회부터는 5만 원 고정', () => {
  assert.equal(hypotheticalPrize(draw(400), 4).basis, 'split');
  assert.deepEqual(hypotheticalPrize(draw(401), 4), { amount: 50000, basis: 'fixed' });
});

test('5등은 5천 원 고정', () => {
  assert.deepEqual(hypotheticalPrize(draw(1244), 5), { amount: 5000, basis: 'fixed' });
});

test('전 회차·전 등수에서 금액이 양수이고, 나눠 갖는 경우 기존 1인당 금액보다 크지 않음', () => {
  for (const d of draws) {
    for (const rank of [1, 2, 3, 4, 5]) {
      const { amount, basis } = hypotheticalPrize(d, rank);
      assert.ok(Number.isInteger(amount) && amount > 0, `${d.round}회 ${rank}등: ${amount}`);
      if (basis === 'split') assert.ok(amount <= d.prizes[rank - 1].perWinner, `${d.round}회 ${rank}등`);
    }
  }
});
