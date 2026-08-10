(() => {
  const lessons = window.LESSONS || [];
  const app = document.getElementById('app');
  const homeBtn = document.getElementById('homeBtn');
  const randomBtn = document.getElementById('randomBtn');
  let lastRandomId = null;

  const nativeScrollTo = window.scrollTo.bind(window);
  let suppressAutoScroll = false;
  window.scrollTo = (...args) => {
    if (suppressAutoScroll) return;
    return nativeScrollTo(...args);
  };

  function lessonById(id) {
    return lessons.find(lesson => lesson.id === Number(id)) || null;
  }

  function lessonTimestamp(lesson) {
    const timestamp = Date.parse(`${lesson?.createdAt || ''}T00:00:00Z`);
    return Number.isFinite(timestamp) ? timestamp : Number(lesson?.id) || 0;
  }

  function newestLessons() {
    return [...lessons].sort((a, b) => lessonTimestamp(b) - lessonTimestamp(a) || Number(b.id) - Number(a.id));
  }

  function latestLesson() {
    return newestLessons()[0] || null;
  }

  function formatDate(lesson, compact = false) {
    if (!lesson?.createdAt) return `#${String(lesson?.id || '').padStart(3, '0')}`;
    const [year, month, day] = lesson.createdAt.split('-');
    return compact ? `${month}/${day}` : `${year}/${month}/${day}`;
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function currentLessonId() {
    const button = document.querySelector('.lesson-number-button');
    if (!button) return null;
    const stored = Number(button.dataset.lessonId);
    if (Number.isFinite(stored) && stored > 0) return stored;
    const match = (button.textContent || '').match(/DAY\s+(\d+)/i);
    return match ? Number(match[1]) : null;
  }

  function openLessonById(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;
    let target = document.querySelector(`[data-sequence-lesson="${numericId}"]`);
    if (!target) {
      homeBtn?.click();
      target = document.querySelector(`[data-sequence-lesson="${numericId}"]`);
    }
    target?.click();
  }

  function chooseRandomLesson() {
    if (!lessons.length) return null;
    const currentId = currentLessonId();
    let candidates = lessons;
    if (lessons.length > 1) {
      candidates = lessons.filter(lesson => lesson.id !== currentId && lesson.id !== lastRandomId);
      if (!candidates.length) candidates = lessons.filter(lesson => lesson.id !== currentId);
      if (!candidates.length) candidates = lessons;
    }
    const lesson = candidates[Math.floor(Math.random() * candidates.length)];
    lastRandomId = lesson.id;
    return lesson;
  }

  function openRandomLesson() {
    const lesson = chooseRandomLesson();
    if (lesson) openLessonById(lesson.id);
  }

  function sortNodesNewestFirst(container, selector, dataKey) {
    if (!container) return;
    const nodes = [...container.querySelectorAll(selector)];
    const desired = [...nodes].sort((a, b) => {
      const lessonA = lessonById(a.dataset[dataKey]);
      const lessonB = lessonById(b.dataset[dataKey]);
      return lessonTimestamp(lessonB) - lessonTimestamp(lessonA) || Number(lessonB?.id || 0) - Number(lessonA?.id || 0);
    });
    if (nodes.every((node, index) => node === desired[index])) return;
    desired.forEach(node => container.appendChild(node));
  }

  function enhanceHome() {
    const home = document.querySelector('.home');
    if (!home) return;
    const latest = latestLesson();

    const kicker = home.querySelector('.home-kicker-row');
    if (kicker && !kicker.querySelector('[data-home-random]')) {
      const button = document.createElement('button');
      button.className = 'text-button home-random-button';
      button.type = 'button';
      button.dataset.homeRandom = 'true';
      button.textContent = 'Random lesson ↝';
      button.addEventListener('click', openRandomLesson);
      const allLessons = kicker.querySelector('#openAllLessons');
      if (allLessons) kicker.insertBefore(button, allLessons);
      else kicker.appendChild(button);
    }

    setText(home.querySelector('.lead'), '英語を一語ずつ訳すのではなく、意味のまとまりで前から受け取る。新しく作った練習からすぐ始められる。');

    if (latest) {
      const currentCard = home.querySelector('#startNext');
      if (currentCard && currentCard.dataset.latestId !== String(latest.id)) {
        const card = currentCard.cloneNode(true);
        card.dataset.latestId = String(latest.id);
        card.setAttribute('aria-label', `${formatDate(latest)} ${latest.title}を始める`);
        setText(card.querySelector('.sequence-number'), formatDate(latest));
        setText(card.querySelector('.next-state'), 'LATEST');
        setText(card.querySelector('.next-card-title'), latest.title);
        setText(card.querySelector('.scene-copy'), latest.sceneJa);
        const facts = card.querySelector('.lesson-facts');
        if (facts) facts.innerHTML = `<span>${latest.minutes} min</span><span>Level ${latest.difficulty}</span><span>${latest.tags.slice(0, 2).join(' · ')}</span>`;
        card.querySelector('.resume-note')?.remove();
        card.addEventListener('click', () => openLessonById(latest.id));
        currentCard.replaceWith(card);
      }
    }

    const section = home.querySelector('.sequence-section');
    const rail = section?.querySelector('.sequence-rail');
    sortNodesNewestFirst(rail, '[data-sequence-lesson]', 'sequenceLesson');
    rail?.querySelectorAll('[data-sequence-lesson]').forEach(button => {
      const lesson = lessonById(button.dataset.sequenceLesson);
      if (!lesson) return;
      setText(button.querySelector('.sequence-item-number'), formatDate(lesson, true));
      button.setAttribute('aria-label', `${formatDate(lesson)}${button.classList.contains('is-done') ? ' 完了済み' : ''}`);
      button.classList.toggle('is-active', latest?.id === lesson.id);
      const state = button.querySelector('.sequence-item-state');
      if (latest?.id === lesson.id) setText(state, 'LATEST');
      else if (button.classList.contains('is-done')) setText(state, '✓');
      else setText(state, '');
    });

    setText(section?.querySelector('.eyebrow'), 'Recent');
    setText(section?.querySelector('.micro-copy'), '作成日の新しい順。日付をタップして開く。');

    const review = home.querySelector('.mini-review small');
    if (review) {
      const match = review.textContent.match(/DAY\s+(\d+)/i);
      const lesson = match ? lessonById(match[1]) : null;
      if (lesson) setText(review, formatDate(lesson));
    }
  }

  function enhanceArchive() {
    const archive = document.querySelector('.archive');
    if (!archive) return;
    setText(archive.querySelector('.archive-head .eyebrow'), 'Created');
    setText(archive.querySelector('.archive-lead'), '作成日の新しい順で表示。行全体を押して開ける。');

    const filters = archive.querySelector('.archive-filters');
    if (filters && !filters.querySelector('[data-random-lesson]')) {
      const button = document.createElement('button');
      button.className = 'filter-chip random-filter-chip';
      button.type = 'button';
      button.dataset.randomLesson = 'true';
      button.innerHTML = '<span aria-hidden="true">↝</span> Random';
      button.addEventListener('click', openRandomLesson);
      filters.prepend(button);
    }

    const list = archive.querySelector('.lesson-list');
    sortNodesNewestFirst(list, '[data-lesson]', 'lesson');
    list?.querySelectorAll('[data-lesson]').forEach(row => {
      const lesson = lessonById(row.dataset.lesson);
      const date = row.querySelector('.lesson-row-day');
      if (!lesson || !date || date.dataset.dateApplied === lesson.createdAt) return;
      const done = row.querySelector('.done-mark')?.textContent || '';
      date.innerHTML = `${formatDate(lesson)}<span class="done-mark">${done}</span>`;
      date.dataset.dateApplied = lesson.createdAt || 'fallback';
    });
  }

  function enhanceLessonDetail() {
    const picker = document.querySelector('.lesson-number-button');
    if (!picker) return;

    let id = Number(picker.dataset.lessonId);
    if (!Number.isFinite(id) || id <= 0) {
      const match = picker.textContent.match(/DAY\s+(\d+)/i);
      if (!match) return;
      id = Number(match[1]);
      picker.dataset.lessonId = String(id);
    }

    const lesson = lessonById(id);
    if (!lesson) return;
    if (picker.dataset.dateApplied !== lesson.createdAt) {
      picker.innerHTML = `${formatDate(lesson)} <span>⌄</span>`;
      picker.dataset.dateApplied = lesson.createdAt || 'fallback';
    }

    document.querySelectorAll('.lesson-switch-button[data-adjacent]').forEach(button => {
      const adjacent = lessonById(button.dataset.adjacent);
      if (!adjacent || button.dataset.dateApplied === adjacent.createdAt) return;
      const isPrevious = button.textContent.includes('←');
      button.textContent = isPrevious ? `← ${formatDate(adjacent, true)}` : `${formatDate(adjacent, true)} →`;
      button.dataset.dateApplied = adjacent.createdAt || 'fallback';
    });

    setText(document.querySelector('.complete-panel h2'), `${formatDate(lesson)} complete.`);

    const nextDirect = document.getElementById('nextLessonDirect');
    if (nextDirect) {
      const index = lessons.findIndex(item => item.id === id);
      const next = index >= 0 ? lessons[index + 1] : null;
      if (next) setText(nextDirect, `${formatDate(next)}へ →`);
    }

    document.title = `${formatDate(lesson)} · ${lesson.title} — Daily English Chunks`;
  }

  function enhance() {
    enhanceHome();
    enhanceArchive();
    enhanceLessonDetail();
  }

  function enhanceAfterCurrentEvent() {
    requestAnimationFrame(enhance);
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('[data-chunk-reveal], #toggleJa')) {
      suppressAutoScroll = true;
      setTimeout(() => { suppressAutoScroll = false; }, 0);
    }
  }, true);

  document.addEventListener('click', enhanceAfterCurrentEvent);
  document.addEventListener('keydown', enhanceAfterCurrentEvent);
  randomBtn?.addEventListener('click', openRandomLesson);

  if (app) enhance();
})();
