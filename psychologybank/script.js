(() => {
  'use strict';

  const STORAGE_KEY = 'psychologyBank.words.v1';
  let words = loadWords();
  let deleteTargetId = null;
  let reviewQueue = [];
  let reviewTotal = 0;
  let currentReviewFormat = 'flash';
  let toastTimer;

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    wordGrid: $('#wordGrid'), emptyState: $('#emptyState'), emptyTitle: $('#emptyTitle'), emptyCopy: $('#emptyCopy'),
    wordCount: $('#wordCount'), dueCount: $('#dueCount'), dueBadge: $('#dueBadge'),
    search: $('#searchInput'), categoryFilter: $('#categoryFilter'), sort: $('#sortSelect'),
    dialog: $('#wordDialog'), form: $('#wordForm'), dialogTitle: $('#dialogTitle'), editId: $('#editId'),
    word: $('#wordInput'), category: $('#categoryInput'), meaning: $('#meaningInput'), notes: $('#notesInput'),
    categorySuggestions: $('#categorySuggestions'),
    deleteDialog: $('#deleteDialog'), toast: $('#toast'), reviewDialog: $('#reviewDialog'),
    bankStats: $('#bankStats'), libraryPage: $('#libraryPage'), statisticsPage: $('#statisticsPage'),
    statisticsTotal: $('#statisticsTotal'), dailyChart: $('#dailyChart'), dailyEmpty: $('#dailyEmpty'),
    reviewProgress: $('#reviewProgress'), reviewWord: $('#reviewWord'),
    reviewAnswer: $('#reviewAnswer'), reviewMeaning: $('#reviewMeaning'), reviewNotes: $('#reviewNotes'),
    reviewMode: $('#reviewMode'), reviewPromptLabel: $('#reviewPromptLabel'), reviewCorrectWord: $('#reviewCorrectWord'),
    typeAnswerArea: $('#typeAnswerArea'), typedAnswer: $('#typedAnswer'), choiceAnswerArea: $('#choiceAnswerArea'),
    revealArea: $('#revealArea'), ratingArea: $('#ratingArea'), reviewComplete: $('#reviewComplete')
  };

  function loadWords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const value = JSON.parse(stored || '[]');
      if (!Array.isArray(value)) return [];
      const validWords = value.filter(item => item && item.id && item.word);
      const migratedWords = validWords.map(item => item.category ? item : { ...item, category: 'Dari Kamus' });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedWords));
      return migratedWords;
    } catch {
      return [];
    }
  }

  function saveWords() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
      return true;
    } catch {
      showToast('Penyimpanan browser penuh. Data belum tersimpan.');
      return false;
    }
  }

  function normalized(value) {
    return value.trim().replace(/\s+/g, ' ');
  }

  function canonicalWord(value) {
    return normalized(value).normalize('NFKC').toLocaleLowerCase('en-US');
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date).replace('.', ':');
  }

  function uniqueValues(key) {
    return [...new Set(words.map(item => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'));
  }

  function dueWords() {
    const now = Date.now();
    return words.filter(item => !item.review?.due || new Date(item.review.due).getTime() <= now);
  }

  function updateSelect(select, values, label) {
    const selected = select.value;
    select.innerHTML = `<option value="">Semua ${label}</option>` + values.map(value => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join('');
    if (values.includes(selected)) select.value = selected;
  }

  function updateSuggestions(list, values) {
    list.innerHTML = values.map(value => `<option value="${escapeHTML(value)}"></option>`).join('');
  }

  function renderControls() {
    const categories = uniqueValues('category');
    updateSelect(elements.categoryFilter, categories, 'kategori');
    updateSuggestions(elements.categorySuggestions, categories);
    elements.wordCount.textContent = words.length;
    const due = dueWords().length;
    elements.dueCount.textContent = due;
    elements.dueBadge.textContent = due;
    $('#startReviewButton').disabled = due === 0;
  }

  function localDayKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const get = type => parts.find(part => part.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function renderStatistics() {
    elements.statisticsTotal.textContent = words.length;
    const counts = words.reduce((result, item) => {
      const key = localDayKey(item.createdAt);
      if (key) result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
    const days = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
    const maximum = Math.max(1, ...days.map(([, count]) => count));
    elements.dailyEmpty.hidden = days.length > 0;
    elements.dailyChart.hidden = days.length === 0;
    elements.dailyChart.innerHTML = days.map(([date, count]) => {
      const label = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
      return `<div class="chart-row"><time datetime="${date}">${escapeHTML(label)}</time><div class="bar-track"><span style="width:${Math.max(3, count / maximum * 100)}%"></span></div><strong>${count}</strong></div>`;
    }).join('');
  }

  function showStatistics() {
    renderStatistics();
    elements.bankStats.hidden = true;
    elements.libraryPage.hidden = true;
    elements.statisticsPage.hidden = false;
  }

  function showLibrary() {
    elements.statisticsPage.hidden = true;
    elements.bankStats.hidden = false;
    elements.libraryPage.hidden = false;
  }

  function exportData() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), storageKey: STORAGE_KEY, words };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `${STORAGE_KEY.split('.')[0]}-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function importData(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try {
      const parsed = JSON.parse(reader.result); const imported = Array.isArray(parsed) ? parsed : parsed.words;
      if (!Array.isArray(imported)) throw new Error();
      const valid = imported.filter(item => item && item.id && item.word).map(item => item.category ? item : { ...item, category: 'Dari Kamus' });
      if (!confirm(`Impor dan gabungkan ${valid.length} data? Data lama tidak akan dihapus.`)) return;
      const seen = new Set(words.map(item => canonicalWord(item.word))); const additions = valid.filter(item => !seen.has(canonicalWord(item.word)));
      additions.forEach(item => seen.add(canonicalWord(item.word))); words = [...words, ...additions];
      saveWords(); render(); showToast(`${additions.length} data baru berhasil ditambahkan.`);
    } catch { alert('File data tidak valid.'); } event.target.value = ''; };
    reader.readAsText(file);
  }

  function visibleWords() {
    const query = elements.search.value.trim().toLocaleLowerCase('id');
    let result = words.filter(item => {
      const matchesQuery = !query || [item.word, item.meaning, item.category, item.notes].some(value => (value || '').toLocaleLowerCase('id').includes(query));
      return matchesQuery && (!elements.categoryFilter.value || item.category === elements.categoryFilter.value);
    });
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      az: (a, b) => a.word.localeCompare(b.word, 'id'),
      za: (a, b) => b.word.localeCompare(a.word, 'id')
    };
    return result.sort(sorters[elements.sort.value]);
  }

  function renderWords() {
    const result = visibleWords();
    elements.wordGrid.innerHTML = result.length ? `
      <div class="table-scroll">
        <table class="word-table">
          <thead><tr>
            <th class="number-column">No.</th><th>Istilah Psikologi</th><th>Definisi</th><th>Catatan</th><th class="date-column">Ditambahkan</th><th class="action-column">Aksi</th>
          </tr></thead>
          <tbody>${result.map((item, index) => `
            <tr class="word-card" data-id="${escapeHTML(item.id)}">
              <td class="number-cell">${index + 1}</td>
              <td class="word-cell">${escapeHTML(item.word)}</td>
              <td>${escapeHTML(item.meaning)}</td>
              <td class="notes-cell">${item.notes ? escapeHTML(item.notes) : '<span class="empty-value">—</span>'}</td>
              <td class="date-cell">${escapeHTML(formatDateTime(item.createdAt))}</td>
              <td class="table-actions">
                <div class="action-buttons">
                  <button class="card-action edit" type="button" aria-label="Edit ${escapeHTML(item.word)}" title="Edit">✎</button>
                  <button class="card-action delete" type="button" aria-label="Hapus ${escapeHTML(item.word)}" title="Hapus">×</button>
                </div>
              </td>
            </tr>`).join('')}</tbody>
        </table>
      </div>` : '';

    const hasFilters = elements.search.value || elements.categoryFilter.value;
    elements.emptyState.hidden = result.length > 0;
    elements.wordGrid.hidden = result.length === 0;
    elements.emptyTitle.textContent = hasFilters ? 'Tidak ada kata yang cocok' : 'Koleksimu masih kosong';
    elements.emptyCopy.textContent = hasFilters ? 'Coba kata kunci atau filter yang berbeda.' : 'Mulai dari satu kata yang sudah kamu kuasai.';
    $('#emptyAddButton').hidden = Boolean(hasFilters);
  }

  function render() {
    renderControls();
    renderWords();
    renderStatistics();
    if (window.parent !== window) window.parent.postMessage({ type: 'language-bank-count', storageKey: STORAGE_KEY, count: words.length }, '*');
  }

  function openForm(item = null) {
    elements.form.reset();
    elements.word.setCustomValidity('');
    clearErrors();
    elements.editId.value = item?.id || '';
    elements.dialogTitle.textContent = item ? 'Edit istilah' : 'Tambah istilah';
    if (item) {
      elements.word.value = item.word;
      elements.category.value = item.category || '';
      elements.meaning.value = item.meaning;
      elements.notes.value = item.notes || '';
    }
    elements.dialog.showModal();
    setTimeout(() => elements.word.focus(), 50);
  }

  function closeForm() { elements.dialog.close(); }

  function clearErrors() {
    elements.form.querySelectorAll('.field').forEach(field => field.classList.remove('invalid'));
    elements.form.querySelectorAll('.error').forEach(error => error.textContent = '');
  }

  function validateForm() {
    clearErrors();
    const fields = [
      [elements.word, 'Istilah psikologi perlu diisi.'], [elements.meaning, 'Definisi perlu diisi.']
    ];
    let valid = true;
    fields.forEach(([input, message]) => {
      if (!normalized(input.value)) {
        input.closest('.field').classList.add('invalid');
        input.closest('.field').querySelector('.error').textContent = message;
        if (valid) input.focus();
        valid = false;
      }
    });
    return valid;
  }

  function submitForm(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const id = elements.editId.value;
    const wordValue = normalized(elements.word.value);
    const duplicate = words.find(item => String(item.id) !== String(id) && canonicalWord(item.word) === canonicalWord(wordValue));
    if (duplicate) {
      elements.word.setCustomValidity('Istilah ini sudah tersimpan.');
      elements.word.closest('.field').classList.add('invalid');
      elements.word.closest('.field').querySelector('.error').textContent = `Istilah “${duplicate.word}” sudah tersimpan.`;
      elements.word.focus();
      elements.word.reportValidity();
      showToast('Istilah yang sama sudah ada di Psychology Bank.');
      return;
    }
    const existing = words.find(item => item.id === id);
    const item = {
      id: id || (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      word: wordValue, category: normalized(elements.category.value), meaning: normalized(elements.meaning.value),
      notes: elements.notes.value.trim(), review: existing?.review || null,
      createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    const nextWords = id ? words.map(word => word.id === id ? item : word) : [item, ...words];
    const previous = words;
    words = nextWords;
    if (!saveWords()) { words = previous; return; }
    closeForm();
    render();
    showToast(id ? 'Istilah berhasil diperbarui.' : 'Istilah berhasil disimpan.');
  }

  function requestDelete(id) {
    deleteTargetId = id;
    elements.deleteDialog.showModal();
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    const previous = words;
    words = words.filter(item => item.id !== deleteTargetId);
    if (!saveWords()) { words = previous; return; }
    deleteTargetId = null;
    elements.deleteDialog.close();
    render();
    showToast('Istilah telah dihapus.');
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2600);
  }

  function intervalPreview(item) {
    const review = item.review || {};
    const interval = Math.max(0, Number(review.interval) || 0);
    const ease = Math.max(1.3, Number(review.ease) || 2.5);
    const repetitions = Number(review.repetitions) || 0;
    return {
      again: '1 mnt',
      hard: `${Math.max(1, Math.round(interval * 1.2) || 1)} hari`,
      good: `${repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, Math.round(interval * ease))} hari`,
      easy: `${repetitions === 0 ? 4 : Math.max(4, Math.round(interval * (ease + .15)))} hari`
    };
  }

  function showReviewCard() {
    const item = reviewQueue[0];
    if (!item) {
      $('.review-progress').hidden = true;
      $('.review-card').hidden = true;
      elements.revealArea.hidden = true;
      elements.ratingArea.hidden = true;
      elements.reviewComplete.hidden = false;
      render();
      return;
    }
    $('.review-progress').hidden = false;
    $('.review-card').hidden = false;
    elements.reviewComplete.hidden = true;
    elements.reviewAnswer.hidden = true;
    elements.typeAnswerArea.hidden = true;
    elements.choiceAnswerArea.hidden = true;
    elements.reviewCorrectWord.hidden = true;
    elements.ratingArea.hidden = true;
    elements.reviewProgress.textContent = `${reviewTotal - reviewQueue.length + 1} / ${reviewTotal}`;
    currentReviewFormat = elements.reviewMode.value === 'mixed' ? ['flash', 'type', 'choice'][Math.floor(Math.random() * 3)] : elements.reviewMode.value;
    elements.reviewPromptLabel.textContent = currentReviewFormat === 'type' ? 'DEFINISI' : 'ISTILAH';
    elements.reviewWord.textContent = currentReviewFormat === 'type' ? item.meaning : item.word;
    elements.reviewMeaning.textContent = item.meaning;
    elements.reviewNotes.textContent = item.notes || '';
    elements.reviewNotes.hidden = !item.notes;
    elements.revealArea.hidden = currentReviewFormat !== 'flash';
    if (currentReviewFormat === 'type') {
      elements.typeAnswerArea.hidden = false;
      elements.typedAnswer.value = '';
      setTimeout(() => elements.typedAnswer.focus(), 30);
    }
    if (currentReviewFormat === 'choice') {
      elements.choiceAnswerArea.hidden = false;
      const alternatives = [...new Set(words.filter(word => word.id !== item.id && word.meaning !== item.meaning).map(word => word.meaning))].sort(() => Math.random() - .5).slice(0, 3);
      const choices = [item.meaning, ...alternatives].sort(() => Math.random() - .5);
      elements.choiceAnswerArea.innerHTML = choices.map(choice => `<button class="button choice-option" type="button" data-correct="${choice === item.meaning}">${escapeHTML(choice)}</button>`).join('');
    }
    const preview = intervalPreview(item);
    Object.entries(preview).forEach(([rating, label]) => $(`#${rating}Interval`).textContent = label);
  }

  function startReview() {
    reviewQueue = dueWords().sort(() => Math.random() - .5);
    reviewTotal = reviewQueue.length;
    if (!reviewTotal) return;
    elements.reviewDialog.showModal();
    showReviewCard();
  }

  function revealAnswer() {
    const item = reviewQueue[0];
    if (!item) return;
    elements.reviewAnswer.hidden = false;
    elements.reviewCorrectWord.textContent = item.word;
    elements.reviewCorrectWord.hidden = currentReviewFormat === 'flash';
    elements.typeAnswerArea.hidden = true;
    elements.revealArea.hidden = true;
    elements.ratingArea.hidden = false;
  }

  function checkTypedAnswer() {
    const item = reviewQueue[0];
    if (!item || !elements.typedAnswer.value.trim()) return;
    const correct = canonicalWord(elements.typedAnswer.value) === canonicalWord(item.word);
    showToast(correct ? 'Jawaban benar.' : `Belum tepat. Jawaban: ${item.word}`);
    revealAnswer();
  }

  function checkChoice(event) {
    const button = event.target.closest('.choice-option');
    if (!button) return;
    elements.choiceAnswerArea.querySelectorAll('.choice-option').forEach(option => {
      option.disabled = true;
      if (option.dataset.correct === 'true') option.classList.add('correct');
    });
    if (button.dataset.correct !== 'true') button.classList.add('wrong');
    showToast(button.dataset.correct === 'true' ? 'Jawaban benar.' : 'Jawaban belum tepat.');
    revealAnswer();
  }

  function rateCard(rating) {
    const current = reviewQueue.shift();
    if (!current) return;
    const old = current.review || {};
    let interval = Math.max(0, Number(old.interval) || 0);
    let ease = Math.max(1.3, Number(old.ease) || 2.5);
    let repetitions = Number(old.repetitions) || 0;
    let dueMs;
    if (rating === 'again') {
      repetitions = 0;
      interval = 0;
      ease = Math.max(1.3, ease - .2);
      dueMs = Date.now() + 60 * 1000;
    } else if (rating === 'hard') {
      interval = Math.max(1, Math.round(interval * 1.2) || 1);
      ease = Math.max(1.3, ease - .15);
      repetitions += 1;
      dueMs = Date.now() + interval * 86400000;
    } else if (rating === 'good') {
      interval = repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, Math.round(interval * ease));
      repetitions += 1;
      dueMs = Date.now() + interval * 86400000;
    } else {
      interval = repetitions === 0 ? 4 : Math.max(4, Math.round(interval * (ease + .15)));
      ease += .15;
      repetitions += 1;
      dueMs = Date.now() + interval * 86400000;
    }
    const updated = { ...current, review: { interval, ease, repetitions, due: new Date(dueMs).toISOString(), lastRating: rating, reviewedAt: new Date().toISOString() } };
    words = words.map(item => item.id === current.id ? updated : item);
    saveWords();
    showReviewCard();
  }

  $('#openFormButton').addEventListener('click', () => openForm());
  $('#openStatsButton').addEventListener('click', showStatistics);
  $('#backToBankButton').addEventListener('click', showLibrary);
  $('.exportDataButton').addEventListener('click', exportData);
  $('.importDataButton').addEventListener('click', () => $('.importDataInput').click());
  $('.importDataInput').addEventListener('change', importData);
  $('#emptyAddButton').addEventListener('click', () => openForm());
  $('#closeDialogButton').addEventListener('click', closeForm);
  $('#cancelButton').addEventListener('click', closeForm);
  elements.form.addEventListener('submit', submitForm);
  elements.word.addEventListener('input', () => elements.word.setCustomValidity(''));
  elements.meaning.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      elements.form.requestSubmit();
    }
  });
  [elements.search, elements.categoryFilter, elements.sort].forEach(control => control.addEventListener('input', renderWords));
  elements.wordGrid.addEventListener('click', event => {
    const card = event.target.closest('.word-card');
    if (!card) return;
    const item = words.find(word => word.id === card.dataset.id);
    if (event.target.closest('.edit')) openForm(item);
    if (event.target.closest('.delete')) requestDelete(item.id);
  });
  $('#cancelDeleteButton').addEventListener('click', () => { deleteTargetId = null; elements.deleteDialog.close(); });
  $('#confirmDeleteButton').addEventListener('click', confirmDelete);
  $('#startReviewButton').addEventListener('click', startReview);
  $('#showAnswerButton').addEventListener('click', revealAnswer);
  $('#checkTypedButton').addEventListener('click', checkTypedAnswer);
  elements.typedAnswer.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.isComposing) checkTypedAnswer(); });
  elements.choiceAnswerArea.addEventListener('click', checkChoice);
  elements.reviewMode.addEventListener('change', showReviewCard);
  $('#closeReviewButton').addEventListener('click', () => elements.reviewDialog.close());
  $('#finishReviewButton').addEventListener('click', () => elements.reviewDialog.close());
  elements.ratingArea.addEventListener('click', event => {
    const button = event.target.closest('[data-rating]');
    if (button) rateCard(button.dataset.rating);
  });
  [elements.dialog, elements.deleteDialog].forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  }));

  render();
})();
