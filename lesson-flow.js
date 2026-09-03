(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const nativeScrollTo = window.scrollTo.bind(window);
  let pendingCause = null;
  let scheduled = false;

  const CONTINUATION_CAUSES = new Set(['next', 'previous', 'menu']);

  function markCause(cause) {
    pendingCause = cause;
  }

  function isTopReset(args) {
    if (!args.length) return false;
    const first = args[0];
    if (typeof first === 'object' && first !== null) return Number(first.top) === 0;
    return Number(args[1]) === 0;
  }

  window.scrollTo = (...args) => {
    if (pendingCause && CONTINUATION_CAUSES.has(pendingCause) && isTopReset(args)) return;
    nativeScrollTo(...args);
  };

  function currentStepKey() {
    const lesson = app.querySelector('.lesson');
    if (!lesson) return null;

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

  function practiceAnchor(step) {
    const selectors = {
      imagine: '.scene-card',
      read: '.read-passage',
      chunk: '.chunk-editor',
      understand: '.chunk-cards',
      check: '.quiz-list',
      speak: '.speak-passage',
      final: '.naked-passage',
      complete: '.complete-panel'
    };
    return selectors[step] ? app.querySelector(selectors[step]) : null;
  }

  function orientationAnchor(step) {
    if (step === 'final') return app.querySelector('.final-reading');
    if (step === 'complete') return app.querySelector('.complete-panel');
    return app.querySelector('.step-heading') || practiceAnchor(step);
  }

  function viewportOffset(cause) {
    const height = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    if (cause === 'next') return Math.min(150, Math.max(88, height * 0.16));
    return Math.min(112, Math.max(64, height * 0.10));
  }

  function moveToAnchor(cause) {
    const step = currentStepKey();
    if (!step) {
      pendingCause = null;
      return;
    }

    const target = cause === 'next' ? practiceAnchor(step) : orientationAnchor(step);
    if (!target) {
      pendingCause = null;
      return;
    }

    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - viewportOffset(cause));
    nativeScrollTo({ top, behavior: 'auto' });
    app.focus({ preventScroll: true });
    pendingCause = null;
  }

  function scheduleMove() {
    if (!pendingCause || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scheduled = false;
        if (pendingCause) moveToAnchor(pendingCause);
      });
    });
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('#nextStep')) markCause('next');
    else if (target.closest('#prevStep')) markCause('previous');
    else if (target.closest('[data-step-jump]')) markCause('menu');
    else if (target.closest('#focusHome, #lessonPicker, #finishLesson, #randomAfter')) pendingCause = null;
  }, true);

  const observer = new MutationObserver(() => {
    if (!app.querySelector('.lesson')) {
      pendingCause = null;
      return;
    }
    scheduleMove();
  });

  observer.observe(app, { childList: true, subtree: false });
})();
