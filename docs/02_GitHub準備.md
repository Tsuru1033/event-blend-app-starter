# GitHubで自分専用のアプリを作成する

このガイドでは、提供元のGitHubテンプレートから、自分専用のアプリ保管ページを作成します。

GitHubの画面では、このアプリ保管ページを`repository`または`リポジトリ`と表示する場合があります。

---

## 事前に確認すること

- [ ] GitHubアカウントを作成した
- [ ] GitHubのメール認証を完了した
- [ ] GitHubへログインできる
- [ ] 提供元からテンプレートのURLを受け取った

パスワード、アクセストークン、秘密情報は、AIとのチャットやスクリーンショットへ載せないでください。

---

## 1. 提供元のGitHubテンプレートを開く

提供元から案内されたGitHubのURLを開きます。

ページ上部またはファイル一覧付近に、次のボタンが表示されていることを確認してください。

```text
Use this template
```

`Use this template`が表示されない場合は、通常のGitHubページを開いているか、テンプレート設定が完了していない可能性があります。

提供元またはAIへ、現在の画面を確認してもらってください。

---

## 2. 自分専用のアプリ保管ページを作る

次の順に進みます。

```text
Use this template
→ Create a new repository
```

この操作により、提供元とは別に、自分専用のアプリ一式がGitHub上へ複製されます。

作成後のアプリは提供元から独立しています。

自分専用のアプリを変更しても、提供元のアプリには影響しません。

また、提供元のテンプレートが後から更新されても、すでに作成済みの自分専用アプリへは自動反映されません。

---

## 3. 作成画面へ入力する

### Owner

自分のGitHubユーザー名または、自分が管理するOrganizationを選択します。

初心者の方は、自分のGitHubユーザー名を選択する方法が分かりやすいです。

### Repository name

自分専用のアプリ名を入力します。

半角英数字とハイフンを使った、分かりやすい名前を推奨します。

例：

```text
my-event-blend-app
```

本番用とテスト用の両方を作る場合は、名前で区別してください。

例：

```text
my-event-blend-app
my-event-blend-app-test
```

### Description

説明欄は空欄でも問題ありません。

入力する場合の例です。

```text
イベント参加者の回答・集計・発表用アプリ
```

### Include all branches

通常はオフのままで問題ありません。

このスターターキットでは、基本的に`main`だけを使用します。

### Visibility

初心者の方は、次を推奨します。

```text
Private
```

`Private`にすると、自分が許可した人だけがGitHub上のアプリファイルを閲覧できます。

なお、GitHubを`Private`にしても、Vercelで公開したアプリのURLはインターネットから開けます。

---

## 4. 作成を実行する

入力内容を確認し、次のボタンを押します。

```text
Create repository
```

作成処理が完了すると、自分専用のGitHubページが開きます。

---

## 5. ファイルが正しく複製されたか確認する

GitHubを開いた最初のファイル一覧で、次を確認してください。

```text
docs
scripts
src
supabase

.env.example
.gitignore
AGENTS.md
AI_HANDOFF.md
AI_PROMPTS.md
README.md
START_HERE.md
index.html
package-lock.json
package.json
vite.config.js
```

フォルダーやファイルが不足している場合は、先へ進まず、提供元またはAIへ現在の画面を確認してもらってください。

---

## 6. 重要なファイルを最初に読む

自分専用のGitHubページを作成したら、次のファイルを開いてください。

```text
START_HERE.md
```

続いて、AIへ次のファイルを確認してもらってください。

- `README.md`
- `AGENTS.md`
- `AI_HANDOFF.md`
- `AI_PROMPTS.md`
- `docs/00_最初にお読みください.md`

---

## 7. GitHubでファイルを変更する基本操作

GitHub上でファイルを変更する場合は、対象ファイルを開き、鉛筆アイコンを押します。

```text
対象ファイル
→ 鉛筆アイコン
→ Edit this file
```

変更後は、次のボタンを押します。

```text
Commit changes...
```

### コミットメッセージ

変更内容が分かる短い説明を入力します。

例：

```text
イベント名と商品名を更新
```

