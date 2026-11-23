// Quick Lab trivia: sourced, editorially curated three-choice cards.
// Questions target specific knowledge rather than literal character-meaning giveaways.
window.QUICK_TRIVIA = [
  {
    "id": "poly-hear",
    "category": "多音字",
    "han": "聽",
    "question": "香港の友人から「聽日見」と届いた。約束する日はいつ？",
    "options": [
      "翌日",
      "当日",
      "翌週"
    ],
    "answer": 0,
    "detail": "「聽日」（ting1 jat6）は香港口語で「明日」。聽日見＝また明日。日本語の「聴く」からは意味を推測しにくい。",
    "source": "https://jyutping.org/en/",
    "skill": "語彙・文脈",
    "objective": "聽日を日常の約束の文脈で理解できる"
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
    "source": "https://jyutping.org/en/",
    "skill": "声調・発音",
    "objective": "上車と上面で「上」の声調が変わることを区別できる"
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
    "source": "https://jyutping.org/en/",
    "skill": "声調・発音",
    "objective": "開會の會の声調を、助動詞の會と区別できる"
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
    "source": "https://jyutping.org/en/",
    "skill": "声調・発音",
    "objective": "si1・si4・si6を声調で区別できる"
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
    "source": "https://jyutping.org/en/",
    "skill": "声調・発音",
    "objective": "si1・si4・si5を声調で区別できる"
  },
  {
    "id": "music",
    "category": "Cantopop",
    "han": "歌",
    "question": "香港の歌詞に「我愛你」が出てきた。日常の口語表現として注意すべきことは？",
    "options": [
      "歌詞の書面語が、そのまま自然な日常会話とは限らない",
      "歌詞にある漢字は広東語では発音しない",
      "歌詞の広東語は声調を持たない言語になる"
    ],
    "answer": 0,
    "detail": "広東語の歌詞には書面語が多く使われ、口語と表現が異なる場合がある。歌で覚えた表現は実際の会話での自然さを別途確認するとよい。",
    "source": "https://www.hkmusic.org/",
    "skill": "言語文化",
    "objective": "歌詞の書面語と口語の違いを意識できる"
  },
  {
    "id": "football",
    "category": "スポーツ・サッカー",
    "han": "球",
    "question": "香港の試合会場で「球迷入場」と案内された。入場するのは誰？",
    "options": [
      "観客・サポーター",
      "登録選手",
      "審判団"
    ],
    "answer": 0,
    "detail": "球迷（kau4 mai4）はファン・サポーター。球員（kau4 jyun4）は選手。香港の案内表示では対象者の違いが重要。",
    "source": "https://www.hkfa.com/en/",
    "skill": "語彙・文脈",
    "objective": "球迷と球員を現地の案内文で読み分けられる"
  },
  {
    "id": "team",
    "category": "スポーツ・サッカー",
    "han": "隊",
    "question": "「球會宣布簽入新球員」というニュースで「球會」は何を指す？",
    "options": [
      "選手を獲得するクラブ",
      "試合を裁く審判団",
      "観客席のサポーター"
    ],
    "answer": 0,
    "detail": "球會はクラブを指し、球員は選手。「簽入新球員」は新しい選手を獲得するという文脈。",
    "source": "https://www.hkfa.com/en/",
    "skill": "語彙・文脈",
    "objective": "球會と球員をスポーツニュースの文脈で理解できる"
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
    "source": "https://www.mtr.com.hk/en/customer/services/system_map.html",
    "skill": "香港の生活知識",
    "objective": "MTRの英語正式名称を識別できる"
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
    "source": "https://www.hktramways.com/en/",
    "skill": "香港の生活知識",
    "objective": "香港トラムの運行地域を識別できる"
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
    "source": "https://www.filmarchive.gov.hk/en/web/hkfa/home.html",
    "skill": "香港の生活知識",
    "objective": "映画資料を保存・公開する機関を識別できる"
  },
  {
    "id": "food",
    "category": "茶餐廳・食文化",
    "han": "茶",
    "question": "香港の茶餐廳で「絲襪奶茶」の「絲襪」が指すのは？",
    "options": [
      "茶こしの見た目をストッキングになぞらえた呼び名",
      "飲み物にストッキングを浸す調理法",
      "ミルクを入れない紅茶の総称"
    ],
    "answer": 0,
    "detail": "絲襪奶茶は香港式ミルクティーの呼び名。茶こしの袋の見た目がストッキングに似ることに由来する。実際に衣類を使うという意味ではない。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html",
    "skill": "香港の生活知識",
    "objective": "香港式奶茶の名称の由来と実際の調理法を区別できる"
  },
  {
    "id": "cafe",
    "category": "茶餐廳・食文化",
    "han": "餐",
    "question": "香港の茶餐廳で「凍檸茶」を注文すると、一般に何が出てくる？",
    "options": [
      "冷たいレモンティー",
      "温かいミルクティー",
      "冷たいレモン入りコーヒー"
    ],
    "answer": 0,
    "detail": "凍檸茶（dung3 ning4 caa4）は冷たいレモンティー。凍は冷たい、檸はレモン、茶はお茶を表す。注文表現として役立つ。",
    "source": "https://www.discoverhongkong.com/eng/explore/dining.html",
    "skill": "香港の生活知識",
    "objective": "茶餐廳での注文表現「凍檸茶」を理解できる"
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
    "source": "https://www.discoverhongkong.com/eng/explore/neighbourhoods.html",
    "skill": "香港の生活知識",
    "objective": "旺角の地理的位置を識別できる"
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
    "source": "https://www.historymuseum.gov.hk/en/web/mh/index.html",
    "skill": "香港の歴史",
    "objective": "1997年の香港返還という基本年表を理解できる"
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
    "source": "https://github.com/rime/rime-cangjie",
    "skill": "入力技術",
    "objective": "速成で倉頡コードの先頭と末尾を使うことを説明できる"
  }
];
