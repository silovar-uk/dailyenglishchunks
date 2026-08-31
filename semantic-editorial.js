(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  let readSnapshot = null;
  let bridgeSerial = 0;

  function currentStep() {
    const label = document.querySelector('.step-label')?.textContent?.trim().toLowerCase() || '';
    if (label.includes('read')) return 'read';
    if (label.includes('chunk')) return 'chunk';
    if (label.includes('imagine')) return 'imagine';
    if (label.includes('understand')) return 'understand';
    if (label.includes('check')) return 'check';
    if (label.includes('speak')) return 'speak';
    return null;
  }

  function captureRead() {
    const sentences = [...document.querySelectorAll('.read-sentence')]
      .map(node => node.querySelector('span:last-child')?.textContent?.trim())
      .filter(Boolean);
    if (!sentences.length) return;
    readSnapshot = { sentences, serial: ++bridgeSerial };
  }

  function enhanceHome() {
    const intro = document.querySelector('.home-intro');
    if (!intro || intro.querySelector('.semantic-home-demo')) return;

    const demo = document.createElement('aside');
    demo.className = 'semantic-home-demo';
    demo.setAttribute('aria-label', 'Meaning chunk example');
    demo.innerHTML = `
      <span class="semantic-home-demo-label">One thought, then the next</span>
      <div class="semantic-home-demo-line" aria-hidden="true">
        <span class="semantic-unit">Read meaning</span>
        <span class="semantic-slash">/</span>
        <span class="semantic-unit">not words.</span>
      </div>
      <p class="semantic-home-demo-caption">文を切るのではなく、意味が切り替わる場所を感じる。</p>`;
    intro.appendChild(demo);

    requestAnimationFrame(() => requestAnimationFrame(() => demo.classList.add('is-split')));
  }

  function buildBridgeLine(sentence) {
    const words = sentence.split(/\s+/).filter(Boolean);
    return words.map((word, index) => {
      const safe = word.replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[char]));
      const spacer = index < words.length - 1 ? '<span class="semantic-bridge-space" aria-hidden="true"></span>' : '';
      return `<span class="semantic-bridge-word" style="--i:${index}">${safe}</span>${spacer}`;
    }).join('');
  }

  function enhanceReadToChunk() {
    if (currentStep() !== 'chunk' || !readSnapshot || reduceMotion?.matches) return;
    const lesson = document.querySelector('.lesson');
    const editor = document.querySelector('.chunk-editor');
    if (!lesson || !editor) return;
    if (lesson.dataset.semanticBridge === String(readSnapshot.serial)) return;

    lesson.dataset.semanticBridge = String(readSnapshot.serial);
    const firstSentence = readSnapshot.sentences[0];
    const bridge = document.createElement('div');
    bridge.className = 'semantic-bridge';
    bridge.setAttribute('aria-hidden', 'true');
    bridge.innerHTML = `
      <p class="semantic-bridge-kicker">Sentence → possible boundaries</p>
      <div class="semantic-bridge-line">${buildBridgeLine(firstSentence)}</div>`;
    editor.insertAdjacentElement('beforebegin', bridge);

    window.setTimeout(() => bridge.classList.add('is-leaving'), 900);
    window.setTimeout(() => bridge.remove(), 1450);
    readSnapshot = null;
  }

  function annotateLesson() {
    const lesson = document.querySelector('.lesson');
    const step = currentStep();
    if (!lesson || !step) return;
    lesson.dataset.semanticMode = step;
  }

  function enhance() {
    enhanceHome();
    annotateLesson();
    enhanceReadToChunk();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  document.addEventListener('click', event => {
    const next = event.target.closest?.('#nextStep');
    if (next && currentStep() === 'read') captureRead();
    schedule();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && currentStep() === 'read') captureRead();
    schedule();
  }, true);

  const observer = new MutationObserver(schedule);
  observer.observe(app, { childList: true, subtree: true });

  reduceMotion?.addEventListener?.('change', schedule);
  enhance();
})();
