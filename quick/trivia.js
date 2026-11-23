// Quick Lab trivia: sourced, editorially curated three-choice cards.
window.QUICK_TRIVIA = [
  {
    "id": "poly-hear",
    "category": "多音字",
    "han": "聽",
    "question": "「聽日」は何を意味する？",
    "options": [
      "明日",
      "今日",
      "昨日"
    ],
    "answer": 0,
    "detail": "「聽日」は香港口語で明日。聽講の聽（teng1）と聽日の聽（ting1）では読みも異なる。",
    "source": "https://jyutping.org/en/"
  },
  {
    "id": "poly-up",
    "category": "多音字",
    "han": "上",
    "question": "「上車」の上の声調は？",
    "options": [
      "第6声 soeng6",
      "第5声 soeng5",
      "第2声 soeng2"
    ],
    "answer": 1,
    "detail": "「上車」は soeng5 ce1。一方「上面」は soeng6 min6。",
    "source": "https://jyutping.org/en/"
  },
  {
    "id": "poly-meet",
    "category": "多音字",
    "han": "會",
    "question": "「開會」の會の声調は？",
    "options": [
      "第5声 wui5",
      "第6声 wui6",
      "第2声 wui2"
    ],
    "answer": 2,
    "detail": "「開會」は hoi1 wui2。助動詞としての「會」は wui5 などで使う。",
    "source": "https://jyutping.org/en/"
  },
  {
    "id": "homophone-1",
    "category": "同音異義語",
    "han": "事",
    "question": "「si6」と発音する漢字はどれ？",
    "options": [
      "詩",
      "事",
      "時"
    ],
    "answer": 1,
    "detail": "事は si6、詩は si1、時は si4。声調の違いも意味を分ける。",
    "source": "https://jyutping.org/en/"
  },
  {
    "id": "homophone-2",
    "category": "同音異義語",
    "han": "市",
    "question": "「si5」と発音する漢字はどれ？",
    "options": [
      "市",
      "詩",
      "時"
    ],
    "answer": 0,
    "detail": "市は si5、詩は si1、時は si4。",
    "source": "https://jyutping.org/en/"
  },
  {
    "id": "music",
    "category": "Cantopop",
    "han": "歌",
    "question": "Cantopop の「Canto」が指すのは？",
    "options": [
      "広東語",
      "北京語",
      "英語"
    ],
    "answer": 0,
    "detail": "Cantopopは広東語ポップ音楽の呼称。歌詞を読むと香港口語と書き言葉の違いも見つかる。",
    "source": "https://www.hkmusic.org/"
  },
  {
    "id": "football",
    "category": "スポーツ・サッカー",
    "han": "球",
    "question": "「足球」の意味は？",
    "options": [
      "バスケットボール",
      "サッカー",
      "バレーボール"
    ],
    "answer": 1,
    "detail": "足球（zuk1 kau4）はサッカー。香港にもサッカー協会と国内リーグがある。",
    "source": "https://www.hkfa.com/en/"
  },
  {
    "id": "team",
    "category": "スポーツ・サッカー",
    "han": "隊",
    "question": "「球隊」は何を指す？",
    "options": [
      "スタジアム",
      "審判",
      "チーム"
    ],
    "answer": 2,
    "detail": "球隊（kau4 deoi6）は球技のチーム。球員は選手。",
    "source": "https://www.hkfa.com/en/"
  },
  {
    "id": "mtr",
    "category": "交通・MTR",
    "han": "鐵",
    "question": "香港のMTRの正式な英語名は？",
    "options": [
      "Mass Transit Railway",
      "Metro Tram Route",
      "Main Transport Road"
    ],
    "answer": 0,
    "detail": "MTRはMass Transit Railwayの略。香港の鉄道網を指す。",
    "source": "https://www.mtr.com.hk/en/customer/services/system_map.html"
  },
  {
    "id": "tram",
    "category": "交通・MTR",
    "han": "車",
    "question": "香港島の路面電車で有名な車両の特徴は？",
    "options": [
      "二階建て",
      "地下専用",
      "一両すべて寝台"
    ],
    "answer": 0,
    "detail": "香港トラムは二階建て車両で知られる。MTRとは異なる交通機関。",
    "source": "https://www.hktramways.com/en/"
  },
  {
    "id": "film",
    "category": "香港映画・ドラマ",
    "han": "影",
    "question": "香港映画の歴史資料を公開する公的機関は？",
    "options": [
      "香港電影資料館",
      "香港天文台",
      "香港郵政"
    ],
    "answer": 0,
    "detail": "香港電影資料館（Hong Kong Film Archive）は映画資料の収集・保存・公開を担う。",
    "source": "https://www.filmarchive.gov.hk/en/web/hkfa/home.html"
  },
  {
    "id": "food",
    "category": "茶餐廳・食文化",
    "han": "茶",
    "question": "「奶茶」は何？",
    "options": [
      "ミルクティー",
      "緑茶だけ",
      "豆乳"
    ],
    "answer": 0,
    "detail": "奶茶（naai5 caa4）はミルクティー。香港の飲食文化でおなじみ。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html"
  },
  {
    "id": "cafe",
    "category": "茶餐廳・食文化",
    "han": "餐",
    "question": "「茶餐廳」はどんな店？",
    "options": [
      "カジュアルな飲食店",
      "図書館",
      "駅の改札"
    ],
    "answer": 0,
    "detail": "茶餐廳は香港の大衆的な飲食店の一形態。飲み物と食事を提供する。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html"
  },
  {
    "id": "signs",
    "category": "地名・街の看板",
    "han": "街",
    "question": "香港の「旺角」は何の名前？",
    "options": [
      "地区名",
      "通貨名",
      "料理名"
    ],
    "answer": 0,
    "detail": "旺角（Mong Kok）は九龍の地区名。街の看板から繁体字を学べる。",
    "source": "https://www.discoverhongkong.com/eng/explore/neighbourhoods.html"
  },
  {
    "id": "history",
    "category": "香港の歴史",
    "han": "港",
    "question": "香港が英国から中国へ返還された年は？",
    "options": [
      "1984年",
      "1997年",
      "2008年"
    ],
    "answer": 1,
    "detail": "1997年7月1日に香港の主権が英国から中国へ移った。",
    "source": "https://www.historymuseum.gov.hk/en/web/mh/index.html"
  },
  {
    "id": "input",
    "category": "漢字と入力",
    "han": "字",
    "question": "速成入力が倉頡コードから使う部分は？",
    "options": [
      "先頭と末尾",
      "中央2文字",
      "最後の1文字だけ"
    ],
    "answer": 0,
    "detail": "速成は倉頡コードの先頭と末尾を使う入力方式。IMEの候補選択は別途必要。",
    "source": "https://github.com/rime/rime-cangjie"
  }
];
