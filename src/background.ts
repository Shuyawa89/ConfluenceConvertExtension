import { MessageActions, ErrorMessages } from './types';
import type { ExtensionResponse } from './types';

console.log('Confluence to Markdown: Background script loaded');

// 拡張機能がインストールされたときにコンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
    // 選択範囲をMarkdownに変換してクリップボードにコピー
    chrome.contextMenus.create({
        id: 'convertAndCopy',
        title: '選択範囲をMarkdownに変換してコピー',
        contexts: ['selection']
    });

    // 選択範囲をMarkdownに変換してポップアップで表示
    chrome.contextMenus.create({
        id: 'convertAndShow',
        title: '選択範囲をMarkdownに変換して表示',
        contexts: ['selection']
    });

    console.log('Context menus created');
});

// コンテキストメニューのクリックイベントをハンドリング
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) {
        console.error(ErrorMessages.NO_ACTIVE_TAB);
        return;
    }

    try {
        // コンテンツスクリプトに選択範囲の変換を要求
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: MessageActions.CONVERT_SELECTION_TO_MARKDOWN
        }) as ExtensionResponse;

        if (!response.success) {
            console.error('Conversion failed:', response.error);
            return;
        }

        const markdown = response.data;

        // メニュー項目に応じて処理を分岐
        if (info.menuItemId === 'convertAndCopy') {
            // クリップボードにコピー
            await copyToClipboard(markdown);
        } else if (info.menuItemId === 'convertAndShow') {
            // ポップアップで表示するためにストレージに保存
            await chrome.storage.local.set({ selectionMarkdown: markdown });
            // ポップアップを開く
            await chrome.action.openPopup();
        }
    } catch (error) {
        console.error('Error handling context menu click:', error);
        // ユーザーにエラーを通知
        await showErrorNotification(
            error instanceof Error ? error.message : ErrorMessages.UNNOWN_ERROR
        );
    }
});

/**
 * クリップボードにテキストをコピーする
 */
async function copyToClipboard(text: string): Promise<void> {
    try {
        // Service Workerではnavigator.clipboardが使えないため、
        // コンテンツスクリプトにコピーを依頼する
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error(ErrorMessages.NO_ACTIVE_TAB);
        }

        await chrome.tabs.sendMessage(tab.id, {
            action: MessageActions.COPY_TO_CLIPBOARD,
            payload: text
        });

        console.log('Copied to clipboard successfully');
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        await showErrorNotification(ErrorMessages.COPY_FAILED);
        throw error;
    }
}

/**
 * エラー通知を表示する
 */
async function showErrorNotification(message: string): Promise<void> {
    try {
        // Chrome通知APIを使用してエラーを表示
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Confluence to Markdown',
            message: message,
            priority: 2
        });
    } catch (notificationError) {
        // 通知の作成に失敗した場合はconsole.errorのみ
        console.error('Failed to show notification:', notificationError);
    }
}
