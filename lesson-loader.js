(() => {
  const cache = new Map();
  const inFlight = new Map();
  const bypass = new WeakSet();
  const RANDOM_IDS = new Set(['randomBtn', 'homeRandom', 'archiveRandom', 'randomAfter']);

  function lessonById(id) {
    return (window.LESSONS || []).find(lesson => Number(lesson.id) === Number(id)) || null;
  }

  function latestLesson() {
    return [...(window.LESSONS || [])].sort((a, b) => {
      const at = Date.parse(`${a?.createdAt || ''}T00:00:00Z`) || Number(a?.id) || 0;
      const bt = Date.parse(`${b?.createdAt || ''}T00:00:00Z`) || Number(b?.id) || 0;
      return bt - at || Number(b?.id) - Number(a?.id);
    })[0] || null;
  }

  function isLoaded(lesson) {
    return Boolean(lesson && !lesson.lazy && Array.isArray(lesson.sentences) && Array.isArray(lesson.questions));
  }

  function validateLesson(data, expectedId) {
    if (!data || typeof data !== 'object') throw new Error('Lesson data is not an object.');
    if (Number(data.schemaVersion) !== 1) throw new Error(`Unsupported lesson schema: ${data.schemaVersion}`);
    if (Number(data.id) !== Number(expectedId)) throw new Error(`Lesson id mismatch: expected ${expectedId}, got ${data.id}`);
    if (!Array.isArray(data.sentences) || !data.sentences.length) throw new Error('Lesson has no sentences.');
    if (!Array.isArray(data.questions)) throw new Error('Lesson questions are missing.');
    return data;
  }

  async function loadLesson(id) {
    const lesson = lessonById(id);
    if (!lesson) throw new Error(`Lesson ${id} was not found.`);
    if (isLoaded(lesson)) return lesson;
    if (cache.has(Number(id))) return cache.get(Number(id));
    if (inFlight.has(Number(id))) return inFlight.get(Number(id));

    const path = lesson.dataPath;
    if (!path) throw new Error(`Lesson ${id} has no dataPath.`);

    const promise = fetch(path, { cache: 'default' })
      .then(response => {
        if (!response.ok) throw new Error(`Lesson ${id} load failed: HTTP ${response.status}`);
        return response.json();
      })
      .then(data => validateLesson(data, id))
      .then(data => {
        Object.assign(lesson, data, { lazy: false, dataPath: path });
        cache.set(Number(id), lesson);
        return lesson;
      })
      .finally(() => inFlight.delete(Number(id)));

    inFlight.set(Number(id), promise);
    return promise;
  }

  async function loadIndex() {
    const response = await fetch('./data/lessons-index.json', { cache: 'default' });
    if (!response.ok) throw new Error(`Lesson index load failed: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Lesson index is not an array.');
    return data;
  }

  function showError(message) {
    console.error('[lesson-loader]', message);
    let toast = document.querySelector('.lesson-loader-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast lesson-loader-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = 'Lessonを読み込めませんでした。もう一度お試しください。';
    toast.classList.add('is-visible');
    clearTimeout(showError.timer);
    showError.timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function requestedLessonFromButton(button) {
    if (!button) return null;

    const recent = button.closest('[data-recent-lesson]');
    if (recent) return lessonById(Number(recent.dataset.recentLesson));

    const archive = button.closest('[data-lesson]');
    if (archive) return lessonById(Number(archive.dataset.lesson));

    if (button.id === 'startLatest') return latestLesson();
    return null;
  }

  function lazyLessons() {
    return (window.LESSONS || []).filter(lesson => lesson.lazy && !isLoaded(lesson));
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest('button');
    if (!button) return;

    if (bypass.has(button)) {
      bypass.delete(button);
      return;
    }

    const requested = requestedLessonFromButton(button);
    const randomNeedsPilotLoad = RANDOM_IDS.has(button.id) && lazyLessons().length > 0;
    if ((!requested || isLoaded(requested) || !requested.lazy) && !randomNeedsPilotLoad) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    button.setAttribute('aria-busy', 'true');

    const work = randomNeedsPilotLoad
      ? Promise.all(lazyLessons().map(lesson => loadLesson(lesson.id)))
      : loadLesson(requested.id);

    work.then(() => {
      button.removeAttribute('aria-busy');
      if (!button.isConnected) return;
      bypass.add(button);
      button.click();
    }).catch(error => {
      button.removeAttribute('aria-busy');
      showError(error?.message || String(error));
    });
  }, true);

  window.DailyEnglishLessonLoader = {
    loadLesson,
    loadIndex,
    isLoaded: id => isLoaded(lessonById(id)),
    getCachedIds: () => [...cache.keys()]
  };
})();
