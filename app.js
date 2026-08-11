(() => {
  const lessons = [...(window.LESSONS || [])].sort((a, b) => lessonTime(a) - lessonTime(b) || Number(a.id) - Number(b.id));
  const app = document.getElementById('app');
  const homeBtn = document.getElementById('homeBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const randomBtn = document.getElementById('randomBtn');
  const progressWrap = document.getElementById('stepProgress');
  const progressBar = document.getElementById('stepProgressBar');

  const STORAGE_KEY = 'dailyEnglishChunks.v3';
  const LEGACY_KEYS = ['dailyEnglishChunks.v2', 'dailyEnglishChunks.v1'];
  const PRACTICE_STEPS = [
    { key: 'imagine', label: 'Imagine' },
    { key: 'read', label: 'Read' },
    { key: 'chunk', label: 'Chunk' },
    { key: 'understand', label: 'Understand' },
    { key: 'check', label: 'Check' },
    { key: 'speak', label: 'Speak' }
  ];
  const FLOW = [...PRACTICE_STEPS, { key: 'final', label: 'Final read' }, { key: 'complete', label: 'Done' }];

  let state = loadState();
  let currentLesson = null;
  let stepIndex = 0;
  let showStepMenu = false;
  let chunkSelections = {};
  let quizSelections = {};
  let revealedChunks = new Set();
  let readSentences = new Set();
  let speakRounds = new Set();
  let showJapanese = false;
  let showSpeakSlashes = true;
  let sceneReady = false;
  let hintLevel = 0;
  let comparedChunks = false;
  let lastRandomId = null;
  let readRecorded = new Set();
  let revealRecorded = new Set();

  function lessonTime(lesson) {
    const parsed = Date.parse(`${lesson?.createdAt || ''}T00:00:00Z`);
    return Number.isFinite(parsed) ? parsed : Number(lesson?.id) || 0;
  }

  function newestLessons(source = lessons) {
    return [...source].sort((a, b) => lessonTime(b) - lessonTime(a) || Number(b.id) - Number(a.id));
  }

  function latestLesson() {
    return newestLessons()[0] || null;
  }

  function formatDate(lesson, compact = false) {
    if (!lesson?.createdAt) return `#${String(lesson?.id || '').padStart(3, '0')}`;
    const [year, month, day] = lesson.createdAt.split('-');
    return compact ? `${month}/${day}` : `${year}/${month}/${day}`;
  }

  function loadState() {
    let loaded = null;
    try {
      loaded = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (_) {}
    if (!loaded?.lessons) {
      for (const key of LEGACY_KEYS) {
        try {
          const legacy = JSON.parse(localStorage.getItem(key));
          if (legacy?.lessons) {
            loaded = legacy;
            break;
          }
        } catch (_) {}
      }
    }

    const next = loaded?.lessons ? loaded : { lessons: {} };
    next.stats = {
      sentencesRead: Number.isFinite(Number(next.stats?.sentencesRead)) ? Number(next.stats.sentencesRead) : 0,
      chunksRevealed: Number.isFinite(Number(next.stats?.chunksRevealed)) ? Number(next.stats.chunksRevealed) : 0
    };
    next.visits = Number.isFinite(Number(next.visits)) ? Number(next.visits) + 1 : 1;

    Object.entries(next.lessons).forEach(([id, value]) => {
      if (!value || typeof value !== 'object') next.lessons[id] = {};
      const item = next.lessons[id];
      const rawStep = Number(item.lastStep);
      if (item.completed && rawStep === 6) item.lastStep = FLOW.length - 1;
      else item.lastStep = Number.isFinite(rawStep) ? Math.max(0, Math.min(Math.trunc(rawStep), FLOW.length - 1)) : 0;
      item.helpUsed = Number.isFinite(Number(item.helpUsed)) ? Math.max(0, Number(item.helpUsed)) : 0;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
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

  function randomWeight(lesson) {
    const saved = lessonState(lesson.id);
    let weight = 1;
    if (!saved.completed) weight += 3;
    if (saved.difficulty === 'hard') weight += 4;
    else if (saved.difficulty === 'just-right') weight += 1.5;
    weight += Math.min(3, Number(saved.helpUsed) || 0);
    if (saved.comparedChunks) weight += 1;
    const ageDays = Math.max(0, (lessonTime(latestLesson()) - lessonTime(lesson)) / 86400000);
    weight += Math.min(3, ageDays / 3);
    return weight;
  }

  function chooseRandomLesson() {
    if (!lessons.length) return null;
    let candidates = lessons.filter(lesson => lesson.id !== currentLesson?.id && lesson.id !== lastRandomId);
    if (!candidates.length) candidates = lessons.filter(lesson => lesson.id !== currentLesson?.id);
    if (!candidates.length) candidates = lessons;

    const weighted = candidates.map(lesson => ({ lesson, weight: randomWeight(lesson) }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * total;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) {
        lastRandomId = item.lesson.id;
        return item.lesson;
      }
    }
    const fallback = weighted[weighted.length - 1]?.lesson || null;
    if (fallback) lastRandomId = fallback.id;
    return fallback;
  }

  function chooseReviewLesson() {
    const latest = latestLesson();
    return lessons
      .filter(lesson => lesson.id !== latest?.id && lessonState(lesson.id).completed)
      .sort((a, b) => randomWeight(b) - randomWeight(a) || lessonTime(b) - lessonTime(a))[0] || null;
  }

  function renderHome() {
    currentLesson = null;
    document.body.classList.remove('is-practicing');
    progressWrap.hidden = true;
    document.title = 'Daily English Chunks';

    const latest = latestLesson();
    if (!latest) {
      app.innerHTML = '<section class="home"><p>Lessonがまだありません。</p></section>';
      return;
    }

    const done = lessons.filter(lesson => lessonState(lesson.id).completed).length;
    const review = chooseReviewLesson();
    const returning = state.visits > 1;
    const latestState = lessonState(latest.id);
    const savedStep = latestState.completed ? 0 : Math.min(latestState.lastStep || 0, PRACTICE_STEPS.length - 1);
    const hasProgress = !latestState.completed && savedStep > 0;

    app.innerHTML = `
      <section class="home ${returning ? 'is-returning' : ''}">
        <div class="home-intro">
          <div class="home-kicker-row">
            <p class="eyebrow">${done} lessons complete</p>
            <div class="home-shortcuts">
              <button class="text-button" id="homeRandom" type="button">Random ↝</button>
              <button class="text-button" id="openAllLessons" type="button">All lessons →</button>
            </div>
          </div>
          <h1>Read meaning,<br>not words.</h1>
          <p class="lead">英語を前から、意味のまとまりとして受け取る。最新の練習から、そのまま始める。</p>
        </div>

        <button class="next-card action-surface latest-card" id="startLatest" type="button">
          <span class="next-card-top">
            <span class="sequence-number">${formatDate(latest)}</span>
            <span class="next-state">${hasProgress ? 'CONTINUE' : latestState.completed ? 'REPLAY' : 'LATEST'}</span>
          </span>
          <span class="next-card-body">
            <span class="next-card-copy">
              <strong class="next-card-title">${escapeHTML(latest.title)}</strong>
              <span class="scene-copy">${escapeHTML(latest.sceneJa)}</span>
              <span class="lesson-facts"><span>${latest.minutes} min</span><span>Level ${latest.difficulty}</span><span>${latest.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span></span>
            </span>
            <span class="surface-arrow" aria-hidden="true">→</span>
          </span>
          ${hasProgress ? `<span class="resume-note">前回の続き：${PRACTICE_STEPS[savedStep].label}</span>` : ''}
        </button>

        <div class="experience-strip" aria-label="Practice history">
          <div><strong>${done}</strong><span>lessons</span></div>
          <div><strong>${state.stats.sentencesRead}</strong><span>sentences read</span></div>
          <div><strong>${state.stats.chunksRevealed}</strong><span>chunks revealed</span></div>
        </div>

        <section class="sequence-section" aria-label="Recent lessons">
          <div class="section-label-row">
            <div><p class="eyebrow">Recent</p><p class="micro-copy">作成日の新しい順。日付をタップして開く。</p></div>
          </div>
          ${renderRecentRail(latest.id)}
        </section>

        ${review ? `
          <section class="home-section">
            <div class="home-section-head"><div><h3>Quick Review</h3><p>少し引っかかったLessonを優先して戻す。</p></div></div>
            <button class="mini-review action-surface" id="reviewLesson" type="button">
              <span class="mini-review-copy"><small>${formatDate(review)}</small><strong>${escapeHTML(review.review)}</strong></span>
              <span class="surface-arrow" aria-hidden="true">→</span>
            </button>
          </section>` : ''}
      </section>`;

    document.getElementById('startLatest')?.addEventListener('click', () => openLesson(latest.id, hasProgress ? savedStep : 0));
    document.getElementById('homeRandom')?.addEventListener('click', openRandomLesson);
    document.getElementById('openAllLessons')?.addEventListener('click', () => renderArchive());
    document.getElementById('reviewLesson')?.addEventListener('click', () => openLesson(review.id, 0));
    bindRecentRail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderRecentRail(activeId) {
    return `<div class="sequence-rail">${newestLessons().map(lesson => {
      const saved = lessonState(lesson.id);
      return `<button class="sequence-item ${saved.completed ? 'is-done' : ''} ${lesson.id === activeId ? 'is-active' : ''}" data-recent-lesson="${lesson.id}" type="button">
        <span class="sequence-item-number">${formatDate(lesson, true)}</span>
        <span class="sequence-item-state">${lesson.id === activeId ? 'LATEST' : saved.completed ? '✓' : ''}</span>
      </button>`;
    }).join('')}</div>`;
  }

  function bindRecentRail() {
    document.querySelectorAll('[data-recent-lesson]').forEach(button => button.addEventListener('click', () => {
      const id = Number(button.dataset.recentLesson);
      const saved = lessonState(id);
      openLesson(id, saved.completed ? 0 : saved.lastStep || 0);
    }));
  }

  function openRandomLesson() {
    const lesson = chooseRandomLesson();
    if (lesson) openLesson(lesson.id, 0);
  }

  function openLesson(id, startStep = 0) {
    currentLesson = lessons.find(lesson => lesson.id === Number(id));
    if (!currentLesson) return renderHome();

    const requested = Number(startStep);
    stepIndex = Number.isFinite(requested) ? Math.max(0, Math.min(Math.trunc(requested), FLOW.length - 1)) : 0;
    if (lessonState(currentLesson.id).completed && stepIndex >= PRACTICE_STEPS.length) stepIndex = 0;

    showStepMenu = false;
    chunkSelections = {};
    quizSelections = {};
    revealedChunks = new Set();
    readSentences = new Set();
    speakRounds = new Set();
    showJapanese = false;
    showSpeakSlashes = true;
    sceneReady = false;
    hintLevel = 0;
    comparedChunks = false;
    readRecorded = new Set();
    revealRecorded = new Set();

    document.body.classList.add('is-practicing');
    progressWrap.hidden = false;
    renderLesson();
  }

  function renderLesson(options = {}) {
    const { preserveScroll = false } = options;
    const previousY = window.scrollY;
    const step = FLOW[stepIndex] || FLOW[0];
    const practiceIndex = Math.min(stepIndex, PRACTICE_STEPS.length - 1);
    const progress = step.key === 'complete' ? 100 : step.key === 'final' ? 96 : ((practiceIndex + 1) / PRACTICE_STEPS.length) * 90;
    progressBar.style.width = `${progress}%`;
    document.title = `${formatDate(currentLesson)} · ${currentLesson.title} — Daily English Chunks`;

    if (!['complete'].includes(step.key)) updateLessonState(currentLesson.id, { lastStep: stepIndex });

    app.innerHTML = `
      <section class="lesson focus-lesson">
        <div class="focus-bar">
          <button class="focus-exit" id="focusHome" type="button" aria-label="ホームへ戻る">×</button>
          <button class="focus-date" id="lessonPicker" type="button">${formatDate(currentLesson)}</button>
          <button class="focus-step" id="stepMenuToggle" type="button">${stepSummary(step)} <span>⌄</span></button>
        </div>
        ${showStepMenu ? renderStepMenu() : ''}
        <header class="lesson-head lesson-head-compact">
          <h1 class="lesson-title">${escapeHTML(currentLesson.title)}</h1>
          <div class="lesson-meta"><span>${currentLesson.minutes} min</span><span class="meta-dot">${currentLesson.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span></div>
        </header>
        ${renderStep(step.key)}
      </section>`;

    bindGlobalLessonEvents();
    bindStepEvents(step.key);
    updateNextCTA();

    if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: previousY, behavior: 'auto' }));
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function stepSummary(step) {
    if (step.key === 'final') return 'Final read';
    if (step.key === 'complete') return 'Done';
    return `${Math.min(stepIndex + 1, PRACTICE_STEPS.length)} / ${PRACTICE_STEPS.length} · ${step.label}`;
  }

  function renderStepMenu() {
    return `<nav class="compact-step-menu" aria-label="Lesson steps">${PRACTICE_STEPS.map((step, index) => `<button class="compact-step-item ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-past' : ''}" data-step-jump="${index}" type="button"><span>${index + 1}</span>${step.label}</button>`).join('')}</nav>`;
  }

  function renderStep(step) {
    if (step === 'imagine') return `
      <div class="step-heading"><p class="step-label">Imagine</p><h2 class="step-title">Before reading, build the scene.</h2><p class="step-intro">まず、書かれている場面や話し手の気持ちを想像する。場面が浮かんだらカードをタップ。</p></div>
      <button class="practice-card scene-card action-surface ${sceneReady ? 'is-ready' : ''}" id="sceneReady" type="button">
        <span class="scene-ready-mark">${sceneReady ? '✓ READY' : 'TAP WHEN YOU CAN SEE IT'}</span>
        <span class="scene-en">${escapeHTML(currentLesson.scene)}</span>
        <span class="scene-ja">${escapeHTML(currentLesson.sceneJa)}</span>
        <span class="emotion-arc">${currentLesson.emotions.map((emotion, index) => `${index ? '<span class="emotion-arrow">→</span>' : ''}<span class="emotion-chip">${escapeHTML(emotion)}</span>`).join('')}</span>
      </button>
      ${navFooter()}`;

    if (step === 'read') return `
      <div class="step-heading"><p class="step-label">Read</p><h2 class="step-title">Read once. Don’t analyze yet.</h2><p class="step-intro">文を読んだら、その文全体をタップ。訳さず、出来事だけ追う。</p></div>
      <div class="practice-card passage read-passage">${currentLesson.sentences.map((sentence, index) => `<button class="read-sentence ${readSentences.has(index) ? 'is-read' : ''}" data-read-sentence="${index}" type="button"><span class="read-check">${readSentences.has(index) ? '✓' : String(index + 1).padStart(2, '0')}</span><span>${escapeHTML(rawSentence(sentence))}</span></button>`).join('')}</div>
      ${navFooter()}`;

    if (step === 'chunk') return `
      <div class="step-heading"><p class="step-label">Chunk</p><h2 class="step-title">Where does one idea end?</h2><p class="step-intro">単語間をタップして `/` を入れる。正解当てではなく、自分の読み方を先に作る。</p></div>
      <div class="practice-card">
        <div class="chunk-editor">${currentLesson.sentences.map((sentence, index) => renderChunkEditor(sentence, index)).join('')}</div>
        <div class="chunk-tool-row">
          <button class="quiet-button" id="chunkHint" type="button">Hint${hintLevel ? ` ${hintLevel}/3` : ''}</button>
          <button class="secondary-button" id="compareChunks" type="button">差だけ比べる</button>
        </div>
        <div id="hintBox" class="hint-box">${renderHint()}</div>
        <div id="chunkCompare"></div>
      </div>
      ${navFooter()}`;

    if (step === 'understand') return `
      <div class="step-heading"><p class="step-label">Understand</p><h2 class="step-title">Build meaning from left to right.</h2><p class="step-intro">必要なチャンクだけタップして日本語を確認。押しても画面位置は動かない。</p></div>
      <div class="step-toolbar"><span class="eyebrow toolbar-label">Tap to reveal</span><button class="quiet-button" id="toggleJa" type="button">${showJapanese ? 'すべて隠す' : 'すべて表示'}</button></div>
      <div class="chunk-cards">${renderUnderstandChunks()}</div>
      ${navFooter()}`;

    if (step === 'check') return `
      <div class="step-heading"><p class="step-label">Check</p><h2 class="step-title">Retrieve before you reread.</h2><p class="step-intro">本文へ戻る前に、意味・気持ち・チャンクを思い出して答える。</p></div>
      <div class="practice-card"><div class="quiz-list">${currentLesson.questions.map((question, index) => renderQuiz(question, index)).join('')}</div></div>
      ${navFooter()}`;

    if (step === 'speak') return `
      <div class="step-heading"><p class="step-label">Speak</p><h2 class="step-title">Read the situation, not the sentence.</h2><p class="step-intro">意味 → リズム → 気持ち。3回読んだら、最後は補助なしで読む。</p></div>
      <div class="practice-card">
        <button class="speak-passage passage" id="toggleSpeakSlashes" type="button"><span class="speak-toggle-label">${showSpeakSlashes ? '/ ON · tap to hide' : '/ OFF · tap to show'}</span>${renderSpeakPassage()}</button>
        <div class="speak-count">${['Meaning', 'Rhythm', 'Emotion'].map((label, index) => `<button class="speak-round ${speakRounds.has(index) ? 'is-done' : ''}" data-round="${index}" type="button"><strong>${speakRounds.has(index) ? '✓' : index + 1}</strong><span>${label}</span><small>${['意味を追う', '流れを切らない', '気持ちを乗せる'][index]}</small></button>`).join('')}</div>
        <div class="emotion-note"><strong>Direction</strong><br>${escapeHTML(currentLesson.speak)}</div>
      </div>
      ${navFooter()}`;

    if (step === 'final') return `
      <section class="final-reading">
        <p class="step-label">Final read</p>
        <h2 class="final-title">Now read it without help.</h2>
        <p class="final-intro">スラッシュも訳も操作もなし。最初に想像した場面だけを持って、普通の英文として読む。</p>
        <div class="naked-passage">${currentLesson.sentences.map(sentence => `<p>${escapeHTML(rawSentence(sentence))}</p>`).join('')}</div>
        <div class="final-emotion">${currentLesson.emotions.map((emotion, index) => `${index ? '<span>→</span>' : ''}<strong>${escapeHTML(emotion)}</strong>`).join('')}</div>
      </section>
      ${navFooter()}`;

    const keep = currentLesson.review;
    return `
      <section class="complete-panel practice-card">
        <div class="complete-check">✓</div>
        <p class="eyebrow">Take one thing with you</p>
        <h2>${escapeHTML(keep)}</h2>
        <div class="complete-emotions">${currentLesson.emotions.map((emotion, index) => `${index ? '<span>→</span>' : ''}<strong>${escapeHTML(emotion)}</strong>`).join('')}</div>
        <div class="difficulty-row">${['easy', 'just-right', 'hard'].map(value => `<button type="button" data-difficulty="${value}" class="${lessonState(currentLesson.id).difficulty === value ? 'is-selected' : ''}">${value === 'easy' ? 'Easy' : value === 'just-right' ? 'Just right' : 'Hard'}</button>`).join('')}</div>
        <div class="complete-actions"><button class="secondary-button" id="rereadNaked" type="button">もう一度読む</button><button class="secondary-button" id="finishLesson" type="button">ホームへ</button><button class="primary-button" id="randomAfter" type="button">Random ↝</button></div>
      </section>`;
  }

  function renderChunkEditor(sentence, sentenceIndex) {
    const words = rawSentence(sentence).split(/\s+/);
    const selected = chunkSelections[sentenceIndex] || new Set();
    return `<div class="chunk-sentence" data-sentence-index="${sentenceIndex}">${words.map((word, index) => {
      const gap = index < words.length - 1 ? `<button class="gap-button ${selected.has(index) ? 'is-active' : ''}" data-sentence="${sentenceIndex}" data-gap="${index}" type="button" aria-label="${index + 1}語目の後で区切る"><span>/</span></button>` : '';
      return `<span class="word">${escapeHTML(word)}</span>${gap}`;
    }).join('')}</div>`;
  }

  function renderHint() {
    if (hintLevel === 0) return '';
    if (hintLevel === 1) return '<p><strong>Hint 1:</strong> まず「誰がどうした」の核を探す。単語数では切らない。</p>';
    if (hintLevel === 2) return '<p><strong>Hint 2:</strong> 最初の意味の境界だけ薄く示した。そこまでで小さな意味が成立するか確認する。</p>';
    return '<p><strong>Hint 3:</strong> モデルとの差分を表示した。答えを暗記せず、自分との違いだけ見る。</p>';
  }

  function applyHint() {
    document.querySelectorAll('.gap-button').forEach(button => button.classList.remove('is-hint-boundary'));
    if (hintLevel >= 2) {
      currentLesson.sentences.forEach((sentence, sentenceIndex) => {
        const firstBoundary = modelBoundaries(sentence)[0];
        if (Number.isInteger(firstBoundary)) document.querySelector(`.gap-button[data-sentence="${sentenceIndex}"][data-gap="${firstBoundary}"]`)?.classList.add('is-hint-boundary');
      });
    }
    const hintBox = document.getElementById('hintBox');
    if (hintBox) hintBox.innerHTML = renderHint();
    const button = document.getElementById('chunkHint');
    if (button) button.textContent = `Hint ${hintLevel}/3`;
    if (hintLevel >= 3) compareChunks();
  }

  function compareChunks() {
    comparedChunks = true;
    updateLessonState(currentLesson.id, { comparedChunks: true });
    const html = currentLesson.sentences.map((sentence, sentenceIndex) => {
      const words = rawSentence(sentence).split(/\s+/);
      const yours = chunkSelections[sentenceIndex] || new Set();
      const model = new Set(modelBoundaries(sentence));
      return `<div class="diff-sentence">${words.map((word, index) => {
        if (index === words.length - 1) return `<span class="word">${escapeHTML(word)}</span>`;
        const y = yours.has(index);
        const m = model.has(index);
        let gap = '<span class="diff-space"> </span>';
        if (y && m) gap = '<span class="diff-gap is-match" title="一致">/</span>';
        else if (y && !m) gap = '<span class="diff-gap is-yours" title="自分だけ">/</span>';
        else if (!y && m) gap = '<span class="diff-gap is-model" title="モデルのみ">＋/</span>';
        return `<span class="word">${escapeHTML(word)}</span>${gap}`;
      }).join('')}</div>`;
    }).join('');
    const target = document.getElementById('chunkCompare');
    if (target) target.innerHTML = `<div class="diff-legend"><span><i class="legend-match">/</i>一致</span><span><i class="legend-yours">/</i>自分だけ</span><span><i class="legend-model">＋/</i>モデルのみ</span></div><div class="diff-list">${html}</div>`;
    updateNextCTA();
  }

  function renderUnderstandChunks() {
    let index = 0;
    return currentLesson.sentences.flatMap(sentence => sentence.chunks).map(chunk => {
      const chunkIndex = index++;
      const revealed = showJapanese || revealedChunks.has(chunkIndex);
      return `<button class="chunk-card ${revealed ? 'is-revealed' : ''}" data-chunk-reveal="${chunkIndex}" type="button"><span class="chunk-en">${escapeHTML(chunk.en)}</span><span class="chunk-reveal-hint">${revealed ? '−' : '+'}</span><span class="chunk-ja" ${revealed ? '' : 'hidden'}>${escapeHTML(chunk.ja)}</span></button>`;
    }).join('');
  }

  function renderQuiz(question, index) {
    const selected = quizSelections[index];
    return `<div class="quiz-card" data-quiz-card="${index}"><div class="quiz-number">Q${index + 1} · ${escapeHTML(question.type)}</div><div class="quiz-question">${escapeHTML(question.question)}</div><div class="quiz-options">${question.options.map((option, optionIndex) => {
      const classes = ['quiz-option'];
      if (selected === optionIndex) classes.push('is-selected');
      if (selected !== undefined && optionIndex === question.answer) classes.push('is-correct');
      if (selected === optionIndex && optionIndex !== question.answer) classes.push('is-wrong');
      return `<button type="button" class="${classes.join(' ')}" data-question="${index}" data-option="${optionIndex}"><span class="option-key">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHTML(option)}</span></button>`;
    }).join('')}</div>${selected !== undefined ? `<p class="quiz-explanation">${selected === question.answer ? '✓ ' : ''}${escapeHTML(question.explanation)}</p>` : ''}</div>`;
  }

  function updateQuizCard(index) {
    const card = document.querySelector(`[data-quiz-card="${index}"]`);
    if (!card) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderQuiz(currentLesson.questions[index], index);
    card.replaceWith(wrapper.firstElementChild);
    bindQuizCard(index);
    updateNextCTA();
  }

  function bindQuizCard(index) {
    document.querySelectorAll(`[data-question="${index}"]`).forEach(button => button.addEventListener('click', () => {
      quizSelections[index] = Number(button.dataset.option);
      updateQuizCard(index);
    }));
  }

  function renderSpeakPassage() {
    return currentLesson.sentences.map(sentence => `<span class="speak-sentence">${sentence.chunks.map(chunk => escapeHTML(chunk.en)).join(showSpeakSlashes ? ' <span class="slash">/</span> ' : ' ')}</span>`).join('');
  }

  function navFooter() {
    return `<div class="step-actions focus-actions">${stepIndex > 0 ? '<button class="secondary-button" id="prevStep" type="button">← 戻る</button>' : '<span></span>'}<button class="primary-button" id="nextStep" type="button">次へ →</button></div>`;
  }

  function stepReady() {
    const step = FLOW[stepIndex]?.key;
    if (step === 'imagine') return sceneReady;
    if (step === 'read') return readSentences.size === currentLesson.sentences.length;
    if (step === 'chunk') return comparedChunks || Object.values(chunkSelections).some(set => set?.size);
    if (step === 'understand') return showJapanese || revealedChunks.size > 0;
    if (step === 'check') return Object.keys(quizSelections).length === currentLesson.questions.length;
    if (step === 'speak') return speakRounds.size === 3;
    return true;
  }

  function nextLabel() {
    const step = FLOW[stepIndex]?.key;
    if (step === 'imagine') return sceneReady ? 'Readへ →' : 'Readへ →';
    if (step === 'read') return readSentences.size === currentLesson.sentences.length ? '読み終えた · Chunkへ →' : 'Chunkへ →';
    if (step === 'chunk') return comparedChunks ? '差を確認した · Understandへ →' : 'Understandへ →';
    if (step === 'understand') return revealedChunks.size || showJapanese ? 'Checkへ →' : 'Checkへ →';
    if (step === 'check') return Object.keys(quizSelections).length === currentLesson.questions.length ? '確認できた · Speakへ →' : 'Speakへ →';
    if (step === 'speak') return speakRounds.size === 3 ? '最後に補助なしで読む →' : 'Final readへ →';
    if (step === 'final') return '読み切った →';
    return '次へ →';
  }

  function updateNextCTA() {
    const button = document.getElementById('nextStep');
    if (!button) return;
    button.textContent = nextLabel();
    button.classList.toggle('is-ready', stepReady());
  }

  function bindGlobalLessonEvents() {
    document.getElementById('focusHome')?.addEventListener('click', renderHome);
    document.getElementById('lessonPicker')?.addEventListener('click', () => renderArchive());
    document.getElementById('stepMenuToggle')?.addEventListener('click', () => {
      showStepMenu = !showStepMenu;
      renderLesson({ preserveScroll: true });
    });
    document.querySelectorAll('[data-step-jump]').forEach(button => button.addEventListener('click', () => {
      stepIndex = Number(button.dataset.stepJump);
      showStepMenu = false;
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
        toast('3回読んでから、最後の補助なし読みに進もう');
        return;
      }
      stepIndex = Math.min(FLOW.length - 1, stepIndex + 1);
      if (FLOW[stepIndex].key === 'complete') {
        updateLessonState(currentLesson.id, { completed: true, completedAt: new Date().toISOString(), readCount: speakRounds.size, lastStep: FLOW.length - 1 });
      }
      renderLesson();
    });

    document.getElementById('sceneReady')?.addEventListener('click', buttonEvent => {
      sceneReady = !sceneReady;
      const button = buttonEvent.currentTarget;
      button.classList.toggle('is-ready', sceneReady);
      const mark = button.querySelector('.scene-ready-mark');
      if (mark) mark.textContent = sceneReady ? '✓ READY' : 'TAP WHEN YOU CAN SEE IT';
      updateNextCTA();
    });

    document.querySelectorAll('[data-read-sentence]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.readSentence);
      const wasRead = readSentences.has(index);
      wasRead ? readSentences.delete(index) : readSentences.add(index);
      button.classList.toggle('is-read', !wasRead);
      const check = button.querySelector('.read-check');
      if (check) check.textContent = !wasRead ? '✓' : String(index + 1).padStart(2, '0');
      if (!wasRead && !readRecorded.has(index)) {
        readRecorded.add(index);
        state.stats.sentencesRead += 1;
        saveState();
      }
      updateNextCTA();
    }));

    document.querySelectorAll('.gap-button').forEach(button => button.addEventListener('click', () => {
      const sentenceIndex = Number(button.dataset.sentence);
      const gapIndex = Number(button.dataset.gap);
      if (!Number.isInteger(sentenceIndex) || !Number.isInteger(gapIndex)) return;
      if (!chunkSelections[sentenceIndex]) chunkSelections[sentenceIndex] = new Set();
      chunkSelections[sentenceIndex].has(gapIndex) ? chunkSelections[sentenceIndex].delete(gapIndex) : chunkSelections[sentenceIndex].add(gapIndex);
      button.classList.toggle('is-active');
      comparedChunks = false;
      document.getElementById('chunkCompare').innerHTML = '';
      updateNextCTA();
    }));

    document.getElementById('chunkHint')?.addEventListener('click', () => {
      hintLevel = Math.min(3, hintLevel + 1);
      updateLessonState(currentLesson.id, { helpUsed: (lessonState(currentLesson.id).helpUsed || 0) + 1 });
      applyHint();
    });
    document.getElementById('compareChunks')?.addEventListener('click', compareChunks);

    document.querySelectorAll('[data-chunk-reveal]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.chunkReveal);
      const revealed = revealedChunks.has(index);
      revealed ? revealedChunks.delete(index) : revealedChunks.add(index);
      button.classList.toggle('is-revealed', !revealed);
      const ja = button.querySelector('.chunk-ja');
      const sign = button.querySelector('.chunk-reveal-hint');
      if (ja) ja.hidden = revealed;
      if (sign) sign.textContent = revealed ? '+' : '−';
      if (!revealed && !revealRecorded.has(index)) {
        revealRecorded.add(index);
        state.stats.chunksRevealed += 1;
        saveState();
      }
      updateNextCTA();
    }));

    document.getElementById('toggleJa')?.addEventListener('click', event => {
      showJapanese = !showJapanese;
      document.querySelectorAll('[data-chunk-reveal]').forEach(button => {
        const ja = button.querySelector('.chunk-ja');
        const sign = button.querySelector('.chunk-reveal-hint');
        button.classList.toggle('is-revealed', showJapanese);
        if (ja) ja.hidden = !showJapanese;
        if (sign) sign.textContent = showJapanese ? '−' : '+';
      });
      event.currentTarget.textContent = showJapanese ? 'すべて隠す' : 'すべて表示';
      if (!showJapanese) revealedChunks = new Set();
      updateNextCTA();
    });

    currentLesson.questions.forEach((_, index) => bindQuizCard(index));

    document.getElementById('toggleSpeakSlashes')?.addEventListener('click', event => {
      showSpeakSlashes = !showSpeakSlashes;
      const target = event.currentTarget;
      const label = target.querySelector('.speak-toggle-label');
      if (label) label.textContent = showSpeakSlashes ? '/ ON · tap to hide' : '/ OFF · tap to show';
      const sentences = target.querySelectorAll('.speak-sentence');
      currentLesson.sentences.forEach((sentence, index) => {
        if (sentences[index]) sentences[index].innerHTML = sentence.chunks.map(chunk => escapeHTML(chunk.en)).join(showSpeakSlashes ? ' <span class="slash">/</span> ' : ' ');
      });
    });

    document.querySelectorAll('.speak-round').forEach(button => button.addEventListener('click', () => {
      const round = Number(button.dataset.round);
      const done = speakRounds.has(round);
      done ? speakRounds.delete(round) : speakRounds.add(round);
      button.classList.toggle('is-done', !done);
      const strong = button.querySelector('strong');
      if (strong) strong.textContent = !done ? '✓' : round + 1;
      updateNextCTA();
    }));

    document.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => {
      updateLessonState(currentLesson.id, { difficulty: button.dataset.difficulty });
      document.querySelectorAll('[data-difficulty]').forEach(item => item.classList.toggle('is-selected', item === button));
    }));

    document.getElementById('rereadNaked')?.addEventListener('click', () => {
      stepIndex = PRACTICE_STEPS.length;
      renderLesson();
    });
    document.getElementById('finishLesson')?.addEventListener('click', renderHome);
    document.getElementById('randomAfter')?.addEventListener('click', openRandomLesson);
  }

  function renderArchive(filter = 'all') {
    currentLesson = null;
    document.body.classList.remove('is-practicing');
    progressWrap.hidden = true;
    document.title = 'All lessons — Daily English Chunks';
    const allTags = [...new Set(lessons.flatMap(lesson => lesson.tags))];
    const filtered = filter === 'all' ? lessons : lessons.filter(lesson => lesson.tags.includes(filter));
    const visible = newestLessons(filtered);

    app.innerHTML = `
      <section class="archive">
        <header class="archive-head"><p class="eyebrow">Created</p><h1>All lessons</h1><p class="archive-lead">作成日の新しい順。Randomは、未完了・Hard・ヒントを使ったLessonを少し優先する。</p></header>
        <div class="archive-filters"><button class="filter-chip random-filter-chip" id="archiveRandom" type="button">↝ Random</button><button class="filter-chip ${filter === 'all' ? 'is-active' : ''}" data-filter="all" type="button">All</button>${allTags.map(tag => `<button class="filter-chip ${filter === tag ? 'is-active' : ''}" data-filter="${escapeHTML(tag)}" type="button">${escapeHTML(tag)}</button>`).join('')}</div>
        <div class="lesson-list">${visible.map(lesson => `<button class="lesson-row" data-lesson="${lesson.id}" type="button"><span class="lesson-row-day">${formatDate(lesson)}<span class="done-mark">${lessonState(lesson.id).completed ? '✓' : ''}</span></span><span class="lesson-row-main"><strong class="lesson-row-title">${escapeHTML(lesson.title)}</strong><span class="lesson-row-scene">${escapeHTML(lesson.sceneJa)}</span></span><span class="lesson-row-tags">${lesson.minutes} min · Lv.${lesson.difficulty}<br>${lesson.tags.slice(0, 2).map(escapeHTML).join(' · ')}</span><span class="lesson-row-arrow">→</span></button>`).join('')}</div>
      </section>`;

    document.getElementById('archiveRandom')?.addEventListener('click', openRandomLesson);
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => renderArchive(button.dataset.filter)));
    document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => {
      const id = Number(button.dataset.lesson);
      openLesson(id, lessonState(id).completed ? 0 : lessonState(id).lastStep || 0);
    }));
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
  randomBtn?.addEventListener('click', openRandomLesson);

  document.addEventListener('keydown', event => {
    if (!currentLesson || event.metaKey || event.ctrlKey || event.altKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (event.key === 'Escape') return renderHome();
    if (event.key === 'ArrowLeft' && stepIndex > 0) {
      stepIndex -= 1;
      renderLesson();
    }
    if (event.key === 'ArrowRight' && stepIndex < FLOW.length - 2) {
      if (FLOW[stepIndex].key === 'speak' && speakRounds.size < 3) return;
      stepIndex += 1;
      renderLesson();
    }
  });

  renderHome();
})();