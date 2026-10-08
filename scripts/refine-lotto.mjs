// 원본(data/raw/lotto-dhlottery.json)을 서비스용 데이터(data/lotto.json)로 정제한다.
// 원칙: 값을 계산해서 만들어내지 않는다. 원본에 없거나 의미를 확인하지 못한 값은 null로 둔다.
// 정제 후 원본과 다시 대조해, 하나라도 다르면 파일을 쓰지 않고 실패한다.
// 사용법: node scripts/refine-lotto.mjs
import { readFile, writeFile } from 'node:fs/promises';

// 등수 총액이 원본에 빠짐없이 기록되기 시작한 회차(2008-07-19). 그 이전은 총액이 없어 서비스에서 쓰지 않는다.
// (289회는 총액이 있지만 290~293회가 비어 있어, 연속 구간의 시작인 294회로 정했다.)
const FIRST_ROUND = 294;

// 원본의 등수 총액이 1인당 금액과 맞지 않지만, 외부 출처로 1인당 금액이 맞다고 확인한 경우.
// 이 경우 1인당 금액은 유지하고 총액만 비운다. 근거는 docs/DATA_VERIFICATION.md에 기록한다.
const VERIFIED_TOTAL_MISMATCH = {
  381: [1, 2], // 2010-03-20. 이투데이·경인일보 보도의 1인당 금액이 원본 1인당 금액과 일치
};

// 1등 당첨자가 0명인 회차의 원본 1등 합계금액은 이월금이다. 회차별로 언론 보도와 대조했다.
const VERIFIED_CARRYOVER = [295, 463];

const raw = JSON.parse(await readFile('data/raw/lotto-dhlottery.json', 'utf8'));
const rows = raw.rows.filter(r => r.ltEpsd >= FIRST_ROUND);
const errors = [];
const ymd = s => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

const draws = rows.map(r => {
  const prizes = [1, 2, 3, 4, 5].map(rank => {
    const winners = r[`rnk${rank}WnNope`];
    const perWinner = r[`rnk${rank}WnAmt`];
    const total = r[`rnk${rank}SumWnAmt`];
    // 1인당 금액은 등수 총액을 인원으로 나눈 값(시기에 따라 버림 또는 반올림)이어야 한다.
    const known = VERIFIED_TOTAL_MISMATCH[r.ltEpsd]?.includes(rank);
    if (!known && winners > 0 && Math.abs(total - winners * perWinner) >= winners) {
      errors.push(`${r.ltEpsd}회 ${rank}등: ${winners}명 × ${perWinner} ≠ 총액 ${total}`);
    }
    if (rank > 1 && winners === 0) errors.push(`${r.ltEpsd}회 ${rank}등: 당첨자 0명 (처리 규칙 없음)`);
    return {
      rank,
      winners,
      perWinner: winners > 0 ? perWinner : null, // 당첨자가 없으면 1인당 금액은 존재하지 않음
      total: winners > 0 && !known ? total : null,
    };
  });

  let carryover = null;
  if (r.rnk1WnNope === 0) {
    if (VERIFIED_CARRYOVER.includes(r.ltEpsd)) carryover = r.rnk1SumWnAmt;
    else errors.push(`${r.ltEpsd}회: 1등 0명이지만 이월금이 검증되지 않음`);
  }

  return {
    round: r.ltEpsd,
    date: ymd(r.ltRflYmd),
    numbers: [1, 2, 3, 4, 5, 6].map(i => r[`tm${i}WnNo`]),
    bonus: r.bnsWnNo,
    prizes,
    carryover, // 1등 당첨자가 없어 다음 회차로 넘어간 1등 당첨금. 1등이 있으면 null
    // 1등 자동/수동/반자동 인원. 1등이 0명이면 null
    firstPrizeByMethod: r.rnk1WnNope > 0
      ? { auto: r.winType1, manual: r.winType2, semiAuto: r.winType3 }
      : null,
  };
});

// 정제 결과를 원본과 다시 대조한다.
draws.forEach((d, i) => {
  const r = rows[i];
  const same =
    d.round === r.ltEpsd &&
    d.round === FIRST_ROUND + i &&
    d.date.replaceAll('-', '') === r.ltRflYmd &&
    d.numbers.every((n, k) => n === r[`tm${k + 1}WnNo`]) &&
    d.bonus === r.bnsWnNo &&
    d.prizes.every(p => p.winners === r[`rnk${p.rank}WnNope`] && (p.perWinner === null || p.perWinner === r[`rnk${p.rank}WnAmt`]));
  if (!same) errors.push(`${d.round}회: 정제 결과가 원본과 다름`);
  if (new Date(d.date + 'T00:00:00Z').getUTCDay() !== 6) errors.push(`${d.round}회: ${d.date}이 토요일이 아님`);
  const m = d.firstPrizeByMethod;
  if (m && m.auto + m.manual + m.semiAuto !== d.prizes[0].winners) errors.push(`${d.round}회: 1등 구매방식 합계 불일치`);
});

if (errors.length) {
  console.log(`실패 ${errors.length}건. 파일을 쓰지 않았습니다.`);
  errors.slice(0, 30).forEach(e => console.log(' - ' + e));
  process.exit(1);
}

await writeFile('data/lotto.json', JSON.stringify({
  source: '동행복권 공식 사이트 (www.dhlottery.co.kr)',
  collectedAt: raw.collectedAt,
  firstRound: FIRST_ROUND,
  latestRound: draws.at(-1).round,
  draws,
}));

console.log(`정제 완료: ${draws.length}개 회차 (${draws[0].round}회 ${draws[0].date} ~ ${draws.at(-1).round}회 ${draws.at(-1).date}), 원본 대조 실패 0건`);
console.log(`- 1등 0명(이월금 기록): ${draws.filter(d => d.carryover !== null).map(d => d.round + '회').join(', ')}`);
console.log(`- 등수 총액 비움: ${draws.flatMap(d => d.prizes.filter(p => p.total === null).map(p => `${d.round}회 ${p.rank}등`)).join(', ')}`);
