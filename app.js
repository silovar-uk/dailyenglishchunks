(() => {
  const lessons = window.LESSONS || [];
  const app = document.getElementById('app');
  const homeBtn = document.getElementById('homeBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const progressWrap = document.getElementById('stepProgress');
  const progressBar = document.getElementById('stepProgressBar');

  const STORAGE_KEY = 'dailyEnglishChunks.v2';
  const LEGACY_STORAGE_KEY = 'dailyEnglishChunks.v1';
  const STEPS = [
    { key: 'imagine', label: 'Imagine' },
    { key: 'read', label: 'Read' },
    { key: 'chunk', label: 'Chunk' },
    { key: 'understand', label: 'Understand' },
    { key: 'check', label: 'Check' },
    { key: 'speak', label: 'Speak' },
    { key: 'complete', label: 'Done' }
  ];

  let state = loadState();
  let currentLesson = null;
  let stepIndex = 0;
  let chunkSelections = {};
  let quizSelections = {};
  let showJapanese = false;
  let revealedChunks = new Set();
  let readSentences = new Set();
  let speakRounds = new Set();
  let showSpeakSlashes = true;
  let sceneReady = false;

  function loadState() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (current?.lessons) return current;
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
      if (legacy?.lessons) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
        return legacy;
      }
    } catch (_) {}
    return { lessons: {} };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function lessonState(id) {
    return state.lessons[id] || {};
  }

  function updateLessonState(id, patch) {
    state.lessons[id] = { ...lessonState(id), ...patch };
    saveState();
  }

  function dayLabel(id) {
    return `DAY ${String(id).padStart(3, '0')}`;
  }

  function getNextLesson() {
    return lessons.find(lesson => !lessonState(lesson.id).completed) || lessons[lessons.length - 1];
  }

  function getLessonIndex(id) {
    return lessons.findIndex(lesson => lesson.id === Number(id));
  }

  function getAdjacentLesson(id, direction) {
    const index = getLessonIndex(id);
    if (index < 0) return null;
    return lessons[index + direction] || null;
  }

  function rawSentence(sentence) {
    return sentence.chunks.map(chunk => chunk.en).join(' ').replace(/\s+([,.!?;:])/g, '$1');
  }

  function modelBoundaries(sentence) {
    const boundaries = [];
    let wordCount = 0;
    sentence.chunks.forEach((chunk, index) => {
      wordCount += chunk.en.trim().split(/\s+/).length;
      if (index < sentence.chunks.length - 1) boundaries.push(wordCount - 1);
    });
    return boundaries;
  }

  function renderHome() {
    currentLesson = null;
    progressWrap.hidden = true;
    document.title = 'Daily English Chunks';

    const next = getNextLesson();
    const done = lessons.filter(lesson => lessonState(lesson.id).completed).length;
    const allDone = lessons.length > 0 && done === lessons.length;
    const previousIndex = Math.max(0, getLessonIndex(next.id) - 1);
    const review = lessons.length > 1 ? lessons[previousIndex] : null;
    const savedStep = Math.min(lessonState(next.id).lastStep || 0, STEPS.length - 2);
    const hasProgress = !lessonState(next.id).completed && savedStep > 0;

    app.innerHTML = `
      <section class="home">
        <div class="home-kicker-row">
          <p class="eyebrow">Course · ${done} / ${lessons.length} complete</p>
          <button class="text-button" id="openAllLessons" type="button">All lessons →</button>
        </div>
        <h1>Read meaning,<br>not words.</h1>
        <p class="lead">英語を一語ずつ訳すのではなく、意味のまとまりで前から受け取る。日付ではなく、番号順にひとつずつ積み上げる。</p>

        <button class="next-card action-surface" id="startNext" type="button" aria-label="${dayLabel(next.id)} ${escapeHTML(next.title)}を始める">
          <span class="next-card-top">
            <span class="sequence-number">${dayLabel(next.id)}</span>
            <span class="next-state">${allDone ? 'REPLAY' : hasProgress ? 'CONTINUE' : 'NEXT'}</span>
          </span>
          <span class="next-card-body">
            <span class="next-card-copy">
              <strong class="next-card-title">${escapeHTML(next.title)}</strong>
              <span class="scene-copy">${escapeHTML(next.sceneJa)}</span>
              <span class="lesson-facts">
                <span>${next.minutes} min</span>
                <span>Level ${next.difficulty}</span>
                <span>${next.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span>
              </span>
            </span>
            <span class="surface-arrow" aria-hidden="true">→</span>
          </span>
          ${hasProgress ? `<span class="resume-note">前回の続き：${STEPS[savedStep].label}</span>` : ''}
        </button>

        <section class="sequence-section" aria-label="Lesson sequence">
          <div class="section-label-row">
            <div>
              <p class="eyebrow">Sequence</p>
              <p class="micro-copy">番号をタップして、どこからでも開ける。</p>
            </div>
            <span class="progress-count">${done}/${lessons.length}</span>
          </div>
          ${renderSequenceRail(next.id)}
        </section>

        ${review && review.id !== next.id ? `
          <section class="home-section">
            <div class="home-section-head">
              <div><h3>Quick Review</h3><p>ひとつ前の感覚を30秒で戻す。</p></div>
            </div>
            <button class="mini-review action-surface" id="reviewLesson" type="button">
              <span class="mini-review-copy">
                <small>${dayLabel(review.id)}</small>
                <strong>${escapeHTML(review.review)}</strong>
              </span>
              <span class="surface-arrow" aria-hidden="true">→</span>
            </button>
          </section>
        ` : ''}
      </section>
    `;

    document.getElementById('startNext')?.addEventListener('click', () => openLesson(next.id, hasProgress ? savedStep : 0));
    document.getElementById('reviewLesson')?.addEventListener('click', () => openLesson(review.id, 0));
    document.getElementById('openAllLessons')?.addEventListener('click', () => renderArchive());
    bindSequenceRail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSequenceRail(activeId) {
    return `<div class="sequence-rail">${lessons.map(lesson => {
      const completed = lessonState(lesson.id).completed;
      const active = lesson.id === activeId;
      return `
        <button class="sequence-item ${completed ? 'is-done' : ''} ${active ? 'is-active' : ''}" data-sequence-lesson="${lesson.id}" type="button" aria-label="${dayLabel(lesson.id)} ${completed ? '完了済み' : ''}">
          <span class="sequence-item-number">${String(lesson.id).padStart(3, '0')}</span>
          <span class="sequence-item-state">${completed ? '✓' : active ? 'NEXT' : ''}</span>
        </button>`;
    }).join('')}</div>`;
  }

  function bindSequenceRail() {
    document.querySelectorAll('[data-sequence-lesson]').forEach(button => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.sequenceLesson);
        const saved = Math.min(lessonState(id).lastStep || 0, STEPS.length - 2);
        openLesson(id, lessonState(id).completed ? 0 : saved);
      });
    });
  }

  function openLesson(id, startStep = null) {
    currentLesson = lessons.find(lesson => lesson.id === Number(id));
    if (!currentLesson) return renderHome();

    const savedStep = Math.min(lessonState(currentLesson.id).lastStep || 0, STEPS.length - 2);
    stepIndex = startStep === null ? savedStep : Math.max(0, Math.min(Number(startStep), STEPS.length - 1));
    chunkSelections = {};
    quizSelections = {};
    showJapanese = false;
    revealedChunks = new Set();
    readSentences = new Set();
    speakRounds = new Set();
    showSpeakSlashes = true;
    sceneReady = false;
    progressWrap.hidden = false;
    renderLesson();
  }

  function renderLesson() {
    document.title = `${dayLabel(currentLesson.id)} · ${currentLesson.title} — Daily English Chunks`;
    const step = STEPS[stepIndex];
    progressBar.style.width = `${((stepIndex + 1) / STEPS.length) * 100}%`;

    if (step.key !== 'complete') updateLessonState(currentLesson.id, { lastStep: stepIndex });

    app.innerHTML = `
      <section class="lesson">
        <header class="lesson-head">
          <div class="lesson-head-top">
            <button class="lesson-number-button" id="lessonPicker" type="button">${dayLabel(currentLesson.id)} <span>⌄</span></button>
            <div class="lesson-switcher">${renderAdjacentButton(-1)}${renderAdjacentButton(1)}</div>
          </div>
          <h1 class="lesson-title">${escapeHTML(currentLesson.title)}</h1>
          <div class="lesson-meta">
            <span>${currentLesson.minutes} min</span>
            <span class="meta-dot">Level ${currentLesson.difficulty}</span>
            <span class="meta-dot">${currentLesson.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span>
          </div>
          ${renderStepRail()}
        </header>
        ${renderStep(step.key)}
      </section>
    `;

    bindGlobalLessonEvents();
    bindStepEvents(step.key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAdjacentButton(direction) {
    const lesson = getAdjacentLesson(currentLesson.id, direction);
    if (!lesson) return `<span class="lesson-switch-placeholder"></span>`;
    const arrow = direction < 0 ? '←' : '→';
    return `<button class="lesson-switch-button" data-adjacent="${lesson.id}" type="button" aria-label="${dayLabel(lesson.id)}へ">${direction < 0 ? `${arrow} ${String(lesson.id).padStart(3, '0')}` : `${String(lesson.id).padStart(3, '0')} ${arrow}`}</button>`;
  }

  function renderStepRail() {
    return `<nav class="step-rail" aria-label="Lesson steps">${STEPS.slice(0, -1).map((step, index) => `
      <button class="step-chip ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-past' : ''}" data-step="${index}" type="button">
        <span>${String(index + 1).padStart(2, '0')}</span>${step.label}
      </button>`).join('')}</nav>`;
  }

  function renderStep(step) {
    if (step === 'imagine') return `
      <p class="step-label">01 · Imagine</p>
      <h2 class="step-title">Before reading, build the scene.</h2>
      <p class="step-intro">英文より先に、場面と気持ちを頭の中に置く。場面が浮かんだらカード全体をタップ。</p>
      <button class="practice-card scene-card action-surface ${sceneReady ? 'is-ready' : ''}" id="sceneReady" type="button">
        <span class="scene-ready-mark">${sceneReady ? '✓ READY' : 'TAP WHEN YOU CAN SEE IT'}</span>
        <span class="announcement">「まず、書かれている場面や話し手の気持ちを想像しながら読みましょう。」</span>
        <span class="eyebrow scene-eyebrow">Scene</span>
        <span class="scene-en">${escapeHTML(currentLesson.scene)}</span>
        <span class="scene-ja">${escapeHTML(currentLesson.sceneJa)}</span>
        <span class="emotion-arc">${currentLesson.emotions.map((emotion, index) => `${index ? '<span class="emotion-arrow">→</span>' : ''}<span class="emotion-chip">${escapeHTML(emotion)}</span>`).join('')}</span>
      </button>
      ${navButtons()}
    `;

    if (step === 'read') return `
      <p class="step-label">02 · Read</p>
      <h2 class="step-title">Read once. Don’t analyze yet.</h2>
      <p class="step-intro">文をタップすると読み終えた印がつく。スラッシュも訳も見ず、何が起きているかだけ追う。</p>
      <div class="practice-card passage read-passage">${currentLesson.sentences.map((sentence, index) => `
        <button class="read-sentence ${readSentences.has(index) ? 'is-read' : ''}" data-read-sentence="${index}" type="button">
          <span class="read-check">${readSentences.has(index) ? '✓' : String(index + 1).padStart(2, '0')}</span>
          <span>${escapeHTML(rawSentence(sentence))}</span>
        </button>`).join('')}</div>
      ${navButtons()}
    `;

    if (step === 'chunk') return `
      <p class="step-label">03 · Chunk</p>
      <h2 class="step-title">Where does one idea end?</h2>
      <p class="step-intro">単語間の広いタップ領域を押して `/` を入れる。もう一度押せば戻せる。</p>
      <div class="practice-card">
        <div class="chunk-editor">${currentLesson.sentences.map((sentence, index) => renderChunkEditor(sentence, index)).join('')}</div>
        <div class="chunk-tool-row">
          <p class="chunk-hint">意味が一度まとまる場所で切る。</p>
          <button class="secondary-button" id="compareChunks" type="button">モデルと比べる</button>
        </div>
        <div id="chunkCompare"></div>
      </div>
      ${navButtons()}
    `;

    if (step === 'understand') return `
      <p class="step-label">04 · Understand</p>
      <h2 class="step-title">Build meaning from left to right.</h2>
      <p class="step-intro">各チャンク自体をタップすると日本語が出る。必要なところだけ確認してもええ。</p>
      <div class="step-toolbar">
        <span class="eyebrow toolbar-label">Tap a chunk to reveal</span>
        <button class="quiet-button" id="toggleJa" type="button">${showJapanese ? 'すべて隠す' : 'すべて表示'}</button>
      </div>
      <div class="chunk-cards">${renderUnderstandChunks()}</div>
      ${navButtons()}
    `;

    if (step === 'check') return `
      <p class="step-label">05 · Check</p>
      <h2 class="step-title">Retrieve before you reread.</h2>
      <p class="step-intro">選択肢の行全体がタップ対象。意味・気持ち・チャンクの3方向から確認する。</p>
      <div class="practice-card"><div class="quiz-list">${currentLesson.questions.map((question, index) => renderQuiz(question, index)).join('')}</div></div>
      ${navButtons()}
    `;

    if (step === 'speak') return `
      <p class="step-label">06 · Speak</p>
      <h2 class="step-title">Read the situation, not the sentence.</h2>
      <p class="step-intro">英文エリアをタップするとスラッシュ表示を切り替えられる。3回の音読カードもそのままタップ。</p>
      <div class="practice-card">
        <button class="speak-passage passage" id="toggleSpeakSlashes" type="button" aria-label="スラッシュ表示を切り替える">
          <span class="speak-toggle-label">${showSpeakSlashes ? '/ ON · tap to hide' : '/ OFF · tap to show'}</span>
          ${currentLesson.sentences.map(sentence => `<span class="speak-sentence">${sentence.chunks.map(chunk => escapeHTML(chunk.en)).join(showSpeakSlashes ? ' <span class="slash">/</span> ' : ' ')}</span>`).join('')}
        </button>
        <div class="speak-count">
          ${['Meaning', 'Rhythm', 'Emotion'].map((label, index) => `<button class="speak-round ${speakRounds.has(index) ? 'is-done' : ''}" data-round="${index}" type="button"><strong>${speakRounds.has(index) ? '✓' : index + 1}</strong><span>${label}</span><small>${['意味を追う', '流れを切らない', '気持ちを乗せる'][index]}</small></button>`).join('')}
        </div>
        <div class="emotion-note"><strong>Direction</strong><br>${escapeHTML(currentLesson.speak)}</div>
        <div class="review-note"><strong>Keep</strong><span>${escapeHTML(currentLesson.review)}</span></div>
      </div>
      ${navButtons()}
    `;

    const nextLesson = getAdjacentLesson(currentLesson.id, 1);
    return `
      <p class="step-label">Done</p>
      <div class="practice-card complete-panel">
        <div class="complete-check">✓</div>
        <h2>${dayLabel(currentLesson.id)} complete.</h2>
        <p class="complete-copy">英文を「単語」ではなく「意味の流れ」として読めたら十分。</p>
        <p class="eyebrow complete-eyebrow">How did it feel?</p>
        <div class="difficulty-row">
          ${['easy', 'just-right', 'hard'].map(value => `<button type="button" data-difficulty="${value}" class="${lessonState(currentLesson.id).difficulty === value ? 'is-selected' : ''}">${value === 'easy' ? 'Easy' : value === 'just-right' ? 'Just right' : 'Hard'}</button>`).join('')}
        </div>
        <div class="complete-actions">
          <button class="secondary-button" id="finishLesson" type="button">ホームへ</button>
          ${nextLesson ? `<button class="primary-button" id="nextLessonDirect" type="button">${dayLabel(nextLesson.id)}へ →</button>` : ''}
        </div>
      </div>
    `;
  }

  function renderUnderstandChunks() {
    let chunkIndex = 0;
    return currentLesson.sentences.flatMap(sentence => sentence.chunks).map(chunk => {
      const index = chunkIndex++;
      const revealed = showJapanese || revealedChunks.has(index);
      return `
        <button class="chunk-card ${revealed ? 'is-revealed' : ''}" data-chunk-reveal="${index}" type="button">
          <span class="chunk-en">${escapeHTML(chunk.en)}</span>
          <span class="chunk-reveal-hint">${revealed ? '−' : '+'}</span>
          <span class="chunk-ja" ${revealed ? '' : 'hidden'}>${escapeHTML(chunk.ja)}</span>
        </button>`;
    }).join('');
  }

  function renderChunkEditor(sentence, sentenceIndex) {
    const words = rawSentence(sentence).split(/\s+/);
    const selected = chunkSelections[sentenceIndex] || new Set();
    return `<div class="chunk-sentence">${words.map((word, index) => {
      const gap = index < words.length - 1
        ? `<button class="gap-button ${selected.has(index) ? 'is-active' : ''}" data-sentence="${sentenceIndex}" data-gap="${index}" type="button" aria-label="${index + 1}語目の後で区切る"><span>/</span></button>`
        : '';
      return `<span class="word">${escapeHTML(word)}</span>${gap}`;
    }).join('')}</div>`;
  }

  function compareChunks() {
    const html = currentLesson.sentences.map((sentence, index) => {
      const words = rawSentence(sentence).split(/\s+/);
      const selected = chunkSelections[index] || new Set();
      const model = new Set(modelBoundaries(sentence));
      const withBreaks = breaks => words.map((word, wordIndex) => `${escapeHTML(word)}${wordIndex < words.length - 1 ? (breaks.has(wordIndex) ? ' / ' : ' ') : ''}`).join('');
      return `
        <div class="compare-item">
          <div class="compare-label">Sentence ${index + 1} · Yours</div>
          <div class="compare-text">${withBreaks(selected)}</div>
          <div class="compare-label compare-model-label">Model</div>
          <div class="compare-text compare-model">${withBreaks(model)}</div>
        </div>`;
    }).join('');
    document.getElementById('chunkCompare').innerHTML = `<div class="compare-list">${html}</div>`;
    document.getElementById('chunkCompare').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderQuiz(question, index) {
    const selected = quizSelections[index];
    return `
      <div class="quiz-card">
        <div class="quiz-number">Q${index + 1} · ${escapeHTML(question.type)}</div>
        <div class="quiz-question">${escapeHTML(question.question)}</div>
        <div class="quiz-options">${question.options.map((option, optionIndex) => {
          const classes = ['quiz-option'];
          if (selected === optionIndex) classes.push('is-selected');
          if (selected !== undefined && optionIndex === question.answer) classes.push('is-correct');
          if (selected === optionIndex && optionIndex !== question.answer) classes.push('is-wrong');
          return `<button type="button" class="${classes.join(' ')}" data-question="${index}" data-option="${optionIndex}"><span class="option-key">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHTML(option)}</span></button>`;
        }).join('')}</div>
        ${selected !== undefined ? `<p class="quiz-explanation">${selected === question.answer ? '✓ ' : ''}${escapeHTML(question.explanation)}</p>` : ''}
      </div>`;
  }

  function navButtons() {
    const isLastPractice = stepIndex === STEPS.length - 2;
    return `
      <div class="step-actions">
        ${stepIndex > 0 ? '<button class="secondary-button" id="prevStep" type="button">← 戻る</button>' : '<span></span>'}
        <button class="primary-button" id="nextStep" type="button">${isLastPractice ? '完了する' : `${STEPS[stepIndex + 1].label}へ`} →</button>
      </div>`;
  }

  function bindGlobalLessonEvents() {
    document.getElementById('lessonPicker')?.addEventListener('click', () => renderArchive());
    document.querySelectorAll('[data-adjacent]').forEach(button => button.addEventListener('click', () => openLesson(Number(button.dataset.adjacent), null)));
    document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
      stepIndex = Number(button.dataset.step);
      renderLesson();
    }));
  }

  function bindStepEvents(step) {
    document.getElementById('prevStep')?.addEventListener('click', () => {
      stepIndex = Math.max(0, stepIndex - 1);
      renderLesson();
    });

    document.getElementById('nextStep')?.addEventListener('click', () => {
      if (step === 'speak' && speakRounds.size < 3) {
        toast('音読3回をタップしてから完了しよう');
        return;
      }
      stepIndex = Math.min(STEPS.length - 1, stepIndex + 1);
      if (STEPS[stepIndex].key === 'complete') {
        updateLessonState(currentLesson.id, {
          completed: true,
          completedAt: new Date().toISOString(),
          readCount: speakRounds.size,
          lastStep: STEPS.length - 1
        });
      }
      renderLesson();
    });

    document.getElementById('sceneReady')?.addEventListener('click', () => {
      sceneReady = !sceneReady;
      renderLesson();
    });

    document.querySelectorAll('[data-read-sentence]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.readSentence);
      readSentences.has(index) ? readSentences.delete(index) : readSentences.add(index);
      button.classList.toggle('is-read');
      const check = button.querySelector('.read-check');
      check.textContent = readSentences.has(index) ? '✓' : String(index + 1).padStart(2, '0');
    }));

    document.querySelectorAll('.gap-button').forEach(button => button.addEventListener('click', () => {
      const sentenceIndex = Number(button.dataset.sentence);
      const gapIndex = Number(button.dataset.gap);
      if (!chunkSelections[sentenceIndex]) chunkSelections[sentenceIndex] = new Set();
      chunkSelections[sentenceIndex].has(gapIndex)
        ? chunkSelections[sentenceIndex].delete(gapIndex)
        : chunkSelections[sentenceIndex].add(gapIndex);
      button.classList.toggle('is-active');
    }));

    document.getElementById('compareChunks')?.addEventListener('click', compareChunks);

    document.querySelectorAll('[data-chunk-reveal]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.chunkReveal);
      revealedChunks.has(index) ? revealedChunks.delete(index) : revealedChunks.add(index);
      renderLesson();
    }));

    document.getElementById('toggleJa')?.addEventListener('click', () => {
      showJapanese = !showJapanese;
      if (!showJapanese) revealedChunks = new Set();
      renderLesson();
    });

    document.querySelectorAll('.quiz-option').forEach(button => button.addEventListener('click', () => {
      quizSelections[Number(button.dataset.question)] = Number(button.dataset.option);
      renderLesson();
    }));

    document.getElementById('toggleSpeakSlashes')?.addEventListener('click', () => {
      showSpeakSlashes = !showSpeakSlashes;
      renderLesson();
    });

    document.querySelectorAll('.speak-round').forEach(button => button.addEventListener('click', () => {
      const round = Number(button.dataset.round);
      speakRounds.has(round) ? speakRounds.delete(round) : speakRounds.add(round);
      renderLesson();
    }));

    document.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => {
      updateLessonState(currentLesson.id, { difficulty: button.dataset.difficulty });
      renderLesson();
    }));

    document.getElementById('finishLesson')?.addEventListener('click', renderHome);
    document.getElementById('nextLessonDirect')?.addEventListener('click', () => {
      const nextLesson = getAdjacentLesson(currentLesson.id, 1);
      if (nextLesson) openLesson(nextLesson.id, 0);
    });
  }

  function renderArchive(filter = 'all') {
    currentLesson = null;
    progressWrap.hidden = true;
    document.title = 'All lessons — Daily English Chunks';

    const allTags = [...new Set(lessons.flatMap(lesson => lesson.tags))];
    const visible = filter === 'all' ? lessons : lessons.filter(lesson => lesson.tags.includes(filter));

    app.innerHTML = `
      <section class="archive">
        <header class="archive-head">
          <p class="eyebrow">Sequence</p>
          <h1>All lessons</h1>
          <p class="archive-lead">日付ではなく、番号が学習の位置。行全体を押して開ける。</p>
        </header>
        <div class="archive-filters">
          <button class="filter-chip ${filter === 'all' ? 'is-active' : ''}" data-filter="all" type="button">All</button>
          ${allTags.map(tag => `<button class="filter-chip ${filter === tag ? 'is-active' : ''}" data-filter="${escapeHTML(tag)}" type="button">${escapeHTML(tag)}</button>`).join('')}
        </div>
        <div class="lesson-list">${visible.map(lesson => `
          <button class="lesson-row" data-lesson="${lesson.id}" type="button">
            <span class="lesson-row-day">${String(lesson.id).padStart(3, '0')}<span class="done-mark">${lessonState(lesson.id).completed ? '✓' : ''}</span></span>
            <span class="lesson-row-main">
              <strong class="lesson-row-title">${escapeHTML(lesson.title)}</strong>
              <span class="lesson-row-scene">${escapeHTML(lesson.sceneJa)}</span>
            </span>
            <span class="lesson-row-tags">${lesson.minutes} min · Lv.${lesson.difficulty}<br>${lesson.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span>
            <span class="lesson-row-arrow">→</span>
          </button>`).join('')}</div>
      </section>`;

    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => renderArchive(button.dataset.filter)));
    document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => openLesson(Number(button.dataset.lesson), null)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toast(message) {
    let node = document.querySelector('.toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('is-visible'), 1800);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  homeBtn.addEventListener('click', renderHome);
  archiveBtn.addEventListener('click', () => renderArchive());

  document.addEventListener('keydown', event => {
    if (!currentLesson || event.metaKey || event.ctrlKey || event.altKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowLeft' && stepIndex > 0) {
      stepIndex -= 1;
      renderLesson();
    }
    if (event.key === 'ArrowRight' && stepIndex < STEPS.length - 2) {
      stepIndex += 1;
      renderLesson();
    }
  });

  renderHome();
})();