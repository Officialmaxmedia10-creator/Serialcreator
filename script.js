const USERS_KEY='storyhub_users_v1', STORIES_KEY='storyhub_stories_v1', SESSION_KEY='storyhub_session_v1';
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let mode='login';

const demoStories=[
{id:'1',title:'The Last Train Home',category:'Drama',content:'The station was almost empty when the last train arrived. Maya stepped forward, carrying a small bag and a decision she had been avoiding for years. Sometimes going home is not about a place; it is about finally facing yourself.',author:'Story Hub Editorial',authorEmail:'editor@storyhub.local',status:'published',created:Date.now()},
{id:'2',title:'A Door in the Rain',category:'Mystery',content:'Every evening at exactly seven, a blue door appeared at the end of the street. Nobody knew where it came from. On Thursday, Daniel decided to knock.',author:'Story Hub Editorial',authorEmail:'editor@storyhub.local',status:'published',created:Date.now()-1000}
];
if(!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY,JSON.stringify([]));
if(!localStorage.getItem(STORIES_KEY)) localStorage.setItem(STORIES_KEY,JSON.stringify(demoStories));

function users(){return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}
function stories(){return JSON.parse(localStorage.getItem(STORIES_KEY)||'[]')}
function saveStories(v){localStorage.setItem(STORIES_KEY,JSON.stringify(v))}
function session(){return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}
function setSession(u){localStorage.setItem(SESSION_KEY,JSON.stringify(u))}
function showApp(){ $('#authView').classList.add('hidden');$('#appView').classList.remove('hidden');renderStories();renderProfile()}
function showAuth(){ $('#authView').classList.remove('hidden');$('#appView').classList.add('hidden') }

$$('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#nameWrap').classList.toggle('hidden',mode==='login');$('#authSubmit').textContent=mode==='login'?'Log In':'Create Account';$('#authMessage').textContent=''});

$('#authForm').onsubmit=e=>{e.preventDefault();const email=$('#email').value.trim().toLowerCase(),password=$('#password').value;let us=users();
if(mode==='signup'){const name=$('#name').value.trim();if(!name)return $('#authMessage').textContent='Please enter your name.';if(us.some(u=>u.email===email))return $('#authMessage').textContent='An account with this email already exists.';const u={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,email,password,created:Date.now()};us.push(u);localStorage.setItem(USERS_KEY,JSON.stringify(us));setSession({id:u.id,name:u.name,email:u.email});showApp();}
else{const u=us.find(x=>x.email===email&&x.password===password);if(!u)return $('#authMessage').textContent='Incorrect email or password.';setSession({id:u.id,name:u.name,email:u.email});showApp();}};

$('#logoutBtn').onclick=()=>{localStorage.removeItem(SESSION_KEY);showAuth()};
$('#menuBtn').onclick=()=>$('#nav').classList.toggle('open');
document.body.addEventListener('click',e=>{const p=e.target.closest('[data-page]');if(p){e.preventDefault();openPage(p.dataset.page)}});

function openPage(id){$$('.page').forEach(p=>p.classList.remove('active-page'));$('#'+id).classList.add('active-page');$('#nav').classList.remove('open');if(id==='stories')renderStories();if(id==='profile')renderProfile();window.scrollTo({top:0,behavior:'smooth'})}
function card(s){return `<div class="story-card"><p class="eyebrow">${escapeHtml(s.category)}</p><h3>${escapeHtml(s.title)}</h3><p class="muted">By ${escapeHtml(s.author)}</p><p>${escapeHtml(s.content.slice(0,130))}...</p><button class="link-btn" data-read="${s.id}">Read story →</button></div>`}
function renderStories(){const published=stories().filter(s=>s.status==='published').sort((a,b)=>b.created-a.created);$('#latestStories').innerHTML=published.slice(0,3).map(card).join('')||'<p class="muted">No published stories yet.</p>';$('#storyGrid').innerHTML=published.map(card).join('')||'<p class="muted">No published stories yet.</p>'}
$('#searchInput').oninput=()=>{const q=$('#searchInput').value.toLowerCase();$('#storyGrid').innerHTML=stories().filter(s=>s.status==='published'&&(s.title.toLowerCase().includes(q)||s.author.toLowerCase().includes(q))).map(card).join('')||'<p class="muted">No matching stories.</p>'};
document.addEventListener('click',e=>{const b=e.target.closest('[data-read]');if(!b)return;const s=stories().find(x=>x.id===b.dataset.read);if(!s)return;$('#readerCategory').textContent=s.category;$('#readerTitle').textContent=s.title;$('#readerAuthor').textContent='By '+s.author;$('#readerContent').textContent=s.content;openPage('reader')});
$('#storyForm').onsubmit=e=>{e.preventDefault();const u=session();if(!u)return;const arr=stories();arr.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:$('#storyTitle').value.trim(),category:$('#storyCategory').value,content:$('#storyContent').value.trim(),author:u.name,authorEmail:u.email,status:'pending',created:Date.now()});saveStories(arr);$('#storyForm').reset();$('#storyMessage').textContent='Story submitted for admin review.'};
function renderProfile(){const u=session();if(!u)return;$('#profileName').textContent=u.name;$('#profileEmail').textContent=u.email;$('#avatar').textContent=u.name.charAt(0).toUpperCase();const mine=stories().filter(s=>s.authorEmail===u.email);$('#myCount').textContent=mine.length;$('#publishedCount').textContent=mine.filter(s=>s.status==='published').length}
function escapeHtml(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
if(session())showApp();
