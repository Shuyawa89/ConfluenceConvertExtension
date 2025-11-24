// アクション名の定数定義
export const MessageActions = {
    CONVERT_TO_MARKDOWN: 'CONVERT_TO_MARKDOWN',
} as const;

// アクション名の型定義 (MessageActionsの値のユニオン型)
export type MessageAction = typeof MessageActions[keyof typeof MessageActions];

// リクストメッセージの型
export interface ExtensionMessage {
    action: MessageAction;
    payload?: unknown;
}

// レスポンスメッセージの型
export type ExtensionResponse =
    | { success: true; data: string }
    | { success: false; error: string };
