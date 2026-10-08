// 1~45 번호판. 다른 칸에서 이미 고른 번호는 고를 수 없다.
import { useEffect } from 'react';
import Ball from './Ball.jsx';

const ALL = Array.from({ length: 45 }, (_, i) => i + 1);

export default function NumberPicker({ slot, current, taken, onPick, onClear, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="picker-backdrop" onClick={onClose}>
      <div className="picker" role="dialog" aria-label={`${slot + 1}번째 번호 고르기`} onClick={e => e.stopPropagation()}>
        <div className="picker-head">
          <strong>{slot + 1}번째 번호</strong>
          <button type="button" className="text-btn" onClick={onClose}>닫기</button>
        </div>
        <div className="picker-grid">
          {ALL.map(n => {
            const used = taken.includes(n) && n !== current;
            return (
              <button key={n} type="button" className="picker-cell" disabled={used} onClick={() => onPick(n)} aria-pressed={n === current}>
                <Ball n={n} size="md" dim={used} />
              </button>
            );
          })}
        </div>
        {current && <button type="button" className="text-btn" onClick={onClear}>이 칸 비우기</button>}
      </div>
    </div>
  );
}
