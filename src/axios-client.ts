import axios, { type InternalAxiosRequestConfig } from 'axios';
import { reportError, reportMetric } from './firebase-bridge';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

const apiClient = axios.create({
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.metadata = { startTime: performance.now() };
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const durationMs = Math.round(performance.now() - (response.config.metadata?.startTime ?? performance.now()));
    const method = (response.config.method || 'GET').toUpperCase();
    const url = response.config.url || 'unknown';

    if (durationMs > 1000) {
      reportMetric('slow-response', `${method} ${url} → ${response.status} OK (${durationMs}ms)`, {
        url,
        method,
        status: response.status,
        durationMs,
      });
    }

    return response;
  },
  (error) => {
    const config = error.config || {};
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || 'unknown';
    const startTime = config.metadata?.startTime || performance.now();
    const durationMs = Math.round(performance.now() - startTime);

    if (error.response) {
      const { status, statusText, data } = error.response;
      const responseBody = typeof data === 'string' ? data : JSON.stringify(data);
      reportError('http-error', `${method} ${url} → ${status} ${statusText}`, {
        url,
        method,
        status,
        statusText,
        durationMs,
        responseBody: responseBody.substring(0, 512),
      });
    } else {
      reportError('network-error', `${method} ${url} → Network Error`, {
        url,
        method,
        errorMessage: error.message || 'Unknown network error',
      });
    }

    return Promise.reject(error);
  },
);

export { apiClient };
