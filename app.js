const TABS = ["s-home","s-seminar","s-groups","s-info","s-me"];
const TAB_FALLBACK = {"s-group":"s-groups","s-round":"s-home","s-recommend":"s-groups","s-create":"s-groups","s-consult":"s-seminar","s-mission":"s-info"};
const REDUCE = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

let currentId = null;

// ───── i18n ─────
function setLang(lang){
  if(lang!=='ko' && lang!=='vi') lang='ko';
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-ko]').forEach(el=>{
    if(el.children.length>0) return;
    const t = el.dataset[lang];
    if(t) el.textContent = t;
  });
  document.querySelectorAll('[data-ko-html]').forEach(el=>{
    const key = lang==='vi' ? 'viHtml' : 'koHtml';
    const t = el.dataset[key];
    if(t) el.innerHTML = t;
  });
  document.querySelectorAll('[data-ko-ph]').forEach(el=>{
    const ph = lang==='vi' ? el.dataset.viPh : el.dataset.koPh;
    if(ph) el.placeholder = ph;
  });
  try{ localStorage.setItem('mc_lang', lang); }catch(_){}
  document.querySelectorAll('[data-lang-set]').forEach(b=>{
    b.setAttribute('aria-pressed', String(b.dataset.langSet===lang));
  });
}

const GROUPS = {
  guitar: {name:'기타 한 곡 완주반', nameVi:'Lớp hoàn thành 1 bài guitar', leader:'Tran Thi Hoa'},
  house: {name:'집 구하기 품앗이', nameVi:'Giúp nhau tìm nhà', leader:'Jamila K.'},
  topik: {name:'TOPIK 3급반', nameVi:'Lớp TOPIK cấp 3', leader:'Le Van Thanh'},
  food: {name:'고향 음식 나눔', nameVi:'Chia sẻ món quê', leader:'Tran Thi Hoa'},
  photo: {name:'사진 산책', nameVi:'Dạo chụp ảnh', leader:'Jamila K.'},
  bike: {name:'주말 자전거 라이딩', nameVi:'Đạp xe cuối tuần', leader:'Bakhtiyor R.'},
};
let CURRENT_GROUP = 'guitar';
function renderGroup(key){
  const g = GROUPS[key]; if(!g) return;
  CURRENT_GROUP = key;
  const vi = (document.documentElement.lang||'ko')==='vi';
  const nameEl = document.querySelector('#s-group [data-slot="name"]');
  if(nameEl) nameEl.textContent = vi?g.nameVi:g.name;
  const leaderEl = document.querySelector('#s-group [data-slot="leaderName"]');
  if(leaderEl) leaderEl.textContent = g.leader;
  const jb = document.getElementById('joinBtn');
  if(jb){ jb.textContent = vi?'Tham gia nhóm này':'이 모임 가입하기'; jb.classList.remove('done'); }
}
function joinedList(){ try{return JSON.parse(localStorage.getItem('mc_joined')||'["guitar","house"]');}catch(_){return ['guitar','house'];} }
function addJoined(key){ const a=joinedList(); if(!a.includes(key))a.push(key); try{localStorage.setItem('mc_joined',JSON.stringify(a));}catch(_){} renderMyGroups(); }
function renderMyGroups(){
  const host = document.getElementById('my-groups-list'); if(!host) return;
  const vi = (document.documentElement.lang||'ko')==='vi';
  const arr = joinedList();
  const dmap = {guitar:'10/19 (토) 19:00', house:'10/20 (일) 14:00', topik:'10/22 (수) 20:00', food:'10/24 (금) 20:00', photo:'10/26 (일) 10:00', bike:'10/26 (일) 08:00'};
  const dmv = {guitar:'10/19 T7 19:00', house:'10/20 CN 14:00', topik:'10/22 T4 20:00', food:'10/24 T6 20:00', photo:'10/26 CN 10:00', bike:'10/26 CN 08:00'};
  host.innerHTML = arr.map(k=>{ const g=GROUPS[k]; if(!g) return ''; const d=vi?dmv[k]:dmap[k]; const n=vi?g.nameVi:g.name; const L=vi?'Lần tới':'다음'; return '<button class="card card--btn" data-group="'+k+'" data-seminar="tax"><div class="row"><div class="grow"><div class="ttl">'+n+'</div><div class="sub mt1">'+L+': '+d+'</div></div><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div></button>'; }).join('');
}

