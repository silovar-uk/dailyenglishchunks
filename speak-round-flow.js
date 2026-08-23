(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const ROUND_FOCUS = [
    { label: 'MEANING', copy: '意味を追う' },
    { label: 'RHYTHM', copy: '流れを切らない' },
    { label: 'EMOTION', copy: '気持ちを乗せる' }
  ];

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

  function scrollToSpeakStart() {
    const target = document.querySelector('.speak-reading-focus') || document.querySelector('.speak-passage');
    if (!target) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      block: 'start',
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
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

  const observer = new MutationObserver(() => {
    if (!document.querySelector('.speak-passage')) return;
    requestAnimationFrame(ensureFocusIndicator);
  });

  observer.observe(app, { childList: true, subtree: true });
  ensureFocusIndicator();
})();
