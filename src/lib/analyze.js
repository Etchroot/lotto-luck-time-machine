// 내 번호 6개로 전 회차를 매주 1장씩 샀다고 가정하고 결과를 집계한다.
import { rankOf, hypotheticalPrize } from './prize.js';

export const TICKET_PRICE = 1000;

export function analyze(myNumbers, draws) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const wins = [];
  let totalPrize = 0;

  for (const draw of draws) {
    const rank = rankOf(myNumbers, draw);
    if (!rank) continue;
    const { amount, basis } = hypotheticalPrize(draw, rank);
    wins.push({ draw, rank, amount, basis });
    counts[rank]++;
    totalPrize += amount;
  }

  const spent = draws.length * TICKET_PRICE;
  return {
    played: draws.length,
    wins: wins.reverse(), // 최신 회차가 위로
    counts,
    totalPrize,
    spent,
    net: totalPrize - spent,
    bestRank: wins.length ? Math.min(...wins.map(w => w.rank)) : null,
  };
}
