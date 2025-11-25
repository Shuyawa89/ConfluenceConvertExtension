import { MarkdownConverter } from "./converter";
import { MessageActions } from "./types";
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
        sendResponse({ success: false, error: (error as Error).message });
    }
}
