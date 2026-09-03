(() => {
  const app = document.getElementById('app');
  const progress = document.getElementById('stepProgress');
  if (!app) return;

  function resetPracticeUI() {
    document.body.classList.remove('is-practicing');
    document.documentElement.classList.remove('is-practicing');

    if (progress) progress.hidden = true;

    app.removeAttribute('data-ui-step');
    app.style.removeProperty('width');
    app.style.removeProperty('max-width');
    app.style.removeProperty('margin');
    app.style.removeProperty('padding');

    document.querySelectorAll('.ui-step-status, .ui-check-progress, .ui-check-complete, .ui-chunk-legend')
      .forEach(node => {
        if (!node.closest('.home, .archive')) return;
        node.remove();
      });
  }

  function isOverviewVisible() {
    return Boolean(app.querySelector('.home, .archive'));
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('#focusHome, #lessonPicker')) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isOverviewVisible()) resetPracticeUI();
        });
      });
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (isOverviewVisible()) resetPracticeUI();
  });
  observer.observe(app, { childList: true, subtree: false });

  if (isOverviewVisible()) resetPracticeUI();
})();
