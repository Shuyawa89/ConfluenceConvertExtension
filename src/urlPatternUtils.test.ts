import { describe, it, expect } from "vitest";
import {
    parseUrlToPattern,
    isValidPattern,
    testUrlAgainstPattern,
} from "./urlPatternUtils";

describe("parseUrlToPattern", () => {
    it("Atlassian URLを正しく変換", () => {
        expect(
            parseUrlToPattern("https://example.atlassian.net/wiki/spaces/DEV")
        ).toBe("*://*.atlassian.net/*");
    });

    it("一般的なwiki URLを正しく変換", () => {
        expect(
            parseUrlToPattern("https://confluence.example.com/wiki/display/TEAM")
        ).toBe("*://confluence.example.com/wiki/*");
    });

    it("シンプルなドメインを正しく変換", () => {
        expect(parseUrlToPattern("https://hogeoge.net")).toBe("*://hogeoge.net/*");
    });

    it("httpプレフィックスなしでも動作", () => {
        expect(parseUrlToPattern("hogeoge.net")).toBe("*://hogeoge.net/*");
    });

    it("サブパスを持つURLを正しく変換", () => {
        expect(parseUrlToPattern("https://example.com/some/path")).toBe(
            "*://example.com/*"
        );
    });

    it("wiki パスを持つサブドメインのURLを正しく変換", () => {
        expect(parseUrlToPattern("https://wiki.example.com/wiki/page")).toBe(
            "*://wiki.example.com/wiki/*"
        );
    });
});

describe("isValidPattern", () => {
    it("有効なパターンを認識", () => {
        expect(isValidPattern("*://example.com/*")).toBe(true);
        expect(isValidPattern("https://example.com/*")).toBe(true);
        expect(isValidPattern("http://example.com/path/*")).toBe(true);
    });

    it("無効なパターンを拒否", () => {
        expect(isValidPattern("example.com")).toBe(false);
        expect(isValidPattern("http://example.com")).toBe(false);
        expect(isValidPattern("://example.com/*")).toBe(false);
    });
});

describe("testUrlAgainstPattern", () => {
    it("パターンに正しくマッチ", () => {
        expect(
            testUrlAgainstPattern(
                "https://example.com/wiki/page",
                "*://example.com/wiki/*"
            )
        ).toBe(true);
    });

    it("Atlassianドメインパターンに正しくマッチ", () => {
        expect(
            testUrlAgainstPattern(
                "https://mycompany.atlassian.net/wiki/spaces/DEV",
                "*://*.atlassian.net/*"
            )
        ).toBe(true);
    });

    it("パターンに一致しないURLを正しく判定", () => {
        expect(
            testUrlAgainstPattern("https://example.com/other/page", "*://example.com/wiki/*")
        ).toBe(false);
    });

    it("ワイルドカードパスパターンに正しくマッチ", () => {
        expect(
            testUrlAgainstPattern("https://example.com/wiki/any/deep/path", "*://*/wiki/*")
        ).toBe(true);
    });

    it("httpとhttpsの両方にマッチ", () => {
        expect(
            testUrlAgainstPattern("http://example.com/page", "*://example.com/*")
        ).toBe(true);
        expect(
            testUrlAgainstPattern("https://example.com/page", "*://example.com/*")
        ).toBe(true);
    });
});
