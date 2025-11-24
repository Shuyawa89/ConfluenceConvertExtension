import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import {
    HtmlPreprocessor,
    RemoveStickyHeaderTableFilter,
    NormalizeTableStructureFilter,
    CleanTableCellsFilter
} from './html-filters';

/**
 * HTMLをMarkdownに変換するサービス
 */
export class MarkdownConverter {
    private turndownService: TurndownService;
    private preprocessor: HtmlPreprocessor;

    constructor() {
        this.turndownService = new TurndownService({
            headingStyle: 'atx',    // # 形式の見出し
            codeBlockStyle: 'fenced', // ``` 形式のコードブロック
            emDelimiter: '*',        // * 強調
        });

        // GitHub Flavored Markdown (GFM) を有効にする
        this.turndownService.use(gfm);

        // HTML前処理のセットアップ
        this.preprocessor = new HtmlPreprocessor([
            new RemoveStickyHeaderTableFilter(),
            new NormalizeTableStructureFilter(),
            new CleanTableCellsFilter()
        ]);

        // 画像処理のカスタムルールを追加
        this.turndownService.addRule('images', {
            filter: 'img',
            replacement: (_content, node) => {
                const img = node as HTMLImageElement;
                const src = this.extractImageSrc(img);
                const alt = img.alt || '';

                // Markdownの画像表記で返す
                return `![${alt}](${src})`;
            }
        });

        // テーブル内のbrタグはHTMLのまま出力する（Markdownの改行だとテーブルが壊れるため）
        this.turndownService.addRule('tableBr', {
            filter: (node) => {
                return node.nodeName === 'BR' && (node.closest('table') !== null);
            },
            replacement: () => {
                return '<br>';
            }
        });
    }

    /**
     * 画像のソースURLを抽出するメソッド
     * 将来的にbase64埋め込みなどに対応するため、独立して分離しておく
     */
    private extractImageSrc(img: HTMLImageElement): string {
        return img.src;
    }

    /**
     * HTMLをMarkdownに変換する
     */
    public convert(html: string): string {
        const cleanHtml = this.preprocessor.process(html);
        return this.turndownService.turndown(cleanHtml);
    }

    /**
     * DOM要素をMarkdownに変換する
     * 選択範囲の変換などに使用される
     */
    public convertFromElement(element: Element): string {
        // 元の要素を変更しないようにクローンを作成
        const clonedElement = element.cloneNode(true) as Element;

        // 新しいDocumentを作成してクローンを追加
        const doc = document.implementation.createHTMLDocument('');
        doc.body.appendChild(clonedElement);

        // HTMLフィルターを適用
        this.preprocessor.processDocument(doc);

        // Markdownに変換
        return this.turndownService.turndown(doc.body.innerHTML);
    }
}
