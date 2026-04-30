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

// Account area is now non-authenticated. Keep a small utility menu if the
// layout includes it, but do not render sign-in/sign-up controls.
(function initAccountUI(){
  const host = document.getElementById('accountArea');
  if (!host) return;

  host.innerHTML = `
    <div class="menu">
      <div class="avatar" title="AI MOM">AM</div>
      <div class="dropdown show" style="position: static; display: block; box-shadow: none; background: transparent; padding: 0; border: 0; min-width: auto;">
        <div class="group-title">Workspace</div>
        <a href="./profile.html">Profile</a>
        <a href="./setting.html">Settings</a>
      </div>
    </div>
  `;
})();
