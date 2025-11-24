/**
 * HTMLドキュメントを加工するフィルターのインターフェース
 */
export interface HtmlFilter {
    filter(doc: Document): void;
}

/**
 * スティッキーヘッダー用の重複テーブルを削除するフィルター
 */
export class RemoveStickyHeaderTableFilter implements HtmlFilter {
    filter(doc: Document): void {
        const stickyWrappers = doc.querySelectorAll('.pm-table-sticky-wrapper');
        stickyWrappers.forEach(wrapper => wrapper.remove());
    }
}

/**
 * テーブル構造を正規化するフィルター
 * (theadがない場合にtbodyから生成するなど)
 */
export class NormalizeTableStructureFilter implements HtmlFilter {
    filter(doc: Document): void {
        const tables = doc.querySelectorAll('table');
        tables.forEach(table => {
            // theadがない場合、tbodyの最初の行がthのみならtheadに移動する
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
        });
    }
}

/**
 * テーブルセルの内容をクリーンアップするフィルター
 * (不要なdiv/figureの削除、pタグの改行変換など)
 */
export class CleanTableCellsFilter implements HtmlFilter {
    filter(doc: Document): void {
        const tables = doc.querySelectorAll('table');
        tables.forEach(table => {
            const cells = table.querySelectorAll('th, td');
            cells.forEach(cell => {
                this.unwrapSortableDivs(cell);
                this.removeSortingIcons(cell);
                this.convertParagraphsToBr(cell, doc);
            });
        });
    }

    private unwrapSortableDivs(cell: Element): void {
        const sortableDivs = cell.querySelectorAll('.ak-renderer-tableHeader-sortable-column');
        sortableDivs.forEach(div => {
            div.replaceWith(...div.childNodes);
        });
    }

    private removeSortingIcons(cell: Element): void {
        const sortingIcons = cell.querySelectorAll('.ak-renderer-tableHeader-sorting-icon__wrapper');
        sortingIcons.forEach(icon => icon.remove());
    }

    private convertParagraphsToBr(cell: Element, doc: Document): void {
        const paragraphs = cell.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
            const children = Array.from(p.childNodes);
            if (index < paragraphs.length - 1) {
                children.push(doc.createElement('br'));
            }
            p.replaceWith(...children);
        });
    }
}

/**
 * HTML前処理を実行するプロセッサ
 */
export class HtmlPreprocessor {
    private filters: HtmlFilter[];

    constructor(filters: HtmlFilter[] = []) {
        this.filters = filters;
    }

    addFilter(filter: HtmlFilter): void {
        this.filters.push(filter);
    }

    process(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        this.filters.forEach(filter => filter.filter(doc));

        return doc.body.innerHTML;
    }
}
