(() => {
  const lessons = window.LESSONS || [];
  const app = document.getElementById('app');
  const homeBtn = document.getElementById('homeBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const progressWrap = document.getElementById('stepProgress');
  const progressBar = document.getElementById('stepProgressBar');
  const STORAGE_KEY = 'dailyEnglishChunks.v1';
  const STEPS = ['imagine', 'read', 'chunk', 'understand', 'check', 'speak', 'complete'];

  let state = loadState();
  let currentLesson = null;
  let stepIndex = 0;
  let chunkSelections = {};
  let quizSelections = {};
  let showJapanese = false;
  let speakRounds = new Set();

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { lessons: {} };
    } catch (_) {
      return { lessons: {} };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function lessonState(id) {
    return state.lessons[id] || {};
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getTodayLesson() {
    const exact = lessons.find(l => l.date === todayISO());
    if (exact) return exact;
    return lessons[lessons.length - 1];
  }

  function rawSentence(sentence) {
    return sentence.chunks.map(c => c.en).join(' ').replace(/\s+([,.!?;:])/g, '$1');
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
    const today = getTodayLesson();
    const done = lessons.filter(l => lessonState(l.id).completed).length;
    const review = lessons.find(l => l.id === Math.max(1, today.id - 1));

    app.innerHTML = `
      <section class="home">
        <p class="eyebrow">Daily practice · about 10 min</p>
        <h1>Read meaning,<br>not words.</h1>
        <p class="lead">英語を一語ずつ訳すのではなく、意味のまとまりで前から受け取る。毎日ひとつ、小さな場面を読んで、区切って、声に出す。</p>

        <article class="today-card">
          <div class="today-meta">
            <span>DAY ${String(today.id).padStart(2, '0')}</span>
            <span class="meta-dot">${today.minutes} min</span>
            <span class="meta-dot">Level ${today.difficulty}</span>
          </div>
          <h2>${escapeHTML(today.title)}</h2>
          <p class="scene-copy">${escapeHTML(today.sceneJa)}</p>
          <div class="today-actions">
            <button class="primary-button" id="startToday" type="button">${lessonState(today.id).completed ? 'もう一度やる' : '今日の練習を始める'} →</button>
            <button class="secondary-button" id="openLatest" type="button">英文を見る</button>
          </div>
          <div class="week-strip">${renderWeek(today)}</div>
        </article>

        ${review ? `
          <section class="home-section">
            <div class="home-section-head">
              <div><h3>Quick Review</h3><p>${done} / ${lessons.length} lessons completed</p></div>
            </div>
            <div class="mini-review">
              <div>
                <small>From Day ${String(review.id).padStart(2, '0')}</small>
                <strong>${escapeHTML(review.review)}</strong>
              </div>
              <button class="quiet-button" id="reviewLesson" type="button">Day ${String(review.id).padStart(2, '0')} を復習</button>
            </div>
          </section>
        ` : ''}
      </section>
    `;

    document.getElementById('startToday').addEventListener('click', () => openLesson(today.id, 0));
    document.getElementById('openLatest').addEventListener('click', () => openLesson(today.id, 1));
    document.getElementById('reviewLesson')?.addEventListener('click', () => openLesson(review.id, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderWeek(today) {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, i) => {
      const lesson = lessons[i];
      const isToday = lesson?.id === today.id;
      const done = lesson && lessonState(lesson.id).completed;
      return `<div class="day-dot ${isToday ? 'is-today' : ''} ${done ? 'is-done' : ''}"><span>${label}</span><strong>${lesson ? String(lesson.id).padStart(2, '0') : '—'}</strong></div>`;
    }).join('');
  }

  function openLesson(id, startStep = 0) {
    currentLesson = lessons.find(l => l.id === Number(id));
    if (!currentLesson) return renderHome();
    stepIndex = startStep;
    chunkSelections = {};
    quizSelections = {};
    showJapanese = false;
    speakRounds = new Set();
    progressWrap.hidden = false;
    renderLesson();
  }

  function renderLesson() {
    document.title = `${currentLesson.title} — Daily English Chunks`;
    const step = STEPS[stepIndex];
    progressBar.style.width = `${((stepIndex + 1) / STEPS.length) * 100}%`;
    app.innerHTML = `
      <section class="lesson">
        <header class="lesson-head">
          <div class="lesson-meta">
            <span>DAY ${String(currentLesson.id).padStart(2, '0')}</span>
            <span class="meta-dot">${currentLesson.minutes} min</span>
            <span class="meta-dot">${currentLesson.tags.slice(0,2).join(' · ')}</span>
          </div>
          <h1 class="lesson-title">${escapeHTML(currentLesson.title)}</h1>
        </header>
        ${renderStep(step)}
      </section>
    `;
    bindStepEvents(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStep(step) {
    if (step === 'imagine') return `
      <p class="step-label">01 · Imagine</p>
      <h2 class="step-title">Before reading, build the scene.</h2>
      <p class="step-intro">英文より先に、場面と気持ちを頭の中に置く。</p>
      <div class="practice-card">
        <div class="announcement">「まず、書かれている場面や話し手の気持ちを想像しながら読みましょう。」</div>
        <p class="eyebrow" style="margin-top:28px">Scene</p>
        <p style="font-size:1.15rem; line-height:1.8; margin:0">${escapeHTML(currentLesson.scene)}</p>
        <p style="color:var(--muted); line-height:1.8">${escapeHTML(currentLesson.sceneJa)}</p>
        <div class="emotion-arc">${currentLesson.emotions.map((e,i) => `${i ? '<span class="emotion-arrow">→</span>' : ''}<span class="emotion-chip">${escapeHTML(e)}</span>`).join('')}</div>
      </div>
      ${navButtons()}
    `;

    if (step === 'read') return `
      <p class="step-label">02 · Read</p>
      <h2 class="step-title">Read once. Don’t analyze yet.</h2>
      <p class="step-intro">スラッシュも訳もなし。知らない単語で止まらず、何が起きているかを追う。</p>
      <div class="practice-card passage">${currentLesson.sentences.map(s => `<p>${escapeHTML(rawSentence(s))}</p>`).join('')}</div>
      ${navButtons()}
    `;

    if (step === 'chunk') return `
      <p class="step-label">03 · Chunk</p>
      <h2 class="step-title">Where does one idea end?</h2>
      <p class="step-intro">単語と単語の間をタップして、自分で意味の区切りを入れてみる。正解当てではなく、まず自分の読み方を作る。</p>
      <div class="practice-card">
        <div class="chunk-editor">${currentLesson.sentences.map((s,i) => renderChunkEditor(s,i)).join('')}</div>
        <p class="chunk-hint">ヒント：単語数ではなく、「ここまでで小さな意味が成立するか」で切る。</p>
        <div style="margin-top:20px"><button class="secondary-button" id="compareChunks" type="button">モデルと比べる</button></div>
        <div id="chunkCompare"></div>
      </div>
      ${navButtons()}
    `;

    if (step === 'understand') return `
      <p class="step-label">04 · Understand</p>
      <h2 class="step-title">Build meaning from left to right.</h2>
      <p class="step-intro">きれいな日本語を作るより、「次にどんな情報が足されたか」を追う。</p>
      <div class="step-toolbar">
        <span class="eyebrow" style="margin:0">Chunks</span>
        <button class="quiet-button" id="toggleJa" type="button">${showJapanese ? '日本語を隠す' : '日本語を表示'}</button>
      </div>
      <div class="chunk-cards">${currentLesson.sentences.flatMap(s => s.chunks).map(c => `
        <div class="chunk-card">
          <div class="chunk-en">${escapeHTML(c.en)}</div>
          <div class="chunk-ja" ${showJapanese ? '' : 'hidden'}>${escapeHTML(c.ja)}</div>
        </div>`).join('')}
      </div>
      ${navButtons()}
    `;

    if (step === 'check') return `
      <p class="step-label">05 · Check</p>
      <h2 class="step-title">Retrieve before you reread.</h2>
      <p class="step-intro">本文を見返す前に、短く答えてみる。意味・気持ち・チャンクの3方向から確認。</p>
      <div class="practice-card"><div class="quiz-list">${currentLesson.questions.map((q,i) => renderQuiz(q,i)).join('')}</div></div>
      ${navButtons()}
    `;

    if (step === 'speak') return `
      <p class="step-label">06 · Speak</p>
      <h2 class="step-title">Read the situation, not the sentence.</h2>
      <p class="step-intro">3回読む。1回目は意味、2回目はリズム、3回目は気持ち。終わった回をタップ。</p>
      <div class="practice-card">
        <div class="passage">${currentLesson.sentences.map(s => `<p>${s.chunks.map(c => escapeHTML(c.en)).join(' <span style="color:var(--warm)">/</span> ')}</p>`).join('')}</div>
        <div class="speak-count">
          ${['Meaning','Rhythm','Emotion'].map((label,i) => `<button class="speak-round ${speakRounds.has(i) ? 'is-done' : ''}" data-round="${i}" type="button"><strong>${i+1}</strong><span>${label}</span></button>`).join('')}
        </div>
        <div class="emotion-note"><strong>Direction</strong><br>${escapeHTML(currentLesson.speak)}</div>
        <p style="color:var(--muted); line-height:1.8; margin:26px 0 0"><strong>Review:</strong> ${escapeHTML(currentLesson.review)}</p>
      </div>
      ${navButtons()}
    `;

    return `
      <p class="step-label">Done</p>
      <div class="practice-card complete-panel">
        <div class="complete-check">✓</div>
        <h2>Nice work.</h2>
        <p style="color:var(--muted); line-height:1.8">今日の英文を「単語」ではなく「意味の流れ」として読めたら十分。</p>
        <p class="eyebrow" style="margin-top:28px">How did it feel?</p>
        <div class="difficulty-row">
          ${['easy','just-right','hard'].map(v => `<button type="button" data-difficulty="${v}" class="${lessonState(currentLesson.id).difficulty === v ? 'is-selected' : ''}">${v === 'easy' ? 'Easy' : v === 'just-right' ? 'Just right' : 'Hard'}</button>`).join('')}
        </div>
        <div style="margin-top:28px"><button class="primary-button" id="finishLesson" type="button">ホームへ戻る</button></div>
      </div>
    `;
  }

  function renderChunkEditor(sentence, sentenceIndex) {
    const words = rawSentence(sentence).split(/\s+/);
    const selected = chunkSelections[sentenceIndex] || new Set();
    return `<div class="chunk-sentence">${words.map((w,i) => {
      const gap = i < words.length - 1 ? `<button class="gap-button ${selected.has(i) ? 'is-active' : ''}" data-sentence="${sentenceIndex}" data-gap="${i}" type="button" aria-label="${i+1}語目の後で区切る"></button>` : '';
      return `<span class="word">${escapeHTML(w)}</span>${gap}`;
    }).join('')}</div>`;
  }

  function compareChunks() {
    const html = currentLesson.sentences.map((s,i) => {
      const words = rawSentence(s).split(/\s+/);
      const selected = chunkSelections[i] || new Set();
      const model = new Set(modelBoundaries(s));
      const withBreaks = breaks => words.map((w,idx) => `${escapeHTML(w)}${idx < words.length - 1 ? (breaks.has(idx) ? ' / ' : ' ') : ''}`).join('');
      return `<div class="compare-item"><div class="compare-label">Sentence ${i+1} · Yours</div><div class="compare-text">${withBreaks(selected)}</div><div class="compare-label" style="margin-top:10px">Model</div><div class="compare-text compare-model">${withBreaks(model)}</div></div>`;
    }).join('');
    document.getElementById('chunkCompare').innerHTML = `<div class="compare-list">${html}</div>`;
  }

  function renderQuiz(q, i) {
    const selected = quizSelections[i];
    return `<div class="quiz-card">
      <div class="quiz-number">Q${i+1} · ${escapeHTML(q.type)}</div>
      <div class="quiz-question">${escapeHTML(q.question)}</div>
      <div class="quiz-options">${q.options.map((option,j) => {
        const classes = ['quiz-option'];
        if (selected === j) classes.push('is-selected');
        if (selected !== undefined && j === q.answer) classes.push('is-correct');
        if (selected === j && j !== q.answer) classes.push('is-wrong');
        return `<button type="button" class="${classes.join(' ')}" data-question="${i}" data-option="${j}">${escapeHTML(option)}</button>`;
      }).join('')}</div>
      ${selected !== undefined ? `<p class="quiz-explanation">${selected === q.answer ? '✓ ' : ''}${escapeHTML(q.explanation)}</p>` : ''}
    </div>`;
  }

  function navButtons() {
    return `<div class="step-actions">
      ${stepIndex > 0 ? '<button class="secondary-button" id="prevStep" type="button">← 戻る</button>' : '<span></span>'}
      <button class="primary-button" id="nextStep" type="button">${stepIndex === STEPS.length - 2 ? '完了する' : '次へ'} →</button>
    </div>`;
  }

  function bindStepEvents(step) {
    document.getElementById('prevStep')?.addEventListener('click', () => { stepIndex = Math.max(0, stepIndex - 1); renderLesson(); });
    document.getElementById('nextStep')?.addEventListener('click', () => {
      if (step === 'speak' && speakRounds.size < 3) toast('音読3回をタップしてから完了しよう');
      stepIndex = Math.min(STEPS.length - 1, stepIndex + 1);
      if (STEPS[stepIndex] === 'complete') {
        state.lessons[currentLesson.id] = { ...lessonState(currentLesson.id), completed: true, completedAt: new Date().toISOString(), readCount: speakRounds.size };
        saveState();
      }
      renderLesson();
    });

    document.querySelectorAll('.gap-button').forEach(btn => btn.addEventListener('click', () => {
      const s = Number(btn.dataset.sentence);
      const g = Number(btn.dataset.gap);
      if (!chunkSelections[s]) chunkSelections[s] = new Set();
      chunkSelections[s].has(g) ? chunkSelections[s].delete(g) : chunkSelections[s].add(g);
      btn.classList.toggle('is-active');
    }));
    document.getElementById('compareChunks')?.addEventListener('click', compareChunks);
    document.getElementById('toggleJa')?.addEventListener('click', () => { showJapanese = !showJapanese; renderLesson(); });

    document.querySelectorAll('.quiz-option').forEach(btn => btn.addEventListener('click', () => {
      quizSelections[Number(btn.dataset.question)] = Number(btn.dataset.option);
      renderLesson();
    }));

    document.querySelectorAll('.speak-round').forEach(btn => btn.addEventListener('click', () => {
      const r = Number(btn.dataset.round);
      speakRounds.has(r) ? speakRounds.delete(r) : speakRounds.add(r);
      btn.classList.toggle('is-done');
    }));

    document.querySelectorAll('[data-difficulty]').forEach(btn => btn.addEventListener('click', () => {
      state.lessons[currentLesson.id] = { ...lessonState(currentLesson.id), difficulty: btn.dataset.difficulty };
      saveState();
      renderLesson();
    }));
    document.getElementById('finishLesson')?.addEventListener('click', renderHome);
  }

  function renderArchive(filter = 'all') {
    currentLesson = null;
    progressWrap.hidden = true;
    const allTags = [...new Set(lessons.flatMap(l => l.tags))];
    const visible = filter === 'all' ? lessons : lessons.filter(l => l.tags.includes(filter));
    app.innerHTML = `
      <section class="archive">
        <header class="archive-head"><p class="eyebrow">Library</p><h1>All lessons</h1></header>
        <div class="archive-filters">
          <button class="filter-chip ${filter === 'all' ? 'is-active' : ''}" data-filter="all" type="button">All</button>
          ${allTags.map(tag => `<button class="filter-chip ${filter === tag ? 'is-active' : ''}" data-filter="${escapeHTML(tag)}" type="button">${escapeHTML(tag)}</button>`).join('')}
        </div>
        <div class="lesson-list">${visible.map(l => `
          <button class="lesson-row" data-lesson="${l.id}" type="button">
            <div class="lesson-row-day">DAY ${String(l.id).padStart(2,'0')}${lessonState(l.id).completed ? '<br><span class="done-mark">DONE</span>' : ''}</div>
            <div class="lesson-row-title">${escapeHTML(l.title)}</div>
            <div class="lesson-row-tags">${l.tags.join(' · ')}<br>${l.minutes} min · Lv.${l.difficulty}</div>
          </button>`).join('')}</div>
      </section>`;
    document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => renderArchive(btn.dataset.filter)));
    document.querySelectorAll('[data-lesson]').forEach(btn => btn.addEventListener('click', () => openLesson(Number(btn.dataset.lesson), 0)));
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
    return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  homeBtn.addEventListener('click', renderHome);
  archiveBtn.addEventListener('click', () => renderArchive());
  renderHome();
})();
