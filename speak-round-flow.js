(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const ROUND_FOCUS = [
    {
      label: 'DIRECTION',
      prompt: '相手に何を起こしたいかを決める',
      action: 'この意図で読む →',
      fallback: 'Speak with a clear intention toward the listener.'
    },
    {
      label: 'EMOTION',
      prompt: 'その意図に、気持ちを乗せる',
      action: '気持ちを乗せてもう一度読む →',
      fallback: 'Let the feeling follow the situation.'
    },
    {
      label: 'RHYTHM',
      prompt: '最後に、流れとして声へ出す',
      action: '流れを意識してもう一度読む →',
      fallback: 'Keep the thought moving instead of reading word by word.'
    }
  ];

  const RESET_DELAY_MS = 90;
  const MIN_DURATION_MS = 420;
  const MAX_DURATION_MS = 680;
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

  function currentLessonData() {
    const title = document.querySelector('.lesson-title')?.textContent?.trim();
    if (!title) return null;
    return (window.LESSONS || []).find(lesson => lesson?.title === title) || null;
  }

  function splitSpeakGuide(lesson) {
    const full = String(lesson?.speak || '').trim();
    const firstSentence = full.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
    const direction = (firstSentence?.[1] || full || ROUND_FOCUS[0].fallback).trim();
    const remainder = (firstSentence?.[2] || '').trim();
    const emotions = Array.isArray(lesson?.emotions)
      ? lesson.emotions.map(value => String(value).trim()).filter(Boolean)
      : [];

    return {
      direction,
      emotion: emotions.length ? emotions.join(' → ') : ROUND_FOCUS[1].fallback,
      rhythm: remainder || ROUND_FOCUS[2].fallback
    };
  }

  function guidanceCopy() {
    const guide = splitSpeakGuide(currentLessonData());
    return [guide.direction, guide.emotion, guide.rhythm];
  }

  function decorateRoundButton(button, index) {
    const meta = ROUND_FOCUS[index];
    if (!meta) return;
    button.setAttribute('aria-label', `${meta.label}: ${meta.action}`);
    if (button.dataset.guidedRound === String(index)) return;
    button.dataset.guidedRound = String(index);
    button.innerHTML = `<strong>${index + 1} / 3</strong><span>${meta.action}</span><small>${meta.label}</small>`;
  }

  function ensureGuidanceStack() {
    const passage = document.querySelector('.speak-passage');
    const card = passage?.closest('.practice-card');
    if (!passage || !card) return null;

    let stack = card.querySelector('.speak-guidance-stack');
    if (!stack) {
      const oldNote = card.querySelector('.emotion-note');
      stack = oldNote || document.createElement('div');
      stack.className = 'speak-guidance-stack';
      stack.setAttribute('aria-live', 'polite');
      stack.innerHTML = ROUND_FOCUS.map((meta, index) => `
        <section class="speak-guidance-item" data-guidance-round="${index}">
          <div class="speak-guidance-kicker"><span>${index + 1} / 3</span><strong>${meta.label}</strong></div>
          <p class="speak-guidance-copy"></p>
          <small>${meta.prompt}</small>
        </section>`).join('');
      passage.insertAdjacentElement('beforebegin', stack);
    } else if (stack.nextElementSibling !== passage) {
      passage.insertAdjacentElement('beforebegin', stack);
    }

    return stack;
  }

  function syncHeading() {
    const heading = document.querySelector('.step-heading');
    if (!heading || !document.querySelector('.speak-passage')) return;
    const title = heading.querySelector('.step-title');
    const intro = heading.querySelector('.step-intro');
    if (title) title.textContent = 'Build the voice from the intention.';
    if (intro) intro.textContent = 'Direction → Emotion → Rhythm。意図から声を組み立てて、最後は補助なしで読む。';
  }

  function syncGuidedFlow() {
    const rounds = speakRounds();
    if (!rounds.length) return;

    syncHeading();
    const stack = ensureGuidanceStack();
    if (!stack) return;

    const copies = guidanceCopy();
    const focus = currentFocus();
    if (!focus) return;

    stack.querySelectorAll('[data-guidance-round]').forEach(item => {
      const index = Number(item.dataset.guidanceRound);
      const copy = item.querySelector('.speak-guidance-copy');
      if (copy && copy.textContent !== copies[index]) copy.textContent = copies[index];

      const visible = focus.complete || index <= focus.index;
      item.hidden = !visible;
      item.classList.toggle('is-current', !focus.complete && index === focus.index);
      item.classList.toggle('is-past', focus.complete || index < focus.index);
    });

    rounds.forEach((button, index) => {
      decorateRoundButton(button, index);
      const isCurrent = !focus.complete && index === focus.index;
      button.hidden = !isCurrent;
      button.classList.toggle('is-current', isCurrent);
      button.disabled = !isCurrent;
    });

    let complete = document.querySelector('.speak-guided-complete');
    if (focus.complete) {
      if (!complete) {
        complete = document.createElement('div');
        complete.className = 'speak-guided-complete';
        complete.innerHTML = '<span>3 / 3 · COMPLETE</span><strong>意図 → 気持ち → 流れ。次は補助なしで読む。</strong>';
        document.querySelector('.speak-count')?.insertAdjacentElement('afterend', complete);
      }
    } else {
      complete?.remove();
    }
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
    return Math.min(MAX_DURATION_MS, Math.max(MIN_DURATION_MS, 420 + distance * 0.16));
  }

  function speakTargetY(target) {
    const focusBar = document.querySelector('.focus-bar');
    const stickyOffset = (focusBar?.getBoundingClientRect().height || 0) + 14;
    return Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyOffset);
  }

  function markArrival(target) {
    if (arrivalTimer) window.clearTimeout(arrivalTimer);
    target.classList.remove('is-arrived');
    requestAnimationFrame(() => {
      target.classList.add('is-arrived');
      arrivalTimer = window.setTimeout(() => target.classList.remove('is-arrived'), 300);
    });
  }

  function scrollToSpeakStart() {
    const target = document.querySelector('.speak-guidance-stack') || document.querySelector('.speak-passage');
    if (!target) return;

    cancelReadingReset();
    const targetY = speakTargetY(target);

    if (prefersReducedMotion()) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      markArrival(target);
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
      const justCompleted = button.classList.contains('is-done');
      syncGuidedFlow();
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
    requestAnimationFrame(syncGuidedFlow);
  });

  observer.observe(app, { childList: true, subtree: true });
  syncGuidedFlow();
})();
