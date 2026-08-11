window.LESSONS = window.LESSONS || [];

window.LESSONS.push({
  id: 6,
  createdAt: "2026-08-11",
  title: "Giving a Clear Project Update",
  scene: "You need to explain a small project delay without making the situation sound worse than it is.",
  sceneJa: "仕事の小さな遅れについて、必要以上に深刻に見せず、状況・理由・見通しを落ち着いて伝える。",
  emotions: ["slightly apologetic", "clear", "reassuring"],
  difficulty: 3,
  minutes: 10,
  tags: ["work", "because", "to-infinitive", "project-update"],
  sentences: [
    { chunks: [
      { en: "I wanted to give you", ja: "お伝えしておきたくて" },
      { en: "a quick update", ja: "簡単に進捗を" },
      { en: "on the project.", ja: "このプロジェクトについて" }
    ]},
    { chunks: [
      { en: "We’re running a little behind", ja: "少し予定より遅れています" },
      { en: "because we found an issue", ja: "問題が一つ見つかったので" },
      { en: "during the final check.", ja: "最終確認のときに" }
    ]},
    { chunks: [
      { en: "I don’t think", ja: "私は〜とは思いません" },
      { en: "it will affect the overall schedule,", ja: "それが全体のスケジュールに影響する" },
      { en: "but I’d like one more day", ja: "ただ、もう1日ほしいです" },
      { en: "to make sure", ja: "確実にするために" },
      { en: "everything is ready.", ja: "すべて準備できていることを" }
    ]},
    { chunks: [
      { en: "I’ll send you", ja: "お送りします" },
      { en: "the finished version", ja: "完成版を" },
      { en: "by Thursday afternoon.", ja: "木曜の午後までに" }
    ]}
  ],
  questions: [
    {
      type: "chunk",
      question: "Which chunking is more natural?",
      options: [
        "We’re running a little behind / because we found an issue",
        "We’re running / a little behind because / we found an issue",
        "We’re running a little / behind because we / found an issue"
      ],
      answer: 0,
      explanation: "‘We’re running a little behind’ gives the situation first, and the because-clause then adds the reason."
    },
    {
      type: "meaning",
      question: "What does ‘running a little behind’ mean here?",
      options: [
        "The project is slightly behind schedule",
        "Someone is physically running behind another person",
        "The speaker is leaving the project"
      ],
      answer: 0,
      explanation: "Here, ‘running behind’ means being later than the planned schedule."
    },
    {
      type: "intention",
      question: "What is the job of ‘to make sure’ in the third sentence?",
      options: [
        "It explains the purpose of asking for one more day",
        "It starts a completely new topic",
        "It shows disagreement with the listener"
      ],
      answer: 0,
      explanation: "‘To make sure’ explains why the speaker wants one more day: to confirm that everything is ready."
    }
  ],
  speak: "Start slightly apologetic, but keep the tone calm. Make the reason clear on ‘because we found an issue,’ then sound reassuring on ‘I don’t think it will affect the overall schedule.’ Finish with confidence on the deadline.",
  review: "Follow the information flow: delay → reason → reassurance → request → deadline. Read the speaker’s intention, not isolated words."
});
