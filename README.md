# 마이커넥트 목업

'26 下 신입사원 온보딩 · 4팀 인터랙티브 목업. 삼성화재가 운영하는 외국인 근로자 커뮤니티 앱 "마이커넥트"의 사용자 화면.

## 아키텍처 (2026-10-07 리팩토링)

**이전**: 단일 3.2MB HTML (이미지 base64 임베드, CSS·JS 인라인)
**현재**: HTML 110KB + CSS 32KB + JS 15KB + data/ 외부 참조 → **유지보수 가능**

| 파일 | 역할 |
|---|---|
| `index.html` | 마크업·구조. 10개 `<section class="screen">` + 하단 `<nav class="tabbar">`. 이미지는 `data/*.png` 외부 참조 |
| `styles.css` | 디자인 토큰(:root CSS vars) + 글래스 톤 + 레이아웃. 3개 `/* block boundary */` 로 나뉨 — 상단 리셋 / 메인 디자인 시스템 / 브랜드 리프레시 오버라이드 |
| `app.js` | 데이터 사전(GROUPS, SEMINARS) + 핸들러(show, renderGroup, renderSeminar, syncMissions, setLang, applyProfile, applyPoints 등). 모든 상태는 `localStorage.mc_*` 로 지속화 |
| `data/` | PNG 아이콘·사진. **`-sm.png` 접미사**만 배포 대상 (리사이즈본). 원본(1MB)은 로컬 전용 |
| `netlify.toml` / `vercel.json` | 배포 설정. **물리적 제외** 원칙 (mockup/legacy/백업 HTML은 dist/에 복사 안 됨) |

## 핵심 데이터 모델

```js
// app.js 안
GROUPS = { guitar, house, topik, food, photo, bike }  // 6개 소모임
SEMINARS = { tax, rent, insurance, basic }            // 4개 세미나
TABS = ["s-home","s-seminar","s-groups","s-info","s-me"]
TAB_FALLBACK = { s-group→s-groups, s-consult→s-seminar, ... }

// localStorage keys
mc_lang      // 'ko' | 'vi'
mc_profile   // { name, nat, bday }
mc_joined    // ["guitar", "house"] — 가입된 소모임 키 배열
mc_points    // 누적 포인트 (상담 신청 +10000, 세미나 +500, 모임 가입 +300)
```

## 화면 라우팅

클릭 핸들러 체인 (`app.js` 안 `document.addEventListener('click', ...)`):
1. `[data-todo]` → 토스트 (목업에서 미동작 안내)
2. `[data-group]` → `renderGroup()` + `show('s-group')`
3. `[data-seminar]` → `renderSeminar()` + `show('s-seminar-detail')`
4. `[data-go]` → `show(dataset.go)`
5. `[data-tab]` → `show(dataset.tab)`
6. `.pick` → aria-pressed 토글 (멀티선택은 `data-pick-multi` 분기)
7. `.mission` → `data-done` 토글 + `syncMissions()`
8. `.day` → 주간 출석 체크 토글
9. `[data-lang-set]` → `setLang()`
10. `[data-step-go]` → wizard 단계 전환
11. `#consultCTA` / `#seminarApplyBtn` / `#joinBtn` → 각자 포인트 적립 로직

## i18n

- `data-ko="..."` / `data-vi="..."` 쌍이 있는 요소의 **textContent**를 `setLang()`이 교체
- 인라인 태그(`<b>`)가 포함된 경우 `data-ko-html="..."` / `data-vi-html="..."` 로 **innerHTML** 교체
- `document.documentElement.lang` 이 `ko`↔`vi` 토글, `localStorage.mc_lang`에 저장

## 로컬 개발

```bash
# 서버
python3 -m http.server 8765
# 브라우저
open http://localhost:8765/index.html
```

CSS/JS/HTML 수정 → 브라우저 하드 리프레시(Cmd+Shift+R).

## 배포

Vercel + GitHub 연동. `main`에 push하면 자동 재배포.

**배포되는 파일**: `index.html`, `styles.css`, `app.js`, `robots.txt`, `data/` 중 아래만:
- `header-logo.svg`
- `myconnect-logo-1-sm.png`
- `newlogo-*-sm.png`
- `legacy-*.png`
- `veitnam-man-v2-sm.png`

`myconnect_mockup.html`, `myconnect_soft_glass_ui.html`, `index.hand-tuned.html`,
`index.legacy.html`, `index_myconnect_unified.html`, 원본 1MB PNG들은 모두
배포물에 **아예 포함되지 않습니다** (리다이렉트가 아니라 cp 제외).

> 배포 후 `https://<site>.vercel.app/myconnect_mockup.html` 가 **404 반드시 확인**.

## 유지보수 가이드

### 소모임 추가
1. `app.js` 의 `GROUPS = { ... }` 에 새 키 추가 (name, nameVi, time, leader 등)
2. 그 모임 아이콘 PNG를 `data/newlogo-group-{key}-sm.png` 로 저장
3. HTML의 어딘가 모임 카드를 추가하고 `data-group="{key}"` 속성 부여

### 세미나 추가
1. `app.js` 의 `SEMINARS = { ... }` 에 새 키 추가
2. HTML의 세미나 리스트에 카드 추가하고 `data-seminar="{key}"` 속성

### 번역 추가
- 짧은 문자열: `<span data-ko="한국어" data-vi="Vietnamese">한국어</span>`
- 인라인 태그 포함: `<p data-ko-html="..." data-vi-html="...">`

### 화면 추가
1. HTML에 `<section class="screen" id="s-newscreen" hidden>...</section>` 추가
2. `app.js` 의 `TABS` 또는 `TAB_FALLBACK` 에 등록
3. (탭에 노출할 경우) `<nav class="tabbar">` 에 `<button class="tab" data-tab="s-newscreen">` 추가

### 포인트 로직 변경
- `app.js` 안 `#consultCTA` / `#seminarApplyBtn` / `#joinBtn` 핸들러의 `+300`/`+500`/`+10000` 숫자 수정
- `applyPoints()` 가 `base = 7500` 기준으로 누적 포인트 합산

## 알려진 제약

- 데모용이라 **새로고침 시 상태 유지 X** (localStorage는 저장되나 UI 초기 렌더에 반영 로직은 부분적)
- 베트남어 번역은 네이티브 리뷰 전 임시
- 각 모임 상세 (s-group)는 이름/리더만 데이터 주입, 설명·시간·장소는 하드코딩 (demo 수준)

## 목업 범위

사용자(멤버) 화면만. 모임 리더용 운영 화면, 삼성화재 담당자용 상담 처리 화면은 미포함.
