# イベント・ブレンドマッチングアプリ

イベント参加者がQRコードから回答し、集計・ランキング・マッチング・結果発表を行うためのWebアプリです。

このGitHubテンプレートは、AI、GitHub、Supabase、Vercel、プログラミングの初心者でも、AIへ画面のスクリーンショットを送りながら導入できるように構成されています。

## 初めて利用する方へ

最初に、次のファイルを開いてください。

```text
START_HERE.md
```

`START_HERE.md`には、次の内容がまとめられています。

- 必要なサービスとアカウント
- AIへ最初に送る文章
- GitHubテンプレートの複製方法
- Supabaseの設定方法
- Vercelでの公開方法
- 集計者アカウントの作成方法
- 今回の参加人数の設定方法
- QRコードの作成方法
- 本番前テスト
- トラブル発生時の確認方法

詳しい説明は、`docs`フォルダーにあります。

---

## 主な機能

### 参加者画面

- 固有QRから札番号を自動取得
- マスターQRから札番号を手入力
- 3種類の商品と配合量を選択
- 合計量を自動計算
- 初回回答の保存
- 回答済み判定
- 回答内容の再表示
- 回答の上書き修正

### 集計者画面

- メールアドレスとパスワードによるログイン
- 今回の参加人数を1～30名で設定
- 参加人数をSupabaseへ保存
- 全札数、回答済み数、未回答数を表示
- 未回答札番号を表示
- 人気No.1ベース
- 人気No.1フレーバー
- 同じベースを選んだ参加者
- 同じ3種類を選んだ参加者
- 種類と配合量が完全一致した参加者
- 全回答削除

### 発表モード

- 人気No.1ベースの発表
- 人気No.1フレーバーの発表
- 3種類マッチの発表
- 完全一致の発表
- プロジェクター向け表示
- 発表開始時点の結果を固定

---

## 最大参加人数

最大対応人数は30名です。

実際の参加人数は、アプリの集計者画面から1～30名で設定できます。

```text
集計者
→ イベント設定
→ 今回の参加人数
→ 参加人数を保存
```

参加人数はSupabaseへ保存されます。ページを再読み込みした場合や、別の端末から開いた場合も同じ人数が反映されます。

---

## 使用するサービス

- GitHub：アプリのファイルと説明書を保管
- Supabase：回答、参加人数、集計者アカウントを保存
- Vercel：アプリをインターネット上へ公開

提供先ごとに、GitHub、Supabase、Vercelの環境を分けて使用してください。

---

## 主なファイル

```text
START_HERE.md
README.md
AGENTS.md
AI_HANDOFF.md
AI_PROMPTS.md

src/
├─ App.jsx
├─ index.css
├─ main.jsx
├─ config/
│  └─ eventConfig.js
└─ lib/
   └─ supabase.js

docs/
├─ 00_最初にお読みください.md
├─ 01_アカウント作成.md
├─ 02_GitHub準備.md
├─ 03_Supabase設定.md
├─ 04_Vercel公開.md
├─ 05_イベント設定.md
├─ 06_QR生成.md
├─ 07_本番前テスト.md
└─ 08_トラブル対応.md

supabase/
├─ migrations/
│  └─ 202608280001_initial_schema.sql
└─ admin_delete_policy_template.sql

scripts/
├─ generate-qr.mjs
└─ verify-qr.mjs
```

---

## 基本設定の変更場所

イベント名、商品名、初期参加人数、配合量は、次のファイルへまとめています。

```text
src/config/eventConfig.js
```

実際のイベント参加人数は、コードではなく集計者画面から変更してください。

---

## Supabaseの初期構築

SupabaseのSQL Editorで、次のファイルの内容を実行します。

```text
supabase/migrations/202608280001_initial_schema.sql
```

このSQLで、次を作成します。

- 回答保存用の`answers`テーブル
- 参加人数保存用の`event_settings`テーブル
- テーブル権限
- RLSポリシー

集計者だけに全回答削除を許可するため、次のファイルも使用します。

```text
supabase/admin_delete_policy_template.sql
```

`YOUR_ADMIN_UID`を、Supabase Authenticationで作成した集計者のUIDへ置き換えて実行してください。

---

## Vercelの環境変数

次の2つをProductionへ登録します。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

2つの値は、必ず同じSupabaseプロジェクトから取得してください。

```text
VITE_SUPABASE_URL
→ https://プロジェクトID.supabase.co
```

```text
VITE_SUPABASE_PUBLISHABLE_KEY
→ sb_publishable_で始まるキー
```

Value欄には値だけを入力してください。

Secret key、`sb_secret_`で始まるキー、service_roleキーはブラウザー側で使用しないでください。

環境変数を変更した後は、Productionを再デプロイしてください。

---

## QRコード

固有QRは次の形式です。

```text
https://公開URL/?ticket=札番号
```

マスターQRは札番号を含まない公開URLを使用します。

QR生成と検査には次のファイルを使用します。

```text
scripts/generate-qr.mjs
scripts/verify-qr.mjs
```

詳しい使用方法は次を確認してください。

```text
docs/06_QR生成.md
```

---

## AIへ変更を依頼する場合

最初に、AIへ次のファイルを確認してもらってください。

- `START_HERE.md`
- `AGENTS.md`
- `AI_HANDOFF.md`
- `AI_PROMPTS.md`

用途別のコピペ用依頼文は、次にまとめています。

```text
AI_PROMPTS.md
```

---

## 本番前テスト

本番前には、次を開いて確認してください。

```text
docs/07_本番前テスト.md
```

最低限、次を確認します。

- 集計者ログイン
- 参加人数の保存と再読み込み
- 最後の有効な札番号と、その次の番号
- 初回回答
- 回答済み判定
- 回答修正
- 未回答札番号
- 人気ランキング
- 3種類マッチ
- 完全一致
- 発表モード
- 全回答削除

テスト完了後は、回答済み0件、未回答数が今回の参加人数と同じ状態へ戻してください。

---

## 秘密情報の取り扱い

次の情報をGitHub、AIとのチャット、スクリーンショットへ載せないでください。

- `.env`の実際の内容
- パスワード
- 復旧コード
- Secret key
- service_roleキー
- GitHubアクセストークン
- Vercelアクセストークン
- 管理者UID
- 個人情報を含む回答データ

Publishable keyはブラウザー用ですが、スクリーンショットでは隠すことを推奨します。

---

## 困った場合

次のファイルを確認してください。

```text
docs/08_トラブル対応.md
```

エラーが発生した場合は、推測だけでパスワードや設定を繰り返し変更せず、エラー全文、Vercelの環境変数、Supabaseの接続先、Console、Network、Authログを順に確認してください。
