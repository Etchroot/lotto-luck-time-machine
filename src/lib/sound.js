// 효과음. 외부 음원 파일 없이 Web Audio API로 직접 합성한다(무료, 저작권 문제 없음).
// 브라우저 정책상 소리는 사용자가 버튼을 누른 뒤에만 재생할 수 있어, 클릭 시점에 처음 생성한다.
let ctx = null;
let muted = false;

export const setMuted = value => { muted = value; };

function audio() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, duration, { type = 'square', volume = 0.12, slideTo } = {}) {
  if (muted) return;
  const c = audio();
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t + duration);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

/** 뽑기 기계가 도는 동안 공이 부딪히는 소리. 점점 빨라진다. */
export function playRolling(seconds) {
  let t = 0;
  for (let gap = 0.16; t < seconds; gap = Math.max(0.045, gap * 0.94)) {
    tone(700 + Math.random() * 600, t, 0.05, { type: 'triangle', volume: 0.06 });
    t += gap;
  }
}

/** 번호 하나를 고를 때 나는 짧은 소리 */
export function playPick() {
  tone(520, 0, 0.1, { type: 'sine', slideTo: 900, volume: 0.15 });
}

/** 결과 발표 소리. 등수가 높을수록 길고 화려하다. 낙첨이면 슬픈 트롬본. */
export function playResult(bestRank) {
  if (!bestRank) {
    [392, 370, 349].forEach((f, i) => tone(f, i * 0.42, 0.4, { type: 'sawtooth', volume: 0.09 }));
    tone(330, 1.26, 1.1, { type: 'sawtooth', volume: 0.09, slideTo: 300 });
    return;
  }
  const C = [523, 659, 784, 1047]; // 도 미 솔 도
  const repeats = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 1 }[bestRank];
  let t = 0;
  for (let r = 0; r < repeats; r++) {
    C.forEach((f, i) => tone(f * (1 + r * 0.125), t + i * 0.09, 0.18, { volume: 0.1 }));
    t += 0.4;
  }
  tone(1047 * (1 + (repeats - 1) * 0.125), t, bestRank <= 2 ? 1.4 : 0.6, { volume: 0.12 });
  if (bestRank === 1) {
    for (let i = 0; i < 24; i++) tone(1500 + Math.random() * 1500, t + i * 0.06, 0.08, { type: 'sine', volume: 0.05 });
  }
}
