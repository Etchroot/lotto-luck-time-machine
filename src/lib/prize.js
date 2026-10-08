// "내가 그 회차에 이 번호로 1장 샀다면" 받았을 등수와 가상 당첨금을 계산한다.
// 가정: 로또 1장, 회차별 독립 계산(내 당첨이 다음 회차 이월에 주는 영향은 무시), 세전 금액.
// 데이터는 data/lotto.json의 draw 하나를 받는다. 근거는 docs/DATA_VERIFICATION.md 참고.

// 4등이 5만 원 고정 금액으로 바뀐 회차(2010-08-07). 그 전에는 4등도 총액을 나눠 가졌다.
const FIXED_4TH_FROM = 401;

/** 내 번호 6개로 해당 회차의 등수를 구한다. 낙첨이면 null. */
export function rankOf(myNumbers, draw) {
  const hits = myNumbers.filter(n => draw.numbers.includes(n)).length;
  if (hits === 6) return 1;
  if (hits === 5) return myNumbers.includes(draw.bonus) ? 2 : 3;
  if (hits === 4) return 4;
  if (hits === 3) return 5;
  return null;
}

/**
 * 내가 당첨자 한 명으로 더해졌을 때의 가상 당첨금.
 * 반환: { amount, basis } · basis는 계산 근거
 *   'carryover' 1등 당첨자가 없던 회차라 이월금을 혼자 받음
 *   'split'     등수 총액을 (기존 당첨자 + 나)로 나눔
 *   'fixed'     고정 금액이라 인원과 무관
 */
export function hypotheticalPrize(draw, rank) {
  const p = draw.prizes[rank - 1];

  if (rank === 5 || (rank === 4 && draw.round >= FIXED_4TH_FROM)) {
    return { amount: p.perWinner, basis: 'fixed' };
  }
  if (rank === 1 && p.winners === 0) {
    return { amount: draw.carryover, basis: 'carryover' };
  }
  // 총액이 비어 있는 경우(381회 1·2등)는 외부 보도로 확인한 1인당 금액에서 총액을 되살린다.
  const pool = p.total ?? p.winners * p.perWinner;
  return { amount: Math.floor(pool / (p.winners + 1)), basis: 'split' };
}
