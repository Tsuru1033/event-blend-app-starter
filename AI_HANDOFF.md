# AI引き継ぎ資料

## この資料の目的

この資料は、イベント用ブレンド回答・集計アプリを、別のAIが安全に保守・変更できるようにするための引き継ぎ資料です。

利用者は、AI、GitHub、Supabase、Vercel、プログラミングの初心者を想定しています。

AIは、最初に次のファイルを確認してください。

- `START_HERE.md`
- `README.md`
- `AGENTS.md`
- `AI_HANDOFF.md`
- `AI_PROMPTS.md`
- `src/config/eventConfig.js`
- `src/App.jsx`
- `src/lib/supabase.js`
- `supabase/migrations/202608280001_initial_schema.sql`
- `supabase/admin_delete_policy_template.sql`

---

## アプリの概要

参加者が固有QRコードからアプリを開き、3種類の商品と配合量を回答するイベント用Webアプリです。

回答はSupabaseへ保存され、集計者画面で次を確認できます。

- 全札数
- 回答済み数
- 未回答数
- 未回答札番号
- 人気No.1ベース
- 人気No.1フレーバー
- 同じベースを選んだ参加者
- 同じ3種類を選んだ参加者
- 種類と配合量が完全一致した参加者
- プロジェクター投影用の発表モード

---

## 使用技術

- フロントエンド：React
- 開発・ビルド：Vite
- データベース：Supabase PostgreSQL
- 認証：Supabase Auth
- 公開：Vercel
- ソース保管：GitHub
- QR生成：Node.jsスクリプト

---

## 主なデータの流れ

```text
固有QRまたはマスターQR
↓
Vercelで公開されたWebアプリ
↓
Supabaseへ回答を保存・更新
↓
集計者がログイン
↓
回答状況、ランキング、マッチを集計
↓
発表モードでプロジェクターへ表示
```

---

## 主なファイル構成

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

## 完成済み機能

### 参加者機能

- URLの`ticket`から札番号を取得
- 固有QRから開いた場合は札番号を固定
- マスターQRから開いた場合は札番号を手入力
- 3種類の異なる商品を選択
- ベース量を固定
- フレーバー量から残り量を自動計算
- 合計量の検証
- 回答内容の確認
- 初回回答の保存
- 回答済み判定
- 回答内容の再表示
- 回答の上書き修正

### 集計者機能

- メールアドレスとパスワードによるログイン
- 回答一覧の最新読み込み
- 今回の参加人数を1～30名で設定
- 参加人数をSupabaseへ保存
- 主催者番号を参加人数と同じ番号へ自動設定
- 回答済み数と未回答数の表示
- 未回答札番号の表示
- 人気No.1ベース
- 人気No.1フレーバー
- 同じベースのグループ
- 同じ3種類のグループ
- 種類と配合量が完全一致したグループ
- 全回答削除

### 発表モード

- 人気No.1ベース
- 人気No.1フレーバー
- 3種類マッチ
- 完全一致
- 前へ
- 次へ
- 結果を表示
- 発表モードを終了
- 発表開始時点の結果を固定
- スマートフォン横向きとプロジェクター投影を想定した表示

---

## 参加人数の仕様

### 最大人数

最大対応人数は30名です。

### 初期値

初期参加人数は次のファイルに設定します。

```text
src/config/eventConfig.js
```

### 運用中の人数

実際のイベントで使用する参加人数は、Supabaseの次のテーブルに保存します。

```text
event_settings
```

使用する主な列は次のとおりです。

```text
participant_count
organizer_ticket
updated_at
```

アプリ起動時に`event_settings`を読み込み、Supabaseに保存された参加人数を優先します。

### 参加人数に連動する機能

- 全札数
- 回答済み数
- 未回答数
- 未回答札番号
- 札番号入力欄の上限
- 固有QRの有効範囲
- ランキングの集計対象
- 3種類マッチの集計対象
- 完全一致の集計対象
- 発表モードの集計対象
- 主催者番号

### 範囲外回答

参加人数を減らした際、現在の参加人数を超える札番号に回答が存在する場合は警告します。

範囲外回答は自動削除しません。

ただし、ランキング、マッチ、発表モードなどの集計対象から外します。

---

## 商品と配合の設定

基本設定は次のファイルにまとめています。

```text
src/config/eventConfig.js
```

主な設定項目は次のとおりです。

```text
eventName
totalTickets
baseAmount
totalAmount
flavorAmounts
items
```

商品データは次の形式です。

```javascript
{ id: 1, name: '商品名' }
```

データベースには商品名ではなく商品番号を保存します。

表示時に`eventConfig.js`の商品名へ変換します。

---

## 回答データの仕様

Supabaseの`answers`テーブルへ保存します。

主な列は次のとおりです。

```text
id
ticket_number
base_sake
flavor1_sake
flavor1_amount
flavor2_sake
flavor2_amount
created_at
```

### 重要な制約

- `ticket_number`は一意
- 1つの札番号につき回答は1件
- ベース、フレーバー1、フレーバー2は異なる商品
- 配合量は正の数
- 初回回答は`INSERT`
- 回答修正は`UPDATE`
- 修正しても回答件数を増やさない

---

## 集計ロジック

### 人気ベース

各回答の`base_sake`を1票として集計します。

### 人気フレーバー

各回答の`flavor1_sake`と`flavor2_sake`を合算します。

配合量に関係なく、選択された1回を1票として数えます。

同率1位の場合は、該当する商品をすべて表示します。

### 3種類マッチ

ベース、フレーバー1、フレーバー2の商品番号を並べ替え、3種類の組み合わせが同じ参加者をグループ化します。

配合量は3種類マッチの判定に含めません。

### 完全一致

