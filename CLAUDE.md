# プロジェクト概要
料理上達ロードマップWebアプリ

# 技術スタック
- HTML/CSS/JS（ファイル分割構成）
- Claude API連携あり（model: claude-sonnet-4-20250514）
- localStorageでデータ永続化

# 画面構成
1. ホーム：全体進捗バー
2. ロードマップ：5フレームワーク一覧とミッション
3. レシピ：解除済みレシピ一覧＋AI生成
4. 詳細：各レシピの工程と科学的解説

# ファイル構成と役割
- index.html：エントリーポイント
- css/style.css：全スタイル
- js/app.js：全体制御・画面遷移
- js/roadmap.js：ロードマップ機能
- js/recipe.js：レシピ表示・スタンプ機能
- js/api.js：Claude API連携・レシピ生成
- data/recipes.json：レシピデータ

# コーディング方針
- コメントは日本語でOK
- 変数名は英語
- 変更前に必ず意図を説明してから実装すること
- 一度に変更するのは一機能ずつ
- 実装前にファイル全体の構造を確認すること

# 手戻り防止ルール
- 新機能追加前に既存機能への影響を必ず確認する
- スタイルはstyle.cssに一元管理する
- localStorageのキー名は変更禁止：CULINARY_PROGRESS, CULINARY_RECIPES

# スクリプトのロード順（依存関係）
index.html でのロード順は以下に固定する。順番を変えると依存関係が壊れる。
1. js/app.js   → Storage / App を定義（他モジュールが依存）
2. js/roadmap.js → Roadmap を定義
3. js/recipe.js  → Recipe を定義（Storage / Roadmap に依存）
4. js/api.js     → Api を定義（Storage / Roadmap に依存）

# データモデル変更ルール
localStorageに保存されているデータ構造を変更する場合は必ずマイグレーション関数を書くこと。
- 変更前のデータ形式と変更後の形式を関数内にコメントで明記する
- マイグレーション関数は該当モジュールの initView または App.init で呼び出す
- 過去の変更例：ミッション進捗を boolean → number（カウント）に変更

# セキュリティルール
- Claude APIキーをコード・チャット・コミットに直接書かない
- APIキーはユーザーがUIから入力し、localStorageにのみ保存する
- 現構成はブラウザ直接呼び出し（anthropic-dangerous-direct-browser-access）のため、
  本番運用する場合はバックエンドのプロキシ経由に切り替えること
