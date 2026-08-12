(() => {
  const DEBUG_KEY = 'dailyEnglishChunks.debug.chunkNaN.v1';
  const MAX_DEBUG_RECORDS = 20;
  let repairing = false;

  function saveDiagnostic(kind, node, extra = {}) {
    try {
      const current = JSON.parse(localStorage.getItem(DEBUG_KEY) || '[]');
      const records = Array.isArray(current) ? current : [];
      const parent = node?.parentElement || node;
      records.push({
        at: new Date().toISOString(),
        kind,
        path: parent instanceof Element ? cssPath(parent) : '',
        text: parent?.textContent || '',
        html: parent instanceof Element ? parent.outerHTML.slice(0, 1600) : '',
        step: document.querySelector('.step-label')?.textContent || '',
        lesson: document.querySelector('.focus-date')?.textContent || document.title,
        ...extra
      });
      localStorage.setItem(DEBUG_KEY, JSON.stringify(records.slice(-MAX_DEBUG_RECORDS)));
    } catch (_) {}
  }

  function cssPath(element) {
    if (!(element instanceof Element)) return '';
    const parts = [];
    let current = element;
    while (current && current !== document.body && parts.length < 6) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part += `#${current.id}`;
        parts.unshift(part);
        break;
      }
      if (current.classList.length) part += `.${[...current.classList].slice(0, 3).join('.')}`;
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function normalizeChunkCoordinates(root = document) {
    root.querySelectorAll?.('.chunk-editor').forEach(editor => {
      [...editor.querySelectorAll('.chunk-sentence')].forEach((sentence, sentenceIndex) => {
        sentence.dataset.sentenceIndex = String(sentenceIndex);
        [...sentence.querySelectorAll('.gap-button')].forEach((button, gapIndex) => {
          button.dataset.sentence = String(sentenceIndex);
          button.dataset.gap = String(gapIndex);
          const slash = button.querySelector('span');
          if (slash && slash.textContent !== '/') {
            saveDiagnostic('slash-corrupted', slash, { before: slash.textContent });
            slash.textContent = '/';
          }
        });
      });
    });
  }

  function repairClickedGap(button) {
    const sentence = button.closest('.chunk-sentence');
    const editor = button.closest('.chunk-editor');
    if (!sentence || !editor) {
      saveDiagnostic('missing-chunk-container', button);
      return false;
    }

    const sentenceIndex = [...editor.querySelectorAll('.chunk-sentence')].indexOf(sentence);
    const gapIndex = [...sentence.querySelectorAll('.gap-button')].indexOf(button);

    if (!Number.isInteger(sentenceIndex) || sentenceIndex < 0 || !Number.isInteger(gapIndex) || gapIndex < 0) {
      saveDiagnostic('invalid-dom-coordinate', button, { sentenceIndex, gapIndex });
      console.error('[chunk-guard] Invalid DOM coordinate', { sentenceIndex, gapIndex, button });
      return false;
    }

    const oldSentence = button.dataset.sentence;
    const oldGap = button.dataset.gap;
    button.dataset.sentence = String(sentenceIndex);
    button.dataset.gap = String(gapIndex);

    if (oldSentence !== button.dataset.sentence || oldGap !== button.dataset.gap) {
      saveDiagnostic('coordinate-repaired', button, {
        beforeSentence: oldSentence,
        beforeGap: oldGap,
        sentenceIndex,
        gapIndex
      });
    }
    return true;
  }

  function sanitizeVisibleNaN(root = document) {
    const targets = root.querySelectorAll?.('.chunk-editor, #chunkCompare') || [];
    targets.forEach(target => {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const broken = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/\bNaN\b/.test(node.nodeValue || '')) broken.push(node);
      }

      broken.forEach(node => {
        saveDiagnostic('visible-nan', node, { raw: node.nodeValue });
        const gap = node.parentElement?.closest('.gap-button');
        if (gap) {
          const slash = gap.querySelector('span');
          if (slash) slash.textContent = '/';
          if (node !== slash?.firstChild) node.nodeValue = (node.nodeValue || '').replace(/\bNaN\b/g, '');
          return;
        }
        node.nodeValue = (node.nodeValue || '').replace(/\bNaN\b/g, '');
      });
    });
  }

  function validateChunkDOM(root = document) {
    if (repairing) return;
    repairing = true;
    try {
      normalizeChunkCoordinates(root);
      sanitizeVisibleNaN(root);
    } finally {
      repairing = false;
    }
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('.gap-button');
    if (!button) return;
    repairClickedGap(button);
    sanitizeVisibleNaN(button.closest('.chunk-editor') || document);
  }, true);

  const app = document.getElementById('app');
  if (app) {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => validateChunkDOM(app));
    });
    observer.observe(app, { childList: true, subtree: true, characterData: true });
  }

  window.addEventListener('error', event => {
    if (!document.querySelector('.chunk-editor')) return;
    saveDiagnostic('window-error-on-chunk', document.querySelector('.chunk-editor'), {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  validateChunkDOM();
})();
