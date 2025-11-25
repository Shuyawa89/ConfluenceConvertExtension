export const DEFAULT_PATTERNS = [
    "*://*.atlassian.net/*",
] as const;

export async function getUrlPatterns(): Promise<string[]> {
    const result = await chrome.storage.sync.get(["urlPatterns"]);
    return (result.urlPatterns as string[] | undefined) || [...DEFAULT_PATTERNS];
}

export async function saveUrlPatterns(patterns: string[]): Promise<void> {
    // 重複削除
    const uniquePatterns = Array.from(new Set(patterns));
    await chrome.storage.sync.set({ urlPatterns: uniquePatterns });
}

export async function addUrlPattern(pattern: string): Promise<void> {
    const current = await getUrlPatterns();
    if (!current.includes(pattern)) {
        await saveUrlPatterns([...current, pattern]);
    }
}

export async function removeUrlPattern(pattern: string): Promise<void> {
    const current = await getUrlPatterns();
    await saveUrlPatterns(current.filter((p) => p !== pattern));
}
