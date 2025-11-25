import { MarkdownConverter } from "./converter";
import { MessageActions, ErrorMessages } from "./types";
import type { ExtensionMessage, ExtensionResponse } from "./types";

console.log("Confluence to Markdown: Content script loaded");

chrome.runtime.onMessage.addListener((
    request: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
) => {
    if (!isValidMessage(request)) {
        return false;
    }

    if (request.action === MessageActions.CONVERT_TO_MARKDOWN) {
        handleConversion(sendResponse);
        return true;
    }

    if (request.action === MessageActions.CONVERT_SELECTION_TO_MARKDOWN) {
        handleSelectionConversion(sendResponse);
        return true;
    }

    if (request.action === MessageActions.COPY_TO_CLIPBOARD) {
        handleClipboardCopy(request.payload as string, sendResponse);
        return true;
    }

    return false;
});

/**
 * メッセージがExtensionMessageであるかを検証する
 */
function isValidMessage(request: unknown): request is ExtensionMessage {
    return (
        typeof request === 'object' &&
        request !== null &&
        'action' in request &&
        typeof (request as ExtensionMessage).action === 'string'
    );
}

/**
 * Markdown変換を実行して、レスポンスを返す
 */
function handleConversion(sendResponse: (response: ExtensionResponse) => void): void {
    try {
        // Confluenceのメインコンテンツを取得
        const mainContentElement = document.querySelector('#main-content') || document.querySelector('.wiki-content') || document.body;

        const converter = new MarkdownConverter();
        const markdown = converter.convert(mainContentElement.innerHTML);

        sendResponse({ success: true, data: markdown });
    } catch (error) {
        console.error('Error converting to Markdown:', error);
        const errorMessage = error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR;
        sendResponse({ success: false, error: errorMessage });
    }
}

/**
 * 選択範囲をMarkdownに変換する
 */
function handleSelectionConversion(sendResponse: (response: ExtensionResponse) => void): void {
    try {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
            sendResponse({ success: false, error: ErrorMessages.NO_SELECTION });
            return;
        }

        // 選択範囲のDOM要素を取得
        const range = selection.getRangeAt(0);
        const container = range.cloneContents();

        // コンテナをdiv要素に変換
        const div = document.createElement('div');
        div.appendChild(container);

        const converter = new MarkdownConverter();
        const markdown = converter.convertFromElement(div);

        sendResponse({ success: true, data: markdown });
    } catch (error) {
        console.error('Error converting selection to Markdown:', error);
        const errorMessage = error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR;
        sendResponse({ success: false, error: errorMessage });
    }
}

/**
 * クリップボードにテキストをコピーする
 */
async function handleClipboardCopy(text: string, sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        sendResponse({ success: true, data: 'Copied to clipboard' });
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        sendResponse({ success: false, error: ErrorMessages.COPY_FAILED });
    }
}

