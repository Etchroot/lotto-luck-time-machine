// 회차별 당첨 기록. 최신 회차부터 보여주고, 많으면 "더 보기"로 나눠 보여준다.
import { useState } from 'react';
import Ball from './Ball.jsx';
import { EMPTY_LIST } from '../content/copy.js';
import Lines from './Lines.jsx';

const PAGE = 20;
const won = n => n.toLocaleString('ko-KR');

function basisNote({ draw, rank, basis }) {
  if (basis === 'carryover') return '1등이 없던 회차! 이월금을 혼자 독차지';
  if (basis === 'fixed') return '고정 금액';
  const others = draw.prizes[rank - 1].winners;
  return `실제 당첨자 ${won(others)}명 + 나 = ${won(others + 1)}명이 나눔`;
}

export default function RoundList({ wins, myNumbers }) {
  const [shown, setShown] = useState(PAGE);

  if (!wins.length) return <p className="empty"><Lines text={EMPTY_LIST} /></p>;

  return (
    <section className="rounds">
      <h2>회차별 기록 <small>당첨 {wins.length}회</small></h2>
      <ol>
        {wins.slice(0, shown).map(w => (
          <li key={w.draw.round} className={`round rank-${w.rank}`}>
            <div className="round-head">
              <span className="round-no">{w.draw.round}회</span>
              <span className="round-date">{w.draw.date}</span>
              <span className="rank-badge">{w.rank}등</span>
            </div>
            <div className="round-balls">
              {w.draw.numbers.map(n => <Ball key={n} n={n} size="sm" dim={!myNumbers.includes(n)} />)}
              <span className="plus-sign">+</span>
              <Ball n={w.draw.bonus} size="sm" bonus dim={!(w.rank === 2 && myNumbers.includes(w.draw.bonus))} />
            </div>
            <div className="round-prize">
              <b>{won(w.amount)}원</b>
              <span>{basisNote(w)}</span>
            </div>
          </li>
        ))}
      </ol>
      {shown < wins.length && (
        <button type="button" className="more-btn" onClick={() => setShown(s => s + PAGE)}>
          더 보기 ({wins.length - shown}회 남음)
        </button>
      )}
    </section>
  );
}
