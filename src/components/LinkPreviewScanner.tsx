import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Trash2,
  Loader2,
  AlertCircle,
  Globe,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LinkPreviewData } from '../types';
import { sound } from '../audio/soundEngine';

export const LinkPreviewScanner: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentPreview, setCurrentPreview] = useState<LinkPreviewData | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<string>('');
  const [history, setHistory] = useState<LinkPreviewData[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('last_signal_link_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (item: LinkPreviewData) => {
    try {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.url !== item.url);
        const updated = [item, ...filtered].slice(0, 8);
        localStorage.setItem('last_signal_link_history', JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore
    }
  };

  const validateUrl = (raw: string): string | null => {
    let trimmed = raw.trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      return parsed.href;
    } catch {
      return null;
    }
  };

  const handleFetchPreview = async (urlToFetch?: string) => {
    const targetRaw = urlToFetch || urlInput;
    const validUrl = validateUrl(targetRaw);

    if (!validUrl) {
      sound.playHeartbeat();
      setErrorMessage('Please enter a valid URL (e.g. https://wikipedia.org or github.com)');
      return;
    }

    sound.playClick();
    setIsLoading(true);
    setErrorMessage('');
    setCopiedUrl(false);
    setShareSuccess('');

    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(validUrl)}`);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: LinkPreviewData = await response.json();
      data.createdAt = Date.now();

      sound.playChime();
      setCurrentPreview(data);
      saveToHistory(data);
    } catch (err: unknown) {
      console.warn('API link preview error, constructing client fallback:', err);
      // Clean fallback if API fails
      try {
        const parsed = new URL(validUrl);
        const domain = parsed.hostname.replace(/^www\./, '');
        const fallback: LinkPreviewData = {
          url: validUrl,
          domain,
          title: domain.charAt(0).toUpperCase() + domain.slice(1),
          description: `Transmission destination at ${domain}. Click to visit external site safely.`,
          image: null,
          favicon: `${parsed.origin}/favicon.ico`,
          siteName: domain,
          success: false,
          createdAt: Date.now(),
        };
        sound.playChime();
        setCurrentPreview(fallback);
        saveToHistory(fallback);
      } catch {
        setErrorMessage('Unable to resolve host or parse website metadata.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      setErrorMessage('Failed to copy to clipboard.');
    }
  };

  const handleShareLink = async (item: LinkPreviewData) => {
    sound.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.url,
        });
        setShareSuccess('Link shared successfully!');
        setTimeout(() => setShareSuccess(''), 2500);
      } catch {
        // User aborted or unallowed, fallback to copy
        handleCopyLink(item.url);
      }
    } else {
      handleCopyLink(item.url);
      setShareSuccess('Link copied to clipboard!');
      setTimeout(() => setShareSuccess(''), 2500);
    }
  };

  const handleRemoveCurrent = () => {
    sound.playClick();
    setCurrentPreview(null);
    setCopiedUrl(false);
    setShareSuccess('');
  };

  const handleRemoveHistoryItem = (url: string) => {
    sound.playClick();
    setHistory((prev) => {
      const updated = prev.filter((h) => h.url !== url);
      try {
        localStorage.setItem('last_signal_link_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    if (currentPreview?.url === url) {
      setCurrentPreview(null);
    }
  };

  const handleClearHistory = () => {
    sound.playClick();
    setHistory([]);
    try {
      localStorage.removeItem('last_signal_link_history');
    } catch {
      // ignore
    }
  };

  const sampleUrls = [
    { label: 'Wikipedia: Wow! Signal', url: 'https://en.wikipedia.org/wiki/Wow!_signal' },
    { label: 'NASA Deep Space', url: 'https://www.nasa.gov' },
    { label: 'Internet Archive', url: 'https://archive.org' },
    { label: 'GitHub Repository', url: 'https://github.com' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b border-neutral-900 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <div>
              <h2 className="font-display text-xl font-bold tracking-wider text-neutral-100">
                EXTERNAL SIGNAL INTERCEPTOR // LINK PREVIEW SCANNER
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Paste any valid website URL to extract real-time Open Graph metadata, title, description, and thumbnail card.
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="rounded-lg border border-neutral-800 bg-black/90 p-5 shadow-2xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchPreview();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter or paste any website URL (e.g., https://example.com)..."
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 pl-10 pr-4 py-3 text-xs sm:text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-md text-xs sm:text-sm font-bold tracking-wide transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Signal...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Generate Preview</span>
                  </>
                )}
              </button>

              {urlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    setErrorMessage('');
                  }}
                  className="px-3 py-3 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-xs"
                  title="Clear input"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/30 p-2.5 rounded border border-red-950">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Preset Samples */}
          <div className="mt-4 pt-3 border-t border-neutral-900 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Quick Test Frequencies:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setUrlInput(s.url);
                  handleFetchPreview(s.url);
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING INDICATOR STATE */}
        {isLoading && (
          <div className="rounded-lg border border-neutral-800 bg-black/90 p-8 shadow-2xl mb-8 flex flex-col items-center justify-center text-center font-mono">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-3" />
            <div className="text-sm font-bold text-neutral-200">INTERCEPTING EXTERNAL FREQUENCY...</div>
            <div className="text-xs text-neutral-500 mt-1 max-w-sm">
              Connecting to host, parsing Open Graph tags and metadata stream.
            </div>
          </div>
        )}

        {/* ACTIVE PREVIEW CARD (Modern, Interactive, High-Fidelity) */}
        {!isLoading && currentPreview && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 font-mono text-xs text-neutral-400">
              <span className="flex items-center gap-2 text-red-400 font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Active Link Preview Card
              </span>
              <button
                onClick={handleRemoveCurrent}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                title="Remove preview card"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Dismiss</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl transition-all duration-200 hover:border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Thumbnail Image Section (5 Cols on Desktop) */}
                <div className="relative md:col-span-5 bg-black flex items-center justify-center overflow-hidden min-h-[200px] md:min-h-full">
                  {currentPreview.image ? (
                    <img
                      src={currentPreview.image}
                      alt={currentPreview.title}
                      className="h-full w-full object-cover object-center max-h-64 md:max-h-full transition-transform duration-300 hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback if remote image fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-neutral-600 font-mono text-center">
                      <Globe className="h-12 w-12 text-neutral-700 mb-2" />
                      <span className="text-xs">{currentPreview.domain}</span>
                      <span className="text-[10px] text-neutral-500 mt-1">No Open Graph image provided</span>
                    </div>
                  )}

                  {/* Domain Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/85 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-neutral-200 border border-neutral-800">
                    {currentPreview.favicon ? (
                      <img
                        src={currentPreview.favicon}
                        alt=""
                        className="h-3.5 w-3.5 rounded-sm object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                    <span className="font-semibold">{currentPreview.domain}</span>
                  </div>
                </div>

                {/* Content Section (7 Cols on Desktop) */}
                <div className="md:col-span-7 p-6 flex flex-col justify-between">
                  <div>
                    {/* Site name & Domain */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-2">
                      <span className="text-red-400 font-semibold">{currentPreview.siteName}</span>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="truncate max-w-[200px]">{currentPreview.url}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-100 hover:text-red-400 transition-colors leading-snug">
                      <a
                        href={currentPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus:outline-none"
                      >
                        {currentPreview.title}
                      </a>
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-xs sm:text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                      {currentPreview.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Open Link CTA */}
                    <a
                      href={currentPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-semibold tracking-wide transition-colors"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    {/* Right: Copy & Share Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(currentPreview.url)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
                        title="Copy link to clipboard"
                      >
                        {copiedUrl ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleShareLink(currentPreview)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
                        title="Share link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={handleRemoveCurrent}
                        className="p-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
                        title="Remove preview"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {shareSuccess && (
                    <div className="mt-2 text-right text-[11px] text-green-400 font-mono">
                      {shareSuccess}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCANNED FREQUENCY HISTORY */}
        {history.length > 0 && (
          <div className="rounded-lg border border-neutral-900 bg-black/80 p-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
              <div className="flex items-center gap-2 text-neutral-300 font-bold">
                <Clock className="h-4 w-4 text-neutral-500" />
                <span>Previously Intercepted Links ({history.length})</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="text-neutral-500 hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.url}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-neutral-900 bg-neutral-950/70 hover:border-neutral-800 gap-3 transition-colors"
                >
                  <div
                    onClick={() => {
                      sound.playClick();
                      setCurrentPreview(item);
                      setUrlInput(item.url);
                    }}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-0.5">
                      <span className="text-red-400 font-bold">{item.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-xs">{item.url}</span>
                    </div>
                    <div className="font-semibold text-neutral-200 line-clamp-1">{item.title}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
                      title="Open website"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleCopyLink(item.url)}
                      className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveHistoryItem(item.url)}
                      className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
