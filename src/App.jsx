// 로또 운 타임머신: 번호 6개를 고르면 294회부터 매주 그 번호로 1장씩 샀을 때의 결과를 보여준다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { draws, firstRound, latestRound } from './lib/lotto.js';
import { analyze } from './lib/analyze.js';
import { playPick, playResult, playRolling, setMuted } from './lib/sound.js';
import NumberSlots from './components/NumberSlots.jsx';
import NumberPicker from './components/NumberPicker.jsx';
import GachaMachine from './components/GachaMachine.jsx';
import Confetti from './components/Confetti.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import RoundList from './components/RoundList.jsx';
import Lines from './components/Lines.jsx';

const DRAW_MS = 2600; // 뽑기 기계가 도는 시간

export default function App() {
  const [numbers, setNumbers] = useState(Array(6).fill(null));
  const [editing, setEditing] = useState(null); // 번호판이 열린 칸의 위치
  const [phase, setPhase] = useState('pick'); // pick → drawing → result
  const [result, setResult] = useState(null);
  const [fxKey, setFxKey] = useState(0);
  const [muted, setMutedState] = useState(false);
  const timer = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setMuted(muted), [muted]);

  const ready = numbers.every(Boolean);
  const chosen = numbers.filter(Boolean);

  const updateNumbers = next => {
    setNumbers(next);
    if (phase === 'result') { setPhase('pick'); setResult(null); } // 번호를 바꾸면 이전 결과는 지운다
  };

  const pickNumber = n => {
    playPick();
    updateNumbers(numbers.map((v, i) => (i === editing ? n : v)));
    // 다음 빈칸으로 자동 이동, 다 찼으면 닫기
    const nextEmpty = numbers.findIndex((v, i) => i !== editing && !v);
    setEditing(nextEmpty === -1 ? null : nextEmpty);
  };

  const randomFill = () => {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    playPick();
    updateNumbers(pool.slice(0, 6).sort((a, b) => a - b));
  };

  const check = () => {
    if (!ready || phase === 'drawing') return;
    const r = analyze(chosen, draws);
    setPhase('drawing');
    playRolling(DRAW_MS / 1000);
    timer.current = setTimeout(() => {
      setResult(r);
      setPhase('result');
      setFxKey(k => k + 1);
      playResult(r.bestRank);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
    }, DRAW_MS);
  };

  const closePicker = useCallback(() => setEditing(null), []);
  const shake = phase === 'result' && result ? (result.bestRank ? `shake-${result.bestRank}` : 'shake-lose') : '';

  return (
    <>
    <div className={`app ${shake}`}>
      <header className="top">
        <h1>로또 운 타임머신</h1>
        <p><Lines text="그때 그 번호로 매주 샀다면, 나는 얼마를 벌었을까?" /></p>
        <button type="button" className="mute-btn" onClick={() => setMutedState(m => !m)} aria-pressed={muted}>
          {muted ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}
        </button>
      </header>

      <GachaMachine phase={phase} ready={ready} firstRound={firstRound} latestRound={latestRound} bestRank={result?.bestRank} />

      <section className="picker-area">
        <NumberSlots numbers={numbers} onSlotClick={setEditing} disabled={phase === 'drawing'} />
        <div className="actions">
          <button type="button" className="text-btn" onClick={randomFill} disabled={phase === 'drawing'}>🎲 아무거나 골라줘</button>
          <button type="button" className="text-btn" onClick={() => updateNumbers(Array(6).fill(null))} disabled={phase === 'drawing' || !chosen.length}>초기화</button>
        </div>
        <button type="button" className="check-btn" onClick={check} disabled={!ready || phase === 'drawing'}>
          {phase === 'drawing' ? '두구두구두구…' : ready ? '나의 운 확인하기' : `번호 ${6 - chosen.length}개 더 골라주세요`}
        </button>
      </section>

      {phase === 'result' && result && (
        <div ref={resultRef} className="result-area">
          <ResultSummary result={result} />
          <RoundList wins={result.wins} myNumbers={chosen} />
        </div>
      )}

      <footer className="foot">
        <p>
          <Lines
            text={`${firstRound}회(${draws[0].date})부터 ${latestRound}회(${draws.at(-1).date})까지 매주 1장씩 샀다고 가정한 재미용 계산입니다. 당첨금은 실제 당첨자에 나를 한 명 더해 다시 나눈 세전 금액입니다.`}
          />
        </p>
        <p><Lines text="데이터 출처: 동행복권 공식 사이트. 미래의 당첨을 예측하지 않습니다." /></p>
      </footer>
    </div>

      {editing !== null && (
        <NumberPicker
          slot={editing}
          current={numbers[editing]}
          taken={chosen}
          onPick={pickNumber}
          onClear={() => { updateNumbers(numbers.map((v, i) => (i === editing ? null : v))); setEditing(null); }}
          onClose={closePicker}
        />
      )}
      <Confetti trigger={fxKey} bestRank={result?.bestRank} />
    </>
  );
}