const SEMINARS = {
  tax: {date:'10/15', tag:'접수중', tagVi:'Đang nhận', title:'연말정산, 뭐가 다를까?', titleVi:'Quyết toán thuế cuối năm', meta:'수 19:00 · 안산 지점 · 세무사 초청 · 30명', metaVi:'T4 19:00 · Chi nhánh Ansan · Chuyên gia thuế', speaker:'회계사 박지혜', speakerBio:'외국인 노동자 세무 전문', program:'1부 50분 — 연말정산 기본<br>2부 30분 — 외국인 공제 항목<br>3부 20분 — Q&A'},
  rent: {date:'10/22', tag:'접수중', tagVi:'Đang nhận', title:'전·월세 계약 피해 예방', titleVi:'Phòng chống rủi ro hợp đồng thuê nhà', meta:'수 19:30 · 안산 지점 · Samsung MyConnect Space · 50명', metaVi:'T4 19:30 · Chi nhánh Ansan · 50 người', speaker:'안산 지점장 김민수', speakerBio:'전세 사기 예방 전문', program:'1부 50분 — 사기 유형<br>2부 30분 — 체크리스트<br>3부 20분 — Q&A'},
  insurance: {date:'10/29', tag:'곧 열림', tagVi:'Sắp mở', title:'산재 처리 절차 A-Z', titleVi:'Thủ tục tai nạn lao động A-Z', meta:'수 19:30 · 연수원 · 삼성화재 손해사정사', metaVi:'T4 19:30 · TT đào tạo', speaker:'손해사정사 이상훈', speakerBio:'산재 처리 15년', program:'1부 — 신고 절차<br>2부 — 보상 범위<br>3부 — Q&A'},
  basic: {date:'11/05', tag:'보험 안내', tagVi:'Bảo hiểm', title:'외국인을 위한 보험 기본', titleVi:'Kiến thức bảo hiểm cho người nước ngoài', meta:'수 19:30 · 안산 지점 · 선택 참여', metaVi:'T4 19:30 · Chi nhánh Ansan · Tùy chọn', speaker:'삼성화재 담당자 최정미', speakerBio:'외국인 보험 상담 전문', program:'1부 — 보험이 왜 필요한가<br>2부 — 실손/산재/자동차<br>3부 — Q&A'},
};
function renderSeminar(key){
  const s = SEMINARS[key]; if(!s) return;
  const vi = (document.documentElement.lang||'ko')==='vi';
  const set = (slot, v) => document.querySelectorAll('#s-seminar-detail [data-slot="'+slot+'"]').forEach(el=>{ el.innerHTML=v; });
  set('semDate', s.date);
  set('semTag', vi?s.tagVi:s.tag);
  set('semTitle', vi?s.titleVi:s.title);
  set('semMeta', vi?s.metaVi:s.meta);
  set('semSpeaker', s.speaker);
  set('semSpeakerBio', s.speakerBio);
  set('semProgram', s.program);
  const sb = document.getElementById('seminarApplyBtn');
  if(sb){ sb.textContent = vi?'Đăng ký · +500P':'신청하기 · +500P'; sb.classList.remove('done'); sb.disabled=false; }
}

