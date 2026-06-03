# ドラフト指名結果メーカー 修正版 v2

## 修正内容

- 5〜6チーム時に各チーム2名しか表示されない問題を修正
- 選手リストを `flex` から `grid-template-rows: repeat(6, 1fr)` に変更
- カード内の文字サイズ・余白を縮小
- 大会名を少し小さく調整
- ノイズを強めに再生成
- ノイズ画像の重ね方を調整
- GitHub Pages向けの相対パスを維持

## アップロード方法

ZIPを解凍し、以下がリポジトリ直下にある状態でアップロードしてください。

```text
index.html
style.css
script.js
README.md
sample-data.json
assets/
```

`index.html` がリポジトリ直下にある状態が安全です。
