(function(){
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const keywords = document.getElementById('keywords');
  const prefSpeakerAlerts = document.getElementById('prefSpeakerAlerts');
  const prefAutoSummary = document.getElementById('prefAutoSummary');
  const prefEmail = document.getElementById('prefEmail');
  const saveBtn = document.getElementById('saveSettings');
  const prefDarkTheme = document.getElementById('prefDarkTheme');
  const prefLanguage = document.getElementById('prefLanguage');
  const prefChunk = document.getElementById('prefChunk');
  const clearLocalData = document.getElementById('clearLocalData');

  // Load existing
  fullName.value = profile.fullName || '';
  email.value = profile.email || '';
  keywords.value = profile.keywords || '';
  prefSpeakerAlerts.checked = !!profile?.pref?.speakerAlerts;
  prefAutoSummary.checked = !!profile?.pref?.autoSummary;
  prefEmail.checked = !!profile?.pref?.email;
  prefDarkTheme.checked = !!profile?.pref?.darkTheme;
  if (profile?.pref?.language) prefLanguage.value = profile.pref.language;
  if (profile?.pref?.chunk) prefChunk.value = profile.pref.chunk;

  // Apply theme immediately
  document.body.classList.toggle('theme-dark', prefDarkTheme.checked);
  prefDarkTheme.addEventListener('change', ()=>{
    document.body.classList.toggle('theme-dark', prefDarkTheme.checked);
  });

  saveBtn.addEventListener('click', ()=>{
    const newProfile = {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      keywords: keywords.value.trim(),
      pref: {
        speakerAlerts: prefSpeakerAlerts.checked,
        autoSummary: prefAutoSummary.checked,
        email: prefEmail.checked,
        darkTheme: prefDarkTheme.checked,
        language: prefLanguage.value,
        chunk: Number(prefChunk.value || 5)
      }
    };
    storage.set('userProfile', newProfile);
    alert('Settings saved.');
  });

  clearLocalData?.addEventListener('click', ()=>{
    if (confirm('Clear all local data for AI MOM? This will remove saved sessions, results, and auth.')){
      localStorage.removeItem('meetingMinutesSession');
      localStorage.removeItem('audioProcessingResults');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authUser');
      localStorage.removeItem('users');
      alert('Local data cleared.');
      location.href = './index.html';
    }
  });
})();
