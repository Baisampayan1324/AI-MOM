// Shared helpers: simple localStorage wrapper and tiny pub/sub
const storage = {
  get(key, fallback=null){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key){ localStorage.removeItem(key); }
};

const bus = (()=>{
  const map = new Map();
  return {
    on(event, fn){ map.set(event, [...(map.get(event)||[]), fn]); },
    emit(event, data){ (map.get(event)||[]).forEach(fn=>fn(data)); }
  };
})();

// Pull profile into memory for pages that need it
const profile = storage.get('userProfile', {
  fullName: '',
  email: '',
  keywords: 'question, please, can you',
  pref: { speakerAlerts: true, autoSummary: false, email: false, darkTheme: false }
});

// Apply theme preference ONLY if explicitly set to true
if (profile?.pref?.darkTheme === true){
  document.addEventListener('DOMContentLoaded', ()=> document.body.classList.add('theme-dark'));
}

// Nav highlighting fallback (in case active class missing)
(() => {
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href').endsWith(path)) a.classList.add('active');
  });
})();

// Simple auth mock: show Login/Sign up when logged out; show avatar menu when logged in
(function initAccountUI(){
  const host = document.getElementById('accountArea');
  if (!host) return;
  const auth = storage.get('authUser', null); // { name, email, avatar }

  function renderLoggedOut(){
    host.innerHTML = `
      <div class="auth-buttons">
        <button id="btnLogin" class="btn btn-secondary">Sign in</button>
        <button id="btnSignup" class="btn btn-primary">Sign up</button>
      </div>
    `;
    ensureAuthModal();
    host.querySelector('#btnLogin').addEventListener('click', ()=> openAuthModal('signin'));
    host.querySelector('#btnSignup').addEventListener('click', ()=> openAuthModal('signup'));
  }

  function renderLoggedIn(user){
    const initials = (user?.name || 'User').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
    host.innerHTML = `
      <div class="menu">
        <div id="avatarBtn" class="avatar" title="Account">${user?.avatar ? `<img id="navAvatarImg" src="${user.avatar}" alt="avatar" style="width:100%;height:100%;border-radius:50%">` : initials}</div>
        <div id="dropdown" class="dropdown">
          <div class="group-title">Account</div>
          <a href="./profile.html">👤 Profile</a>
          <a href="./settings.html">⚙️ Settings</a>
          <div class="group-title">Session</div>
          <a href="#" id="logoutBtn">🚪 Log out</a>
        </div>
      </div>
    `;
    const avatarBtn = host.querySelector('#avatarBtn');
    const dropdown = host.querySelector('#dropdown');
    avatarBtn.addEventListener('click', ()=> dropdown.classList.toggle('show'));
    document.addEventListener('click', (e)=>{ if (!host.contains(e.target)) dropdown.classList.remove('show'); });
    host.querySelector('#logoutBtn').addEventListener('click', (e)=>{ 
      e.preventDefault(); 
      storage.remove('authUser'); 
      window.location.href = './index.html';
    });
  }

  if (auth) renderLoggedIn(auth); else renderLoggedOut();

  // --- Modal auth (Sign in / Sign up) - Centered popup ---
  function ensureAuthModal(){
    if (document.getElementById('authModalBackdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'authModalBackdrop';
    backdrop.innerHTML = `
      <div class="modal" id="authModal">
        <div class="modal-header">
          <div class="tabs">
            <button id="tabSignin" class="tab active" type="button">Sign in</button>
            <button id="tabSignup" class="tab" type="button">Sign up</button>
          </div>
          <button id="closeModal" class="close" type="button">✕</button>
        </div>
        <div class="modal-body">
          <form id="formSignin" class="auth-form">
            <div class="form-field">
              <label for="mEmail">Email</label>
              <input id="mEmail" type="email" placeholder="you@example.com" required />
              <div id="errEmailIn" class="field-error"></div>
            </div>
            <div class="form-field">
              <label for="mPassword">Password</label>
              <input id="mPassword" type="password" placeholder="••••••••" required />
              <div id="errPassIn" class="field-error"></div>
            </div>
            <div id="mSignInErr" class="form-error hidden"></div>
            <button class="btn btn-primary w-100" type="submit">Sign in</button>
          </form>

          <form id="formSignup" class="auth-form hidden">
            <div class="form-field">
              <label for="mName">Full Name</label>
              <input id="mName" type="text" placeholder="Jane Doe" required />
              <div id="errNameUp" class="field-error"></div>
            </div>
            <div class="form-field">
              <label for="mEmailUp">Email</label>
              <input id="mEmailUp" type="email" placeholder="you@example.com" required />
              <div id="errEmailUp" class="field-error"></div>
            </div>
            <div class="form-field">
              <label for="mPasswordUp">Password</label>
              <input id="mPasswordUp" type="password" placeholder="••••••••" required />
              <div id="errPassUp" class="field-error"></div>
            </div>
            <div class="form-field">
              <label for="mConfirmUp">Confirm Password</label>
              <input id="mConfirmUp" type="password" placeholder="••••••••" required />
              <div id="errConfirmUp" class="field-error"></div>
            </div>
            <div id="mSignUpErr" class="form-error hidden"></div>
            <button class="btn btn-primary w-100" type="submit">Create account</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    const tabSignin = backdrop.querySelector('#tabSignin');
    const tabSignup = backdrop.querySelector('#tabSignup');
    const formSignin = backdrop.querySelector('#formSignin');
    const formSignup = backdrop.querySelector('#formSignup');
    const closeModal = backdrop.querySelector('#closeModal');
    const errIn = backdrop.querySelector('#mSignInErr');
    const errUp = backdrop.querySelector('#mSignUpErr');

    function show(tab){
      if (tab==='signin'){
        tabSignin.classList.add('active'); tabSignup.classList.remove('active');
        formSignin.classList.remove('hidden'); formSignup.classList.add('hidden');
      } else {
        tabSignup.classList.add('active'); tabSignin.classList.remove('active');
        formSignup.classList.remove('hidden'); formSignin.classList.add('hidden');
      }
    }
    tabSignin.addEventListener('click', ()=> show('signin'));
    tabSignup.addEventListener('click', ()=> show('signup'));
    closeModal.addEventListener('click', ()=> backdrop.classList.remove('show'));
    backdrop.addEventListener('click', (e)=>{ if (e.target===backdrop) backdrop.classList.remove('show'); });

    const usersKey = 'users';
    const hash = (pw)=> btoa(unescape(encodeURIComponent(pw)));
    const getUsers = ()=> {
      const stored = JSON.parse(localStorage.getItem(usersKey)||'[]');
      // Ensure demo admin account always exists
      const demoAdmin = { name: 'Admin', email: 'admin@example.com', passwordHash: hash('admin123') };
      if (!stored.some(u => u.email.toLowerCase() === 'admin@example.com')) {
        stored.unshift(demoAdmin);
        localStorage.setItem(usersKey, JSON.stringify(stored));
      }
      return stored;
    };
    const setUsers = (arr)=> localStorage.setItem(usersKey, JSON.stringify(arr));
    const setAuth = (u)=> localStorage.setItem('authUser', JSON.stringify({ name:u.name, email:u.email, avatar:u.avatar||null }));

    // Inline validators
    function setErr(el, msg){ el.textContent = msg || ''; el.classList.toggle('show', !!msg); }
    const vEmail = (s)=> /.+@.+\..+/.test(s);

    // Live inline validation
    const emailInEl = formSignin.querySelector('#mEmail');
    const passInEl = formSignin.querySelector('#mPassword');
    emailInEl.addEventListener('blur', ()=> setErr(backdrop.querySelector('#errEmailIn'), vEmail(emailInEl.value.trim()) ? '' : 'Enter a valid email'));
    emailInEl.addEventListener('input', ()=> setErr(backdrop.querySelector('#errEmailIn'), vEmail(emailInEl.value.trim()) ? '' : ''));
    passInEl.addEventListener('blur', ()=> setErr(backdrop.querySelector('#errPassIn'), passInEl.value ? '' : 'Enter your password'));
    passInEl.addEventListener('input', ()=> setErr(backdrop.querySelector('#errPassIn'), passInEl.value ? '' : ''));

    const nameUpEl = formSignup.querySelector('#mName');
    const emailUpEl = formSignup.querySelector('#mEmailUp');
    const passUpEl = formSignup.querySelector('#mPasswordUp');
    const confUpEl = formSignup.querySelector('#mConfirmUp');
    nameUpEl.addEventListener('blur', ()=> setErr(backdrop.querySelector('#errNameUp'), nameUpEl.value.trim() ? '' : 'Enter your name'));
    nameUpEl.addEventListener('input', ()=> setErr(backdrop.querySelector('#errNameUp'), nameUpEl.value.trim() ? '' : ''));
    emailUpEl.addEventListener('blur', ()=> setErr(backdrop.querySelector('#errEmailUp'), vEmail(emailUpEl.value.trim()) ? '' : 'Enter a valid email'));
    emailUpEl.addEventListener('input', ()=> setErr(backdrop.querySelector('#errEmailUp'), vEmail(emailUpEl.value.trim()) ? '' : ''));
    passUpEl.addEventListener('blur', ()=> setErr(backdrop.querySelector('#errPassUp'), passUpEl.value.length>=6 ? '' : 'Min 6 characters'));
    passUpEl.addEventListener('input', ()=> setErr(backdrop.querySelector('#errPassUp'), passUpEl.value.length>=6 ? '' : ''));
    function syncConfirm(){ setErr(backdrop.querySelector('#errConfirmUp'), confUpEl.value === passUpEl.value ? '' : 'Passwords do not match'); }
    confUpEl.addEventListener('blur', syncConfirm);
    confUpEl.addEventListener('input', syncConfirm);
    passUpEl.addEventListener('input', syncConfirm);

    formSignin.addEventListener('submit', (e)=>{
      e.preventDefault(); errIn.classList.add('hidden');
      const emailEl = formSignin.querySelector('#mEmail');
      const passEl = formSignin.querySelector('#mPassword');
      const email = emailEl.value.trim().toLowerCase();
      const pw = passEl.value;
      setErr(backdrop.querySelector('#errEmailIn'), vEmail(email) ? '' : 'Enter a valid email');
      setErr(backdrop.querySelector('#errPassIn'), pw ? '' : 'Enter your password');
      if (!vEmail(email) || !pw) return;
      const users = getUsers();
      const u = users.find(x=>x.email.toLowerCase()===email);
      if (!u || u.passwordHash!==hash(pw)){
        errIn.textContent = 'Invalid email or password.'; errIn.classList.remove('hidden'); return;
      }
      setAuth(u);
      backdrop.classList.remove('show');
      // Preserve theme on reload
      setTimeout(() => location.reload(), 100);
    });

    formSignup.addEventListener('submit', (e)=>{
      e.preventDefault(); errUp.classList.add('hidden');
      const nameEl = formSignup.querySelector('#mName');
      const emailEl = formSignup.querySelector('#mEmailUp');
      const passEl = formSignup.querySelector('#mPasswordUp');
      const confEl = formSignup.querySelector('#mConfirmUp');
      const name = nameEl.value.trim();
      const email = emailEl.value.trim().toLowerCase();
      const pw = passEl.value;
      const cf = confEl.value;
      setErr(backdrop.querySelector('#errNameUp'), name ? '' : 'Enter your name');
      setErr(backdrop.querySelector('#errEmailUp'), vEmail(email) ? '' : 'Enter a valid email');
      setErr(backdrop.querySelector('#errPassUp'), pw.length>=6 ? '' : 'Min 6 characters');
      setErr(backdrop.querySelector('#errConfirmUp'), pw===cf ? '' : 'Passwords do not match');
      if (!name || !vEmail(email) || pw.length<6 || pw!==cf) return;
      const users = getUsers();
      if (users.some(x=>x.email.toLowerCase()===email)){ errUp.textContent='Email already registered.'; errUp.classList.remove('hidden'); return; }
      const nu = { name, email, passwordHash: hash(pw) };
      users.push(nu); setUsers(users); setAuth(nu);
      backdrop.classList.remove('show');
      // Preserve theme on reload
      setTimeout(() => location.reload(), 100);
    });

    window.openAuthModal = function(mode='signin'){
      show(mode); backdrop.classList.add('show');
    }
  }
  function openAuthModal(mode){ ensureAuthModal(); window.openAuthModal(mode); }

  // Expose a small refresh utility to update navbar avatar instantly
  window.refreshAvatar = function(avatarDataUrl, name){
    const img = document.getElementById('navAvatarImg');
    if (img && avatarDataUrl){ img.src = avatarDataUrl; return; }
    // If no image element yet, force re-render of account area
    const user = storage.get('authUser');
    if (user){ renderLoggedIn({ ...user, avatar: avatarDataUrl || user.avatar, name: name || user.name }); }
  }

  // Backend API adapter (placeholder). Replace with real fetch calls when backend is ready.
  window.api = {
    saveProfile: async (profile) => {
      // Example: await fetch('/api/profile', {method:'PUT', body: JSON.stringify(profile)});
      return { ok: true };
    },
    uploadAvatar: async (dataUrl) => {
      // Example: await fetch('/api/avatar', {method:'POST', body: JSON.stringify({ dataUrl })});
      return { ok: true };
    }
  };
})();
