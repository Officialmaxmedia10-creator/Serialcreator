const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
let mode = 'login';
let publishedStories = [];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

function setMessage(selector, message, error = false) {
  const el = $(selector);
  el.textContent = message || '';
  el.classList.toggle('error-message', error);
}

function showApp() {
  $('#authView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  loadAllStories();
  renderProfile();
}

function showAuth() {
  $('#authView').classList.remove('hidden');
  $('#appView').classList.add('hidden');
}

$$('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    $$('.tab').forEach((x) => x.classList.remove('active'));
    button.classList.add('active');
    $('#nameWrap').classList.toggle('hidden', mode === 'login');
    $('#authSubmit').textContent = mode === 'login' ? 'Log In' : 'Create Account';
    setMessage('#authMessage', '');
  });
});

$('#authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('#authMessage', 'Working...');

  const email = $('#email').value.trim().toLowerCase();
  const password = $('#password').value;

  if (mode === 'signup') {
    const displayName = $('#name').value.trim();
    if (!displayName) return setMessage('#authMessage', 'Please enter your display name.', true);

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });

    if (error) return setMessage('#authMessage', error.message, true);

    if (data.session) {
      setMessage('#authMessage', 'Account created successfully.');
      showApp();
    } else {
      setMessage('#authMessage', 'Account created. Check your email to confirm your account, then log in.');
      $('#authForm').reset();
    }
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return setMessage('#authMessage', error.message, true);
  if (data.session) showApp();
});

$('#logoutBtn').addEventListener('click', async () => {
  await sb.auth.signOut();
  showAuth();
});

$('#menuBtn').addEventListener('click', () => $('#nav').classList.toggle('open'));

document.body.addEventListener('click', (event) => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) {
    event.preventDefault();
    openPage(pageButton.dataset.page);
  }
});

function openPage(id) {
  $$('.page').forEach((page) => page.classList.remove('active-page'));
  const target = $('#' + id);
  if (!target) return;
  target.classList.add('active-page');
  $('#nav').classList.remove('open');
  if (id === 'stories') renderStories();
  if (id === 'profile') renderProfile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function storyCard(story) {
  const author = story.profiles?.display_name || 'Story Hub Writer';
  return `<article class="story-card">
    <p class="eyebrow">${escapeHtml(story.category || 'General')}</p>
    <h3>${escapeHtml(story.title)}</h3>
    <p class="muted">By ${escapeHtml(author)} · ${formatDate(story.created_at)}</p>
    <p>${escapeHtml((story.content || '').slice(0, 150))}${story.content?.length > 150 ? '...' : ''}</p>
    <button class="link-btn" data-read="${escapeHtml(story.id)}" type="button">Read story →</button>
  </article>`;
}

async function loadAllStories() {
  const { data, error } = await sb
    .from('stories')
    .select('id,title,content,category,status,views,created_at,author_id,profiles(display_name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    $('#latestStories').innerHTML = '<p class="muted">Could not load stories. Please refresh.</p>';
    $('#storyGrid').innerHTML = '<p class="muted">Could not load stories. Please refresh.</p>';
    return;
  }

  publishedStories = data || [];
  renderStories();
}

function renderStories() {
  const latest = publishedStories.slice(0, 3);
  $('#latestStories').innerHTML = latest.map(storyCard).join('') || '<p class="muted">No published stories yet.</p>';
  filterStories();
}

function filterStories() {
  const query = ($('#searchInput')?.value || '').trim().toLowerCase();
  const filtered = publishedStories.filter((story) => {
    const author = story.profiles?.display_name || '';
    return !query || [story.title, story.category, author, story.content].some((value) =>
      String(value || '').toLowerCase().includes(query)
    );
  });
  $('#storyGrid').innerHTML = filtered.map(storyCard).join('') || '<p class="muted">No matching stories.</p>';
}

$('#searchInput').addEventListener('input', filterStories);

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-read]');
  if (!button) return;

  const story = publishedStories.find((item) => item.id === button.dataset.read);
  if (!story) return;

  $('#readerCategory').textContent = story.category || 'General';
  $('#readerTitle').textContent = story.title;
  $('#readerAuthor').textContent = `By ${story.profiles?.display_name || 'Story Hub Writer'}`;
  $('#readerContent').textContent = story.content;
  openPage('reader');
});

$('#storyForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('#storyMessage', 'Submitting...');

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return setMessage('#storyMessage', 'Please log in again.', true);

  const payload = {
    author_id: user.id,
    title: $('#storyTitle').value.trim(),
    category: $('#storyCategory').value,
    content: $('#storyContent').value.trim()
  };

  const { error } = await sb.from('stories').insert(payload);
  if (error) return setMessage('#storyMessage', error.message, true);

  $('#storyForm').reset();
  setMessage('#storyMessage', 'Story submitted successfully. It is now waiting for admin review.');
  renderProfile();
});

async function renderProfile() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const { data: profile } = await sb
    .from('profiles')
    .select('display_name,username')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Story Hub User';
  $('#profileName').textContent = displayName;
  $('#profileEmail').textContent = user.email || '';
  $('#avatar').textContent = displayName.charAt(0).toUpperCase();

  const { data: mine } = await sb
    .from('stories')
    .select('id,status')
    .eq('author_id', user.id);

  const rows = mine || [];
  $('#myCount').textContent = rows.length;
  $('#publishedCount').textContent = rows.filter((story) => story.status === 'published').length;
}

sb.auth.onAuthStateChange((_event, session) => {
  if (session) showApp();
  else showAuth();
});

(async function init() {
  const { data } = await sb.auth.getSession();
  if (data.session) showApp();
  else showAuth();
})();
