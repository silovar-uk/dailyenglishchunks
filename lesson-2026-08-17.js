window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  id: 12,
  createdAt: "2026-08-17",
  title: "Admitting You Missed Something",
  scene: "You realize you overlooked an important detail at work. You want to acknowledge it without over-apologizing, then move quickly to the solution.",
  sceneJa: "仕事で大事な点を一つ見落としていたと気づいた。ミスを認め、言い訳に寄りすぎず、すでに取った行動と今後の見通しを伝える。",
  emotions: ["calm", "responsible", "constructive", "reassuring"],
  difficulty: 4,
  minutes: 10,
  tags: ["work", "mistake", "so-that", "as-long-as", "that-clause", "conversation"],
  sentences: [
    { chunks: [{ en: "I realized this morning", ja: "今朝、気づきました" }, { en: "that I had overlooked one important detail", ja: "大事な点を一つ見落としていたことに" }, { en: "in the schedule.", ja: "スケジュールの中で" }] },
    { chunks: [{ en: "I was focused so much", ja: "私はかなり意識を集中させていました" }, { en: "on getting everything ready for Friday", ja: "金曜日に向けてすべてを準備することに" }, { en: "that I didn’t notice", ja: "その結果、気づきませんでした" }, { en: "the final approval was needed", ja: "最終承認が必要だったことに" }, { en: "a day earlier.", ja: "一日早く" }] },
    { chunks: [{ en: "I’ve already contacted", ja: "すでに連絡しました" }, { en: "the person in charge,", ja: "担当者に" }, { en: "and they said", ja: "そして、その人によると" }, { en: "they should be able to review it", ja: "確認できそうです" }, { en: "this afternoon.", ja: "今日の午後に" }] },
    { chunks: [{ en: "As long as we get their approval today,", ja: "今日中に承認をもらえさえすれば" }, { en: "we can still stay on track.", ja: "まだ予定どおり進められます" }] }
  ],
  questions: [
    { type: "chunk", question: "Which boundary is most natural?", options: ["I realized / that I had overlooked one important detail", "I / realized that I had / overlooked one important detail", "I realized that / I had overlooked / one important detail"], answer: 0, explanation: "‘I realized’ introduces what the speaker noticed, and the that-clause gives the content of that realization." },
    { type: "meaning", question: "What relationship does ‘so ... that ...’ show here?", options: ["Two choices", "A degree and its result", "A condition and the future"], answer: 1, explanation: "The speaker was so focused on Friday’s preparation that the focus led to missing another detail." },
    { type: "meaning", question: "What does ‘As long as we get their approval today’ mean here?", options: ["While we keep getting approval today", "If we can get their approval today", "Even though we get their approval today"], answer: 1, explanation: "Here ‘as long as’ introduces the condition needed to stay on track." }
  ],
  speak: "Acknowledge the mistake, but don’t sound defeated. Read the first sentence calmly. Pick up the pace slightly at ‘I’ve already contacted’ to show that action has already been taken, and finish ‘we can still stay on track’ with reassurance.",
  review: "Previous flow: understand → concern → reframe → combine → next step. Today: realization → reason → action already taken → condition → outlook. Don’t stop at the problem; notice where the speaker’s thought goes next."
});
