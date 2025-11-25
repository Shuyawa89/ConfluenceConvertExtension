/**
 * URLを解析して適切なマッチングパターンに変換
 * 例:
 * - https://hogeoge.net → *://hogeoge.net/*
 * - https://confluence.example.com/wiki/spaces/DEV → *://confluence.example.com/wiki/*
 * - https://example.atlassian.net/wiki/spaces/TEAM/pages/123 → *://*.atlassian.net/*
 */
export function parseUrlToPattern(input: string): string {
    try {
        // http/https プレフィックスがない場合は追加
        const urlString = input.startsWith("http") ? input : `https://${input}`;
        const url = new URL(urlString);
        const hostname = url.hostname;

        // Atlassianドメインの場合
        if (hostname.endsWith(".atlassian.net")) {
            return "*://*.atlassian.net/*";
        }

        // /wiki/ を含むパスの場合
        if (url.pathname.includes("/wiki/")) {
            return `*://${hostname}/wiki/*`;
        }

        // それ以外はホスト全体を許可
        return `*://${hostname}/*`;
    } catch (error) {
        // パースエラーの場合はそのまま返す
        return input;
    }
}

/**
 * パターンが有効かチェック
 */
export function isValidPattern(pattern: string): boolean {
    return /^(\*|https?):\/\/[^/]+\/.*$/.test(pattern);
}

/**
 * URLがパターンにマッチするかテスト
 */
export function testUrlAgainstPattern(url: string, pattern: string): boolean {
    const regex = new RegExp(
        "^" +
        pattern
            .replace(/\./g, "\\.")
            .replace(/\*/g, ".*") +
        "$"
    );
    return regex.test(url);
}
