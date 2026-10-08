// 번호 6칸. 동그라미를 누르면 번호판이 열린다.
import Ball from './Ball.jsx';

export default function NumberSlots({ numbers, onSlotClick, disabled }) {
  return (
    <div className="slots">
      {numbers.map((n, i) => (
        <button
          key={i}
          type="button"
          className="slot"
          onClick={() => onSlotClick(i)}
          disabled={disabled}
          aria-label={n ? `${i + 1}번째 번호 ${n}, 눌러서 바꾸기` : `${i + 1}번째 번호 고르기`}
        >
          {n ? <Ball n={n} size="lg" /> : <span className="ball ball-lg empty">+</span>}
        </button>
      ))}
    </div>
  );
}
