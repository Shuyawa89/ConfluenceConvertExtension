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
        const cleanHtml = this.preProcessHtml(html);
        return this.turndownService.turndown(cleanHtml);
    }

    /**
     * Turndownで処理しやすいようにHTMLを前処理する
     */
    private preProcessHtml(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // スティッキーヘッダー用のテーブル（重複）を削除する
        const stickyWrappers = doc.querySelectorAll('.pm-table-sticky-wrapper');
        stickyWrappers.forEach(wrapper => wrapper.remove());

        // テーブルの正規化
        const tables = doc.querySelectorAll('table');
        tables.forEach(table => {
            // 1. theadがない場合、tbodyの最初の行がthのみならtheadに移動する
            if (!table.querySelector('thead')) {
                const tbody = table.querySelector('tbody');
                if (tbody && tbody.rows.length > 0) {
                    const firstRow = tbody.rows[0];
                    const allCellsAreHeaders = Array.from(firstRow.cells).every(cell => cell.tagName === 'TH');

                    if (allCellsAreHeaders) {
                        const thead = doc.createElement('thead');
                        thead.appendChild(firstRow);
                        table.insertBefore(thead, tbody);
                    }
                }
            }

            // 2. セル内の不要な要素を削除・展開する
            const cells = table.querySelectorAll('th, td');
            cells.forEach(cell => {
                // div.ak-renderer-tableHeader-sortable-column を展開
                const sortableDivs = cell.querySelectorAll('.ak-renderer-tableHeader-sortable-column');
                sortableDivs.forEach(div => {
                    const parent = div.parentNode;
                    if (parent) {
                        while (div.firstChild) {
                            parent.insertBefore(div.firstChild, div);
                        }
                        parent.removeChild(div);
                    }
                });

                // figure.ak-renderer-tableHeader-sorting-icon__wrapper を削除
                const sortingIcons = cell.querySelectorAll('.ak-renderer-tableHeader-sorting-icon__wrapper');
                sortingIcons.forEach(icon => icon.remove());

                // pタグを改行に変換
                const paragraphs = cell.querySelectorAll('p');
                paragraphs.forEach((p, index) => {
                    // 最後のpタグ以外にはbrを追加（またはpタグの後にbrを追加してpタグを展開）
                    // ここではシンプルに pタグの中身 + br に置き換える
                    const br = doc.createElement('br');
                    const parent = p.parentNode;
                    if (parent) {
                        while (p.firstChild) {
                            parent.insertBefore(p.firstChild, p);
                        }
                        if (index < paragraphs.length - 1) {
                            parent.insertBefore(br, p);
                        }
                        parent.removeChild(p);
                    }
                });
            });
        });

        return doc.body.innerHTML;
    }
}
