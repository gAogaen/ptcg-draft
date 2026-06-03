# ドラフト指名結果メーカー 修正版

GitHub Pages にそのままアップロードして使える、格ゲー・eスポーツ大会向けドラフト結果発表サイトです。

## 修正内容

前回版で表示不具合の原因になりやすかった箇所を修正しています。

- `structuredClone` を使わない実装に変更
- CSS の `color-mix()` を使わない実装に変更
- 画像パスを `./assets/...` に統一
- 初期表示・サンプルから特定大会名の文字を削除
- PNG保存ライブラリが読み込めない場合のエラー表示を追加
- GitHub Pages 向けに相対パスを整理

## ファイル構成

```text
index.html
style.css
script.js
README.md
sample-data.json
assets/
  background.webp
  noise.png
  slash.svg
```

## GitHub Pages での使い方

1. ZIPを解凍
2. 中身をリポジトリ直下へアップロード
3. Settings → Pages
4. Branch を `main` / root に設定
5. 表示されたURLへアクセス

## 注意

PNG保存には `html2canvas` をCDNから読み込んでいます。  
社内ネットワークや広告ブロック環境では、表示はできてもPNG保存だけ失敗する場合があります。