function show(id, fromHash){
  try{
    const el = document.getElementById(id);
    if(el){
      el.hidden = false;  // show target first
      document.querySelectorAll(".screen").forEach(s=>{ if(s.id!==id) s.hidden = true; });  // then hide others
      if(!REDUCE){ el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
    }
    const screens = document.querySelector(".screens"); if(screens) screens.scrollTop = 0;
  }catch(e){ console.warn('[show] screen render error', e); }
  // Tabbar visibility — ALWAYS runs, even if above errored
  const tb = document.getElementById("tabbar");
  if(tb){
    const shouldHide = (id==="s-consent" || id==="s-purpose");
    tb.hidden = shouldHide;
    if(!shouldHide) tb.style.display = 'grid'; else tb.style.display = '';
  }
  try{
    const activeTab = TABS.includes(id) ? id : (TAB_FALLBACK[id] || "");
    document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-current", String(t.dataset.tab===activeTab)));
    document.body.dataset.screen = id;
    if(id==='s-me') applyPoints();
    currentId = id;
    if(id==='s-home'){ applyProfile(); applyPoints(); if(typeof renderMyGroups==='function') renderMyGroups(); }
    if(!fromHash && location.hash.slice(1)!==id){ location.hash = id; }
  }catch(e){ console.warn('[show] post-render error', e); }
}
window.addEventListener("hashchange",()=>{
  const id = location.hash.slice(1) || "s-consent";
  if(id===currentId || !document.getElementById(id)) return;
  show(id,true);
});
let toastT;
function toast(msg){
  let el = document.getElementById("toast");
  if(!el){
    el = document.createElement("div"); el.id="toast"; el.className="toast";
    el.setAttribute("role","status"); document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(()=>el.classList.remove("on"),1900);
}
document.addEventListener('click', e=>{
  const cc = e.target.closest('#consultCTA');
  if(cc && !cc.classList.contains('is-disabled') && !cc.classList.contains('done')){
    const vi = (document.documentElement.lang||'ko')==='vi';
    cc.textContent = vi?'Hoàn thành đăng ký ✓':'신청 완료 ✓';
    cc.classList.add('done');
    const sp = document.getElementById('consultSuccess');
    if(sp){ sp.hidden = false; sp.scrollIntoView({behavior:'smooth', block:'center'}); }
    try{const c=Number(localStorage.getItem('mc_points')||0);localStorage.setItem('mc_points',String(c+10000));}catch(_){}
    const el = document.getElementById('consultPts');
    if(el){ countUp(el, 10000, 'P'); }
    toast(vi?'상담 신청 완료 · +10,000P 적립':'상담 신청 완료 · +10,000P 적립');
  }
});
document.addEventListener("click",e=>{
  const todo = e.target.closest("[data-todo]");
  if(todo){ toast(todo.dataset.todo); return; }
  const go = e.target.closest("[data-go]"); if(go){ show(go.dataset.go); return; }
  const sem = e.target.closest("[data-seminar]");
  if(sem){ renderSeminar(sem.dataset.seminar); show("s-seminar-detail"); return; }
  const grp = e.target.closest("[data-group]");
  if(grp){ renderGroup(grp.dataset.group); show("s-group"); return; }
  const tab = e.target.closest("[data-tab]"); if(tab){ show(tab.dataset.tab); return; }
  const d = e.target.closest(".day");
  if(d){
    const cur = d.dataset.done==='1';
    d.dataset.done = cur ? '0' : '1';
    const dc = d.querySelector('.day-c'); if(dc) dc.textContent = cur ? '+' : '✓';
    const cnt = document.querySelectorAll('.day[data-done="1"]').length;
    const el = document.getElementById('attendCount'); if(el) el.textContent = cnt;
    return;
  }
  const pick = e.target.closest(".pick");
  if(pick){
    if(pick.hasAttribute('data-pick-multi')){
      const cur = pick.getAttribute('aria-pressed')==='true';
      pick.setAttribute('aria-pressed', String(!cur));
    } else {
      const scope = pick.closest('.stack') || document;
      scope.querySelectorAll('.pick:not([data-pick-multi])').forEach(p=>p.setAttribute("aria-pressed","false"));
      pick.setAttribute("aria-pressed","true");
    }
    return;
  }
  const m = e.target.closest(".mission");
  if(m){ m.dataset.done = m.dataset.done==="1"?"0":"1"; syncMissions(); return; }
});

// ───── lang & step wizard handlers ─────
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-lang-set]');
  if(b){ setLang(b.dataset.langSet); return; }
  const c = e.target.closest('[data-step-go]');
  if(c){
    const parent = c.closest('.wizard');
    if(parent){
      const next = c.dataset.stepGo;
      parent.querySelectorAll('.wiz-step').forEach(s=>s.hidden=(s.dataset.step!==next));
      parent.querySelectorAll('.wiz-dot').forEach(d=>d.classList.toggle('on', Number(d.dataset.dot)<=Number(next)));
    }
    return;
  }
});

