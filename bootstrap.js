(() => {
  const createdAtById = {
    1: '2026-08-07',
    2: '2026-08-08',
    3: '2026-08-09',
    4: '2026-08-10'
  };

  const lessons = window.LESSONS || [];
  lessons.forEach(lesson => {
    if (!lesson.createdAt && createdAtById[lesson.id]) lesson.createdAt = createdAtById[lesson.id];
  });

  const storageKeys = ['dailyEnglishChunks.v2', 'dailyEnglishChunks.v1'];
  storageKeys.forEach(key => {
    try {
      const state = JSON.parse(localStorage.getItem(key));
      if (!state?.lessons) return;

      Object.values(state.lessons).forEach(item => {
        if (!item || typeof item !== 'object') return;
        const lastStep = Number(item.lastStep);
        const readCount = Number(item.readCount);
        item.lastStep = Number.isFinite(lastStep) ? Math.max(0, Math.trunc(lastStep)) : 0;
        if ('readCount' in item) item.readCount = Number.isFinite(readCount) ? Math.max(0, Math.trunc(readCount)) : 0;
      });

      localStorage.setItem(key, JSON.stringify(state));
    } catch (_) {}
  });
})();
