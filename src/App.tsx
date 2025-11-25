import { useState, useEffect } from 'react'
import './App.css'
import { MessageActions, UIStatus, ErrorMessages } from './types'
import type { UIStatusType, ExtensionResponse, ExtensionMessage } from './types';
import { getUrlPatterns } from './storage'
import { testUrlAgainstPattern } from './urlPatternUtils'
import { ERROR_MESSAGES } from './constants'

function App() {
  const [markdown, setMarkdown] = useState<string>('');
  const [status, setStatus] = useState<UIStatusType>(UIStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    convertCurrentPage();
  }, []);

  const isConfluencePage = async (url: string | undefined): Promise<boolean> => {
    if (!url) return false;

    try {
      const patterns = await getUrlPatterns();
      return patterns.some(pattern => testUrlAgainstPattern(url, pattern));
    } catch (error) {
      console.error('Failed to load URL patterns:', error);
      // フォールバック: デフォルトのチェック
      return url.includes('.atlassian.net') || url.includes('/wiki/');
    }
  };

  const convertCurrentPage = async () => {
    setStatus(UIStatus.LOADING);
    setError(null);
    setMarkdown('');

    try {
      // アクティブなタブを取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error(ErrorMessages.NO_ACTIVE_TAB);
      }

      // Confluenceページかどうかをチェック
      if (!(await isConfluencePage(tab.url))) {
        throw new Error(ERROR_MESSAGES.NOT_CONFLUENCE_PAGE);
      }

      // Content Script にメッセージを送信
      const response = await sendMessageToTab(
        tab.id,
        { action: MessageActions.CONVERT_TO_MARKDOWN }
      );

      if (response.success) {
        setMarkdown(response.data);
        setStatus(UIStatus.SUCCESS);
      } else {
        // Content Script側でエラーが発生した場合
        setError(response.error);
        setStatus(UIStatus.ERROR);
      }
    } catch (error) {
      // 通信エラーなどのシステムエラー
      const errorMessage = error instanceof Error ? error.message : ErrorMessages.UNNOWN_ERROR;
      setError(errorMessage);
      setStatus(UIStatus.ERROR);
    }
  }

  // Chrome APIのPromiseラッパー
  const sendMessageToTab = async (tabId: number, message: ExtensionMessage): Promise<ExtensionResponse> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          // Content Scriptがロードされていない時など
          reject(new Error(ErrorMessages.CONNECTION_FAILED))
        } else if (response) {
          resolve(response as ExtensionResponse);
        } else {
          reject(new Error(ErrorMessages.UNNOWN_ERROR));
        }
      });
    });
  };

  const handleDownload = (): void => {
    if (!markdown) {
      return;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    a.download = 'confluence-page.md'; // TODO: ページタイトルを反映させる
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const getStatusClass = (status: UIStatusType): string => {
    return `status ${status.toLowerCase()}`;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Confluence to Markdown</h1>
        <span className={getStatusClass(status)}>{status}</span>
      </div>

      {status === UIStatus.ERROR && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={convertCurrentPage}>Retry</button>
        </div>
      )}

      <textarea
        className="preview-area"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder={status === UIStatus.LOADING ? 'Loading...' : 'Markdown preview'}
        disabled={status === UIStatus.LOADING}
      />

      <div className="actions">
        <button onClick={handleDownload} disabled={status !== UIStatus.SUCCESS || !markdown}>
          Download Markdown
        </button>
      </div>
    </div>
  )
}

export default App
