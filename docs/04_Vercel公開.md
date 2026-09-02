# Vercelでアプリを公開する

Vercelは、GitHubに保存したアプリをインターネット上へ公開するサービスです。

このガイドでは、GitHubで作成した自分専用のアプリをVercelへ取り込み、Supabaseへ接続する方法を説明します。

---

## 事前に用意するもの

次の作業が完了していることを確認してください。

- GitHubに自分専用のアプリ保管ページを作成した
- Supabaseに自分専用のプロジェクトを作成した
- Supabaseで初期設定SQLを実行した
- Vercelアカウントを作成した

---

## VercelへGitHubのアプリを取り込む

Vercelの管理画面を開きます。

https://vercel.com/dashboard

次の順に進んでください。

```text
Add New
→ Project
```

GitHubのアプリ一覧から、自分専用に作成したアプリ名を探します。

対象のアプリ名の右側にある、次のボタンを押します。

```text
Import
```

### GitHubのアプリが表示されない場合

次を押してください。

```text
Adjust GitHub App Permissions
```

GitHubの権限設定画面で、Vercelに公開したいアプリを選択し、保存します。

提供元のテンプレートではなく、自分専用に作成したGitHubのアプリを選んでください。

---

## 公開前の基本設定

Vercelの設定画面で、次を確認してください。

```text
Framework Preset：Vite
Root Directory：./
```

通常は自動で設定されます。

異なる値になっている場合は、AIへ画面のスクリーンショットを送り、設定内容を確認してください。

---

## Supabaseの接続情報を確認する

Supabaseで、自分専用に作成したプロジェクトを開きます。

画面上部の次のボタンを押してください。

```text
Connect
```

表示設定は次を選びます。

```text
Framework：React
Variant：Vite
```

画面に次の2項目が表示されます。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

次の2つは、必ず同じSupabaseプロジェクトからコピーしてください。

---

## Vercelへ環境変数を登録する

Vercelの公開設定画面で、次の2つをProductionへ登録します。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

### 1つ目：VITE_SUPABASE_URL

Key欄へ次を入力します。

```text
VITE_SUPABASE_URL
```

Value欄へ、SupabaseのProject URLだけを貼り付けます。

```text
https://プロジェクトID.supabase.co
```

次のように、項目名とイコール記号を含めないでください。

```text
VITE_SUPABASE_URL=https://プロジェクトID.supabase.co
```

引用符、空白、改行も含めないでください。

### 2つ目：VITE_SUPABASE_PUBLISHABLE_KEY

Key欄へ次を入力します。

```text
VITE_SUPABASE_PUBLISHABLE_KEY
```

Value欄へ、SupabaseのPublishable keyだけを貼り付けます。

```text
sb_publishable_...
```

以下は使用しないでください。

- Secret key
- `sb_secret_`で始まるキー
- service_roleキー

### とても重要な注意

Project URLとPublishable keyは、必ず同じSupabaseプロジェクトから取得してください。

別のプロジェクトのURLとキーが混ざると、次の問題が発生します。

- 集計者がログインできない
- 回答を保存できない
- 参加人数を取得できない
- 画面にデータベース接続エラーが出る

環境変数を登録するときは、Supabaseの画面上部に表示されるプロジェクト名が、自分が公開するアプリ用のプロジェクトになっていることを確認してください。

---

## Vercelの現在の画面で環境変数を追加する場所

Vercelへアプリを初めて取り込む場合は、公開前の画面にある次の項目から追加できます。

```text
Environment Variables
```

すでに公開済みのアプリへ追加・修正する場合は、次の順に進みます。

```text
Vercel Dashboard
→ 対象のアプリ
→ Settings
→ Environments
→ Production
→ Environment Variables
```

環境変数の右端にある`…`から、編集できます。

```text
…
→ Edit
```

---

## 最初の公開を実行する

環境変数の登録が完了したら、次のボタンを押します。

```text
Deploy
```

公開処理が完了すると、次のような表示になります。

```text
Ready
```

または、次の表示が出る場合があります。

```text
Congratulations!
```

公開URLは、次のような形式です。

```text
https://アプリ名.vercel.app/
```

このURLは、参加者用QRコードの作成時にも使用します。

---

## 環境変数を変更した場合

環境変数を保存しただけでは、すでに公開されているアプリへ変更が反映されません。

次の操作が必要です。

```text
Redeploy
```

再公開するときは、次を確認してください。

