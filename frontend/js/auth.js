// Simple client-side auth demo with localStorage
(function(){
  const storeUsersKey = 'users'; // [{name,email,passwordHash,avatarDataUrl?}]

  function getUsers(){ return JSON.parse(localStorage.getItem(storeUsersKey)||'[]'); }
  function setUsers(u){ localStorage.setItem(storeUsersKey, JSON.stringify(u)); }
  function hash(pw){ return btoa(unescape(encodeURIComponent(pw))); } // NOT secure; demo only

  function setAuthUser(user){
    localStorage.setItem('authUser', JSON.stringify({ name:user.name, email:user.email, avatar:user.avatarDataUrl||null }));
  }

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = loginForm.querySelector('#email').value.trim().toLowerCase();
      const password = loginForm.querySelector('#password').value;
      const users = getUsers();
      const u = users.find(x => x.email.toLowerCase() === email);
      const err = document.getElementById('loginError');
      if (!u || u.passwordHash !== hash(password)){
        err.textContent = 'Invalid email or password.'; err.classList.remove('hidden');
        return;
      }
      setAuthUser(u);
      location.href = './index.html';
    });
  }

  if (signupForm){
    signupForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = signupForm.querySelector('#name').value.trim();
      const email = signupForm.querySelector('#email').value.trim().toLowerCase();
      const password = signupForm.querySelector('#password').value;
      const confirm = signupForm.querySelector('#confirm').value;
      const err = document.getElementById('signupError');
      if (password.length < 6){ err.textContent = 'Password must be at least 6 characters.'; err.classList.remove('hidden'); return; }
      if (password !== confirm){ err.textContent = 'Passwords do not match.'; err.classList.remove('hidden'); return; }
      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)){ err.textContent = 'Email already registered.'; err.classList.remove('hidden'); return; }
      const newUser = { name, email, passwordHash: hash(password) };
      users.push(newUser); setUsers(users); setAuthUser(newUser);
      location.href = './index.html';
    });
  }
})();