商品番号と配合量の組み合わせを並べ替え、3種類と各配合量がすべて同じ参加者をグループ化します。

---

## Supabaseの構成

初期構築SQLは次のファイルです。

```text
supabase/migrations/202608280001_initial_schema.sql
```

このSQLで次を作成します。

- `answers`テーブル
- `event_settings`テーブル
- 初期参加人数30名
- テーブル権限
- RLSの有効化
- 匿名参加者用ポリシー
- ログイン済み集計者用ポリシー

### 管理者専用削除

次のテンプレートSQLを使用します。

```text
supabase/admin_delete_policy_template.sql
```

`YOUR_ADMIN_UID`をSupabase Authで作成した集計者UIDへ置き換えて実行します。

集計者ユーザーを作り直した場合はUIDが変わるため、削除ポリシーも再設定してください。

---

## Vercelの環境変数

使用する環境変数は次の2つです。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

### 必須条件

2つの値は、必ず同じSupabaseプロジェクトから取得してください。

```text
VITE_SUPABASE_URL
→ https://プロジェクトID.supabase.co
```

```text
VITE_SUPABASE_PUBLISHABLE_KEY
→ sb_publishable_で始まるキー
```

VercelのValue欄には値だけを設定します。

次のように変数名を含めてはいけません。

```text
VITE_SUPABASE_URL=https://プロジェクトID.supabase.co
```

Secret key、`sb_secret_`で始まるキー、service_roleキーはブラウザー側で使用しません。

環境変数を変更した後は、Productionを再デプロイしてください。

### 過去に発生した問題

テスト環境で、VercelのProject URLが別のSupabaseプロジェクトを指していたため、集計者ログインとデータ取得が失敗しました。

パスワードを作り直す前に、NetworkのRequest URLとSupabaseのProject URLを比較し、接続先が一致しているか確認してください。

---

## QRコードの仕様

### 固有QR

```text
https://公開URL/?ticket=札番号
```

### マスターQR

```text
https://公開URL/
```

マスターQRには札番号を含めません。

### 生成スクリプト

```text
scripts/generate-qr.mjs
```

### 検査スクリプト

```text
scripts/verify-qr.mjs
```

QR変更後は次を確認します。

- 1から参加人数まで揃っている
- 欠番がない
- 重複がない
- 印刷番号とQR内の番号が一致する
- 公開URLが正しい
- マスターQRに札番号が含まれない

---

## 実機テスト済みの内容

テスト環境で次を確認済みです。

- GitHubテンプレートから新しいGitHubページを作成
- Vercelでビルド・公開
- Supabase初期SQLの実行
- 集計者ユーザーの作成
- 管理者専用削除ポリシーの設定
- 集計者ログイン
- 参加人数を30名から20名へ変更
- 再読み込み後も20名を維持
- 札番号20が有効
- 札番号21が対象外
- 初回回答の保存
- 回答済み状態の復元
- 回答の上書き修正
- 修正後も回答件数が増えない
- 未回答札番号の集計
- 人気ベースと人気フレーバー
- 3種類マッチ
- 完全一致
- 発表モード
- 全回答削除

---

## 変更後の回帰テスト

コードや設定を変更した場合は、次を確認してください。

1. アプリが正常に表示される
2. 集計者がログインできる
3. 参加人数を保存できる
4. 再読み込み後も参加人数が維持される
5. 最後の有効な札番号が使える
6. 次の札番号が対象外になる
7. 初回回答を保存できる
8. 回答済み状態を復元できる
9. 回答を修正できる
10. 修正後も回答件数が増えない
11. 未回答札番号が正しい
12. 人気ランキングが正しい
13. 3種類マッチが正しい
14. 完全一致が正しい
15. 発表モードが動く
16. 全回答削除が集計者だけに許可される

可能であれば次も実行してください。

```bash
npm run build
```

QRを変更した場合は次も実行してください。

```bash
npm run verify:qr
```

---

## 初心者へ案内するときの原則

- 一度に複数操作を案内しない
- 現在開いているサービスと画面名を明記する
- 押すボタン名を画面表示どおりに書く
- 入力する文字列をコードブロックで示す
- 成功時の表示を説明する
- 秘密情報をチャットへ送らせない
- 画面が異なる場合は先へ進めず、スクリーンショットを確認する
- 多数の部分修正より、完成版ファイルの置き換えを優先する
- エラーコードやログを確認してから原因を判断する

---

## エラー切り分けの順番

1. エラー全文を確認する
2. GitHub、Vercel、Supabase、ブラウザーのどこで発生しているか確認する
3. Vercelの環境変数名とValueを確認する
4. Project URLとPublishable keyが同じSupabaseプロジェクトか確認する
5. Supabaseプロジェクトが停止していないか確認する
6. Supabase Authにユーザーが存在するか確認する
7. Auto confirm userの状態を確認する
8. Browser NetworkのRequest URLとResponseを確認する
9. Consoleのエラーを確認する
10. 原因を特定してから設定を変更する

パスワードの再作成やユーザー削除は、接続先が正しいことを確認した後に行ってください。

---

## セキュリティ上の注意

次をGitHub、AIとのチャット、スクリーンショットへ載せないでください。

- パスワード
- 復旧コード
- Secret key
- service_roleキー
- GitHubアクセストークン
- Vercelアクセストークン
- 管理者UID
- 個人情報を含む回答データ

提供先ごとに、GitHub、Supabase、Vercelの環境を分離してください。

このアプリは連番QRを使用する単発イベント向けの簡易方式です。

個人情報を扱う用途、正式投票、高い機密性が必要な用途へ使用する場合は、ランダムトークンや追加認証を含むセキュア方式への設計変更が必要です。
