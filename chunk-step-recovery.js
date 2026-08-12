(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const sessions = new Map();
  let recovering = false;

  function escapeHTML(value) {
    return String(value).replace(/[&<>'\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function rawSentence(sentence) {
    return sentence.chunks.map(chunk => chunk.en).join(' ').replace(/\s+([,.!?;:])/g, '$1');
  }

  function modelBoundaries(sentence) {
    const boundaries = [];
    let wordCount = 0;
    sentence.chunks.forEach((chunk, index) => {
      const text = typeof chunk?.en === 'string' ? chunk.en.trim() : '';
      const count = text ? text.split(/\s+/).length : 0;
      wordCount += count;
      if (index < sentence.chunks.length - 1 && wordCount > 0) boundaries.push(wordCount - 1);
    });
    return boundaries;
  }

  function currentLesson() {
    const dateText = document.querySelector('.focus-date')?.textContent?.trim();
    const title = document.querySelector('.lesson-title')?.textContent?.trim();
    const lessons = window.LESSONS || [];
    return lessons.find(lesson => lesson.createdAt === dateText && (!title || lesson.title === title))
      || lessons.find(lesson => lesson.createdAt === dateText)
      || lessons.find(lesson => lesson.title === title)
      || null;
  }

  function sessionFor(lesson) {
    if (!sessions.has(lesson.id)) {
      sessions.set(lesson.id, {
        selected: lesson.sentences.map(() => new Set()),
        hintLevel: 0,
        compared: false
      });
    }
    return sessions.get(lesson.id);
  }

  function isChunkStep() {
    return /Chunk/i.test(document.querySelector('.focus-step')?.textContent || '');
  }

  function isBrokenChunkStep() {
    if (!isChunkStep()) return false;
    if (document.querySelector('.chunk-editor')) return false;
    const lesson = document.querySelector('.lesson');
    if (!lesson) return false;
    return /\bNaN\b/i.test(lesson.textContent || '') || !document.querySelector('.step-heading');
  }

  function renderEditor(lesson, state) {
    return lesson.sentences.map((sentence, sentenceIndex) => {
      const words = rawSentence(sentence).split(/\s+/).filter(Boolean);
      const selected = state.selected[sentenceIndex] || new Set();
      const html = words.map((word, wordIndex) => {
        const gap = wordIndex < words.length - 1
          ? `<button class="gap-button ${selected.has(wordIndex) ? 'is-active' : ''}" data-recovery-sentence="${sentenceIndex}" data-recovery-gap="${wordIndex}" type="button" aria-label="${wordIndex + 1}語目の後で区切る"><span>/</span></button>`
          : '';
        return `<span class="word">${escapeHTML(word)}</span>${gap}`;
      }).join('');
      return `<div class="chunk-sentence" data-recovery-sentence-row="${sentenceIndex}">${html}</div>`;
    }).join('');
  }

  function renderHint(state) {
    if (state.hintLevel === 0) return '';
    if (state.hintLevel === 1) return '<p><strong>Hint 1:</strong> まず「誰がどうした」の核を探す。単語数では切らない。</p>';
    if (state.hintLevel === 2) return '<p><strong>Hint 2:</strong> 最初の意味の境界だけ示した。そこまでで意味が成立するか確認する。</p>';
    return '<p><strong>Hint 3:</strong> モデルとの差分を表示した。自分との違いだけを見る。</p>';
  }

  function renderCompare(lesson, state) {
    if (!state.compared) return '';
    const html = lesson.sentences.map((sentence, sentenceIndex) => {
      const words = rawSentence(sentence).split(/\s+/).filter(Boolean);
      const yours = state.selected[sentenceIndex] || new Set();
      const model = new Set(modelBoundaries(sentence));
      const row = words.map((word, wordIndex) => {
        if (wordIndex === words.length - 1) return `<span class="word">${escapeHTML(word)}</span>`;
        const y = yours.has(wordIndex);
        const m = model.has(wordIndex);
        let gap = '<span class="diff-space"> </span>';
        if (y && m) gap = '<span class="diff-gap is-match">/</span>';
        else if (y) gap = '<span class="diff-gap is-yours">/</span>';
        else if (m) gap = '<span class="diff-gap is-model">＋/</span>';
        return `<span class="word">${escapeHTML(word)}</span>${gap}`;
      }).join('');
      return `<div class="diff-sentence">${row}</div>`;
    }).join('');
    return `<div class="diff-legend"><span><i class="legend-match">/</i>一致</span><span><i class="legend-yours">/</i>自分だけ</span><span><i class="legend-model">＋/</i>モデルのみ</span></div><div class="diff-list">${html}</div>`;
  }

  function jumpToStep(index) {
    const toggle = document.getElementById('stepMenuToggle');
    if (!toggle) return;
    toggle.click();
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-step-jump="${index}"]`);
      target?.click();
    });
  }

  function bindRecovery(lesson, state) {
    document.querySelectorAll('[data-recovery-sentence][data-recovery-gap]').forEach(button => {
      button.addEventListener('click', () => {
        const sentenceIndex = Number(button.dataset.recoverySentence);
        const gapIndex = Number(button.dataset.recoveryGap);
        if (!Number.isInteger(sentenceIndex) || !Number.isInteger(gapIndex)) return;
        const set = state.selected[sentenceIndex] || (state.selected[sentenceIndex] = new Set());
        set.has(gapIndex) ? set.delete(gapIndex) : set.add(gapIndex);
        state.compared = false;
        button.classList.toggle('is-active', set.has(gapIndex));
        const compare = document.getElementById('chunkCompare');
        if (compare) compare.innerHTML = '';
      });
    });

    document.getElementById('chunkHint')?.addEventListener('click', () => {
      state.hintLevel = Math.min(3, state.hintLevel + 1);
      recover(true);
    });

    document.getElementById('compareChunks')?.addEventListener('click', () => {
      state.compared = true;
      const compare = document.getElementById('chunkCompare');
      if (compare) compare.innerHTML = renderCompare(lesson, state);
    });

    document.getElementById('recoveryPrevStep')?.addEventListener('click', () => jumpToStep(1));
    document.getElementById('recoveryNextStep')?.addEventListener('click', () => jumpToStep(3));
  }

  function recover(force = false) {
    if (recovering) return;
    if (!force && !isBrokenChunkStep()) return;
    if (!isChunkStep()) return;

    const lesson = currentLesson();
    const header = document.querySelector('.lesson-head-compact');
    const lessonRoot = document.querySelector('.lesson');
    if (!lesson || !header || !lessonRoot) return;

    recovering = true;
    try {
      const state = sessionFor(lesson);

      let sibling = header.nextSibling;
      while (sibling) {
        const next = sibling.nextSibling;
        sibling.remove();
        sibling = next;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'chunk-recovery-root';
      wrapper.innerHTML = `
        <div class="step-heading"><p class="step-label">Chunk</p><h2 class="step-title">Where does one idea end?</h2><p class="step-intro">単語間をタップして <code>/</code> を入れる。正解当てではなく、自分の読み方を先に作る。</p></div>
        <div class="practice-card">
          <div class="chunk-editor">${renderEditor(lesson, state)}</div>
          <div class="chunk-tool-row">
            <button class="quiet-button" id="chunkHint" type="button">Hint${state.hintLevel ? ` ${state.hintLevel}/3` : ''}</button>
            <button class="secondary-button" id="compareChunks" type="button">差だけ比べる</button>
          </div>
          <div id="hintBox" class="hint-box">${renderHint(state)}</div>
          <div id="chunkCompare">${renderCompare(lesson, state)}</div>
        </div>
        <div class="step-actions focus-actions">
          <button class="secondary-button" id="recoveryPrevStep" type="button">← 戻る</button>
          <button class="primary-button" id="recoveryNextStep" type="button">Understandへ →</button>
        </div>`;
      lessonRoot.appendChild(wrapper);
      bindRecovery(lesson, state);
    } finally {
      recovering = false;
    }
  }

  const observer = new MutationObserver(() => requestAnimationFrame(() => recover(false)));
  observer.observe(app, { childList: true, subtree: true, characterData: true });

  document.addEventListener('click', () => requestAnimationFrame(() => recover(false)));
  recover(false);
})();
