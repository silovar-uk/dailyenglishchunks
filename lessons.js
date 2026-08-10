window.LESSONS = [
  {
    id: 1,
    title: "A Small Change of Plans",
    scene: "You planned to go straight home after work, but a coworker invited you to dinner.",
    sceneJa: "仕事のあと、まっすぐ帰る予定だった。でも同僚に夕食へ誘われる。",
    emotions: ["tired", "unsure", "glad"],
    difficulty: 1,
    minutes: 8,
    tags: ["daily-life", "to-infinitive"],
    sentences: [
      { chunks: [
        { en: "I was planning", ja: "予定していた" },
        { en: "to go straight home", ja: "まっすぐ家に帰ることを" },
        { en: "after work.", ja: "仕事のあとに" }
      ]},
      { chunks: [
        { en: "But one of my coworkers", ja: "でも同僚の一人が" },
        { en: "asked me", ja: "私を誘った" },
        { en: "to have dinner with him.", ja: "一緒に夕食を食べようと" }
      ]},
      { chunks: [
        { en: "I was a little tired,", ja: "少し疲れていた" },
        { en: "but I decided", ja: "でも決めた" },
        { en: "to go.", ja: "行くことに" }
      ]},
      { chunks: [
        { en: "In the end,", ja: "結局" },
        { en: "I was glad", ja: "よかったと思った" },
        { en: "I did.", ja: "行って" }
      ]}
    ],
    questions: [
      { type: "meaning", question: "What was the speaker planning to do after work?", options: ["Go straight home", "Work late", "Meet a client"], answer: 0, explanation: "The speaker was planning to go straight home after work." },
      { type: "meaning", question: "Why did the speaker change the plan?", options: ["A coworker invited him to dinner", "His train was delayed", "He forgot his keys"], answer: 0, explanation: "One of his coworkers asked him to have dinner." },
      { type: "chunk", question: "Which chunking is more natural?", options: ["I was a little tired / but I decided / to go", "I was / a little tired but / I decided to / go"], answer: 0, explanation: "Each unit carries a small, complete piece of meaning." }
    ],
    speak: "Start a little tired and hesitant, then let ‘I was glad I did’ sound genuinely relieved.",
    review: "English moves from left to right. Build meaning as you read instead of waiting for the whole sentence."
  },
  {
    id: 2,
    title: "Fixing a Small Mistake",
    scene: "You realize you sent an old file to a coworker and quickly try to fix it.",
    sceneJa: "古い資料を送ってしまったことに気づき、急いで修正する。",
    emotions: ["worried", "urgent", "relieved"],
    difficulty: 1,
    minutes: 9,
    tags: ["work", "that-clause"],
    sentences: [
      { chunks: [
        { en: "This morning,", ja: "今朝" },
        { en: "I realized", ja: "私は気づいた" },
        { en: "that I had sent an old version of a document", ja: "古いバージョンの資料を送ってしまったことに" },
        { en: "to my coworker.", ja: "同僚に" }
      ]},
      { chunks: [
        { en: "I was worried", ja: "私は心配になった" },
        { en: "that I had caused a problem,", ja: "問題を起こしてしまったのではないかと" },
        { en: "so I called her", ja: "だから彼女に電話した" },
        { en: "right away.", ja: "すぐに" }
      ]},
      { chunks: [
        { en: "Luckily,", ja: "幸い" },
        { en: "she hadn't opened the file", ja: "彼女はそのファイルを開いていなかった" },
        { en: "yet.", ja: "まだ" }
      ]},
      { chunks: [
        { en: "I sent her the correct version", ja: "私は正しいバージョンを彼女に送った" },
        { en: "and felt much better.", ja: "そして、かなりホッとした" }
      ]}
    ],
    questions: [
      { type: "meaning", question: "What mistake did the speaker make?", options: ["Sent an old version", "Deleted the document", "Called the wrong person"], answer: 0, explanation: "The speaker sent an old version of a document." },
      { type: "feeling", question: "Why did the speaker feel relieved?", options: ["The coworker had not opened the file yet", "The meeting was canceled", "The manager fixed it"], answer: 0, explanation: "Luckily, the coworker had not opened the wrong file yet." },
      { type: "chunk", question: "Which chunking is more natural?", options: ["I was worried / that I had caused a problem", "I was / worried that I / had caused a problem"], answer: 0, explanation: "‘I was worried’ forms the emotional base; the that-clause adds what the worry was about." }
    ],
    speak: "Let the middle sentence sound urgent, then release the tension on ‘felt much better.’",
    review: "Catch the main idea first, then add the that-clause."
  },
  {
    id: 3,
    title: "Asking for More Time",
    scene: "You find suspicious numbers in a report and decide accuracy matters more than finishing quickly.",
    sceneJa: "レポートの数字に違和感を見つけ、急ぐより正確さを優先する。",
    emotions: ["confident", "concerned", "careful"],
    difficulty: 2,
    minutes: 10,
    tags: ["work", "when", "because", "that-clause"],
    sentences: [
      { chunks: [
        { en: "I thought", ja: "私は思っていた" },
        { en: "I could finish the report", ja: "レポートを終えられると" },
        { en: "by this afternoon.", ja: "今日の午後までに" }
      ]},
      { chunks: [
        { en: "But", ja: "でも" },
        { en: "when I checked the data again,", ja: "データをもう一度確認したとき" },
        { en: "I found a few numbers", ja: "いくつかの数字を見つけた" },
        { en: "that didn't look right.", ja: "正しくなさそうな" }
      ]},
      { chunks: [
        { en: "I decided", ja: "私は決めた" },
        { en: "to check them carefully", ja: "それらを注意深く確認することに" },
        { en: "because I didn't want", ja: "なぜなら、したくなかったから" },
        { en: "to send incorrect information.", ja: "間違った情報を送ることを" }
      ]},
      { chunks: [
        { en: "I told my manager", ja: "上司に伝えた" },
        { en: "that I would need", ja: "必要になると" },
        { en: "a little more time.", ja: "もう少し時間が" }
      ]}
    ],
    questions: [
      { type: "meaning", question: "Why couldn't the speaker finish as planned?", options: ["Some numbers looked wrong", "The computer broke", "The manager changed the deadline"], answer: 0, explanation: "The speaker found a few numbers that did not look right." },
      { type: "intention", question: "Why did the speaker check the numbers carefully?", options: ["To avoid sending incorrect information", "To make the report longer", "To delay the meeting"], answer: 0, explanation: "The speaker cared about accuracy and did not want to send incorrect information." },
      { type: "chunk", question: "Which chunking is more natural?", options: ["when I checked the data again / I found a few numbers / that didn't look right", "when I checked / the data again I / found a few / numbers that didn't / look right"], answer: 0, explanation: "Chunk by meaning, not by equal word counts." }
    ],
    speak: "Make ‘that didn't look right’ sound like a real moment of noticing something is off.",
    review: "A long sentence is several small ideas connected together."
  },
  {
    id: 4,
    title: "Giving and Receiving Feedback",
    scene: "You show your manager a proposal you worked hard on and receive several suggestions for changes.",
    sceneJa: "時間をかけた提案書を上司に見せ、いくつか修正を提案される。",
    emotions: ["confident", "disappointed", "convinced"],
    difficulty: 2,
    minutes: 10,
    tags: ["work", "feedback", "that-clause", "make+A+adjective"],
    sentences: [
      { chunks: [
        { en: "I spent most of the morning", ja: "午前中のほとんどを使った" },
        { en: "preparing a proposal", ja: "提案書を準備することに" },
        { en: "for our next project.", ja: "次のプロジェクトのための" }
      ]},
      { chunks: [
        { en: "When I showed it", ja: "それを見せたとき" },
        { en: "to my manager,", ja: "上司に" },
        { en: "she suggested", ja: "彼女は提案した" },
        { en: "changing several parts of it.", ja: "いくつかの部分を変更することを" }
      ]},
      { chunks: [
        { en: "At first,", ja: "最初は" },
        { en: "I was a little disappointed", ja: "少しがっかりした" },
        { en: "because I had worked hard on it.", ja: "一生懸命取り組んでいたから" }
      ]},
      { chunks: [
        { en: "But", ja: "でも" },
        { en: "after hearing her reasons,", ja: "彼女の理由を聞いたあと" },
        { en: "I realized", ja: "私は気づいた" },
        { en: "that her suggestions", ja: "彼女の提案が" },
        { en: "would make the proposal", ja: "その提案書を〜にするだろうと" },
        { en: "much clearer.", ja: "ずっと分かりやすく" }
      ]}
    ],
    questions: [
      { type: "feeling", question: "Why was the speaker disappointed?", options: ["The speaker had worked hard on the proposal", "The manager canceled the project", "The proposal was lost"], answer: 0, explanation: "The speaker had put a lot of effort into the proposal, so several suggested changes initially felt disappointing." },
      { type: "meaning", question: "What changed the speaker's mind?", options: ["Hearing the manager's reasons", "Getting more time", "Reading another proposal"], answer: 0, explanation: "After hearing the manager's reasons, the speaker understood the value of the suggestions." },
      { type: "chunk", question: "Which chunking is more natural?", options: ["after hearing her reasons / I realized / that her suggestions / would make the proposal / much clearer", "after hearing / her reasons I / realized that her / suggestions would / make the proposal much / clearer"], answer: 0, explanation: "The first version preserves meaningful phrase groups and the ‘make + A + adjective’ structure." }
    ],
    speak: "Change your voice at ‘But.’ Move from disappointment to a quiet ‘Ah, that makes sense.’",
    review: "Long sentence ≠ one big idea. Keep completing small pieces of meaning from left to right."
  }
];