window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  id: 14,
  createdAt: "2026-08-18",
  title: "When Priorities Suddenly Change",
  scene: "You are already working on one task when your manager asks you to handle something urgent. You need to clarify what should take priority.",
  sceneJa: "作業中に上司から急ぎの仕事が入った。両方を抱え込まず、何を先に進めるべきか優先順位を確認する。",
  emotions: ["willing", "calm", "organized", "clear"],
  difficulty: 4,
  minutes: 10,
  tags: ["work", "priorities", "rather-than", "make-sure", "conversation"],
  sentences: [
    { chunks: [{ en: "I can start working on this", ja: "これに取りかかれます" }, { en: "right away,", ja: "すぐに" }, { en: "but I’m currently finishing", ja: "ただ、今ちょうど仕上げているところです" }, { en: "the report we discussed yesterday.", ja: "昨日話していたレポートを" }] },
    { chunks: [{ en: "If this needs to take priority,", ja: "もしこちらを優先する必要があるなら" }, { en: "I can pause the report", ja: "レポートをいったん止めて" }, { en: "and come back to it later.", ja: "あとでまた取りかかれます" }] },
    { chunks: [{ en: "I just want to make sure", ja: "確認しておきたいだけです" }, { en: "I’m focusing on the right thing,", ja: "自分が正しいものに集中していることを" }, { en: "rather than trying to finish both", ja: "両方を終わらせようとするのではなく" }, { en: "at the same time.", ja: "同時に" }] },
    { chunks: [{ en: "Which would you like me", ja: "どちらを私にしてほしいですか" }, { en: "to prioritize?", ja: "優先することを" }] }
  ],
  questions: [
    { type: "chunk", question: "Which boundary is most natural?", options: ["If this needs / to take priority I / can pause the report", "If this needs to take priority, / I can pause the report", "If this / needs to take / priority I can pause the report"], answer: 1, explanation: "The if-clause gives the condition, and the main clause gives the action that follows." },
    { type: "meaning", question: "What does ‘come back to it later’ mean here?", options: ["Return to that place later", "Resume that task later", "Explain the same story later"], answer: 1, explanation: "Here, ‘come back to it’ means return to the task and continue working on it." },
    { type: "meaning", question: "Why does the speaker ask ‘Which would you like me to prioritize?’", options: ["To refuse the work", "To avoid both tasks", "To align on which task should come first"], answer: 2, explanation: "The speaker is willing to work, but wants the manager to clarify the priority." }
  ],
  speak: "Sound willing, but not rushed. Start positively, state the current task calmly after ‘but,’ and let the final question sound like a genuine request for alignment.",
  review: "Previous session: realization → reason → action already taken → condition → outlook. Today: accept → explain current work → offer a trade-off → explain why → ask for priority."
});
