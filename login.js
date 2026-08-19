(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const form=$('#loginForm'),email=$('#loginEmail'),password=$('#loginPassword'),confirmField=$('#confirmField'),confirmPassword=$('#confirmPassword'),submit=$('#submitLogin'),toggle=$('#toggleMode'),error=$('#loginError'),info=$('#loginInfo'),language=$('#loginLanguage');
  let signup=false;
  const next=()=>{const value=new URLSearchParams(location.search).get('next');if(!value)return './index.html';try{const url=new URL(value,location.href);return url.origin===location.origin?url.href:'./index.html';}catch{return'./index.html';}};
  function setMode(value){signup=value;confirmField.hidden=!value;confirmPassword.required=value;password.autocomplete=value?'new-password':'current-password';submit.textContent=value?'Daftar':'Masuk';toggle.textContent=value?'Sudah punya akun? Masuk':'Belum punya akun? Daftar';error.textContent='';info.textContent='';}
  toggle.addEventListener('click',()=>setMode(!signup));
  $('#localMode').addEventListener('click',()=>{sessionStorage.setItem('knowledgeBank.localAccess.v1','true');location.href=next();});
  language.value=window.LanguageBankI18n?.getLanguage()||'id';language.addEventListener('change',()=>window.LanguageBankI18n?.setLanguage(language.value));
  form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';info.textContent='';if(!form.reportValidity())return;if(signup&&password.value!==confirmPassword.value){error.textContent='Konfirmasi password tidak sama.';confirmPassword.focus();return;}submit.disabled=true;submit.textContent=signup?'Mendaftarkan...':'Memeriksa...';try{if(signup){const result=await window.KnowledgeBankCloud.signUp(email.value.trim(),password.value);if(!result.access_token){info.textContent='Akun berhasil dibuat. Periksa email untuk konfirmasi, lalu masuk.';setMode(false);return;}}else await window.KnowledgeBankCloud.signIn(email.value.trim(),password.value);sessionStorage.removeItem('knowledgeBank.localAccess.v1');location.replace(next());}catch(exception){error.textContent=exception.message;}finally{submit.disabled=false;submit.textContent=signup?'Daftar':'Masuk';}});
  if(window.KnowledgeBankCloud.getSession())location.replace(next());
})();
