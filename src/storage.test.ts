import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    getUrlPatterns,
    saveUrlPatterns,
    addUrlPattern,
    removeUrlPattern,
    DEFAULT_PATTERNS,
} from "./storage";

// chrome.storage.sync のモック
const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
    // ストレージをリセット
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

    // chrome.storage.sync のモック
    globalThis.chrome = {
        storage: {
            sync: {
                get: vi.fn((keys: string[]) => {
                    const result: Record<string, unknown> = {};
                    keys.forEach((key) => {
                        if (mockStorage[key] !== undefined) {
                            result[key] = mockStorage[key];
                        }
                    });
                    return Promise.resolve(result);
                }),
                set: vi.fn((items: Record<string, unknown>) => {
                    Object.assign(mockStorage, items);
                    return Promise.resolve();
                }),
            },
        },
    } as any;
});

describe("getUrlPatterns", () => {
    it("デフォルトパターンを返す（保存されていない場合）", async () => {
        const patterns = await getUrlPatterns();
        expect(patterns).toEqual([...DEFAULT_PATTERNS]);
    });

    it("保存されたパターンを返す", async () => {
        const customPatterns = ["*://example.com/*", "*://test.com/*"];
        mockStorage["urlPatterns"] = customPatterns;

        const patterns = await getUrlPatterns();
        expect(patterns).toEqual(customPatterns);
    });
});

describe("saveUrlPatterns", () => {
    it("パターンを保存", async () => {
        const patterns = ["*://example.com/*", "*://test.com/*"];
        await saveUrlPatterns(patterns);

        expect(mockStorage["urlPatterns"]).toEqual(patterns);
    });

    it("重複を削除して保存", async () => {
        const patterns = ["*://example.com/*", "*://example.com/*", "*://test.com/*"];
        await saveUrlPatterns(patterns);

        expect(mockStorage["urlPatterns"]).toEqual([
            "*://example.com/*",
            "*://test.com/*",
        ]);
    });
});

describe("addUrlPattern", () => {
    it("新しいパターンを追加", async () => {
        await addUrlPattern("*://example.com/*");

        const patterns = await getUrlPatterns();
        expect(patterns).toContain("*://example.com/*");
    });

    it("既存のパターンは追加しない", async () => {
        await addUrlPattern("*://example.com/*");
        await addUrlPattern("*://example.com/*");

        const patterns = await getUrlPatterns();
        expect(patterns.filter((p) => p === "*://example.com/*").length).toBe(1);
    });
});

describe("removeUrlPattern", () => {
    it("パターンを削除", async () => {
        await saveUrlPatterns(["*://example.com/*", "*://test.com/*"]);
        await removeUrlPattern("*://example.com/*");

        const patterns = await getUrlPatterns();
        expect(patterns).not.toContain("*://example.com/*");
        expect(patterns).toContain("*://test.com/*");
    });

    it("存在しないパターンの削除は何もしない", async () => {
        const initial = ["*://example.com/*"];
        await saveUrlPatterns(initial);
        await removeUrlPattern("*://test.com/*");

        const patterns = await getUrlPatterns();
        expect(patterns).toEqual(initial);
    });
});
