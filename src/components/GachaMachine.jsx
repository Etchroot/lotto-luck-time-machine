// 화면 중앙의 뽑기 기계. 대기 중엔 공이 살랑거리고, 추첨 중엔 미친 듯이 돌고, 결과가 나오면 공 하나가 굴러 나온다.
import { useEffect, useState } from 'react';

const DECO_BALLS = [3, 14, 27, 38, 42, 9, 19, 33, 45, 6, 22, 40];
// 돔 아래쪽에 공이 쌓여 있는 모양이 되도록 미리 정한 위치(px, 돔 220px 기준)
const POSITIONS = [[30, 150], [62, 168], [96, 172], [130, 168], [162, 150], [46, 120], [80, 136], [114, 140], [148, 122], [64, 96], [100, 106], [132, 92]];
const rangeOf = n => (n <= 10 ? 'r1' : n <= 20 ? 'r2' : n <= 30 ? 'r3' : n <= 40 ? 'r4' : 'r5');

export default function GachaMachine({ phase, ready, firstRound, latestRound, bestRank }) {
  const [rolling, setRolling] = useState(firstRound);

  // 추첨 중에는 회차 번호가 빠르게 넘어가며 "전 회차를 훑는 중"임을 보여준다.
  useEffect(() => {
    if (phase !== 'drawing') return;
    const start = performance.now();
    const id = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 2400);
      setRolling(Math.round(firstRound + (latestRound - firstRound) * p));
    }, 40);
    return () => clearInterval(id);
  }, [phase, firstRound, latestRound]);

  const label =
    phase === 'drawing' ? `${rolling}회 추첨 중…` :
    phase === 'result' ? (bestRank ? `최고 ${bestRank}등!` : '꽝…') :
    ready ? '준비 완료! 돌려볼까요?' : '번호 6개를 골라주세요';

  return (
    <div className={`machine ${phase}`} aria-live="polite">
      <div className="dome">
        {DECO_BALLS.map((n, i) => (
          <span key={i} className={`dome-ball ${rangeOf(n)}`} style={{ '--i': i, left: POSITIONS[i][0], top: POSITIONS[i][1] }} />
        ))}
      </div>
      <div className="machine-body">
        <span className="machine-label">{label}</span>
        <div className="chute" />
      </div>
      {phase === 'result' && (
        <div className={`prize-ball ${bestRank ? `rank-${bestRank}` : 'lose'}`}>{bestRank ? `${bestRank}등` : '꽝'}</div>
      )}
    </div>
  );
}
