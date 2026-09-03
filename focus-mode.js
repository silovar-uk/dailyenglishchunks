(() => {
  const app = document.getElementById('app');
  if (!app) return;

  function currentStep(lesson) {
    if (lesson.querySelector('.complete-panel')) return 'complete';
    if (lesson.querySelector('.final-reading')) return 'final';

    const summary = lesson.querySelector('.focus-step')?.textContent?.toLowerCase() || '';
    if (summary.includes('imagine')) return 'imagine';
    if (summary.includes('read')) return 'read';
    if (summary.includes('chunk')) return 'chunk';
    if (summary.includes('understand')) return 'understand';
    if (summary.includes('check')) return 'check';
    if (summary.includes('speak')) return 'speak';
    return null;
  }

  function enhanceFocusIdentity(lesson) {
    const button = lesson.querySelector('.focus-date');
    const title = lesson.querySelector('.lesson-title')?.textContent?.trim();
    if (!button || !title) return;

    const date = button.dataset.focusDate || button.textContent.trim();
    button.dataset.focusDate = date;

    let day = button.querySelector('.focus-date-day');
    let name = button.querySelector('.focus-date-title');

    if (!day || !name) {
      button.textContent = '';
      day = document.createElement('span');
      day.className = 'focus-date-day';
      name = document.createElement('span');
      name.className = 'focus-date-title';
      button.append(day, name);
    }

    day.textContent = date;
    name.textContent = title;
    button.setAttribute('aria-label', `${date} ${title}。Lesson一覧を開く`);
  }

  function sync() {
    const lesson = app.querySelector('.lesson');
    if (!lesson) return;

    const step = currentStep(lesson);
    if (step) lesson.dataset.focusStep = step;
    else lesson.removeAttribute('data-focus-step');

    enhanceFocusIdentity(lesson);
  }

  const observer = new MutationObserver(sync);
  observer.observe(app, { childList: true, subtree: false });

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('#stepMenuToggle, [data-step-jump], #nextStep, #prevStep')) return;
    requestAnimationFrame(sync);
  });

  sync();
})();
