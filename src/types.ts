// アクション名の定数定義
export const MessageActions = {
    CONVERT_TO_MARKDOWN: 'CONVERT_TO_MARKDOWN',
} as const;

// アクション名の型定義 (MessageActionsの値のユニオン型)
export type MessageActionType = typeof MessageActions[keyof typeof MessageActions];

// UIステータスの定数
export const UIStatus = {
    IDLE: 'IDLE',
    LOADING: 'LOADING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    COPIED: 'COPIED',
} as const;

// UIステータスの型定義 (UIStatusの値のユニオン型)
export type UIStatusType = typeof UIStatus[keyof typeof UIStatus];

// エラーメッセージの定数定義
export const ErrorMessages = {
    NO_ACTIVE_TAB: 'アクティブなタブが見つかりません。',
    CONNECTION_FAILED: 'ページとの通信に失敗しました。ページをリロードして再試行してください。',
    CLIPBOARD_COPY_FAILED: 'クリップボードへのコピーに失敗しました。',
    UNKNOWN_ERROR: '予期せぬエラーが発生しました。',
} as const;

// リクストメッセージの型
export interface ExtensionMessage {
    action: MessageActionType;
    payload?: unknown;
}

// レスポンスメッセージの型
export type ExtensionResponse =
    | { success: true; data: string }
    | { success: false; error: string };
