# KnowledgeBank

Aplikasi bank pengetahuan pribadi dengan 12 koleksi, spaced repetition, ekspor/impor JSON, pilihan bahasa antarmuka, dan sinkronisasi Supabase.

## Menjalankan lokal

Klik `START LANGUAGE BANK.bat`. Launcher membuka server lokal di `http://127.0.0.1:8765/`.

## Cloud

- Database dan autentikasi: Supabase
- Source control: GitHub
- Hosting: Vercel
- Penyimpanan browser tetap digunakan sebagai fallback offline.

Data lokal dan cloud digabung berdasarkan identitas item saat sinkronisasi. Impor maupun sinkronisasi tidak menghapus koleksi yang sudah ada.