```text
Environment：Production
Use existing Build Cache：オフを推奨
```

再公開後、状態が`Ready`になるまで待ってください。

その後、公開アプリを再読み込みします。

Windowsで古い表示が残る場合は、次を押してください。

```text
Ctrl + Shift + R
```

---

## 公開後に確認すること

公開URLを開き、次を確認してください。

- アプリの画面が表示される
- イベント名が正しい
- 商品名が正しい
- 参加者と集計者の切り替えが表示される
- 集計者がログインできる
- 今回の参加人数を保存できる
- 回答を保存できる

Supabaseの環境変数を設定していない状態でも画面が表示される場合がありますが、回答保存や集計者ログインは動作しません。

画面表示だけで導入完了と判断せず、必ずログインと回答保存まで確認してください。

---

## アプリが真っ白になった場合

ブラウザーで`F12`を押し、`Console`を確認してください。

次のようなエラーが表示される場合があります。

```text
Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL
```

この場合は、Vercelの`VITE_SUPABASE_URL`を確認します。

Value欄へ入力するのは、次のURL部分だけです。

```text
https://プロジェクトID.supabase.co
```

次は含めません。

- `VITE_SUPABASE_URL=`
- 引用符
- 空白
- 改行
- Markdownの記号

修正後はProductionを再公開してください。

---

## 集計者がログインできない場合

最初に、次を確認してください。

1. Supabaseに集計者ユーザーが存在する
2. メールアドレスとパスワードが正しい
3. ユーザー作成時にAuto confirm userを有効にした
4. Supabaseプロジェクトが停止していない
5. Vercelの環境変数を変更後に再公開した

それでもログインできない場合は、接続先を確認します。

### Supabase側で確認するURL

Supabaseの`Connect`画面に表示される次の値を確認します。

```text
VITE_SUPABASE_URL=https://プロジェクトID.supabase.co
```

### アプリ側で確認するURL

公開アプリを開き、次の順に進みます。

```text
F12
→ Network
→ ログインする
→ token?grant_type=password
→ Headers
→ Request URL
```

Request URLは次の形式です。

```text
https://プロジェクトID.supabase.co/auth/v1/token?grant_type=password
```

比較するのは、`https://`から`.supabase.co`までです。

```text
https://プロジェクトID.supabase.co
```

Supabase側とアプリ側のプロジェクトIDが異なる場合は、Vercelの`VITE_SUPABASE_URL`が別のSupabaseプロジェクトを指しています。

正しいProject URLへ修正し、Publishable keyも同じSupabaseプロジェクトからコピーし直してください。

パスワードを作り直す前に、接続先が一致していることを確認してください。

---

## 通信エラーが表示される場合

ブラウザーのConsoleやNetworkに、次のエラーが表示される場合があります。

```text
ERR_TUNNEL_CONNECTION_FAILED
```

この場合は、Supabaseがパスワードを拒否したとは限りません。

会社ネットワーク、プロキシ、セキュリティ製品などにより、Supabaseへの通信が完了していない可能性があります。

次を確認してください。

- 別のブラウザーで試す
- スマートフォンのモバイル通信で試す
- SupabaseのProject URLを直接開けるか確認する
- NetworkのRequest URLが正しいか確認する
- SupabaseのAuthログにログイン要求が記録されているか確認する

通信エラーが出ている場合は、パスワードやユーザーを繰り返し作り直さないでください。

---

## 秘密情報の注意

次の情報は、GitHub、AIとのチャット、スクリーンショットへ載せないでください。

- パスワード
- Vercelの復旧コード
- Secret key
- service_roleキー
- GitHubアクセストークン
- Vercelアクセストークン
- 管理者UID

Publishable keyはブラウザー用ですが、スクリーンショットでは隠すことを推奨します。

---

## Vercel公開の完了チェック

- [ ] GitHubの自分専用アプリをVercelへ取り込んだ
- [ ] Framework PresetがViteになっている
- [ ] Root Directoryが`./`になっている
- [ ] `VITE_SUPABASE_URL`を登録した
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`を登録した
- [ ] 2つの値を同じSupabaseプロジェクトから取得した
- [ ] Secret keyやservice_roleキーを使用していない
- [ ] Productionへ公開した
- [ ] Vercelの状態がReadyになった
- [ ] 公開URLを確認した
- [ ] 集計者がログインできた
- [ ] 参加人数を保存できた
- [ ] 回答を保存できた

すべて確認できたら、Vercelでの公開設定は完了です。
