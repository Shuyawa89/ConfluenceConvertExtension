# Confluence to Markdown

ConfluenceページをMarkdown形式に変換するChrome拡張機能です。

## 機能

- Confluenceページ全体をMarkdownに変換
- 選択した範囲のみをMarkdownに変換
- 変換結果をクリップボードにコピー

## 開発環境のセットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm run dev
```

開発時は `chrome://extensions/` で「パッケージ化されていない拡張機能を読み込む」から `dist` ディレクトリを選択してください。

## 配布用パッケージの作成

拡張機能を他の人と共有する場合は、以下の手順でZIPファイルを作成します：

```bash
# ビルド & ZIP作成
pnpm run package
```

このコマンドは以下を実行します：
1. プロジェクトをビルド (`pnpm run build`)
2. `dist` ディレクトリの内容を `confluence-md-extension.zip` として圧縮

作成された `confluence-md-extension.zip` を共有してください。

## インストール方法（受け取った人向け）

1. 受け取った `confluence-md-extension.zip` を解凍します
2. Chromeブラウザを開き、`chrome://extensions/` にアクセスします
3. 右上の「デベロッパーモード」をオンにします
4. 「パッケージ化されていない拡張機能を読み込む」をクリックします
5. 解凍したディレクトリを選択します
6. 拡張機能がインストールされ、使用可能になります

## 使い方

1. Confluenceページを開きます
2. 拡張機能アイコンをクリックします
3. 以下のいずれかを選択します：
   - 「Convert Entire Page」: ページ全体を変換
   - 「Convert Selected Area」: 選択範囲のみを変換
4. 変換されたMarkdownが自動的にクリップボードにコピーされます

## 技術スタック

- React + TypeScript
- Vite
- @crxjs/vite-plugin (Chrome拡張機能開発用)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
