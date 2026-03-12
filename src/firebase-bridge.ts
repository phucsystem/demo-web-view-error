declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

const isInWebView = !!window.ReactNativeWebView;

function sendToNative(level: string, message: string, data?: Record<string, unknown>): void {
  if (!isInWebView) return;
  try {
    window.ReactNativeWebView!.postMessage(
      JSON.stringify({ level, message, data }),
    );
  } catch {
    // Silent fail — WebView bridge unavailable
  }
}

export function reportError(level: string, message: string, data?: Record<string, unknown>): void {
  sendToNative(level, message, data);
  console.warn(`[bridge:${level}] ${message}`);
}

export function reportMetric(level: string, message: string, data?: Record<string, unknown>): void {
  sendToNative(level, message, data);
  console.info(`[bridge:${level}] ${message}`);
}

export function reportApiTiming(
  url: string,
  method: string,
  status: number,
  durationMs: number,
  responseSize?: number,
): void {
  sendToNative('api-timing', `${method} ${url} → ${status} in ${durationMs}ms`, {
    url,
    method,
    status,
    durationMs,
    responseSize,
  });
}

function attachImageErrorHandler(img: HTMLImageElement): void {
  if (img.dataset.bridgeObserved) return;
  img.dataset.bridgeObserved = 'true';
  img.addEventListener('error', () => {
    reportError('image-error', `Image failed to load: ${img.src}`, {
      url: img.src,
    });
  });
}

export function initBridge(): void {
  // Image error observer
  const imageObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLImageElement) {
          attachImageErrorHandler(node);
        }
        if (node instanceof HTMLElement) {
          node.querySelectorAll('img').forEach(attachImageErrorHandler);
        }
      }
    }
  });

  imageObserver.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('img').forEach(attachImageErrorHandler);

  // Long task observer
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          reportMetric('slow-task', `Long task detected: ${Math.round(entry.duration)}ms`, {
            durationMs: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
          });
        }
      }
    });
    longTaskObserver.observe({ type: 'longtask', buffered: true });
  } catch {
    // longtask not supported (WKWebView) — silent no-op
  }
}
