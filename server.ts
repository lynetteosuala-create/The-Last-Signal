import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LinkPreviewResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string;
  success: boolean;
}

function cleanHtmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match && match[1] ? cleanHtmlText(match[1]) : null;
}

function isPrivateIp(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  ) {
    return true;
  }
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Link preview API endpoint
  app.get('/api/link-preview', async (req: Request, res: Response) => {
    const rawUrl = req.query.url as string;

    if (!rawUrl || typeof rawUrl !== 'string') {
      res.status(400).json({ error: 'Missing "url" query parameter' });
      return;
    }

    let parsedUrl: URL;
    try {
      let target = rawUrl.trim();
      if (!/^https?:\/\//i.test(target)) {
        target = `https://${target}`;
      }
      parsedUrl = new URL(target);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    if (isPrivateIp(parsedUrl.hostname)) {
      res.status(403).json({ error: 'Access to internal/private addresses is restricted.' });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        // Non-HTML direct link (e.g., image, pdf)
        const domain = parsedUrl.hostname.replace(/^www\./, '');
        const filename = parsedUrl.pathname.split('/').pop() || domain;
        const result: LinkPreviewResult = {
          url: parsedUrl.href,
          domain,
          title: filename,
          description: `Direct resource file (${contentType.split(';')[0] || 'media'})`,
          image: contentType.startsWith('image/') ? parsedUrl.href : null,
          favicon: `${parsedUrl.origin}/favicon.ico`,
          siteName: domain,
          success: true,
        };
        res.json(result);
        return;
      }

      // Read initial 300KB chunk to prevent memory exhaustion
      const reader = response.body?.getReader();
      let html = '';
      if (reader) {
        const decoder = new TextDecoder('utf-8');
        let totalBytes = 0;
        const maxBytes = 350 * 1024;
        while (true) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          html += decoder.decode(value, { stream: true });
          totalBytes += value.length;
          if (totalBytes >= maxBytes || html.includes('</head>')) {
            reader.cancel();
            break;
          }
        }
      } else {
        html = await response.text();
      }

      const domain = parsedUrl.hostname.replace(/^www\./, '');

      // Extract Open Graph & Twitter & Standard metadata
      const ogTitle =
        extractMeta(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);

      const docTitle = extractMeta(html, /<title[^>]*>([^<]+)<\/title>/i);

      const title = ogTitle || docTitle || domain;

      const ogDescription =
        extractMeta(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);

      const description = ogDescription || `Visit ${domain} to explore content and official transmission details.`;

      let ogImage =
        extractMeta(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
        extractMeta(html, /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

      if (ogImage && !ogImage.startsWith('http')) {
        try {
          ogImage = new URL(ogImage, parsedUrl.href).href;
        } catch {
          ogImage = null;
        }
      }

      const ogSiteName =
        extractMeta(html, /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i) || domain;

      // Favicon extraction
      let favicon =
        extractMeta(html, /<link\s+[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
        extractMeta(html, /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

      if (favicon && !favicon.startsWith('http')) {
        try {
          favicon = new URL(favicon, parsedUrl.href).href;
        } catch {
          favicon = `${parsedUrl.origin}/favicon.ico`;
        }
      } else if (!favicon) {
        favicon = `${parsedUrl.origin}/favicon.ico`;
      }

      const result: LinkPreviewResult = {
        url: parsedUrl.href,
        domain,
        title,
        description,
        image: ogImage,
        favicon,
        siteName: ogSiteName,
        success: true,
      };

      res.json(result);
    } catch (err: unknown) {
      // Return structured fallback
      const domain = parsedUrl.hostname.replace(/^www\./, '');
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      console.warn(`Link preview fetch failed for ${parsedUrl.href}:`, errorMessage);

      const fallbackResult: LinkPreviewResult = {
        url: parsedUrl.href,
        domain,
        title: domain.charAt(0).toUpperCase() + domain.slice(1),
        description: `External transmission frequency at ${domain}. Click below to access safely.`,
        image: null,
        favicon: `${parsedUrl.origin}/favicon.ico`,
        siteName: domain,
        success: false,
      };
      res.json(fallbackResult);
    }
  });

  // Vite middleware for dev / static files for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[THE LAST SIGNAL] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
