(() => {
  'use strict';
  function labelTable(table) {
    const labels = [...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(row => {
      [...row.cells].forEach((cell, index) => cell.dataset.label = labels[index] || 'Data');
    });
  }
  function enhanceTables() {
    document.querySelectorAll('.word-table').forEach(labelTable);
  }
  let queued = false;
  const queueEnhancement = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; enhanceTables(); });
  };
  new MutationObserver(queueEnhancement).observe(document.documentElement, { childList: true, subtree: true });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', enhanceTables) : enhanceTables();
})();
