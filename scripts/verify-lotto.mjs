// 수집한 원본 데이터의 내부 정합성을 검사한다. 하나라도 실패하면 목록을 출력하고 종료 코드 1로 끝난다.
// 사용법: node scripts/verify-lotto.mjs
import { readFile } from 'node:fs/promises';

const { rows } = JSON.parse(await readFile('data/raw/lotto-dhlottery.json', 'utf8'));
const errors = [];
const DAY = 864e5;
const toDate = ymd => new Date(`${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00Z`);
const first = toDate(rows[0].ltRflYmd);

rows.forEach((r, i) => {
  const nums = [1, 2, 3, 4, 5, 6].map(k => r[`tm${k}WnNo`]);
  const all = [...nums, r.bnsWnNo];
  const tag = `${r.ltEpsd}회`;

  if (r.ltEpsd !== i + 1) errors.push(`${tag}: 회차 번호가 연속되지 않음 (위치 ${i + 1})`);
  if (!all.every(n => Number.isInteger(n) && n >= 1 && n <= 45)) errors.push(`${tag}: 1~45 범위 밖 번호 ${all}`);
  if (new Set(all).size !== 7) errors.push(`${tag}: 번호 중복 ${all}`);
  if (nums.some((n, k) => k > 0 && n <= nums[k - 1])) errors.push(`${tag}: 당첨번호가 오름차순이 아님 ${nums}`);

  const d = toDate(r.ltRflYmd);
  if (d.getUTCDay() !== 6) errors.push(`${tag}: 추첨일 ${r.ltRflYmd}이 토요일이 아님`);
  if ((d - first) / DAY !== i * 7) errors.push(`${tag}: 1회차로부터 ${i}주 뒤가 아님 (${r.ltRflYmd})`);

  if (r.rnk5WnAmt !== 5000 && r.rnk5WnAmt !== 10000) errors.push(`${tag}: 5등 금액 ${r.rnk5WnAmt}`);
  if (r.rnk1WnNope === 0 && r.rnk1WnAmt !== 0) errors.push(`${tag}: 1등 0명인데 금액 ${r.rnk1WnAmt}`);
});

console.log(`검사 회차: ${rows.length} (${rows[0].ltRflYmd} ~ ${rows.at(-1).ltRflYmd})`);
console.log(`1등 당첨자 없음(이월) 회차: ${rows.filter(r => r.rnk1WnNope === 0).map(r => r.ltEpsd).join(', ')}`);
const fifth = rows.findIndex(r => r.rnk5WnAmt === 5000);
console.log(`5등 금액이 5,000원으로 바뀐 첫 회차: ${rows[fifth].ltEpsd}회 (${rows[fifth].ltRflYmd})`);

if (errors.length) {
  console.log(`\n실패 ${errors.length}건`);
  errors.forEach(e => console.log(' - ' + e));
  process.exit(1);
}
console.log('\n모든 정합성 검사 통과');
