(() => {
  const DEBUG_KEY = 'dailyEnglishChunks.debug.chunkNaN.v2';
  const MAX_DEBUG_RECORDS = 30;
  let repairing = false;

  function saveDiagnostic(kind, node, extra = {}) {
    try {
      const current = JSON.parse(localStorage.getItem(DEBUG_KEY) || '[]');
      const records = Array.isArray(current) ? current : [];
      const element = node instanceof Element ? node : node?.parentElement;
      records.push({
        at: new Date().toISOString(),
        kind,
        path: element ? cssPath(element) : '',
        text: element?.textContent || node?.nodeValue || '',
        html: element?.outerHTML?.slice(0, 1800) || '',
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

  function ensureSlashStructure(button) {
    const children = [...button.childNodes];
    const span = button.querySelector(':scope > span');
    const valid = children.length === 1 && span && span.textContent === '/';
    if (valid) return;

    saveDiagnostic('gap-structure-rebuilt', button, {
      beforeText: button.textContent,
      beforeHtml: button.innerHTML
    });

    const slash = document.createElement('span');
    slash.textContent = '/';
    button.replaceChildren(slash);
  }

  function normalizeChunkDOM(root = document) {
    root.querySelectorAll?.('.chunk-editor').forEach(editor => {
      [...editor.querySelectorAll('.chunk-sentence')].forEach((sentence, sentenceIndex) => {
        const sentenceValue = String(sentenceIndex);
        if (sentence.dataset.sentenceIndex !== sentenceValue) sentence.dataset.sentenceIndex = sentenceValue;

        [...sentence.querySelectorAll('.gap-button')].forEach((button, gapIndex) => {
          const gapValue = String(gapIndex);
          if (button.dataset.sentence !== sentenceValue) button.dataset.sentence = sentenceValue;
          if (button.dataset.gap !== gapValue) button.dataset.gap = gapValue;

          const expectedLabel = `${gapIndex + 1}語目の後で区切る`;
          if (button.getAttribute('aria-label') !== expectedLabel) button.setAttribute('aria-label', expectedLabel);

          ensureSlashStructure(button);

          [...button.attributes].forEach(attribute => {
            if (/\bNaN\b/.test(attribute.value)) {
              saveDiagnostic('nan-attribute', button, { name: attribute.name, value: attribute.value });
              if (attribute.name === 'data-sentence') button.dataset.sentence = sentenceValue;
              else if (attribute.name === 'data-gap') button.dataset.gap = gapValue;
              else if (attribute.name === 'aria-label') button.setAttribute('aria-label', expectedLabel);
              else button.removeAttribute(attribute.name);
            }
          });
        });
      });
    });
  }

  function sanitizeChunkText(root = document) {
    const targets = root.querySelectorAll?.('.chunk-editor, #chunkCompare, #hintBox') || [];
    targets.forEach(target => {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const broken = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/\bNaN\b/i.test(node.nodeValue || '')) broken.push(node);
      }

      broken.forEach(node => {
        const gap = node.parentElement?.closest('.gap-button');
        saveDiagnostic('visible-nan', node, { raw: node.nodeValue });
        if (gap) {
          ensureSlashStructure(gap);
          return;
        }
        node.nodeValue = (node.nodeValue || '').replace(/\bNaN\b/gi, '');
      });
    });
  }

  function repairClickedGap(button) {
    const sentence = button.closest('.chunk-sentence');
    const editor = button.closest('.chunk-editor');
    if (!sentence || !editor) {
      saveDiagnostic('missing-chunk-container', button);
      return;
    }

    const sentenceIndex = [...editor.querySelectorAll('.chunk-sentence')].indexOf(sentence);
    const gapIndex = [...sentence.querySelectorAll('.gap-button')].indexOf(button);
    if (sentenceIndex < 0 || gapIndex < 0) {
      saveDiagnostic('invalid-dom-coordinate', button, { sentenceIndex, gapIndex });
      return;
    }

    button.dataset.sentence = String(sentenceIndex);
    button.dataset.gap = String(gapIndex);
    ensureSlashStructure(button);
  }

  function validate(root = document) {
    if (repairing) return;
    repairing = true;
    try {
      normalizeChunkDOM(root);
      sanitizeChunkText(root);
    } finally {
      repairing = false;
    }
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('.gap-button');
    if (!button) return;
    repairClickedGap(button);
  }, true);

  const app = document.getElementById('app');
  if (app) {
    const observer = new MutationObserver(() => requestAnimationFrame(() => validate(app)));
    observer.observe(app, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-sentence', 'data-gap', 'aria-label']
    });
  }

  window.addEventListener('error', event => {
    const editor = document.querySelector('.chunk-editor');
    if (!editor) return;
    saveDiagnostic('window-error-on-chunk', editor, {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  validate();
})();
