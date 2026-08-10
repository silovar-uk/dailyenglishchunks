(() => {
  const lessons = window.LESSONS || [];
  const app = document.getElementById('app');
  const homeBtn = document.getElementById('homeBtn');
  const randomBtn = document.getElementById('randomBtn');
  let lastRandomId = null;

  function currentLessonId() {
    const label = document.querySelector('.lesson-number-button')?.textContent || '';
    const match = label.match(/\d+/);
    return match ? Number(match[0]) : null;
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
    if (!lesson) return;

    homeBtn?.click();
    const target = document.querySelector(`[data-sequence-lesson="${lesson.id}"]`);
    target?.click();
  }

  function sortArchiveNewestFirst() {
    const list = document.querySelector('.lesson-list');
    if (!list || list.dataset.order === 'desc') return;

    [...list.querySelectorAll('[data-lesson]')]
      .sort((a, b) => Number(b.dataset.lesson) - Number(a.dataset.lesson))
      .forEach(row => list.appendChild(row));

    list.dataset.order = 'desc';
  }

  function enhanceArchive() {
    const archive = document.querySelector('.archive');
    if (!archive) return;

    const lead = archive.querySelector('.archive-lead');
    if (lead) lead.textContent = '最新番号から降順で表示。行全体を押して開ける。';

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

    sortArchiveNewestFirst();
  }

  function enhanceHome() {
    const kicker = document.querySelector('.home-kicker-row');
    if (!kicker || kicker.querySelector('[data-home-random]')) return;

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

  function enhance() {
    enhanceHome();
    enhanceArchive();
  }

  randomBtn?.addEventListener('click', openRandomLesson);

  const observer = new MutationObserver(enhance);
  if (app) observer.observe(app, { childList: true, subtree: true });

  enhance();
})();
