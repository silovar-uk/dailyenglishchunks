# Quick Lab — Phase 2: 字根の見方
## 学習の原則
倉頡の字根キーは、漢字の部首と一致しません。Vは「女」のほか、補助字形を含む分類です。
「晨」= 倉頡 AMMV → 速成 AV。上の「日」がA、下の「辰」の最後の字形がVです。
ただし、形を見ただけで全ての曲線をVと判断してはいけません。字形分解と取碼規則が必要です。

## データ管理
現在の6字はMVP用。第3代系のコードを基準に、教材を拡張する前に各文字のコードと補助字形を照合します。
現状の説明文は学習上の略記であり、正式な全字根分解表ではありません。

## Phase 2 UX検証項目
- iPhone: 2タップ入力、画面キーボードが開かない、結果が画面外に押し出されない
- PC: キーボード入力、Enterで判定・次へ、Backspaceで削除
- 復習: 間違い・ヒント使用時は再学習対象、正答時は復習間隔が延長
- 記録: リロード後も残り、リセットで削除
- アクセシビリティ: フォーカス、色以外の正誤表示、スクリーンリーダー向け結果通知

## 参照
- Microsoft Traditional Chinese IME: https://learn.microsoft.com/en-us/globalization/input/traditional-chinese-ime
- Rime Quick dictionary: https://github.com/rime/rime-quick
- Unicode Cangjie generation discussion: https://www.unicode.org/L2/L2025/25216-kcangjie.pdf
