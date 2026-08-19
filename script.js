(() => {
  'use strict';
  const banks = {
    english: 'englishBank.words.v1', mandarin: 'mandarinBank.words.v1', japan: 'japanBank.words.v1',
    indonesia: 'indonesiaBank.words.v1', music: 'musicBank.words.v1', psychology: 'psychologyBank.words.v1', story: 'storyBank.stories.v1',
    astronomy: 'astronomyBank.words.v1', political: 'politicalBank.words.v1', leader: 'leaderBank.words.v1', computerScience: 'computerScienceBank.words.v1',
    quote: 'quoteBank.quotes.v1'
  };
  const offlineCounts = {};
  const languageSelect = document.querySelector('#systemLanguageSelect');
  languageSelect.value = window.LanguageBankI18n?.getLanguage() || 'id';
  languageSelect.addEventListener('change', () => window.LanguageBankI18n?.setLanguage(languageSelect.value));
  function refreshCounts() {
    let total = 0;
    document.querySelectorAll('.bank-card').forEach(card => {
      if (location.protocol === 'file:') {
        const count = offlineCounts[card.dataset.storage];
        const unit = card.classList.contains('story') ? 'cerita' : card.classList.contains('quote') ? 'kutipan' : card.matches('.music, .psychology, .astronomy, .political, .leader, .computer-science') ? 'istilah' : 'kosakata';
        card.querySelector('[data-count]').textContent = Number.isInteger(count) ? `${count} ${unit}` : 'Memuat data...';
        if (Number.isInteger(count)) total += count;
        return;
      }
      let count = 0;
      try {
        const data = JSON.parse(localStorage.getItem(card.dataset.storage) || '[]');
        count = Array.isArray(data) ? data.length : 0;
      } catch { count = 0; }
      total += count;
      const unit = card.classList.contains('story') ? 'cerita' : card.classList.contains('quote') ? 'kutipan' : card.matches('.music, .psychology, .astronomy, .political, .leader, .computer-science') ? 'istilah' : 'kosakata';
      card.querySelector('[data-count]').textContent = `${count} ${unit}`;
    });
    document.querySelector('#totalItems').textContent = location.protocol === 'file:' ? `${total} total data · mode offline` : `${total} total data · mode stabil`;
  }

  async function ensureRecoveredBank(storageKey, file) {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(current) && current.length > 0) return;
      const response = await fetch(file, { cache: 'no-store' });
      if (!response.ok) return;
      const recovered = (await response.json()).words;
      if (Array.isArray(recovered) && recovered.length > 0) localStorage.setItem(storageKey, JSON.stringify(recovered));
    } catch { /* Individual bank recovery remains available. */ }
  }

  async function ensureRecoveredBanks() {
    await Promise.all([
      ensureRecoveredBank(banks.mandarin, './recovery/mandarin-recovered.json'),
      ensureRecoveredBank(banks.music, './recovery/music-recovered.json')
    ]);
    refreshCounts();
  }

  refreshCounts();
  ensureRecoveredBanks();
  window.addEventListener('pageshow', refreshCounts);
  window.addEventListener('focus', refreshCounts);
  window.addEventListener('storage', refreshCounts);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCounts(); });

  if (location.protocol === 'file:') {
    window.addEventListener('message', event => {
      const data = event.data;
      if (!data || data.type !== 'language-bank-count' || !Object.values(banks).includes(data.storageKey)) return;
      offlineCounts[data.storageKey] = Number(data.count) || 0;
      refreshCounts();
    });
    document.querySelectorAll('.bank-card').forEach(card => {
      const frame = document.createElement('iframe');
      frame.src = `${card.getAttribute('href')}?hub-count=1`;
      frame.title = '';
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;';
      document.body.appendChild(frame);
    });
  }

  function updateClock() {
    document.querySelector('#clock').textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date()).replace('.', ':');
  }
  updateClock();
  setInterval(updateClock, 30000);

  document.querySelector('#exportAllButton').addEventListener('click', () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), banks: {} };
    Object.entries(banks).forEach(([name, key]) => {
      try { data.banks[name] = JSON.parse(localStorage.getItem(key) || '[]'); }
      catch { data.banks[name] = []; }
    });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `language-bank-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const importInput = document.querySelector('#importAllInput');
  document.querySelector('#importAllButton').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.banks || typeof data.banks !== 'object') throw new Error();
        if (!confirm('Impor dan gabungkan backup dengan data yang sudah ada? Data lama tidak akan dihapus.')) return;
        Object.entries(banks).forEach(([name, key]) => {
          const items = data.banks[name];
          if (!Array.isArray(items) || items.length === 0) return;
          let existing = [];
          try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch { existing = []; }
          if (!Array.isArray(existing)) existing = [];
          const canonical = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
          const identity = item => name === 'quote' ? item.content : item.word || item.title;
          const seen = new Set(existing.map(item => canonical(identity(item))));
          const additions = items.filter(item => identity(item) && !seen.has(canonical(identity(item))));
          additions.forEach(item => seen.add(canonical(identity(item))));
          localStorage.setItem(key, JSON.stringify([...existing, ...additions]));
        });
        alert('Data berhasil digabungkan. Data lama tetap dipertahankan.');
        location.reload();
      } catch { alert('File backup Language Bank tidak valid.'); }
      event.target.value = '';
    };
    reader.readAsText(file);
  });
})();
