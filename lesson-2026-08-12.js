window.LESSONS = window.LESSONS || [];

window.LESSONS.push({
  id: 7,
  createdAt: "2026-08-12",
  title: "Asking for Clarification",
  scene: "You are in a meeting and understand the main idea, but one part is still unclear. You want to confirm your understanding without sounding confrontational.",
  sceneJa: "会議中、大筋は理解できているものの一部だけ曖昧。責めるのではなく、自分の理解を示してから認識をそろえる。",
  emotions: ["attentive", "uncertain", "aligned"],
  difficulty: 3,
  minutes: 10,
  tags: ["work", "clarification", "that-clause", "before", "conversation"],
  sentences: [
    { chunks: [
      { en: "I think", ja: "私としては〜と思います" },
      { en: "I understand the main idea,", ja: "大筋は理解できています" },
      { en: "but I’m not completely sure", ja: "ただ、完全には確信がありません" },
      { en: "about the last part.", ja: "最後の部分について" }
    ]},
    { chunks: [
      { en: "Are you saying", ja: "つまり、おっしゃっているのは" },
      { en: "that we should wait for their response", ja: "私たちは相手の返答を待つべきだということ" },
      { en: "before we make a final decision?", ja: "最終決定をする前に" }
    ]},
    { chunks: [
      { en: "If so,", ja: "もしそうなら" },
      { en: "when do you expect", ja: "いつ頃になりそうですか" },
      { en: "to hear back from them?", ja: "相手から返事が来るのは" }
    ]},
    { chunks: [
      { en: "I just want to make sure", ja: "念のため確認しておきたいだけです" },
      { en: "we’re on the same page.", ja: "私たちの認識が一致していることを" }
    ]}
  ],
  questions: [
    {
      type: "chunk",
      question: "Which chunking is most natural?",
      options: [
        "Are you saying / that we should wait for their response",
        "Are you / saying that we / should wait for their response",
        "Are you saying that / we should / wait for their response"
      ],
      answer: 0,
      explanation: "‘Are you saying’ forms the question frame, and the that-clause carries the content being confirmed."
    },
    {
      type: "meaning",
      question: "What does ‘hear back from them’ mean here?",
      options: [
        "To receive a reply from them",
        "To listen to them again",
        "To return to where they are"
      ],
      answer: 0,
      explanation: "‘Hear back from someone’ means receiving a response after earlier contact or a request."
    },
    {
      type: "meaning",
      question: "What does ‘we’re on the same page’ mean?",
      options: [
        "We have the same understanding",
        "We are reading the same document",
        "We are sitting in the same place"
      ],
      answer: 0,
      explanation: "Here, ‘on the same page’ means having a shared understanding or aligned expectations."
    }
  ],
  speak: "Sound curious rather than doubtful. Keep ‘Are you saying / that ... ?’ smooth and neutral. On the final sentence, sound cooperative: you are checking alignment, not challenging the other person.",
  review: "Follow the speaker’s thought process: understanding → uncertainty → confirmation → next question → alignment. A chunk is a unit of thought, not just a short group of words."
});
