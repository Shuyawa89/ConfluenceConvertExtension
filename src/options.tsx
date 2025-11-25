import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./options.css";
import {
    getUrlPatterns,
    addUrlPattern,
    removeUrlPattern,
} from "./storage";
import { parseUrlToPattern, isValidPattern } from "./urlPatternUtils";

function OptionsPage() {
    const [patterns, setPatterns] = useState<string[]>([]);
    const [inputUrl, setInputUrl] = useState("");
    const [previewPattern, setPreviewPattern] = useState("");
    const [testUrl, setTestUrl] = useState("");
    const [matchingPatterns, setMatchingPatterns] = useState<string[]>([]);
    const [message, setMessage] = useState("");

    // 初期ロード
    useEffect(() => {
        loadPatterns();
    }, []);

    // 入力変更時にプレビュー更新
    useEffect(() => {
        if (inputUrl) {
            const pattern = parseUrlToPattern(inputUrl);
            setPreviewPattern(pattern);
        } else {
            setPreviewPattern("");
        }
    }, [inputUrl]);

    async function loadPatterns() {
        const loaded = await getUrlPatterns();
        setPatterns(loaded);
    }

    async function handleAddPattern() {
        if (!previewPattern) {
            showMessage("URLを入力してください", "error");
            return;
        }

        if (!isValidPattern(previewPattern)) {
            showMessage("無効なパターンです", "error");
            return;
        }

        if (patterns.includes(previewPattern)) {
            showMessage("このパターンは既に登録されています", "warning");
            return;
        }

        await addUrlPattern(previewPattern);
        await loadPatterns();
        setInputUrl("");
        setPreviewPattern("");
        showMessage("パターンを追加しました", "success");
    }

    async function handleRemovePattern(pattern: string) {
        if (confirm(`このパターンを削除しますか？\n${pattern}`)) {
            await removeUrlPattern(pattern);
            await loadPatterns();
            showMessage("パターンを削除しました", "success");
        }
    }

    async function handleAddCurrentPage() {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (!tabs[0]?.url) {
                showMessage("現在のページのURLを取得できませんでした", "error");
                return;
            }

            const pattern = parseUrlToPattern(tabs[0].url);

            if (!isValidPattern(pattern)) {
                showMessage("無効なURLです", "error");
                return;
            }

            if (patterns.includes(pattern)) {
                showMessage("このパターンは既に登録されています", "warning");
                return;
            }

            if (confirm(`以下のパターンを追加しますか？\n\n${pattern}`)) {
                await addUrlPattern(pattern);
                await loadPatterns();
                showMessage("パターンを追加しました", "success");
            }
        } catch (error) {
            showMessage(`エラー: ${error}`, "error");
        }
    }

    function handleTestUrl() {
        if (!testUrl) {
            setMatchingPatterns([]);
            return;
        }

        const matching = patterns.filter((pattern) => {
            const regex = new RegExp(
                "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
            );
            return regex.test(testUrl);
        });

        setMatchingPatterns(matching);
    }

    function showMessage(text: string, _type: "success" | "error" | "warning") {
        setMessage(text);
        setTimeout(() => setMessage(""), 3000);
    }

    return (
        <div className="options-container">
            <header>
                <h1>🔧 Confluence Converter - URL設定</h1>
                <p className="subtitle">
                    拡張機能を動作させるURLパターンを管理します
                </p>
            </header>

            {message && (
                <div className={`message message-${message.includes("エラー") ? "error" : "success"}`}>
                    {message}
                </div>
            )}

            <section className="card">
                <h2>📍 現在のページを追加</h2>
                <p className="description">
                    現在開いているタブのURLを自動解析して許可リストに追加します
                </p>
                <button className="btn btn-primary" onClick={handleAddCurrentPage}>
                    現在のページを追加
                </button>
            </section>

            <section className="card">
                <h2>✍️ 手動でURLを追加</h2>
                <p className="description">
                    URLまたはパターンを入力してください。自動的に適切なパターンに変換されます
                </p>
                <div className="input-group">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="例: https://hogeoge.net または https://wiki.example.com/wiki/"
                        className="input"
                        onKeyPress={(e) => e.key === "Enter" && handleAddPattern()}
                    />
                    <button className="btn btn-primary" onClick={handleAddPattern}>
                        追加
                    </button>
                </div>
                {previewPattern && (
                    <div className="preview">
                        <strong>変換後のパターン:</strong> <code>{previewPattern}</code>
                        {!isValidPattern(previewPattern) && (
                            <span className="error-text"> ⚠️ 無効なパターン</span>
                        )}
                    </div>
                )}
            </section>

            <section className="card">
                <h2>📋 登録済みパターン ({patterns.length})</h2>
                <p className="description">
                    現在登録されているURLパターンの一覧です
                </p>
                {patterns.length === 0 ? (
                    <p className="empty-state">登録されているパターンがありません</p>
                ) : (
                    <ul className="pattern-list">
                        {patterns.map((pattern, index) => (
                            <li key={index} className="pattern-item">
                                <code className="pattern-code">{pattern}</code>
                                <button
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleRemovePattern(pattern)}
                                >
                                    削除
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="card">
                <h2>🧪 URLテスト</h2>
                <p className="description">
                    任意のURLを入力して、現在のパターンでマッチするか確認できます
                </p>
                <div className="input-group">
                    <input
                        type="text"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder="例: https://example.atlassian.net/wiki/spaces/DEV"
                        className="input"
                        onKeyPress={(e) => e.key === "Enter" && handleTestUrl()}
                    />
                    <button className="btn btn-secondary" onClick={handleTestUrl}>
                        テスト
                    </button>
                </div>
                {testUrl && (
                    <div className="test-result">
                        {matchingPatterns.length > 0 ? (
                            <>
                                <p className="success-text">
                                    ✅ このURLは以下のパターンにマッチします:
                                </p>
                                <ul className="matching-list">
                                    {matchingPatterns.map((pattern, index) => (
                                        <li key={index}>
                                            <code>{pattern}</code>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="error-text">
                                ❌ このURLはどのパターンにもマッチしません
                            </p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <OptionsPage />
    </React.StrictMode>
);
