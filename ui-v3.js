(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const STEP_LABELS = {
    imagine: { next: 'Read' },
    read: { next: 'Chunk' },
    chunk: { next: 'Understand' },
    understand: { next: 'Check' },
    check: { next: 'Speak' },
    speak: { next: 'Final read' }
  };

  const STEP_COPY = {
    imagine: { title: 'Build the scene.', intro: '場面が浮かんだらタップ。' },
    read: { title: 'Read once.', intro: '訳さず、出来事だけ追う。' },
    chunk: { title: 'Find the boundaries.', intro: '意味が切り替わる場所をタップ。' },
    understand: { title: 'Build meaning.', intro: '必要なチャンクだけ日本語で確認。' },
    check: { title: 'Recall first.', intro: '本文に戻らず、思い出して答える。' },
    speak: { title: 'Read it aloud.', intro: '意味 → リズム → 気持ち。' }
  };

  let checkSessionKey = null;
  let enhanceFrame = null;
  const quizOrders = new Map();

  function setText(node, value) {
    if (!node) return;
    const next = String(value);
    if (node.textContent === next) return;

    if (node.childNodes.length === 1 && node.firstChild?.nodeType === Node.TEXT_NODE) {
      node.firstChild.data = next;
      return;
    }

    node.textContent = next;
  }

  function currentStep() {
    const label = document.querySelector('.step-label')?.textContent || '';
    const normalized = label.toLowerCase();
    return Object.keys(STEP_LABELS).find(key => normalized.includes(key)) || null;
  }

  function currentLessonKey() {
    return `${document.querySelector('.focus-date')?.textContent || ''}|${document.title}`;
  }

  function shuffled(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function setLessonStep(step) {
    const lesson = document.querySelector('.lesson');
    if (!lesson || !step) return;
    if (lesson.dataset.uiStep !== step) lesson.dataset.uiStep = step;

    document.querySelectorAll('.compact-step-item').forEach(button => {
      const active = button.classList.contains('is-active');
      const current = button.getAttribute('aria-current') === 'step';
      if (active && !current) button.setAttribute('aria-current', 'step');
      if (!active && current) button.removeAttribute('aria-current');
    });
  }

  function simplifyLessonHeader() {
    const metaDetail = document.querySelector('.lesson-meta .meta-dot');
    if (metaDetail) metaDetail.hidden = true;
  }

  function simplifyStepHeading(step) {
    const heading = document.querySelector('.step-heading');
    if (!heading || !step) return;

    const copy = STEP_COPY[step];
    const label = heading.querySelector('.step-label');
    const title = heading.querySelector('.step-title');
    const intro = heading.querySelector('.step-intro');

    if (label) label.hidden = true;
    if (copy?.title) setText(title, copy.title);
    if (copy?.intro) setText(intro, copy.intro);
  }

  function removeLegacyStatus() {
    document.querySelectorAll('.ui-step-status').forEach(node => node.remove());
  }

  function enhanceNextButton(step) {
    const button = document.getElementById('nextStep');
    if (!button || !step) return;
    setText(button, `${STEP_LABELS[step].next} →`);
  }

  function applyQuizOrder() {
    const list = document.querySelector('.quiz-list');
    if (!list) return;

    const lessonKey = currentLessonKey();
    if (checkSessionKey !== lessonKey) {
      checkSessionKey = lessonKey;
      quizOrders.clear();
    }

    list.querySelectorAll('.quiz-card').forEach((card, questionIndex) => {
      const options = card.querySelector('.quiz-options');
      if (!options) return;
      const buttons = [...options.querySelectorAll('.quiz-option')];
      if (buttons.length < 2) return;

      if (!quizOrders.has(questionIndex)) {
        const ids = buttons.map(button => Number(button.dataset.option)).filter(Number.isInteger);
        quizOrders.set(questionIndex, shuffled(ids));
      }

      const order = quizOrders.get(questionIndex);
      const currentOrder = buttons.map(button => Number(button.dataset.option));
      const needsReorder = order.some((optionId, index) => currentOrder[index] !== optionId);

      if (needsReorder) {
        order.forEach(optionId => {
          const button = buttons.find(item => Number(item.dataset.option) === optionId);
          if (button) options.appendChild(button);
        });
      }

      [...options.querySelectorAll('.quiz-option')].forEach((button, visualIndex) => {
        const key = button.querySelector('.option-key');
        const nextKey = String.fromCharCode(65 + visualIndex);
        setText(key, nextKey);
      });
    });
  }

  function enhanceCheck() {
    const list = document.querySelector('.quiz-list');
    if (!list) return;

    applyQuizOrder();

    const cards = [...list.querySelectorAll('.quiz-card')];
    const answered = cards.filter(card => card.querySelector('.quiz-option.is-selected')).length;
    const total = cards.length;
    const percentage = total ? (answered / total) * 100 : 0;

    let progress = document.querySelector('.ui-check-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'ui-check-progress';
      progress.innerHTML = '<div class="ui-check-progress-track"><div class="ui-check-progress-bar"></div></div><div class="ui-check-progress-count"></div>';
      list.insertAdjacentElement('beforebegin', progress);
    }

    const bar = progress.querySelector('.ui-check-progress-bar');
    const count = progress.querySelector('.ui-check-progress-count');
    const width = `${percentage}%`;
    if (bar && bar.style.width !== width) bar.style.width = width;
    setText(count, `${answered} / ${total}`);

    let complete = document.querySelector('.ui-check-complete');
    const completeNow = total > 0 && answered === total;
    if (completeNow) {
      if (!complete) {
        complete = document.createElement('div');
        complete.className = 'ui-check-complete';
        complete.textContent = '✓ 確認完了。次は声に出す。';
        list.insertAdjacentElement('afterend', complete);
      }
    } else {
      complete?.remove();
    }
  }

  function enhanceSpeak() {
    const rounds = [...document.querySelectorAll('.speak-round')];
    if (!rounds.length) return;

    const doneCount = rounds.filter(button => button.classList.contains('is-done')).length;
    rounds.forEach(button => {
      button.classList.remove('ui-is-next');
      const pressed = button.classList.contains('is-done') ? 'true' : 'false';
      if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
    });

    const next = rounds.find(button => !button.classList.contains('is-done'));
    if (next) next.classList.add('ui-is-next');

    const nextButton = document.getElementById('nextStep');
    if (nextButton) nextButton.classList.toggle('ui-ready', doneCount === rounds.length);
  }

  function enhance() {
    const step = currentStep();
    if (!step) {
      checkSessionKey = null;
      quizOrders.clear();
      return;
    }

    setLessonStep(step);
    simplifyLessonHeader();
    simplifyStepHeading(step);
    removeLegacyStatus();
    enhanceNextButton(step);

    if (step === 'check') enhanceCheck();
    if (step === 'speak') enhanceSpeak();
  }

  function scheduleEnhance() {
    if (enhanceFrame !== null) return;
    enhanceFrame = requestAnimationFrame(() => {
      enhanceFrame = null;
      enhance();
    });
  }

  function afterEvent() {
    requestAnimationFrame(scheduleEnhance);
  }

  document.addEventListener('click', afterEvent);
  document.addEventListener('keydown', afterEvent);

  const observer = new MutationObserver(() => {
    if (!document.querySelector('.lesson')) return;
    scheduleEnhance();
  });
  observer.observe(app, { childList: true, subtree: true });

  enhance();
})();