function saveProfile(){
  try{
    const p = {
      name: (document.getElementById('pf-name')||{}).value || '',
      nat: (document.getElementById('pf-nat')||{}).value || 'vn',
      bday: (document.getElementById('pf-bday')||{}).value || ''
    };
    localStorage.setItem('mc_profile', JSON.stringify(p));
  }catch(_){}
}
function applyPoints(){
  try{
    const pts = Number(localStorage.getItem('mc_points')||0);
    const base = 7500;
    const total = base + pts;
    document.querySelectorAll('[data-stat="points"]').forEach(el=>{ el.textContent = total.toLocaleString(); });
    // Fallback: find s-me's "누적 포인트" stat
    const stats = document.querySelectorAll('#s-me .stat b');
    if(stats.length>0 && !stats[0].hasAttribute('data-stat')){ stats[0].textContent = total.toLocaleString(); }
  }catch(_){}
}
function applyProfile(){
  try{
    const p = JSON.parse(localStorage.getItem('mc_profile')||'null');
    if(!p || !p.name) return;
    const h2 = document.querySelector('#s-home .phead h2.t-display');
    if(h2) h2.textContent = p.name.split(' ').pop();
    // also apply to s-me
    const me = document.querySelector('#s-me .ttl.ttl--lg');
    if(me) me.textContent = p.name;
    const kv = document.querySelectorAll('#s-me .kv');
    kv.forEach(k=>{
      const b = k.querySelector('b'); if(!b) return;
      if(b.textContent.trim()==='이름' || b.textContent.trim()==='Họ tên'){
        const s = k.querySelector('span'); if(s) s.textContent = p.name;
      }
    });
  }catch(_){}
}
// Hook consent CTA click to save profile
document.addEventListener('click', e=>{
  const cta = e.target.closest('#consentCTA');
  if(cta && !cta.classList.contains('is-disabled')) saveProfile();
}, true);
function syncConsent(){
  const req = document.querySelectorAll('.agree[data-req="1"] input');
  const allOn = Array.from(req).every(c=>c.checked);
  const cta = document.getElementById('consentCTA');
  if(cta){ cta.classList.toggle('is-disabled', !allOn); }
}
document.addEventListener('change', e=>{
  if(e.target.closest('.agree')) syncConsent();
  const req2 = document.querySelectorAll('.agree-consult input[data-req]');
  if(req2.length){
    const ok = Array.from(req2).every(c=>c.checked);
    const cta2 = document.getElementById('consultCTA');
    if(cta2) cta2.classList.toggle('is-disabled', !ok);
  }
});
document.addEventListener('click', e=>{
  const sb = e.target.closest('#seminarApplyBtn');
  if(sb && !sb.classList.contains('done')){
    const vi = (document.documentElement.lang||'ko')==='vi';
    sb.textContent = vi?'Đã đăng ký · +500P':'신청 완료 · +500P';
    sb.classList.add('done');
    try{const c=Number(localStorage.getItem('mc_points')||0);localStorage.setItem('mc_points',String(c+500));}catch(_){}
    toast(vi?'Đăng ký hội thảo hoàn thành · +500P':'세미나 신청 완료 · +500P 적립');
  }
});
document.getElementById("joinBtn").addEventListener("click",function(){
  const vi=(document.documentElement.lang||"ko")==="vi";
  this.textContent = vi?"Hoàn thành · +300P":"가입 완료 · +300P";
  this.classList.add("done");
  if(typeof addJoined==="function") addJoined(CURRENT_GROUP);
  try{const c=Number(localStorage.getItem("mc_points")||0);localStorage.setItem("mc_points",String(c+300));}catch(_){}
  setTimeout(()=>show("s-home"),850);
});
document.getElementById("rsvpBtn").addEventListener("click",function(){
  this.textContent="참석 완료"; this.classList.add("done");
});

function countUp(el,to,suffix){
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if(REDUCE || from===to){ el.textContent = to.toLocaleString()+suffix; return; }
  const t0 = performance.now(), dur = 320;
  (function step(t){
    const k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3);
    el.textContent = Math.round(from+(to-from)*e).toLocaleString()+suffix;
    if(k<1) requestAnimationFrame(step);
  })(t0);
}
function syncMissions(){
  const all=[...document.querySelectorAll(".mission")];
  const done=all.filter(m=>m.dataset.done==="1");
  const pts=done.reduce((s,m)=>s+Number(m.dataset.pt),0);
  document.getElementById("mCount").textContent=done.length+" / "+all.length+" 완료";
  document.getElementById("mBar").style.width=Math.round(done.length/all.length*100)+"%";
  countUp(document.getElementById("ptTag"),pts,"P");
}
syncMissions();
try{ setLang(localStorage.getItem('mc_lang')||'ko'); }catch(_){ setLang('ko'); }
syncConsent();
(function(){
  const h = location.hash.slice(1);
  show(h && document.getElementById(h) ? h : "s-consent", true);
})();