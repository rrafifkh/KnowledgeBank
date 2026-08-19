(() => {
  'use strict';
  const SESSION_KEY='knowledgeBank.supabase.session.v1';
  const LOCAL_KEY='knowledgeBank.localAccess.v1';
  const isLogin=/\/login(?:\.html)?$/i.test(location.pathname);
  if(isLogin)return;
  let session=null;
  try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{}
  const localAccess=sessionStorage.getItem(LOCAL_KEY)==='true';
  if(!session?.refresh_token&&!localAccess){
    const loginTarget=location.protocol==='file:'?'login.html':'login';
    const loginUrl=new URL(loginTarget,document.currentScript.src);
    loginUrl.searchParams.set('next',location.href);
    location.replace(loginUrl.href);
  }
})();
