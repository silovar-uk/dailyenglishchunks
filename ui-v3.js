(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const STEP_LABELS = {
    imagine: { status: '場面をつくる', next: '英文を読んでみる' },
    read: { status: 'まず一度、止まらず読む', next: '自分で区切ってみる' },
    chunk: { status: '意味のまとまりを自分で決める', next: '意味を確かめる' },
    understand: { status: '前から意味を積み上げる', next: '理解をチェックする' },
    check: { status: '思い出してから確認する', next: '声に出して仕上げる' },
    speak: { status: '意味 → リズム → 気持ち', next: '今日の練習を完了' }
  };

  function currentStep() {
    const label = document.querySelector('.step-label')?.textContent || '';
    const normalized = label.toLowerCase();
    return Object.keys(STEP_LABELS).find(key => normalized.includes(key)) || null;
  }

  function setLessonStep(step) {
    const lesson = document.querySelector('.lesson');
    if (!lesson || !step) return;
    lesson.dataset.uiStep = step;

    document.querySelectorAll('.step-chip').forEach(button => {
      button.removeAttribute('aria-current');
      if (button.classList.contains('is-active')) button.setAttribute('aria-current', 'step');
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
    button.textContent = `${STEP_LABELS[step].next} →`;
  }

  function enhanceChunk() {
    const editor = document.querySelector('.chunk-editor');
    if (!editor) return;

    const activeCount = editor.querySelectorAll('.gap-button.is-active').length;
    const status = document.querySelector('.ui-step-status');
    if (status) {
      status.innerHTML = `<span>CHUNKS</span><strong>${activeCount ? `${activeCount}か所に区切り` : '区切りたい場所をタップ'}</strong>`;
    }

    const toolRow = document.querySelector('.chunk-tool-row');
    if (toolRow && !document.querySelector('.ui-chunk-legend')) {
      const legend = document.createElement('div');
      legend.className = 'ui-chunk-legend';
      legend.innerHTML = '<span><i></i>自分の区切り</span><span><i></i>モデルの区切り</span>';
      toolRow.insertAdjacentElement('afterend', legend);
    }
  }

  function enhanceCheck() {
    const list = document.querySelector('.quiz-list');
    if (!list) return;

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

    progress.querySelector('.ui-check-progress-bar').style.width = `${percentage}%`;
    progress.querySelector('.ui-check-progress-count').textContent = `${answered} / ${total} checked`;

    const status = document.querySelector('.ui-step-status');
    if (status) {
      status.classList.toggle('is-complete', total > 0 && answered === total);
      status.innerHTML = `<span>CHECK</span><strong>${answered === total && total ? '全部確認できた' : `あと${Math.max(0, total - answered)}問`}</strong>`;
    }

    let complete = document.querySelector('.ui-check-complete');
    if (answered === total && total > 0) {
      if (!complete) {
        complete = document.createElement('div');
        complete.className = 'ui-check-complete';
        complete.textContent = '✓ 3方向から確認できた。次は、意味を保ったまま声に出す。';
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
    rounds.forEach(button => button.classList.remove('ui-is-next'));
    const next = rounds.find(button => !button.classList.contains('is-done'));
    if (next) next.classList.add('ui-is-next');

    const status = document.querySelector('.ui-step-status');
    if (status) {
      status.classList.toggle('is-complete', doneCount === rounds.length);
      status.innerHTML = `<span>SPEAK</span><strong>${doneCount === rounds.length ? '3回完了' : `${doneCount} / ${rounds.length} rounds`}</strong>`;
    }

    const nextButton = document.getElementById('nextStep');
    if (nextButton) nextButton.classList.toggle('ui-ready', doneCount === rounds.length);
  }

  function enhance() {
    const step = currentStep();
    if (!step) return;

    setLessonStep(step);
    enhanceContextStatus(step);
    enhanceNextButton(step);

    if (step === 'chunk') enhanceChunk();
    if (step === 'check') enhanceCheck();
    if (step === 'speak') enhanceSpeak();
  }

  function afterEvent() {
    requestAnimationFrame(() => requestAnimationFrame(enhance));
  }

  document.addEventListener('click', afterEvent);
  document.addEventListener('keydown', afterEvent);

  const observer = new MutationObserver(() => {
    if (!document.querySelector('.lesson')) return;
    requestAnimationFrame(enhance);
  });
  observer.observe(app, { childList: true, subtree: false });

  enhance();
})();
