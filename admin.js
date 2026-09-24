const ADMIN_EMAIL='admin@storyhub.local',ADMIN_PASSWORD='admin123';
const STORIES_KEY='storyhub_stories_v1',USERS_KEY='storyhub_users_v1',ADMIN_KEY='storyhub_admin_session_v1';
const $=s=>document.querySelector(s);
function stories(){return JSON.parse(localStorage.getItem(STORIES_KEY)||'[]')}
function save(v){localStorage.setItem(STORIES_KEY,JSON.stringify(v))}
function logged(){return localStorage.getItem(ADMIN_KEY)==='1'}
function render(){const s=stories();$('#pendingTotal').textContent=s.filter(x=>x.status==='pending').length;$('#publishedTotal').textContent=s.filter(x=>x.status==='published').length;$('#usersTotal').textContent=JSON.parse(localStorage.getItem(USERS_KEY)||'[]').length;$('#pendingList').innerHTML=list(s.filter(x=>x.status==='pending'),true)||'<p class="muted">No pending stories.</p>';$('#publishedList').innerHTML=list(s.filter(x=>x.status==='published'),false)||'<p class="muted">No published stories.</p>'}
function list(arr,pending){return arr.map(s=>`<div class="admin-item"><p class="eyebrow">${s.category}</p><h3>${safe(s.title)}</h3><p class="muted">By ${safe(s.author)} · ${new Date(s.created).toLocaleString()}</p><p>${safe(s.content.slice(0,280))}</p><div class="admin-actions">${pending?`<button class="success" data-action="approve" data-id="${s.id}">Approve</button><button class="danger" data-action="reject" data-id="${s.id}">Reject</button>`:''}<button class="ghost" data-action="delete" data-id="${s.id}">Delete</button></div></div>`).join('')}
$('#adminLogin').onsubmit=e=>{e.preventDefault();if($('#adminEmail').value.trim().toLowerCase()===ADMIN_EMAIL&&$('#adminPassword').value===ADMIN_PASSWORD){localStorage.setItem(ADMIN_KEY,'1');$('#adminLogin').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}else $('#adminMessage').textContent='Invalid admin login.'};
$('#adminLogout').onclick=()=>{localStorage.removeItem(ADMIN_KEY);location.reload()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const arr=stories(),i=arr.findIndex(s=>s.id===b.dataset.id);if(i<0)return;if(b.dataset.action==='approve')arr[i].status='published';if(b.dataset.action==='reject')arr[i].status='rejected';if(b.dataset.action==='delete')arr.splice(i,1);save(arr);render()});
function safe(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
if(logged()){$('#adminLogin').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}
