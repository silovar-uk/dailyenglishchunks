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
    "question": "香港のCantopopが、広東語の会話練習と必ずしも一致しない理由は？",
    "options": [
      "歌詞には書き言葉の表現も多く使われるから",
      "Cantopopでは広東語の声調が存在しないから",
      "Cantopopはすべて英語で歌われるから"
    ],
    "answer": 0,
    "detail": "Cantopopは広東語の歌を中心とするが、歌詞には書面語も使われる。歌詞の表現がそのまま日常会話で自然とは限らない。",
    "source": "https://www.hkmusic.org/"
  },
  {
    "id": "football",
    "category": "スポーツ・サッカー",
    "han": "球",
    "question": "香港で「球員」と「球迷」を使い分けるとき、正しい組み合わせは？",
    "options": [
      "球員＝選手／球迷＝ファン",
      "球員＝審判／球迷＝選手",
      "球員＝ファン／球迷＝監督"
    ],
    "answer": 0,
    "detail": "球員は選手、球迷はファン・サポーターを指す。字面が似ていても役割は異なる。",
    "source": "https://www.hkfa.com/en/"
  },
  {
    "id": "team",
    "category": "スポーツ・サッカー",
    "han": "隊",
    "question": "「球隊」と「球會」の違いとして、より適切なのは？",
    "options": [
      "球隊は競技チーム、球會はクラブ・団体を指し得る",
      "球隊は審判団、球會は競技チームを指す",
      "球隊は試合会場、球會はリーグの順位を指す"
    ],
    "answer": 0,
    "detail": "球隊は競技チームを指し、球會はクラブや団体を指す語として使われる。文脈によって対象は重なる。",
    "source": "https://www.hkfa.com/en/"
  },
  {
    "id": "mtr",
    "category": "交通・MTR",
    "han": "鐵",
    "question": "香港のMTRの正式な英語名は？",
    "options": [
      "Mass Transit Railway",
      "Metropolitan Transport Rail",
      "Mass Transit Route"
    ],
    "answer": 0,
    "detail": "MTRはMass Transit Railwayの略。香港の鉄道網を指す。",
    "source": "https://www.mtr.com.hk/en/customer/services/system_map.html"
  },
  {
    "id": "tram",
    "category": "交通・MTR",
    "han": "車",
    "question": "香港島のトラムの運行について、正しいのは？",
    "options": [
      "主に香港島北岸を東西に走る",
      "九龍半島だけを環状運行する",
      "香港国際空港と中環を直通する"
    ],
    "answer": 0,
    "detail": "香港トラムは香港島北岸を中心に走る路面電車。二階建て車両が特徴。",
    "source": "https://www.hktramways.com/en/"
  },
  {
    "id": "film",
    "category": "香港映画・ドラマ",
    "han": "影",
    "question": "香港映画の歴史資料を公開する公的機関は？",
    "options": [
      "香港電影資料館",
      "香港文化博物館",
      "香港藝術館"
    ],
    "answer": 0,
    "detail": "香港電影資料館（Hong Kong Film Archive）は映画資料の収集・保存・公開を担う。",
    "source": "https://www.filmarchive.gov.hk/en/web/hkfa/home.html"
  },
  {
    "id": "food",
    "category": "茶餐廳・食文化",
    "han": "茶",
    "question": "香港式奶茶の作り方の特徴として適切なのは？",
    "options": [
      "濃く抽出した紅茶にエバミルクなどを合わせる",
      "抹茶に炭酸水を合わせる",
      "紅茶を必ず冷水だけで抽出する"
    ],
    "answer": 0,
    "detail": "香港式奶茶は濃い紅茶にエバミルクなどを合わせるスタイルで知られる。単なる牛乳入り紅茶より作り方に特徴がある。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html"
  },
  {
    "id": "cafe",
    "category": "茶餐廳・食文化",
    "han": "餐",
    "question": "「茶餐廳」はどんな店？",
    "options": [
      "軽食から食事まで扱う大衆食堂",
      "茶葉の販売を中心とする専門店",
      "飲茶のコース料理だけを提供する高級店"
    ],
    "answer": 0,
    "detail": "茶餐廳は香港の大衆的な飲食店の一形態。飲み物と食事を提供する。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html"
  },
  {
    "id": "signs",
    "category": "地名・街の看板",
    "han": "街",
    "question": "旺角（Mong Kok）は香港のどの地域に位置する？",
    "options": [
      "九龍",
      "香港島",
      "ランタオ島"
    ],
    "answer": 0,
    "detail": "旺角は九龍に位置する繁華街。地名を知っているかが問われ、漢字の字面だけでは答えにくい。",
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
