# 배포 가이드

마이커넥트 목업(`index.html`)을 팀에 링크로 공유하기 위한 배포 절차입니다.
**Netlify 무료 플랜 + GitHub 연동**을 사용하며, `main`에 push하면 자동으로 재배포됩니다.

> **한 줄 요약** — Netlify에 GitHub 계정으로 로그인 → 이 리포지터리 선택 → Deploy.
> 빌드 설정은 건드리지 않습니다 (`netlify.toml`을 자동으로 읽습니다).

---

## 0. 먼저 — 배포가 꼭 필요한가?

목적에 따라 배포 없이 끝나는 경우가 많습니다.

| 목적 | 필요한 것 |
|---|---|
| 내 PC에서 보기 | **배포 불필요.** `index.html` 더블클릭 → `file://`로 그대로 동작 |
| 같은 사무실에서 내 폰으로 보기 | **배포 불필요.** 아래 [부록 A](#부록-a-로컬-서버로-모바일-확인) 로컬 서버 (5분) |
| 팀·멘토에게 링크 뿌리기 | **배포 필요** → 이 문서 본문 |
| 발표 현장 시연 | 배포 권장 (네트워크 장애 대비로 로컬 파일도 함께 챙길 것) |

두 HTML 파일 모두 CSS·JS가 전부 인라인이고 외부 의존성이 Pretendard 폰트(jsdelivr) 하나뿐이라,
인터넷만 연결돼 있으면 로컬에서도 완전히 동일하게 동작합니다.

---

## 1. 배포 범위 — `index.html`만 올라갑니다

이 설정에서 **가장 중요한 부분**입니다.

`netlify.toml`의 빌드 명령이 `index.html`과 `robots.txt`만 `dist/`로 복사하고,
Netlify는 `dist/`만 게시합니다. 따라서 **`myconnect_mockup.html`은 배포물에 존재하지 않습니다.**
접근을 리다이렉트로 막는 것이 아니라 파일 자체가 서버에 올라가지 않습니다.

```toml
[build]
  command = "mkdir -p dist && cp index.html robots.txt dist/"
  publish = "dist"
```

### 왜 제외하는가

`myconnect_mockup.html`(발표/리뷰용 셸)에는 사내 기획 문서 성격의 내용이 들어 있습니다:

- 부가 목표 — RC 도입 · 보험 가입 전환 지표
- 보험업법 제83·97·99조, 개인정보보호법 제15조 리스크 분석
- 남은 결정 사항 — 호스트 활동비 단가·재원, 사내 데이터 반출 불가 시나리오

URL만 알면 누구나 열 수 있는 곳에 둘 성격이 아닙니다.
내부 리뷰가 필요하면 **파일을 직접 전달**하거나, 접근 제한이 가능한 곳
([부록 B](#부록-b-접근-제한이-필요해지면))에 별도로 올리세요.

---

## 2. 최초 1회 설정

### 사전 조건

- GitHub 계정 (이 리포지터리에 접근 권한이 있어야 함)
- `netlify.toml`, `robots.txt`가 `main`에 올라가 있을 것 — 이미 커밋되어 있습니다

### 절차

1. **https://app.netlify.com** 접속 → **Log in with GitHub**
2. 상단 **Add new site** → **Import an existing project**
3. **Deploy with GitHub** 선택
4. Netlify의 GitHub 접근 권한 승인
   - 리포지터리가 private이므로 권한 부여가 필요합니다
   - **All repositories** 대신 **Only select repositories → `onboarding-project`** 를
     고르면 이 리포지터리에만 권한이 갑니다 (권장)
5. 리포지터리 목록에서 **`onboarding-project`** 선택
6. 빌드 설정 화면 — **아무것도 바꾸지 말고** 그대로 **Deploy**
   - Branch to deploy: `main`
   - Build command / Publish directory 칸이 **비어 보여도 정상**입니다.
     `netlify.toml`에 있는 값이 우선 적용됩니다
7. 1~2분 후 배포 완료. `https://랜덤이름-어쩌고.netlify.app` 형태의 URL이 나옵니다
8. **Site configuration → General → Site details → Change site name**
   에서 알아보기 쉬운 이름으로 변경
   → 예: `myconnect-mockup` → `https://myconnect-mockup.netlify.app`

---

## 3. 배포 직후 검증 체크리스트

URL을 팀에 공유하기 **전에** 반드시 확인하세요.

| # | 확인 항목 | 기대 결과 |
|---|---|---|
| 1 | `https://<site>.netlify.app/` | 목업 앱 첫 화면(동의)이 정상 표시 |
| 2 | `https://<site>.netlify.app/myconnect_mockup.html` | **404 — 가장 중요** |
| 3 | `https://<site>.netlify.app/README.md` | 404 |
| 4 | `https://<site>.netlify.app/robots.txt` | `Disallow: /` 표시 |
| 5 | 본문 폰트 | Pretendard로 렌더링 (DevTools Network에서 `PretendardVariable.woff2` 200) |
| 6 | 화면 흐름 | 동의 → 목적 → 추천 → 상세 → 가입 → 홈 자동 이동 |
| 7 | 체크리스트 | 미션 6개 토글 시 진행률·포인트 카운트업 동작 |
| 8 | 탭바 | 하단 5개 탭 이동 정상 |

**2번이 404가 아니면 즉시 사이트를 비공개로 내리고** (`Site configuration → Danger zone`)
`netlify.toml`의 빌드 명령과 Deploy log를 확인하세요.

### 모바일 실기기 확인 (권장)

모바일 앱 목업이라 데스크톱 에뮬레이션만으로는 검증되지 않는 부분이 있습니다.
발급된 URL을 폰에서 열어 아래를 확인하세요.

- 하단 CTA 버튼이 스크롤 중에도 화면 하단에 고정되는지
- 탭바가 홈 인디케이터에 가리지 않는지 (safe-area 대응)
- 화면 전환 시 fade + slide 애니메이션
- iOS Safari에서 주소창 숨김/표시에 따라 레이아웃이 튀지 않는지 (`100dvh`)

---

## 4. 이후 운영

### 재배포

`main`에 push하면 끝입니다.

```bash
git add index.html
git commit -m "변경 내용"
git push origin main
```

Netlify가 push를 감지해 자동으로 다시 빌드·게시합니다 (보통 1분 내).
진행 상황은 Netlify 대시보드의 **Deploys** 탭에서 볼 수 있습니다.

### 배포 전 로컬에서 미리 확인

Netlify가 실행할 빌드 명령을 그대로 돌려 배포물을 미리 볼 수 있습니다.

```bash
rm -rf dist && mkdir -p dist && cp index.html robots.txt dist/
ls dist/            # index.html, robots.txt 둘만 있어야 정상
```

`dist/`는 `.gitignore`에 들어 있어 커밋되지 않습니다.

### 이전 버전으로 되돌리기

**Deploys** 탭 → 되돌릴 배포 클릭 → **Publish deploy**.
즉시 그 버전으로 롤백됩니다. git을 건드릴 필요 없습니다.

### 완전히 내리기

**Site configuration → Danger zone → Delete site.**
URL이 즉시 죽습니다. 리포지터리에 남는 것은 `netlify.toml`, `robots.txt` 두 파일뿐입니다.

---

## 5. 문제 해결

| 증상 | 원인 / 해결 |
|---|---|
| 빌드 실패 — `cp: cannot stat 'robots.txt'` | `robots.txt`가 `main`에 없음. push 여부 확인 |
| 루트가 "Page not found" | `netlify.toml`이 읽히지 않음. Deploy log 상단에 `Using netlify.toml` 문구가 있는지 확인. 없으면 파일이 리포지터리 **루트**에 있는지 확인 |
| `myconnect_mockup.html`이 열림 | 빌드 명령이 적용되지 않고 리포지터리 전체가 게시된 상태. Publish directory가 `dist`인지 확인 후 **즉시 사이트 내리기** |
| 폰트가 시스템 고딕으로 보임 | jsdelivr CDN이 차단된 환경(일부 사내망). 폴백이 동작한 것이라 기능 문제는 없으나 디자인 의도와 다름 |
| 수정했는데 옛날 화면이 보임 | 브라우저 캐시. `Ctrl+Shift+R` (Mac `Cmd+Shift+R`) 강력 새로고침 |
| 배포가 안 돌아감 | Netlify의 GitHub 권한이 만료/철회됨. Site configuration → Build & deploy → 연결 상태 확인 |

---

## 6. 알아둘 제약

- **URL을 아는 사람은 누구나 접근할 수 있습니다.** Netlify 무료 플랜에는 사이트 비밀번호
  기능이 없습니다 (Pro 플랜 월 $19). 검색 색인은 `robots.txt`와 `index.html`의
  `noindex` 메타로 막혀 있지만, URL이 유출되면 열람을 막을 방법이 없습니다.
- **Vercel은 쓰지 않습니다.** 무료 Hobby 플랜이 약관상 비상업적·개인 용도로 제한되어
  사내 프로젝트에 부적합합니다. Netlify 무료 플랜은 상업적 사용이 허용됩니다.
- **GitHub Pages도 쓰지 않습니다.** 무료 계정은 public 리포지터리에서만 Pages를 제공하는데,
  리포지터리를 공개하면 git history를 포함해 `myconnect_mockup.html` 내용이 영구 노출됩니다.
- Netlify 무료 플랜 한도는 빌드 300분/월, 대역폭 100GB/월입니다. 이 목업 규모에서는
  사실상 걸릴 일이 없습니다.

---

## 부록 A. 로컬 서버로 모바일 확인

배포 없이 같은 와이파이에 있는 폰에서 확인하는 방법입니다.

```bash
# 리포지터리 폴더에서
python -m http.server 8000
```

내 PC의 IP를 확인하고 (Windows: `ipconfig` → IPv4 주소, macOS: `ipconfig getifaddr en0`),
폰 브라우저에서 `http://192.168.x.x:8000/` 로 접속합니다.

> 이 방법은 **폴더 전체를 공유**하므로 `myconnect_mockup.html`도 함께 열립니다.
> 같은 사무실 내부망이라 실무상 문제는 없지만, 인지하고 쓰세요.
> 신경 쓰인다면 `index.html`만 빈 폴더에 복사한 뒤 그 폴더에서 서버를 띄우면 됩니다.

## 부록 B. 접근 제한이 필요해지면

"URL 아는 사람만"으로 부족하고 **지정한 사람만** 열 수 있어야 한다면
(예: `myconnect_mockup.html`까지 공유해야 하는 경우) **Cloudflare Pages + Cloudflare Access**
조합이 무료로 이를 제공합니다.

- 허용할 이메일 주소를 등록하면 접속 시 이메일 OTP 인증을 요구
- 무료 플랜에서 50명까지
- 설정에 20~30분 정도 소요

이 경우 `netlify.toml` 대신 Cloudflare Pages의 빌드 설정에 동일한 명령
(`mkdir -p dist && cp index.html robots.txt dist/`, output `dist`)을 넣으면 됩니다.
