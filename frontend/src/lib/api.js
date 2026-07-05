import { loadStoredUser } from "./auth";
// Minimal API helper with timeout, abort, JSON normalization, and simple retry option
const DEFAULT_TIMEOUT = 30000;

function timeoutFetch(resource, options = {}) {
  const { timeout = DEFAULT_TIMEOUT } = options;
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || (controller ? controller.signal : undefined);

  const fetchPromise = fetch(resource, { ...options, signal });

  if (controller) {
    const t = setTimeout(() => controller.abort(), timeout);
    return fetchPromise.finally(() => clearTimeout(t));
  }
  return fetchPromise;
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function apiFetch(path, opts = {}) {
  const base = window?.API_BASE || "";
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const response = await timeoutFetch(url, opts);
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const err = {
      status: response.status,
      message: data?.message || data?.detail || response.statusText,
      code: data?.code,
      detail: data?.detail,
      meta: data?.meta,
    };
    throw err;
  }
  return data;
}

export async function postJson(path, body, opts = {}) {
  return apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...opts })
}

export default { apiFetch, postJson };
