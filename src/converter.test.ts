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
        if (occurrences !== 1) {
            throw new Error(`Expected header to appear exactly once, but found ${occurrences} times.\nMarkdown:\n${markdown}`);
        }

        expect(markdown).toContain(headerRow);
        expect(markdown).toContain('| --- | --- | --- |');
        expect(markdown).toContain('| これなんだと思う<br>\u00A0 | 不思議だよね。 | ほんま不思議 |');
        expect(markdown).toContain('| 俺は知ってるけどね。 | ほんま知ってるけどね。 | かなり知ってるけどね。 |');
    });
});
