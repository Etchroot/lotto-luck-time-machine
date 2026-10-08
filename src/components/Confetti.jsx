// 결과 이펙트. 당첨이면 색종이 폭죽, 낙첨이면 회색 먹구름 비. 등수가 높을수록 양이 많다.
import { useEffect, useRef } from 'react';

const COLORS = ['#fbc400', '#69c8f2', '#ff7272', '#b0d840', '#ffffff', '#ff9ff3'];
const AMOUNT = { 1: 500, 2: 320, 3: 200, 4: 110, 5: 70 };

export default function Confetti({ trigger, bestRank }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    const c = canvas.getContext('2d');
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const lose = !bestRank;

    const parts = Array.from({ length: lose ? 160 : AMOUNT[bestRank] }, () =>
      lose
        ? { x: Math.random() * W, y: -Math.random() * H, vx: 0, vy: 6 + Math.random() * 6, w: 2, h: 14, color: '#8a94a6', rot: 0, vr: 0 }
        : {
            x: W / 2, y: H * 0.45,
            vx: (Math.random() - 0.5) * 26, vy: -Math.random() * 22 - 6,
            w: 6 + Math.random() * 6, h: 10 + Math.random() * 8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
          },
    );

    let frame;
    const step = () => {
      c.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        if (!lose) { p.vy += 0.45; p.vx *= 0.99; }
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y < H + 20) alive++;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      }
      if (alive) frame = requestAnimationFrame(step);
      else c.clearRect(0, 0, W, H);
    };
    step();
    return () => { cancelAnimationFrame(frame); c.clearRect(0, 0, W, H); };
  }, [trigger, bestRank]);

  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}
