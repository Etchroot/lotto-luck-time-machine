// 결과 요약. 총 당첨 횟수와 총 당첨금을 가장 크게 보여준다.
import { useEffect, useMemo, useState } from 'react';
import { TITLES, NET_COMMENTS, pick } from '../content/copy.js';
import Lines from './Lines.jsx';

const won = n => n.toLocaleString('ko-KR');
const CHICKEN = 20000; // 치킨 한 마리 가격 가정

// 숫자가 0부터 목표값까지 빠르게 올라가는 연출
function useCountUp(target, ms = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame;
    const tick = now => {
      const p = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return v;
}

export default function ResultSummary({ result }) {
  const { wins, counts, totalPrize, spent, net, played, bestRank } = result;
  const title = useMemo(() => pick(TITLES[bestRank ?? 'none']), [result]);
  const comment = useMemo(() => pick(NET_COMMENTS[net >= 0 ? 'profit' : 'loss']), [result]);
  const shownPrize = useCountUp(totalPrize);
  const shownWins = useCountUp(wins.length, 900);

  return (
    <section className={`summary ${bestRank ? `rank-${bestRank}` : 'lose'}`}>
      <p className="summary-title"><Lines text={title} /></p>

      <div className="summary-big">
        <div>
          <span className="big-label">총 당첨</span>
          <span className="big-value">{shownWins}<small>번</small></span>
        </div>
        <div>
          <span className="big-label">받았을 돈</span>
          <span className="big-value money">{won(shownPrize)}<small>원</small></span>
        </div>
      </div>

      <ul className="rank-chips">
        {[1, 2, 3, 4, 5].map(r => (
          <li key={r} className={counts[r] ? 'on' : ''}>{r}등 <b>{counts[r]}</b></li>
        ))}
      </ul>

      <p className="summary-net">
        {played}주 동안 매주 1,000원 = <b>{won(spent)}원</b> 투자 →{' '}
        <b className={net >= 0 ? 'plus' : 'minus'}>{net >= 0 ? '+' : ''}{won(net)}원</b>
      </p>
      <p className="summary-comment">
        <Lines text={net < 0 ? `${comment}. (치킨 약 ${Math.floor(-net / CHICKEN)}마리)` : comment} />
      </p>
    </section>
  );
}
