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

### ナビゲーション

全5ページ共通のMac風ドック（`mac-dock`）。第1〜4回と一覧に移動でき、現在のページだけが紫のグラデーションで塗られます。
**本文の上に浮かせる**設計のため `body` に左余白は取らず、ドックと内容がぶつかる幅（861〜1390px）のときだけ `.container` の左padding で逃がしています。
860px以下では画面下の横並び（項目が多いため狭い画面では折り返し）になります。

### 主なクラス

`container` / `header-content`（`eyebrow` `institution-en` `h1` `english-title` `speaker-line` `event-line` `online-badge` `status-past`）
/ `profile-section` / `split-layout`（`japanese-side` `english-side`）/ `content-card` / `details` / `abstract` / `tag`
/ `actions`・`action`（`secondary`）/ `status-note` / `qr` / `feature` / `sponsors`
/ `cards`・`band`・`speaker`・`venue`・`badge`・`link`・`card-actions`

## ポスター

| 回 | ファイル | 内容 |
| --- | --- | --- |
| 第3回 | `3/poster.pdf` | `20261106_Turin_Tsukuba_Poster_v7_print.pdf` に差し替え済み（2026.11.06・中央図書館集会室、QR 2種入り） |
| 第4回 | `4/poster.pdf` | 従来のまま（2026.11.10 17:30–19:00・Jean Winand） |

**第4回のポスターは会場を「A520」と記載しており、ページ側の「A101」と食い違っています。**どちらかを直す必要があります。

## メモ


- 第4回：2026年11月10日 17:30〜19:00（日本時間）、人文社会学系棟 A101、オンライン参加可。
- Webフォントは `assets/site.css` の先頭で `@import` しています（Noto Sans JP / Space Grotesk / Lato）。
- 表示確認には Ruby の WEBrick が使えます（`/seminars/` 配下で配信する必要があります）。

```
ruby -rwebrick -e 's=WEBrick::HTTPServer.new(Port:8787,DocumentRoot:".");s.mount("/seminars",WEBrick::HTTPServlet::FileHandler,".");trap("INT"){s.shutdown};s.start'
```
