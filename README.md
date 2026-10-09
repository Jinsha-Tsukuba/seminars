# 筑波大学人文社会系公開講演会

GitHub Pages（`/seminars/`）で公開している公開講演会のサイトです。

## 構成

| パス | 内容 |
| --- | --- |
| `index.html` → `/seminars/` | 講演一覧（2026年の回＋これまでの回） |
| `1/` → `/seminars/1/` | 第1回 Mark Turin（2025年4月10日・終了） |
| `2/` → `/seminars/2/` | 第2回 Miroslav Bárta（2025年5月9日・終了） |
| `3/` → `/seminars/3/` | 第3回 Mark Turin（2026年11月6日） |
| `4/` → `/seminars/4/` | 第4回 Jean Winand（2026年11月10日） |
| `assets/site.css` | 全ページ共通のデザインシステム |
| `assets/site.js` | 全ページ共通のスクリプト |
| `3/qr.svg` `4/qr.svg` | 参加登録フォームのQRコード |

第1・2回は旧 `/seminar1/` · `/seminar2/` の内容を取り込んだものです。旧リポジトリの公開ページ自体は変更していません。

## 参加登録

| 回 | フォーム |
| --- | --- |
| 第3回 | https://forms.gle/Zw8VPu1dLz8yq74b9 |
| 第4回 | https://forms.gle/vz6AUG5MtyW3vCk7A |

各講演ページのヘッダーと「参加について / How to participate」カード（日本語・英語の両面）、および一覧ページのカードからリンクしています。
QRコードは型番3・誤り訂正レベルM のSVGで、`qrcode-generator` で生成しました。
**フォームのURLを変える場合はQRの再生成が必要です。**

## 終了した回

第1・2回にはヘッダーに「この講演は終了しました」、講演詳細の申込欄に「受付終了 / Registration closed」、一覧ページのカードに「終了しました / Concluded」を表示しています。
終了済みのGoogleフォームへのリンクは誤操作を防ぐため外してあります（URLはgit履歴に残っています）。

## 講演者の表記

全ページ共通で次のかたちに揃えてあります。本文中で講演者に言及するときも「〜先生」「Prof. 〜」を使います。

| 面 | 書き方 | 例 |
| --- | --- | --- |
| 日本語の氏名 | カタカナ＋**先生** | マーク・トゥーリン先生 |
| 英語の氏名 | **Prof.** ＋氏名 | Prof. Mark Turin |
| 日本語の所属・職名 | 大学名＋職名 | ブリティッシュ・コロンビア大学 准教授 |
| 英語の所属・職名 | 職名, 大学名 | Associate Professor, University of British Columbia |

対象箇所は、一覧ページのカード（`speaker`）、各回のヘッダー（`speaker-line`）、講師紹介（`profile-name` `profile-title`）、略歴の本文、`<title>` と `meta[name=description]` です。
ヘッダーの `speaker-line` は `by Prof. 氏名` ＋ `<span>` に英語の職名・所属を入れる形で、第1〜4回すべてに置いてあります。
`header-content` の子要素は入場アニメーションが**8個まで**しか定義されていないため（`site.css` の `nth-child`）、ヘッダーに要素を足すときは数に注意してください。

## デザインシステム

見た目と動きは `assets/site.css` と `assets/site.js` の2枚に集約してあり、**各ページのHTMLにスタイルは書かれていません**。配色や余白を直すときはこの2枚だけを編集してください。

### 配色

| 役割 | 色 | 用途 |
| --- | --- | --- |
| 第一アクセント | 筑波紫 `#6a35ce` | リンク、強調、現在ページ、主ボタン、グラデーション始点、日本語面 |
| 第二アクセント | 筑波ブルー `#3252aa` | グラデーション終点、副ボタン、英語面 |
| 地 | `#f5f3fb` / `#ffffff` | 紙面とカード |
| 文字 | `#1c1630` | 本文（白地に対し十分なコントラスト） |
| フォーカス | `#ff9e1b` | キーボード操作時の枠線**専用**。装飾には使わない |

紫・青はいずれも白地に対して約7:1のコントラストがあり、本文色としてもWCAG AAを満たします。
2言語並列の面は、日本語面を紫、英語面を青のごく薄いパネルに載せて役割を見分けられるようにしています。

### 動き

ヘッダー（グラデーションの移動・光のかたまりの変形・紋章の回転・カーソル追従のスポットライト・スクロール視差）、
見出しの段差つき入場、スクロール進行バー、左右から差し込む出現アニメーション、
カードのカーソル追従ハイライトと浮き上がり、ボタンの磁力ホバーと光沢、タグの反転、ドックの拡大とガラスの光沢。

