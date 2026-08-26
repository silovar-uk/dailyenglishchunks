(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const STEP_LABELS = {
    imagine: { status: '場面をつくる', next: '英文を読んでみる' },
    read: { status: 'まず一度、止まらず読む', next: '自分で区切ってみる' },
    chunk: { status: '意味のまとまりを自分で決める', next: '意味を確かめる' },
    understand: { status: '前から意味を積み上げる', next: '理解をチェックする' },
    check: { status: '思い出してから確認する', next: '声に出して仕上げる' },
    speak: { status: '意味 → リズム → 気持ち', next: '補助なしで最後に読む' }
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

  function setStatus(status, label, copy, complete = false) {
    if (!status) return;
    status.classList.toggle('is-complete', complete);

    let labelNode = status.querySelector('span');
    let copyNode = status.querySelector('strong');
    if (!labelNode || !copyNode) {
      status.innerHTML = `<span>${label}</span><strong>${copy}</strong>`;
      return;
    }

    setText(labelNode, label);
    setText(copyNode, copy);
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

  function enhanceContextStatus(step) {
    const intro = document.querySelector('.step-intro');
    if (!intro || !step || document.querySelector('.ui-step-status')) return;

    const status = document.createElement('div');
    status.className = 'ui-step-status';
    status.innerHTML = `<span>NOW</span><strong>${STEP_LABELS[step].status}</strong>`;
    intro.insertAdjacentElement('afterend', status);
  }

  function enhanceNextButton(step) {
    const button = document.getElementById('nextStep');
    if (!button || !step) return;
    setText(button, `${STEP_LABELS[step].next} →`);
  }

  function enhanceChunk() {
    const editor = document.querySelector('.chunk-editor');
    if (!editor) return;

    const activeCount = editor.querySelectorAll('.gap-button.is-active').length;
    const status = document.querySelector('.ui-step-status');
    setStatus(status, 'CHUNKS', activeCount ? `${activeCount}か所に区切り` : '区切りたい場所をタップ');

    const toolRow = document.querySelector('.chunk-tool-row');
    if (toolRow && !document.querySelector('.ui-chunk-legend')) {
      const legend = document.createElement('div');
      legend.className = 'ui-chunk-legend';
      legend.innerHTML = '<span><i></i>自分の区切り</span><span><i></i>モデルとの差を確認</span>';
      toolRow.insertAdjacentElement('afterend', legend);
    }
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
          const button = buttons.find(item => Number(button.dataset.option) === optionId);
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

    const completeNow = total > 0 && answered === total;
    const status = document.querySelector('.ui-step-status');
    setStatus(status, 'CHECK', completeNow ? '全部確認できた' : `あと${Math.max(0, total - answered)}問`, completeNow);

    let complete = document.querySelector('.ui-check-complete');
    if (completeNow) {
      if (!complete) {
        complete = document.createElement('div');
        complete.className = 'ui-check-complete';
        complete.textContent = '✓ 意味・気持ち・チャンクを確認できた。次は、意味を保ったまま声に出す。';
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

    const complete = doneCount === rounds.length;
    const status = document.querySelector('.ui-step-status');
    setStatus(status, 'SPEAK', doneCount === 0 ? '3回読む' : `${doneCount}回完了`, complete);

    const nextButton = document.getElementById('nextStep');
    if (nextButton) nextButton.classList.toggle('ui-ready', complete);
  }

  function enhance() {
    const step = currentStep();
    if (!step) {
      checkSessionKey = null;
      quizOrders.clear();
      return;
    }

    setLessonStep(step);
    enhanceContextStatus(step);
    enhanceNextButton(step);

    if (step === 'chunk') enhanceChunk();
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
