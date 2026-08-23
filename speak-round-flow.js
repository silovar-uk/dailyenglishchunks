(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const ROUND_FOCUS = [
    { label: 'MEANING', copy: '意味を追う' },
    { label: 'RHYTHM', copy: 'もう一度、流れを意識して' },
    { label: 'EMOTION', copy: 'もう一度、気持ちを乗せて' }
  ];

  const RESET_DELAY_MS = 110;
  const MIN_DURATION_MS = 460;
  const MAX_DURATION_MS = 720;
  let activeReset = null;
  let arrivalTimer = null;

  function speakRounds() {
    return [...document.querySelectorAll('.speak-round')];
  }

  function currentFocus() {
    const rounds = speakRounds();
    if (!rounds.length) return null;

    const next = rounds.find(button => !button.classList.contains('is-done'));
    if (!next) return { complete: true, index: ROUND_FOCUS.length - 1 };

    const index = Number(next.dataset.round);
    if (!Number.isInteger(index) || !ROUND_FOCUS[index]) return null;
    return { complete: false, index };
  }

  function ensureFocusIndicator() {
    const passage = document.querySelector('.speak-passage');
    if (!passage) return;

    let indicator = document.querySelector('.speak-reading-focus');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'speak-reading-focus';
      indicator.setAttribute('aria-live', 'polite');
      passage.insertAdjacentElement('beforebegin', indicator);
    }

    const focus = currentFocus();
    if (!focus) return;

    let nextHTML;
    if (focus.complete) {
      nextHTML = '<span>3 / 3 · COMPLETE</span><strong>3回完了。次は補助なしで読む</strong>';
    } else {
      const meta = ROUND_FOCUS[focus.index];
      nextHTML = `<span>${focus.index + 1} / 3 · ${meta.label}</span><strong>${meta.copy}</strong>`;
    }

    if (indicator.innerHTML !== nextHTML) indicator.innerHTML = nextHTML;
  }

  function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  }

  function cancelReadingReset() {
    if (!activeReset) return;
    if (activeReset.delayId) window.clearTimeout(activeReset.delayId);
    if (activeReset.frameId) window.cancelAnimationFrame(activeReset.frameId);
    activeReset = null;
  }

  function easeInOutCubic(progress) {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  function resetDuration(distance) {
    return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, 460 + distance * 0.18));
  }

  function speakTargetY(target) {
    const focusBar = document.querySelector('.focus-bar');
    const stickyOffset = (focusBar?.getBoundingClientRect().height || 0) + 16;
    return Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyOffset);
  }

  function markArrival(target) {
    if (arrivalTimer) window.clearTimeout(arrivalTimer);
    target.classList.remove('is-arrived');
    requestAnimationFrame(() => {
      target.classList.add('is-arrived');
      arrivalTimer = window.setTimeout(() => target.classList.remove('is-arrived'), 260);
    });
  }

  function scrollToSpeakStart() {
    const target = document.querySelector('.speak-reading-focus') || document.querySelector('.speak-passage');
    if (!target) return;

    cancelReadingReset();
    const targetY = speakTargetY(target);

    if (prefersReducedMotion()) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      return;
    }

    const startY = window.scrollY;
    const delta = targetY - startY;
    const distance = Math.abs(delta);

    if (distance < 24) {
      markArrival(target);
      return;
    }

    const reset = { delayId: null, frameId: null };
    activeReset = reset;

    reset.delayId = window.setTimeout(() => {
      if (activeReset !== reset) return;

      const duration = resetDuration(distance);
      const startedAt = performance.now();

      const step = now => {
        if (activeReset !== reset) return;

        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = easeInOutCubic(progress);
        window.scrollTo({ top: startY + delta * eased, behavior: 'auto' });

        if (progress < 1) {
          reset.frameId = requestAnimationFrame(step);
          return;
        }

        activeReset = null;
        markArrival(target);
      };

      reset.frameId = requestAnimationFrame(step);
    }, RESET_DELAY_MS);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.speak-round');
    if (!button) return;

    const round = Number(button.dataset.round);
    if (!Number.isInteger(round)) return;

    requestAnimationFrame(() => {
      ensureFocusIndicator();

      const justCompleted = button.classList.contains('is-done');
      if (justCompleted && (round === 0 || round === 1)) {
        requestAnimationFrame(scrollToSpeakStart);
      }
    });
  });

  ['wheel', 'touchstart', 'pointerdown'].forEach(eventName => {
    window.addEventListener(eventName, cancelReadingReset, { passive: true });
  });
  window.addEventListener('keydown', cancelReadingReset);

  const observer = new MutationObserver(() => {
    if (!document.querySelector('.speak-passage')) return;
    requestAnimationFrame(ensureFocusIndicator);
  });

  observer.observe(app, { childList: true, subtree: true });
  ensureFocusIndicator();
})();
