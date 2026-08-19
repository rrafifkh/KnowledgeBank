(() => {
  'use strict';
  const KEY = 'languageBank.systemLanguage.v1';
  const supported = ['id', 'en', 'ja', 'zh'];
  const dictionaries = {
    en: {
      'Bank Hub':'Bank Hub','File':'File','View':'View','Help':'Help','Bahasa':'Language','Pilih bank belajar':'Choose a learning bank','Semua koleksi tersedia dari satu tempat.':'All collections are available in one place.','Informasi':'Information','Data setiap bank disimpan terpisah di browser Anda.':'Each bank is stored separately in your browser.','Selamat datang':'Welcome','Pilih bank yang ingin dibuka':'Choose a bank to open','Ekspor Semua':'Export All','Impor Semua':'Import All','bank tersedia':'banks available','total data':'total items','mode stabil':'stable mode','mode offline':'offline mode','Buka bank':'Open bank','Memuat data...':'Loading data...','Pengaturan bahasa':'System language','Kosakata bahasa Inggris':'English vocabulary','Hanzi, Pinyin, dan arti':'Hanzi, Pinyin, and meanings','Kanji, Kana, dan Romaji':'Kanji, Kana, and Romaji','Kosakata bahasa Indonesia':'Indonesian vocabulary','Istilah dan pengetahuan musik':'Music terms and knowledge','Istilah dan konsep psikologi':'Psychology terms and concepts','Koleksi cerita pribadi':'Personal story collection','Istilah dan konsep astronomi':'Astronomy terms and concepts','Istilah dan konsep politik':'Political terms and concepts','Istilah dan konsep kepemimpinan':'Leadership terms and concepts','Istilah dan konsep ilmu komputer':'Computer science terms and concepts','Koleksi kutipan pilihan':'Selected quote collection',
      'Kosakata':'Vocabulary','Istilah':'Terms','Koleksi Cerita':'Story Collection','Koleksi Kutipan':'Quote Collection','Statistik':'Statistics','Review':'Review','Jatuh tempo':'Due','Tambah kosakata':'Add vocabulary','Tambah istilah':'Add term','Tambah cerita':'Add story','Tambah kutipan':'Add quote','Semua kategori':'All categories','Terbaru':'Newest','Terlama':'Oldest','Ekspor':'Export','Impor':'Import','Ditambahkan':'Added','Aksi':'Actions','Catatan':'Notes','Definisi':'Definition','Arti':'Meaning','Kategori':'Category','Kategori opsional':'Optional category','Batal':'Cancel','Simpan kosakata':'Save vocabulary','Simpan istilah':'Save term','Simpan cerita':'Save story','Simpan kutipan':'Save quote','Hapus':'Delete','Edit':'Edit','Tutup':'Close','Tanpa kategori':'Uncategorized','Ketik jawaban':'Type answer','Pilihan ganda':'Multiple choice','Tampilkan jawaban':'Show answer','Review selesai':'Review complete','Semua kartu yang jatuh tempo sudah dipelajari.':'All due cards have been reviewed.','Mudah':'Easy','Sulit':'Hard','Lagi':'Again','Bagus':'Good',
      'Belum ada cerita':'No stories yet','Belum ada kutipan':'No quotes yet','Koleksimu masih kosong':'Your collection is empty','Mulai dari satu kata yang sudah kamu kuasai.':'Start with one word you already know.','Tambah kata pertama':'Add the first word','Klik untuk membaca':'Click to read','Tokoh / sumber':'Author / source','Kutipan':'Quote','Cerita':'Story','Judul':'Title','Cari kutipan atau tokoh...':'Search quotes or authors...','Cari judul cerita...':'Search story titles...','Cari kata atau arti...':'Search words or meanings...','Cari istilah atau definisi...':'Search terms or definitions...'
    },
    ja: {
      'Bank Hub':'バンクハブ','File':'ファイル','View':'表示','Help':'ヘルプ','Bahasa':'言語','Pilih bank belajar':'学習バンクを選択','Semua koleksi tersedia dari satu tempat。':'すべてのコレクションを一か所から利用できます。','Semua koleksi tersedia dari satu tempat.':'すべてのコレクションを一か所から利用できます。','Informasi':'情報','Data setiap bank disimpan terpisah di browser Anda.':'各バンクのデータはブラウザに個別保存されます。','Selamat datang':'ようこそ','Pilih bank yang ingin dibuka':'開くバンクを選択','Ekspor Semua':'すべてエクスポート','Impor Semua':'すべてインポート','bank tersedia':'個のバンク','total data':'合計データ','mode stabil':'安定モード','mode offline':'オフラインモード','Buka bank':'バンクを開く','Memuat data...':'読み込み中...','Pengaturan bahasa':'システム言語','Kosakata bahasa Inggris':'英語の単語','Hanzi, Pinyin, dan arti':'漢字・ピンイン・意味','Kanji, Kana, dan Romaji':'漢字・仮名・ローマ字','Kosakata bahasa Indonesia':'インドネシア語の単語','Istilah dan pengetahuan musik':'音楽の用語と知識','Istilah dan konsep psikologi':'心理学の用語と概念','Koleksi cerita pribadi':'個人の物語集','Istilah dan konsep astronomi':'天文学の用語と概念','Istilah dan konsep politik':'政治の用語と概念','Istilah dan konsep kepemimpinan':'リーダーシップの用語と概念','Istilah dan konsep ilmu komputer':'コンピュータ科学の用語と概念','Koleksi kutipan pilihan':'選んだ名言集',
      'Kosakata':'単語','Istilah':'用語','Koleksi Cerita':'ストーリー集','Koleksi Kutipan':'名言集','Statistik':'統計','Review':'復習','Jatuh tempo':'復習期限','Tambah kosakata':'単語を追加','Tambah istilah':'用語を追加','Tambah cerita':'物語を追加','Tambah kutipan':'名言を追加','Semua kategori':'すべてのカテゴリー','Terbaru':'新しい順','Terlama':'古い順','Ekspor':'エクスポート','Impor':'インポート','Ditambahkan':'追加日時','Aksi':'操作','Catatan':'メモ','Definisi':'定義','Arti':'意味','Kategori':'カテゴリー','Batal':'キャンセル','Simpan kosakata':'単語を保存','Simpan istilah':'用語を保存','Simpan cerita':'物語を保存','Simpan kutipan':'名言を保存','Hapus':'削除','Edit':'編集','Tutup':'閉じる','Tanpa kategori':'カテゴリーなし','Ketik jawaban':'答えを入力','Pilihan ganda':'選択問題','Tampilkan jawaban':'答えを表示','Review selesai':'復習完了','Semua kartu yang jatuh tempo sudah dipelajari.':'期限のカードをすべて復習しました。','Mudah':'簡単','Sulit':'難しい','Lagi':'もう一度','Bagus':'良い',
      'Belum ada cerita':'物語はまだありません','Belum ada kutipan':'名言はまだありません','Koleksimu masih kosong':'コレクションは空です','Mulai dari satu kata yang sudah kamu kuasai.':'覚えている単語から始めましょう。','Tambah kata pertama':'最初の単語を追加','Klik untuk membaca':'クリックして読む','Tokoh / sumber':'人物・出典','Kutipan':'名言','Cerita':'物語','Judul':'タイトル','Cari kutipan atau tokoh...':'名言や人物を検索...','Cari judul cerita...':'物語のタイトルを検索...','Cari kata atau arti...':'単語や意味を検索...','Cari istilah atau definisi...':'用語や定義を検索...'
    },
    zh: {
      'Bank Hub':'学习库中心','File':'文件','View':'查看','Help':'帮助','Bahasa':'语言','Pilih bank belajar':'选择学习库','Semua koleksi tersedia dari satu tempat.':'所有收藏都可从这里访问。','Informasi':'信息','Data setiap bank disimpan terpisah di browser Anda.':'每个学习库的数据分别保存在浏览器中。','Selamat datang':'欢迎','Pilih bank yang ingin dibuka':'选择要打开的学习库','Ekspor Semua':'全部导出','Impor Semua':'全部导入','bank tersedia':'个学习库','total data':'条数据','mode stabil':'稳定模式','mode offline':'离线模式','Buka bank':'打开学习库','Memuat data...':'正在加载...','Pengaturan bahasa':'系统语言','Kosakata bahasa Inggris':'英语词汇','Hanzi, Pinyin, dan arti':'汉字、拼音和意思','Kanji, Kana, dan Romaji':'汉字、假名和罗马字','Kosakata bahasa Indonesia':'印度尼西亚语词汇','Istilah dan pengetahuan musik':'音乐术语与知识','Istilah dan konsep psikologi':'心理学术语与概念','Koleksi cerita pribadi':'个人故事集','Istilah dan konsep astronomi':'天文学术语与概念','Istilah dan konsep politik':'政治术语与概念','Istilah dan konsep kepemimpinan':'领导力术语与概念','Istilah dan konsep ilmu komputer':'计算机科学术语与概念','Koleksi kutipan pilihan':'精选名言集',
      'Kosakata':'词汇','Istilah':'术语','Koleksi Cerita':'故事集','Koleksi Kutipan':'名言集','Statistik':'统计','Review':'复习','Jatuh tempo':'待复习','Tambah kosakata':'添加词汇','Tambah istilah':'添加术语','Tambah cerita':'添加故事','Tambah kutipan':'添加名言','Semua kategori':'所有分类','Terbaru':'最新','Terlama':'最早','Ekspor':'导出','Impor':'导入','Ditambahkan':'添加时间','Aksi':'操作','Catatan':'备注','Definisi':'定义','Arti':'意思','Kategori':'分类','Batal':'取消','Simpan kosakata':'保存词汇','Simpan istilah':'保存术语','Simpan cerita':'保存故事','Simpan kutipan':'保存名言','Hapus':'删除','Edit':'编辑','Tutup':'关闭','Tanpa kategori':'未分类','Ketik jawaban':'输入答案','Pilihan ganda':'选择题','Tampilkan jawaban':'显示答案','Review selesai':'复习完成','Semua kartu yang jatuh tempo sudah dipelajari.':'所有到期卡片均已复习。','Mudah':'简单','Sulit':'困难','Lagi':'重来','Bagus':'良好',
      'Belum ada cerita':'暂无故事','Belum ada kutipan':'暂无名言','Koleksimu masih kosong':'收藏还是空的','Mulai dari satu kata yang sudah kamu kuasai.':'从一个已经掌握的词开始。','Tambah kata pertama':'添加第一个词','Klik untuk membaca':'点击阅读','Tokoh / sumber':'人物／来源','Kutipan':'名言','Cerita':'故事','Judul':'标题','Cari kutipan atau tokoh...':'搜索名言或人物...','Cari judul cerita...':'搜索故事标题...','Cari kata atau arti...':'搜索词语或意思...','Cari istilah atau definisi...':'搜索术语或定义...'
    }
  };
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let applying = false;
  const language = () => { const value = localStorage.getItem(KEY) || 'id'; return supported.includes(value) ? value : 'id'; };
  function translate(value, lang) {
    if (lang === 'id' || !value) return value;
    const dictionary = dictionaries[lang];
    const trimmed = value.trim();
    if (dictionary[trimmed]) return value.replace(trimmed, dictionary[trimmed]);
    let output = value;
    const rules = [
      [/\b(\d+) bank tersedia\b/g,(_,n)=>lang==='en'?`${n} banks available`:lang==='ja'?`${n} 個のバンク`: `${n} 个学习库`],
      [/\b(\d+) total data\b/g,(_,n)=>lang==='en'?`${n} total items`:lang==='ja'?`合計 ${n} 件`: `共 ${n} 条数据`],
      [/\b(\d+) kosakata\b/g,(_,n)=>lang==='en'?`${n} words`:lang==='ja'?`${n} 単語`:`${n} 个词汇`],
      [/\b(\d+) istilah\b/g,(_,n)=>lang==='en'?`${n} terms`:lang==='ja'?`${n} 用語`:`${n} 个术语`],
      [/\b(\d+) cerita\b/g,(_,n)=>lang==='en'?`${n} stories`:lang==='ja'?`${n} 件の物語`:`${n} 个故事`],
      [/\b(\d+) kutipan\b/g,(_,n)=>lang==='en'?`${n} quotes`:lang==='ja'?`${n} 件の名言`:`${n} 条名言`],
      [/\b(\d+) kategori\b/g,(_,n)=>lang==='en'?`${n} categories`:lang==='ja'?`${n} カテゴリー`:`${n} 个分类`]
    ];
    rules.forEach(([pattern,replacer]) => { output = output.replace(pattern,replacer); });
    Object.entries(dictionary).sort((a,b)=>b[0].length-a[0].length).forEach(([from,to])=>{ if(output.includes(from)) output=output.split(from).join(to); });
    return output;
  }
  function apply(root=document) {
    if (applying) return;
    applying = true;
    const lang = language();
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{ if(!node.parentElement||node.parentElement.matches('script,style'))return; if(!originalText.has(node)) originalText.set(node,node.nodeValue); node.nodeValue=translate(originalText.get(node),lang); });
    const elements = root.querySelectorAll ? [root,...root.querySelectorAll('[placeholder],[title],[aria-label]')] : [];
    elements.forEach(element=>{ if(!(element instanceof Element))return; if(!originalAttributes.has(element)) originalAttributes.set(element,{}); const saved=originalAttributes.get(element); ['placeholder','title','aria-label'].forEach(attr=>{ if(!element.hasAttribute(attr))return; if(!(attr in saved)) saved[attr]=element.getAttribute(attr); element.setAttribute(attr,translate(saved[attr],lang)); }); });
    const selector=document.querySelector('#systemLanguageSelect'); if(selector) selector.value=lang;
    applying=false;
  }
  function setLanguage(lang){ if(!supported.includes(lang))return; localStorage.setItem(KEY,lang); apply(document); window.dispatchEvent(new CustomEvent('languagebank:languagechange',{detail:{language:lang}})); }
  const observer=new MutationObserver(records=>{ if(applying)return; records.forEach(record=>record.addedNodes.forEach(node=>{ if(node.nodeType===Node.ELEMENT_NODE)apply(node); else if(node.nodeType===Node.TEXT_NODE&&node.parentElement)apply(node.parentElement); })); });
  const nativeAlert=window.alert.bind(window), nativeConfirm=window.confirm.bind(window);
  window.alert=message=>nativeAlert(translate(String(message),language()));
  window.confirm=message=>nativeConfirm(translate(String(message),language()));
  window.LanguageBankI18n={getLanguage:language,setLanguage,apply,translate:value=>translate(value,language())};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();observer.observe(document.body,{childList:true,subtree:true});}); else {apply();observer.observe(document.body,{childList:true,subtree:true});}
})();
