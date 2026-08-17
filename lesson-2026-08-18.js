window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  id: 13,
  createdAt: "2026-08-18",
  title: "Ten Minutes Early",
  scene: "You leave home a little earlier than usual for an important meeting. A train delay tests whether that small buffer was worth it.",
  sceneJa: "大事な会議の日、いつもより10分早く家を出る。電車遅延に遭うが、その小さな余裕が心の余裕につながる。",
  emotions: ["prepared", "calm", "relieved", "reflective"],
  difficulty: 3,
  minutes: 10,
  tags: ["daily-life", "commute", "because", "would-have", "as-it-turned-out", "peace-of-mind"],
  sentences: [
    { chunks: [{ en: "I left home ten minutes earlier than usual", ja: "いつもより10分早く家を出ました" }, { en: "because I had an important meeting.", ja: "大事な会議があったので" }] },
    { chunks: [{ en: "At first,", ja: "最初は" }, { en: "I thought I was being a little too careful,", ja: "少し慎重すぎるかなと思いました" }, { en: "but when I got to the station,", ja: "でも駅に着くと" }, { en: "the train was delayed.", ja: "電車が遅れていました" }] },
    { chunks: [{ en: "A few years ago,", ja: "数年前の自分なら" }, { en: "something like that would have made me panic.", ja: "こんなことが起きたら焦っていたでしょう" }] },
    { chunks: [{ en: "This time,", ja: "今回は" }, { en: "I just bought a coffee,", ja: "ただコーヒーを買い" }, { en: "sent a short message to my team,", ja: "チームに短いメッセージを送り" }, { en: "and waited.", ja: "待ちました" }] },
    { chunks: [{ en: "As it turned out,", ja: "結局のところ" }, { en: "I arrived exactly on time —", ja: "到着したのはちょうど時間どおりで" }, { en: "which made me realize", ja: "そのことで気づきました" }, { en: "that sometimes ten extra minutes", ja: "たった10分の余裕が時には" }, { en: "can buy you a lot of peace of mind.", ja: "大きな心の余裕をもたらすことに" }] }
  ],
  questions: [
    { type: "chunk", question: "Which boundary is most natural?", options: ["I left home ten minutes earlier than usual / because I had an important meeting", "I left / home ten minutes earlier / than usual because", "I left home / ten minutes / earlier than usual because I had"], answer: 0, explanation: "The first chunk gives the action, and the because-clause naturally gives the reason." },
    { type: "meaning", question: "What does ‘would have made me panic’ express?", options: ["A past habit or likely reaction that did not happen this time", "A plan for the next meeting", "A request to someone else"], answer: 0, explanation: "The speaker contrasts their old likely reaction with how calmly they handled the situation this time." },
    { type: "meaning", question: "What does ‘As it turned out’ mean here?", options: ["Before anything happened", "In the end, when the result became clear", "Because the train turned around"], answer: 1, explanation: "‘As it turned out’ introduces the result that became clear later." }
  ],
  speak: "Start the story in a matter-of-fact tone. Let a little tension enter at ‘the train was delayed,’ then relax at ‘This time.’ Finish ‘peace of mind’ slowly, as if you are noticing the lesson for yourself.",
  review: "Today’s flow: preparation → small problem → contrast with the past → calm response → reflection. Notice how the story uses a tiny everyday event to move from action to insight."
});
