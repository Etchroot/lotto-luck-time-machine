// 동행복권 공식 사이트(www.dhlottery.co.kr)의 로또 6/45 회차 결과를 수집해 원본 그대로 저장한다.
// 정제는 하지 않는다. 사실관계 검증을 위해 응답 원문을 보존하는 것이 목적이다.
// 사용법: node scripts/collect-lotto.mjs [최신회차]
import { writeFile, mkdir } from 'node:fs/promises';

const BASE = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do';
const HEADERS = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.dhlottery.co.kr/lt645/result' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchAround(epsd) {
  const res = await fetch(`${BASE}?srchDir=center&srchLtEpsd=${epsd}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} (회차 ${epsd})`);
  return (await res.json()).data?.list ?? [];
}

const latest = Number(process.argv[2] ?? 1244);
const byEpsd = new Map();

// 한 번 요청하면 기준 회차 주변 약 10개 회차가 온다. 빠진 회차가 생길 때까지 반복한다.
for (let e = 1; e <= latest; e++) {
  if (byEpsd.has(e)) continue;
  for (const row of await fetchAround(e)) byEpsd.set(row.ltEpsd, row);
  if (!byEpsd.has(e)) throw new Error(`회차 ${e}가 응답에 없음`);
  await sleep(300); // 서버 부담을 줄이기 위한 간격
}

const rows = [...byEpsd.values()].filter(r => r.ltEpsd <= latest).sort((a, b) => a.ltEpsd - b.ltEpsd);
await mkdir('data/raw', { recursive: true });
await writeFile('data/raw/lotto-dhlottery.json', JSON.stringify({
  source: BASE,
  collectedAt: new Date().toISOString(),
  count: rows.length,
  rows,
}, null, 2));
console.log(`수집 완료: ${rows.length}개 회차 (1 ~ ${rows.at(-1).ltEpsd})`);
