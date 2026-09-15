# 마이커넥트 목업

'26 下 신입사원 온보딩 · 4팀 인터랙티브 목업. 삼성화재가 운영하는 외국인 근로자 커뮤니티 앱 "마이커넥트"의 사용자 화면 10종.

## 파일

- **`index.html`** — 웹앱 프로토타입 (배포용). 폰 베젤/설명 셸 없이 앱 자체가 브라우저 뷰포트를 차지. 모바일 우선, 데스크톱에서는 max-width 480px 센터링.
- `myconnect_mockup.html` — 발표/리뷰용 셸 버전. 마스트헤드·플로우·설계 근거 레일·리스크 가드가 함께 표시. 팀 내부 리뷰 시 활용. **배포 대상 아님** (아래 배포 섹션 참고).
- `netlify.toml` — 배포 설정. `index.html`만 `dist/`로 추려 올립니다.
- `robots.txt` — 검색 색인 차단.

두 HTML 파일은 같은 스크린 컴포넌트를 공유하지만 감싸는 셸이 다릅니다. 웹앱 개선은 `index.html`에, 근거/리스크 문서 갱신은 `myconnect_mockup.html`에 반영합니다.

## 사용 방법

- 상단 스텝 10개를 클릭해서 화면 흐름 따라가기
- 우측 레일에서 각 화면의 설계 근거·리스크 가드 확인
- 하단 탭바로도 이동 가능 (커뮤니티 / 소모임 / 체크리스트 / 정보·도움 / 마이)
- 미션 카드 클릭 → 체크 토글 + 진행률/포인트 갱신
- "이 모임 가입하기" · "참석" 버튼 실제 동작

데이터는 발표용 예시값. 새로고침 시 인터랙션 상태는 초기화됩니다.

## 배포 (Netlify + Git 연동)

`main`에 push하면 자동 재배포됩니다. 설정은 `netlify.toml`에 있습니다.

### 최초 1회 설정

1. https://app.netlify.com 접속 → GitHub 계정으로 로그인
2. **Add new site → Import an existing project → GitHub**
3. Netlify에 리포지터리 접근 권한 부여 → `onboarding-project` 선택
4. 빌드 설정은 `netlify.toml`을 자동으로 읽으므로 **그대로 두고 Deploy**
   (Build command / Publish directory 칸이 비어 보여도 정상입니다)
5. **Site configuration → Change site name**에서 URL 정리 → 팀 채널에 공유

### 배포 범위 — `index.html`만

`netlify.toml`의 빌드 명령이 `index.html`과 `robots.txt`만 `dist/`로 복사합니다.
**`myconnect_mockup.html`은 배포물에 아예 포함되지 않습니다** — 리다이렉트로 가리는 것이
아니라 파일 자체가 올라가지 않습니다. 발표/리뷰용 셸에는 부가 목표(RC 도입·보험 가입 전환),
보험업법·개인정보보호법 리스크 분석, 미결정 사항(호스트 활동비 재원 등) 같은 사내 기획 내용이
들어 있어 URL만 알면 열리는 곳에 두지 않습니다.

배포 후 `https://<site>.netlify.app/myconnect_mockup.html`이 **404인지 반드시 확인**하세요.

내부 리뷰용 셸 버전이 필요하면 파일을 직접 전달하거나, 접근 제한이 가능한 곳
(Cloudflare Pages + Access 등)에 별도로 올립니다.

### 대안 — 일회성 확인용 드래그 배포

https://app.netlify.com/drop 에 `index.html`을 드래그하면 즉시 URL이 나옵니다.
단 수정할 때마다 다시 드래그해야 하고, 실수로 `myconnect_mockup.html`까지 올릴 위험이 있어
팀 공유용으로는 위의 Git 연동을 쓰세요.

> Vercel 무료(Hobby) 플랜은 약관상 비상업적·개인 용도로 제한되어 사내 프로젝트에는
> 적합하지 않습니다. Netlify 무료 플랜은 상업적 사용이 허용됩니다.

## 목업 범위

사용자(멤버) 화면 10종. 호스트용 모임 관리 화면과 서포터(RC)용 도움 요청 처리 화면은 미포함.