基本的には次の設定で保存します。

```text
Commit directly to the main branch
```

コミットとは、変更内容と変更履歴をGitHubへ保存する操作です。

---

## 8. 完成版ファイルへ丸ごと置き換える方法

AIから完成版ファイルを受け取った場合は、細かく分けてコピーせず、ファイル全体を一度に置き換えます。

1. AIから完成版ファイルをダウンロードする
2. ダウンロードしたファイルをメモ帳などで開く
3. `Ctrl + A`で全文を選択する
4. `Ctrl + C`でコピーする
5. GitHubで同名ファイルの編集画面を開く
6. GitHubの編集欄で`Ctrl + A`を押す
7. 既存内容を削除する
8. `Ctrl + V`で完成版全文を貼り付ける
9. `Preview`で表示を確認する
10. `Commit changes...`で保存する

Markdownファイルでは、見出しの`#`、箇条書きの`-`、コード枠の記号を消さないでください。

---

## 9. フォルダーとファイル名を変更するときの注意

次のフォルダー名は、理由なく変更しないでください。

```text
docs
scripts
src
supabase
```

次の主要ファイル名も、理由なく変更しないでください。

```text
package.json
vite.config.js
src/App.jsx
src/config/eventConfig.js
src/lib/supabase.js
```

ファイル名や場所を変更すると、アプリの読み込みや説明書内の案内が動かなくなる可能性があります。

変更が必要な場合は、先にAIへ影響範囲を確認してください。

---

## 10. 本番用とテスト用を取り違えない

本番用とテスト用のGitHubページを作成した場合は、画面上部の名前を毎回確認してください。

例：

```text
my-event-blend-app
my-event-blend-app-test
```

テンプレート本体、テスト版、本番版はそれぞれ独立しています。

1つを変更しても、ほかのGitHubページへは自動反映されません。

AIへスクリーンショットを送る場合は、GitHubページ名が見える範囲を含めてください。

---

## 11. Vercelへ表示されない場合

Vercelで自分専用のGitHubアプリが表示されない場合は、VercelのImport画面から次を選びます。

```text
Adjust GitHub App Permissions
```

GitHubの権限設定で、Vercelに利用を許可するアプリを追加します。

既存の本番アプリを削除せず、追加したいアプリを選択して保存してください。

詳しくは次のガイドを確認してください。

```text
04_Vercel公開.md
```

---

## 12. 秘密情報を保存しない

次の情報は、GitHubのファイルへ直接書かないでください。

- パスワード
- 復旧コード
- Secret key
- service_roleキー
- GitHubアクセストークン
- Vercelアクセストークン
- 実際の環境変数
- 管理者UID
- 個人情報を含む回答データ

環境変数の見本は`.env.example`にありますが、実際の値はVercelのEnvironment Variablesへ登録します。

`.env.example`の見本を、実際の秘密情報へ書き換えてGitHubへ保存しないでください。

---

## 13. GitHubを変更しても公開アプリが変わらない場合

次を確認してください。

- 正しいGitHubページを編集した
- 変更を`main`へ保存した
- VercelがそのGitHubページと接続されている
- VercelのDeploymentが`Ready`になっている
- Productionの固定URLを開いている
- ブラウザーを再読み込みした

古い表示が残る場合は、Windowsで次を押してください。

```text
Ctrl + Shift + R
```

---

## GitHub準備の完了チェック

- [ ] 提供元のGitHubテンプレートを開いた
- [ ] `Use this template`を押した
- [ ] `Create a new repository`を選んだ
- [ ] 自分のOwnerを選んだ
- [ ] 分かりやすいアプリ名を入力した
- [ ] 公開範囲を確認した
- [ ] 自分専用のGitHubページを作成した
- [ ] `docs`、`scripts`、`src`、`supabase`がある
- [ ] `START_HERE.md`がある
- [ ] 主要ファイルが揃っている
- [ ] `START_HERE.md`を開いた
- [ ] 秘密情報をGitHubへ保存していない

すべて確認できたら、次のガイドへ進んでください。

```text
03_Supabase設定.md
```
