(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const STORAGE_KEY = 'dailyEnglishChunks.v3';

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed?.lessons || {};
    } catch (_) {
      return {};
    }
  }

  function statusFor(id, lessonsState) {
    const saved = lessonsState?.[id];
    if (!saved || typeof saved !== 'object') return 'untouched';
    if (saved.completed) return 'completed';
    return 'progress';
  }

  function latestLessonId() {
    const lessons = [...(window.LESSONS || [])];
    if (!lessons.length) return null;
    lessons.sort((a, b) => {
      const aTime = Date.parse(`${a?.createdAt || ''}T00:00:00Z`);
      const bTime = Date.parse(`${b?.createdAt || ''}T00:00:00Z`);
      const safeA = Number.isFinite(aTime) ? aTime : Number(a?.id) || 0;
      const safeB = Number.isFinite(bTime) ? bTime : Number(b?.id) || 0;
      return safeB - safeA || Number(b?.id) - Number(a?.id);
    });
    return Number(lessons[0]?.id);
  }

  function markLatestCard(lessonsState) {
    const card = document.querySelector('.latest-card');
    const latestId = latestLessonId();
    if (!card || !Number.isInteger(latestId)) return;

    const status = statusFor(latestId, lessonsState);
    card.classList.toggle('is-completed', status === 'completed');
    card.classList.toggle('is-progress', status === 'progress');

    const stateNode = card.querySelector('.next-state');
    if (!stateNode) return;
    if (status === 'completed') stateNode.textContent = 'COMPLETED';
    else if (status === 'progress') stateNode.textContent = 'CONTINUE';
    else stateNode.textContent = 'LATEST';
  }

  function markRecentLessons(lessonsState) {
    const latestId = latestLessonId();

    document.querySelectorAll('[data-recent-lesson]').forEach(button => {
      const id = Number(button.dataset.recentLesson);
      const status = statusFor(id, lessonsState);
      const isLatest = id === latestId;

      button.classList.toggle('is-completed', status === 'completed');
      button.classList.toggle('is-progress', status === 'progress');
      button.classList.toggle('is-latest', isLatest);
      button.classList.toggle('is-done', status === 'completed');

      const label = button.querySelector('.sequence-item-state');
      if (!label) return;

      if (isLatest && status === 'completed') label.textContent = 'LATEST ✓';
      else if (isLatest && status === 'progress') label.textContent = 'LATEST · …';
      else if (isLatest) label.textContent = 'LATEST';
      else if (status === 'completed') label.textContent = '✓ DONE';
      else if (status === 'progress') label.textContent = 'IN PROGRESS';
      else label.textContent = '';
    });
  }

  function markArchiveRows(lessonsState) {
    document.querySelectorAll('.lesson-row[data-lesson]').forEach(row => {
      const id = Number(row.dataset.lesson);
      const status = statusFor(id, lessonsState);

      row.classList.toggle('is-completed', status === 'completed');
      row.classList.toggle('is-progress', status === 'progress');

      const date = row.querySelector('.lesson-row-day');
      if (!date) return;

      date.querySelector('.lesson-status-badge')?.remove();
      if (status === 'untouched') return;

      const badge = document.createElement('span');
      badge.className = `lesson-status-badge is-${status}`;
      badge.textContent = status === 'completed' ? '完了' : '途中';
      date.appendChild(badge);
    });
  }

  function enhance() {
    const lessonsState = readState();
    markLatestCard(lessonsState);
    markRecentLessons(lessonsState);
    markArchiveRows(lessonsState);
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(app, { childList: true, subtree: false });

  document.addEventListener('click', () => requestAnimationFrame(enhance));
  enhance();
})();
