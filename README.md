# 筑波大学人文社会系公開講演会

GitHub Pages（`/seminars/`）で公開している公開講演会のサイトです。

## 構成

| パス | 内容 |
| --- | --- |
| `index.html` → `/seminars/` | 講演一覧（2026年の回＋これまでの回） |
| `1/` → `/seminars/1/` | 第1回 Mark Turin（2025年4月10日） |
| `2/` → `/seminars/2/` | 第2回 Miroslav Bárta（2025年5月9日） |
| `3/` → `/seminars/3/` | 第3回 Mark Turin（2026年11月6日） |
| `4/` → `/seminars/4/` | 第4回 Jean Winand（2026年11月10日） |
| `assets/site.css` | 全ページ共通のデザインシステム |
| `assets/site.js` | 全ページ共通のスクリプト |

第1・2回は旧 `/seminar1/` · `/seminar2/` の内容を取り込んだものです。旧リポジトリの公開ページ自体は変更していません。

## デザインシステム

見た目と動きは `assets/site.css` と `assets/site.js` の2枚に集約してあり、**各ページのHTMLにスタイルは書かれていません**。配色や余白を直すときはこの2枚だけを編集してください。

### 配色

| 役割 | 色 | 用途 |
| --- | --- | --- |
| 第一アクセント | 筑波紫 `#6a35ce` | リンク、強調、現在ページ、主ボタン、グラデーション始点 |
| 第二アクセント | 筑波ブルー `#3252aa` | グラデーション終点、英語面の見出し、副ボタン |
| 地 | `#f7f5fc` / `#ffffff` | 紙面とカード |
| 文字 | `#1c1630` | 本文（白地に対し十分なコントラスト） |
| フォーカス | `#ff9e1b` | キーボード操作時の枠線**専用**。装飾には使わない |

紫・青はいずれも白地に対して約7:1のコントラストがあり、本文色としてもWCAG AAを満たします。

### 動き

ヘッダーの光の往復、スクロール進行バー、スクロール連動の出現、カードのホバー、ボタンの光沢、ドックの拡大。
いずれも `prefers-reduced-motion: reduce` で停止します。出現アニメーションのクラスはJSが付与するため、JS無効時も内容はすべて表示されます。

### ナビゲーション

全5ページ共通のMac風ドック（`mac-dock`）。第1〜4回と一覧に移動でき、現在のページだけが紫のグラデーションで塗られます。
デスクトップでは画面左、860px以下では画面下の横並び（項目が多いため狭い画面では折り返し）になります。

### 主なクラス

`container` / `header-content`（`eyebrow` `institution-en` `h1` `english-title` `speaker-line` `event-line` `online-badge`）/ `profile-section` / `split-layout`（`japanese-side` `english-side`）/ `content-card` / `details` / `abstract` / `tag` / `actions`・`action`（`secondary`）/ `feature` / `cards`・`band`・`speaker`・`venue`・`badge`・`link`

## メモ

- 第4回：2026年11月10日 17:30〜19:00（日本時間）、人文社会学系棟 A101、オンライン参加可。
- Webフォントは `assets/site.css` の先頭で `@import` しています（Noto Sans JP / Space Grotesk / Lato）。
