(() => {
  'use strict';
  const config = window.KNOWLEDGE_BANK_CONFIG || {};
  const SESSION_KEY = 'knowledgeBank.supabase.session.v1';
  const BANK_KEYS = [
    'englishBank.words.v1','mandarinBank.words.v1','japanBank.words.v1','indonesiaBank.words.v1',
    'musicBank.words.v1','psychologyBank.words.v1','storyBank.stories.v1','astronomyBank.words.v1',
    'politicalBank.words.v1','leaderBank.words.v1','computerScienceBank.words.v1','quoteBank.quotes.v1'
  ];
  const nativeSetItem = Storage.prototype.setItem;
  let session = loadSession();
  let cloudReady = false;
  let syncing = false;
  const timers = new Map();

  function loadSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
  function saveSession(value) { session=value; value ? nativeSetItem.call(localStorage,SESSION_KEY,JSON.stringify(value)) : localStorage.removeItem(SESSION_KEY); updateUI(); }
  function headers(auth=true) { const result={apikey:config.supabaseKey,'Content-Type':'application/json'}; if(auth&&session?.access_token)result.Authorization=`Bearer ${session.access_token}`; return result; }
  async function api(path,options={}) { const response=await fetch(`${config.supabaseUrl}${path}`,{...options,headers:{...headers(options.auth!==false),...(options.headers||{})}}); const text=await response.text(); let data=null; try{data=text?JSON.parse(text):null;}catch{data=text;} if(!response.ok)throw new Error(data?.msg||data?.message||data?.error_description||`Cloud error ${response.status}`); return data; }
  const clean=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();
  function identity(key,item){ if(key==='quoteBank.quotes.v1')return item.content; return item.word||item.title; }
  function merge(key,local,remote){ const map=new Map(); [...(Array.isArray(remote)?remote:[]),...(Array.isArray(local)?local:[])].forEach(item=>{const id=clean(identity(key,item));if(!id)return;const old=map.get(id);const itemTime=new Date(item.updatedAt||item.createdAt||0).getTime();const oldTime=new Date(old?.updatedAt||old?.createdAt||0).getTime();if(!old||itemTime>=oldTime)map.set(id,item);});return [...map.values()]; }
  function localData(key){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data:[];}catch{return[];}}
  async function ensureFreshSession(){if(!session?.refresh_token)return false;const expires=(session.expires_at||0)*1000;if(expires>Date.now()+60000)return true;const data=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',auth:false,body:JSON.stringify({refresh_token:session.refresh_token})});saveSession(data);return true;}
  async function signIn(email,password){const data=await api('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:JSON.stringify({email,password})});saveSession(data);await syncAll();return data;}
  async function signUp(email,password){const data=await api('/auth/v1/signup',{method:'POST',auth:false,body:JSON.stringify({email,password})});if(data.access_token){saveSession(data);await syncAll();}return data;}
  function signOut(){saveSession(null);cloudReady=false;setStatus('Mode lokal');}
  async function pushBank(key){if(!session||!cloudReady||!BANK_KEYS.includes(key))return;await ensureFreshSession();await api('/rest/v1/bank_snapshots?on_conflict=user_id,bank_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:session.user.id,bank_key:key,payload:localData(key),updated_at:new Date().toISOString()})});setStatus('Tersimpan di cloud');}
  async function syncAll(){if(!session||syncing)return;if(!config.supabaseUrl||!config.supabaseKey)throw new Error('Konfigurasi Supabase belum tersedia.');syncing=true;setStatus('Menyinkronkan...');try{await ensureFreshSession();const rows=await api('/rest/v1/bank_snapshots?select=bank_key,payload,updated_at');const remote=new Map((rows||[]).map(row=>[row.bank_key,row.payload]));const payload=[];let localChanged=false;BANK_KEYS.forEach(key=>{const before=JSON.stringify(localData(key));const merged=merge(key,JSON.parse(before),remote.get(key));const after=JSON.stringify(merged);if(before!==after)localChanged=true;nativeSetItem.call(localStorage,key,after);payload.push({user_id:session.user.id,bank_key:key,payload:merged,updated_at:new Date().toISOString()});});await api('/rest/v1/bank_snapshots?on_conflict=user_id,bank_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)});cloudReady=true;setStatus('Sinkron selesai');window.dispatchEvent(new CustomEvent('knowledgebank:cloudsynced'));if(localChanged&&!document.querySelector('#cloudAccountButton'))location.reload();return payload;}finally{syncing=false;updateUI();}}
  Storage.prototype.setItem=function(key,value){nativeSetItem.call(this,key,value);if(this===localStorage&&BANK_KEYS.includes(key)&&session&&cloudReady){clearTimeout(timers.get(key));timers.set(key,setTimeout(()=>pushBank(key).catch(error=>setStatus(error.message,true)),700));}};
  function setStatus(message,error=false){const element=document.querySelector('#cloudStatus');if(element){element.textContent=message;element.classList.toggle('error',error);}}
  function updateUI(){const account=document.querySelector('#cloudAccountButton'),sync=document.querySelector('#cloudSyncButton');if(account)account.textContent=session?.user?.email?'Akun cloud':'Masuk cloud';if(sync){sync.hidden=!session;sync.disabled=syncing;}if(session)setStatus(cloudReady?'Cloud aktif':'Cloud terhubung');}
  function bindUI(){const dialog=document.querySelector('#cloudDialog'),form=document.querySelector('#cloudForm'),account=document.querySelector('#cloudAccountButton'),sync=document.querySelector('#cloudSyncButton'),logout=document.querySelector('#cloudLogoutButton');if(!dialog||!form)return;account?.addEventListener('click',()=>{if(session){dialog.showModal();}else{dialog.showModal();setTimeout(()=>document.querySelector('#cloudEmail')?.focus(),20);}});document.querySelectorAll('[data-close-cloud]').forEach(button=>button.addEventListener('click',()=>dialog.close()));sync?.addEventListener('click',()=>syncAll().then(()=>location.reload()).catch(error=>setStatus(error.message,true)));logout?.addEventListener('click',()=>{signOut();dialog.close();});form.addEventListener('submit',async event=>{event.preventDefault();const email=document.querySelector('#cloudEmail').value.trim(),password=document.querySelector('#cloudPassword').value,mode=event.submitter?.value||'signin',error=document.querySelector('#cloudError');error.textContent='';try{if(mode==='signup'){const data=await signUp(email,password);if(!data.access_token){error.textContent='Akun dibuat. Periksa email untuk konfirmasi.';return;}}else await signIn(email,password);dialog.close();location.reload();}catch(exception){error.textContent=exception.message;}});updateUI();if(session)syncAll().catch(error=>setStatus(error.message,true));}
  window.KnowledgeBankCloud={signIn,signUp,signOut,syncAll,getSession:()=>session};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindUI);else bindUI();
})();
