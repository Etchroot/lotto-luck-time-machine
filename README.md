# 🎰 로또 운 타임머신

> 그때 그 번호로 매주 샀다면, 나는 얼마를 벌었을까?

번호 6개를 고르면 **2008년 7월(294회)부터 2026년 10월(1244회)까지 매주 그 번호로 로또를 1장씩 샀다고 가정**하고, 몇 번 당첨됐고 얼마를 받았을지 보여주는 재미용 웹 서비스입니다.
미래를 예측하지 않고, 실제 과거 기록만으로 "그때 이랬다면"을 보여줍니다.

**👉 바로 써보기: https://etchroot.github.io/lotto-luck-time-machine/**

## 특징

- **실제 당첨 기록만 사용합니다.** 동행복권 공식 사이트에서 수집하고, 언론 보도와 대조해 검증했습니다.
- **당첨금을 다시 계산합니다.** 내가 당첨됐다면 당첨자가 한 명 늘어나므로, 실제 당첨금을 (기존 당첨자 + 나)로 나눠 계산합니다.
- **뽑기 기계 연출**: 등수에 따라 폭죽, 화면 흔들림, 팡파르가 달라집니다.
- 서버 없이 브라우저에서만 동작합니다.

## AI 네이티브 커리어 캠프 제출 문서

| 문서 | 내용 |
|---|---|
| [Human-in-the-Loop 기록](docs/HUMAN_IN_THE_LOOP.md) | AI의 제안과 결과에 사람이 언제, 왜 개입했는지 |
| [AI 활용 목적 기록](docs/AI_USAGE_LOG.md) | 단계별로 AI에게 맡긴 역할과 그 이유, 맡기지 않은 것 |
| [UI 컴포넌트 구성](docs/UI_COMPONENTS.md) | 화면 흐름, 컴포넌트 구조와 역할 |
| [데이터 수집·검증 보고서](docs/DATA_VERIFICATION.md) | 데이터 출처, 검증 과정, 가상 당첨금 계산 규칙 |

## 직접 실행하기

```bash
npm install
npm run dev        # 개발 서버
npm test           # 계산 로직 테스트
npm run build      # 배포용 빌드
```

데이터 갱신: `npm run data:collect` → `npm run data:verify` → `npm run data:refine`

기술: React 19 · Vite · Web Audio API
