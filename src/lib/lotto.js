// 검증·정제된 로또 데이터(data/lotto.json)를 앱에 연결한다. 빌드 시 번들에 포함되어 외부 요청 없이 동작한다.
import lotto from '../../data/lotto.json';

export const { draws, firstRound, latestRound, source, collectedAt } = lotto;

/** 회차 번호로 회차 데이터를 찾는다. 사용 범위 밖이면 undefined. */
export const getDraw = round => draws[round - firstRound];
