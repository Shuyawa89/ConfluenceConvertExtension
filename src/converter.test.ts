// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { MarkdownConverter } from './converter';

describe('MarkdownConverter', () => {
    it('should convert complex Confluence tables to Markdown tables', () => {
        const converter = new MarkdownConverter();
        const html = `
<div style="min-height:calc(100vh - 48px - 46px - 64px - 14px)" class="_19itglyw _vchhusvi _r06hglyw _1e0cj4ch" data-vc="view-page-main-content-container" data-testid="view-page-main-content-container">
    <div class="pm-table-container with-shadow-observer" data-layout="custom" data-testid="table-container">
        <!-- Sticky Header Table (Duplicate) -->
        <div class="pm-table-sticky-wrapper" style="overflow:hidden">
            <table data-testid="renderer-table" data-number-column="false" data-table-width="760" data-layout="default" style="margin-top:0px">
                <colgroup></colgroup>
                <tbody>
                    <tr>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">テスト表</strong></p>
                            </div>
                        </th>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">カラム1</strong></p>
                            </div>
                        </th>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">カラム2</strong></p>
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Main Table -->
        <div class="pm-table-wrapper" data-number-column="false" data-layout="default">
            <table data-testid="renderer-table" data-number-column="false" data-table-width="760" data-layout="default">
                <colgroup></colgroup>
                <tbody>
                    <tr>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">テスト表</strong></p>
                                <figure class="ak-renderer-tableHeader-sorting-icon__wrapper">
                                    <div role="presentation"><div class="ak-renderer-tableHeader-sorting-icon"></div></div>
                                </figure>
                            </div>
                        </th>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">カラム1</strong></p>
                                <figure class="ak-renderer-tableHeader-sorting-icon__wrapper">
                                    <div role="presentation"><div class="ak-renderer-tableHeader-sorting-icon"></div></div>
                                </figure>
                            </div>
                        </th>
                        <th rowspan="1" colspan="1" class="ak-renderer-tableHeader-sortable-column__wrapper">
                            <div class="ak-renderer-tableHeader-sortable-column">
                                <p><strong data-renderer-mark="true">カラム2</strong></p>
                                <figure class="ak-renderer-tableHeader-sorting-icon__wrapper">
                                    <div role="presentation"><div class="ak-renderer-tableHeader-sorting-icon"></div></div>
                                </figure>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <td rowspan="1" colspan="1"><p>これなんだと思う</p><p>&nbsp;</p></td>
                        <td rowspan="1" colspan="1"><p>不思議だよね。</p></td>
                        <td rowspan="1" colspan="1"><p>ほんま不思議</p></td>
                    </tr>
                    <tr>
                        <td rowspan="1" colspan="1"><p>俺は知ってるけどね。</p></td>
                        <td rowspan="1" colspan="1"><p>ほんま知ってるけどね。</p></td>
                        <td rowspan="1" colspan="1"><p>かなり知ってるけどね。</p></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
        `;

        const markdown = converter.convert(html);
        console.log(markdown);

        // Expected Markdown table structure
        // ヘッダーが1回だけ出現することを確認
        const headerRow = '| **テスト表** | **カラム1** | **カラム2** |';
        const occurrences = (markdown.match(new RegExp(headerRow.replace(/\|/g, '\\|').replace(/\*/g, '\\*'), 'g')) || []).length;
        expect(occurrences, 'ヘッダーは正確に1回だけ出現するべきです').toBe(1);

        expect(markdown).toContain(headerRow);
        expect(markdown).toContain('| --- | --- | --- |');

        // 行ごとに分割して確認することで、改行コードの問題を回避
        const lines = markdown.split('\n');
        const row1 = lines.find(line => line.includes('これなんだと思う'));
        const row2 = lines.find(line => line.includes('俺は知ってるけどね'));

        expect(row1).toBeDefined();
        expect(row2).toBeDefined();
        expect(row1).toContain('<br>');
        expect(row2).toContain('俺は知ってるけどね');
    });

    describe('convertFromElement', () => {
        it('should convert DOM element to markdown', () => {
            const converter = new MarkdownConverter();
            const div = document.createElement('div');
            div.innerHTML = '<p><strong>Bold text</strong></p><p>Normal text</p>';

            const markdown = converter.convertFromElement(div);
            expect(markdown).toContain('**Bold text**');
            expect(markdown).toContain('Normal text');
        });

        it('should produce same result as convert() for same HTML', () => {
            const converter = new MarkdownConverter();
            const html = '<h1>Title</h1><p>Paragraph with <em>emphasis</em></p>';

            const div = document.createElement('div');
            div.innerHTML = html;

            const fromString = converter.convert(html);
            const fromElement = converter.convertFromElement(div);

            expect(fromElement).toBe(fromString);
        });

        it('should handle table elements correctly', () => {
            const converter = new MarkdownConverter();
            const div = document.createElement('div');
            div.innerHTML = `
                <table>
                    <thead>
                        <tr><th>Header 1</th><th>Header 2</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Cell 1</td><td>Cell 2</td></tr>
                    </tbody>
                </table>
            `;

            const markdown = converter.convertFromElement(div);
            expect(markdown).toContain('| Header 1 | Header 2 |');
            expect(markdown).toContain('| --- | --- |');
            expect(markdown).toContain('| Cell 1 | Cell 2 |');
        });

        it('should handle selection-like fragments', () => {
            const converter = new MarkdownConverter();

            // 実際の選択範囲のシミュレーション
            const div = document.createElement('div');
            const p1 = document.createElement('p');
            p1.textContent = 'First paragraph';
            const p2 = document.createElement('p');
            p2.innerHTML = '<strong>Second</strong> paragraph';

            div.appendChild(p1);
            div.appendChild(p2);

            const markdown = converter.convertFromElement(div);
            expect(markdown).toContain('First paragraph');
            expect(markdown).toContain('**Second** paragraph');
        });
    });
});