いずれも `prefers-reduced-motion: reduce` で停止します。
ヘッダーの入場はCSSのみ（`animation-fill-mode: both`）、出現アニメーションのクラスはJSが付与するため、**JSが読み込めなくても内容はすべて表示されます**。

出現アニメーション（`initReveal`）で守っていること：

- **段差は `transition-delay` ではなく、クラスを付けるタイミングを `setTimeout` でずらしてつけます。**
  inline の `transition-delay` を残すと、出現後のホバー（カードの浮き上がり）まで同じだけ遅れてしまうためです。
- **出現し終えた要素からは `reveal` / `from-left` / `from-right` を外します。**
  付けたままだと `will-change` による合成層と `.75s` の遷移が残り、カード本来の `.35s` のホバーや1px枠線の描画を狂わせます。
- **入れ子の対象（`content-card` の中の `qr` など）は親の出現に任せます。** 二重に `transform` がかかり中身だけ別に動くのを防ぐためです。
- **3秒後の保険は、IntersectionObserver が一度も動かなかったときだけ**発火します。
  無条件に発火させるとスクロール連動の出現が3秒で死にます。

### ナビゲーション

全5ページ共通のMac風ドック（`mac-dock`）。第1〜4回と一覧に移動でき、現在のページだけが紫のグラデーションで塗られます。
**本文の上に浮かせる**設計のため `body` に左余白は取らず、ドックと内容がぶつかる幅（861〜1390px）のときだけ `.container` の左padding で逃がしています。
860px以下では画面下の横並び（項目が多いため狭い画面では折り返し）になります。

ドックで守っていること：

- **`.mac-dock` に `overflow` を掛けてはいけません。** ツールチップは項目の外（`left: calc(100% + 14px)`）に出るので、
  `overflow: hidden` があるとガラスの余白に隠れて**一切表示されません**。項目の拡大も縁で切られます。
  ガラスの光沢は要素をはみ出さないよう、`inset: 0` のまま `background-position` だけを動かして内側に閉じ込めています。
- **拡大の当たり判定は内側の `.dock-container` ではなくパネル全体（`.mac-dock`）で受けます。**
  内側で受けると、パネルの padding（ガラスの余白）に入った時点で `mouseleave` が発火してちらつきます。
- `touchcancel` でも拡大を戻します（`touchend` だけだと、ブラウザがジェスチャを奪ったときに拡大したまま固まります）。

### 主なクラス

`container` / `header-content`（`eyebrow` `institution-en` `h1` `english-title` `speaker-line` `event-line` `online-badge` `status-past`）
/ `profile-section` / `split-layout`（`japanese-side` `english-side`）/ `content-card` / `details` / `abstract` / `tag`
/ `actions`・`action`（`secondary`）/ `status-note` / `qr` / `feature` / `sponsors`
/ `cards`・`band`・`speaker`・`venue`・`badge`・`link`・`card-actions`

## ポスター

| 回 | ファイル | 差し替え元 | 内容 |
| --- | --- | --- | --- |
| 第3回 | `3/poster.pdf` | `20261106_Turin_Tsukuba_Poster_v7_print.pdf` | 2026.11.06（金）16:45–18:00・中央図書館集会室、QR 2種 |
| 第4回 | `4/poster.pdf` | `20261110_Winand_Tsukuba_Poster_v11_print.pdf` | 2026.11.10（火）17:30–19:00・人文社会学系 A棟 101室、QR 2種 |

2枚とも同じ新デザイン（縦長・紫／シアン・右下に QR 2種）で揃えてあり、右下に「確認用 / DRAFT」の表記が入ったままです。
**以前の第4回ポスターにあった会場の食い違い（ポスター「A520」／ページ「A101」）は、v11 で A101 に直ったため解消しました。**

QRは2枚とも次の2つで、各ページの記載と一致することを確認済みです。

| ポスター上のラベル | 第3回 | 第4回 |
| --- | --- | --- |
| 講演案内 / Details | `jinsha.tsukuba.ac.jp/node/505` | `jinsha.tsukuba.ac.jp/node/506` |
| オンライン参加申込 / Register online | `forms.gle/Zw8VPu1dLz8yq74b9` | `forms.gle/vz6AUG5MtyW3vCk7A` |

## メモ


- 第4回：2026年11月10日 17:30〜19:00（日本時間）、人文社会学系棟 A101、オンライン参加可。
- Webフォントは `assets/site.css` の先頭で `@import` しています（Noto Sans JP / Space Grotesk / Lato）。
- 表示確認には Ruby の WEBrick が使えます（`/seminars/` 配下で配信する必要があります）。

```
ruby -rwebrick -e 's=WEBrick::HTTPServer.new(Port:8787,DocumentRoot:".");s.mount("/seminars",WEBrick::HTTPServlet::FileHandler,".");trap("INT"){s.shutdown};s.start'
```
