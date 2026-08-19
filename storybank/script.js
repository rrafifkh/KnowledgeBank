(() => {
  'use strict';
  const STORAGE_KEY = 'storyBank.stories.v1';
  const $ = selector => document.querySelector(selector);
  let stories = load();
  let activeId = null;
  let toastTimer;

  const el = {
    grid: $('#storyGrid'), empty: $('#emptyState'), count: $('#storyCount'), categoryCount: $('#categoryCount'),
    search: $('#searchInput'), categoryFilter: $('#categoryFilter'), sort: $('#sortSelect'),
    formDialog: $('#formDialog'), form: $('#storyForm'), formTitle: $('#formTitle'), editId: $('#editId'),
    title: $('#titleInput'), category: $('#categoryInput'), content: $('#contentInput'), suggestions: $('#categorySuggestions'),
    reader: $('#readerDialog'), readerTitle: $('#readerTitle'), readerCategory: $('#readerCategory'), readerDate: $('#readerDate'), readerContent: $('#readerContent'),
    importInput: $('#importInput'), toast: $('#toast')
  };

  function load() {
    try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? data : []; }
    catch { return []; }
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stories)); return true; } catch { showToast('Data gagal disimpan.'); return false; } }
  const clean = value => value.trim().replace(/\s+/g, ' ');
  const canonical = value => clean(value).normalize('NFKC').toLocaleLowerCase('id-ID');
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function visibleStories() {
    const query = el.search.value.trim().toLocaleLowerCase('id-ID');
    const filtered = stories.filter(story => (!query || story.title.toLocaleLowerCase('id-ID').includes(query)) && (!el.categoryFilter.value || story.category === el.categoryFilter.value));
    return filtered.sort(el.sort.value === 'az' ? (a,b)=>a.title.localeCompare(b.title,'id') : el.sort.value === 'oldest' ? (a,b)=>new Date(a.createdAt)-new Date(b.createdAt) : (a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }
  function render() {
    const categories = [...new Set(stories.map(s=>s.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'));
    const selected = el.categoryFilter.value;
    el.categoryFilter.innerHTML = '<option value="">Semua kategori</option>'+categories.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
    if(categories.includes(selected)) el.categoryFilter.value=selected;
    el.suggestions.innerHTML=categories.map(c=>`<option value="${escapeHTML(c)}"></option>`).join('');
    el.count.textContent=stories.length; el.categoryCount.textContent=categories.length;
    const list=visibleStories();
    el.grid.innerHTML=list.map((s,index)=>`<article class="story-card" data-id="${escapeHTML(s.id)}" tabindex="0" role="button"><span class="story-number" aria-label="Cerita nomor ${index+1}">${String(index+1).padStart(2,'0')}</span><span class="story-bookmark" aria-hidden="true"></span><h2>${escapeHTML(s.title)}</h2><span class="story-hint">Klik untuk membaca</span></article>`).join('');
    el.grid.hidden=!list.length; el.empty.hidden=Boolean(list.length);
    if(window.parent!==window) window.parent.postMessage({type:'language-bank-count',storageKey:STORAGE_KEY,count:stories.length},'*');
  }
  function openForm(story=null){el.form.reset();el.editId.value=story?.id||'';el.formTitle.textContent=story?'Edit cerita':'Tambah cerita';if(story){el.title.value=story.title;el.category.value=story.category||'';el.content.value=story.content;}el.formDialog.showModal();setTimeout(()=>el.title.focus(),30);}
  function submit(event){event.preventDefault();const title=clean(el.title.value),content=el.content.value.trim();$('#titleError').textContent=title?'':'Judul perlu diisi.';$('#contentError').textContent=content?'':'Cerita perlu diisi.';if(!title||!content)return;const id=el.editId.value;const duplicate=stories.find(s=>s.id!==id&&canonical(s.title)===canonical(title));if(duplicate){$('#titleError').textContent='Judul cerita ini sudah ada.';el.title.focus();return;}const old=stories.find(s=>s.id===id);const story={id:id||(crypto.randomUUID?.()||`${Date.now()}`),title,category:clean(el.category.value),content,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};stories=id?stories.map(s=>s.id===id?story:s):[story,...stories];if(save()){el.formDialog.close();render();showToast('Cerita berhasil disimpan.');}}
  function openReader(id){const story=stories.find(s=>s.id===id);if(!story)return;activeId=id;el.readerTitle.textContent=story.title;el.readerCategory.textContent=story.category||'Tanpa kategori';el.readerDate.textContent=new Intl.DateTimeFormat('id-ID',{dateStyle:'long',timeStyle:'short'}).format(new Date(story.createdAt));el.readerContent.textContent=story.content;el.reader.showModal();}
  function exportData(){const payload={version:1,exportedAt:new Date().toISOString(),storageKey:STORAGE_KEY,stories};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`story-bank-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importData(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const incoming=Array.isArray(parsed)?parsed:parsed.stories;if(!Array.isArray(incoming))throw new Error();const seen=new Set(stories.map(s=>canonical(s.title)));const additions=incoming.filter(s=>s?.title&&s?.content&&!seen.has(canonical(s.title)));additions.forEach(s=>seen.add(canonical(s.title)));stories=[...stories,...additions];save();render();showToast(`${additions.length} cerita ditambahkan.`);}catch{alert('File Story Bank tidak valid.');}event.target.value='';};reader.readAsText(file);}
  function showToast(message){clearTimeout(toastTimer);el.toast.textContent=message;el.toast.classList.add('show');toastTimer=setTimeout(()=>el.toast.classList.remove('show'),2500);}

  $('#addStoryButton').addEventListener('click',()=>openForm());el.form.addEventListener('submit',submit);
  [el.search,el.categoryFilter,el.sort].forEach(x=>x.addEventListener('input',render));
  el.grid.addEventListener('click',e=>{const card=e.target.closest('.story-card');if(card)openReader(card.dataset.id);});
  el.grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.story-card'))openReader(e.target.dataset.id);});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`#${b.dataset.close}`).close()));
  $('#editStoryButton').addEventListener('click',()=>{const story=stories.find(s=>s.id===activeId);el.reader.close();openForm(story);});
  $('#deleteStoryButton').addEventListener('click',()=>{if(!activeId||!confirm('Hapus cerita ini?'))return;stories=stories.filter(s=>s.id!==activeId);save();el.reader.close();render();showToast('Cerita dihapus.');});
  $('#exportButton').addEventListener('click',exportData);$('#importButton').addEventListener('click',()=>el.importInput.click());el.importInput.addEventListener('change',importData);
  render();
})();
