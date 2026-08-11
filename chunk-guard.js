(() => {
  function normalizeChunkCoordinates(root = document) {
    root.querySelectorAll?.('.chunk-editor').forEach(editor => {
      [...editor.querySelectorAll('.chunk-sentence')].forEach((sentence, sentenceIndex) => {
        sentence.dataset.sentenceIndex = String(sentenceIndex);
        [...sentence.querySelectorAll('.gap-button')].forEach((button, gapIndex) => {
          button.dataset.sentence = String(sentenceIndex);
          button.dataset.gap = String(gapIndex);
        });
      });
    });
  }

  function repairClickedGap(button) {
    const sentence = button.closest('.chunk-sentence');
    const editor = button.closest('.chunk-editor');
    if (!sentence || !editor) return false;

    const sentences = [...editor.querySelectorAll('.chunk-sentence')];
    const gaps = [...sentence.querySelectorAll('.gap-button')];
    const sentenceIndex = sentences.indexOf(sentence);
    const gapIndex = gaps.indexOf(button);

    if (!Number.isInteger(sentenceIndex) || sentenceIndex < 0 || !Number.isInteger(gapIndex) || gapIndex < 0) {
      console.error('[chunk-guard] Invalid DOM coordinate', { sentenceIndex, gapIndex, button });
      return false;
    }

    button.dataset.sentence = String(sentenceIndex);
    button.dataset.gap = String(gapIndex);
    return true;
  }

  function reportVisibleNaN(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const value = walker.currentNode.nodeValue || '';
      if (/\bNaN\b/.test(value)) {
        console.error('[chunk-guard] Visible NaN detected', {
          text: value,
          parent: walker.currentNode.parentElement
        });
      }
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
    const observer = new MutationObserver(() => {
      normalizeChunkCoordinates(app);
      reportVisibleNaN(app);
    });
    observer.observe(app, { childList: true, subtree: true });
  }

  normalizeChunkCoordinates();
  reportVisibleNaN();
})();
