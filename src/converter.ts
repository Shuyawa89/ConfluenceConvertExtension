import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * HTMLをMarkdownに変換するサービス
 */
export class MarkdownConverter {
    private turndownService: TurndownService;

    constructor() {
        this.turndownService = new TurndownService({
            headingStyle: 'atx',    // # 形式の見出し
            codeBlockStyle: 'fenced', // ``` 形式のコードブロック
            emDelimiter: '*',        // * 強調
        });

        // GitHub Flavored Markdown (GFM) を有効にする
        this.turndownService.use(gfm);

        // 画像処理のカスタムルールを追加
        this.turndownService.addRule('images', {
            filter: 'img',
            replacement: (content, node) => {
                const img = node as HTMLImageElement;
                const src = this.extractImageSrc(img);
                const alt = img.alt || '';

                // Markdownの画像表記で返す
                return `![${alt}](${src})`;
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
        return this.turndownService.turndown(html);
    }
}
