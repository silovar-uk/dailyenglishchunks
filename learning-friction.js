(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const RECENT_LIMIT = 7;
  const RESUME_CONTEXT = {
    Imagine: '場面をつかむ',
    Read: '英文を読む',
    Chunk: '区切りを考える',
    Understand: '意味を確認する',
    Check: '理解度を確かめる',
    Speak: '声に出す'
  };

  let scheduled = false;

  function lessons() {
    return Array.isArray(window.LESSONS) ? window.LESSONS : [];
  }

  function lessonById(id) {
    return lessons().find(lesson => Number(lesson?.id) === Number(id)) || null;
  }

  function lessonByTitle(title) {
    const normalized = String(title || '').trim();
    return lessons().find(lesson => String(lesson?.title || '').trim() === normalized) || null;
  }

  function decorateRecent() {
    const rail = app.querySelector('.sequence-rail');
    if (!rail) return;

    const items = [...rail.querySelectorAll('.sequence-item[data-recent-lesson]')];
    items.forEach((button, index) => {
      if (index >= RECENT_LIMIT) {
        button.remove();
        return;
      }

      const lesson = lessonById(button.dataset.recentLesson);
      if (!lesson) return;

      let title = button.querySelector('.sequence-item-title');
      if (!title) {
        title = document.createElement('span');
        title.className = 'sequence-item-title';
        const state = button.querySelector('.sequence-item-state');
        button.insertBefore(title, state || null);
      }
      title.textContent = lesson.title;

      const date = button.querySelector('.sequence-item-number')?.textContent?.trim() || '';
      button.setAttribute('aria-label', `${date} ${lesson.title}`.trim());
    });

    const microCopy = app.querySelector('.sequence-section .micro-copy');
    if (microCopy && microCopy.textContent !== '直近7件。日付とタイトルから戻る。') {
      microCopy.textContent = '直近7件。日付とタイトルから戻る。';
    }
  }

  function simplifyLatestFacts() {
    const facts = app.querySelector('#startLatest .lesson-facts');
    if (!facts) return;
    [...facts.children].slice(2).forEach(node => node.remove());
  }

  function clarifyResume() {
    const note = app.querySelector('#startLatest .resume-note');
    if (!note || note.dataset.contextualized === 'true') return;

    const match = note.textContent.match(/前回の続き：(.+)/);
    if (!match) return;

    const step = match[1].trim();
    const context = RESUME_CONTEXT[step];
    if (context) note.textContent = `前回の続き：${step} · ${context}`;
    note.dataset.contextualized = 'true';
  }

  function simplifyLessonMeta() {
    const title = app.querySelector('.lesson-title')?.textContent;
    const meta = app.querySelector('.lesson-meta');
    if (!title || !meta) return;

    const lesson = lessonByTitle(title);
    if (!lesson) return;

    const signature = `${lesson.id}:${lesson.minutes}:${lesson.difficulty}`;
    if (meta.dataset.frictionSignature === signature) return;

    meta.innerHTML = `<span>${lesson.minutes} min</span><span class="meta-dot">Level ${lesson.difficulty}</span>`;
    meta.dataset.frictionSignature = signature;
  }

  function reorderStepSummary() {
    const button = app.querySelector('#stepMenuToggle');
    if (!button) return;

    const textNode = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (!textNode) return;

    const raw = textNode.textContent.trim();
    const match = raw.match(/^(\d+\s*\/\s*\d+)\s*·\s*(.+)$/);
    if (!match) return;

    const next = `${match[2].trim()} · ${match[1].replace(/\s+/g, ' ')}`;
    if (raw !== next) textNode.textContent = `${next} `;
  }

  function improveCTA() {
    const button = app.querySelector('#nextStep');
    if (!button) return;

    const replacements = new Map([
      ['Readへ →', '英文を読む →'],
      ['Chunkへ →', '区切りを考える →'],
      ['読み終えた · Chunkへ →', '区切りを考える →'],
      ['Understandへ →', '意味を確認する →'],
      ['差を確認した · Understandへ →', '意味を確認する →'],
      ['Checkへ →', '理解度をチェック →']
    ]);

    const replacement = replacements.get(button.textContent.trim());
    if (replacement) button.textContent = replacement;
  }

  function decorate() {
    scheduled = false;
    decorateRecent();
    simplifyLatestFacts();
    clarifyResume();
    simplifyLessonMeta();
    reorderStepSummary();
    improveCTA();
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(decorate);
  }

  const observer = new MutationObserver(scheduleDecorate);
  observer.observe(app, { childList: true, subtree: true, characterData: true });

  scheduleDecorate();
})();