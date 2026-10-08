// 로또 공 하나. 실제 로또 공처럼 번호 구간별 색을 쓴다.
const rangeOf = n => (n <= 10 ? 'r1' : n <= 20 ? 'r2' : n <= 30 ? 'r3' : n <= 40 ? 'r4' : 'r5');

export default function Ball({ n, size = 'md', dim = false, bonus = false }) {
  const cls = ['ball', `ball-${size}`, n ? rangeOf(n) : 'empty', dim && 'dim', bonus && 'bonus'];
  return <span className={cls.filter(Boolean).join(' ')}>{n ?? ''}</span>;
}
