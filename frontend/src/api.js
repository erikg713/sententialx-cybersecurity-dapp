// Lightweight, resilient API client for the frontend.
// - Configurable via REACT_APP_API_URL
// - Consistent return shape: { ok, status, data, error }
// - Timeouts, simple retries with exponential backoff, input validation

const DEFAULT_API_URL = "http://localhost:5000";
const API_URL = (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) || DEFAULT_API_URL;
const DEFAULT_TIMEOUT = 8000; // ms
const DEFAULT_RETRIES = 2;

/**
 * Normalize a given path into a full URL against API_URL.
 * @param {string} path
 * @returns {string}
 */
function makeUrl(path) {
  const base = API_URL.replace(/\/+$/, "");
  const p = String(path || "").replace(/^\/+/, "");
  return `${base}/${p}`;
}

/**
 * Perform fetch with timeout and retries. Always returns an object:
 * { ok: boolean, status: number, data: any, error?: string }
 * @param {string} path
 * @param {{ method?: string, body?: any, headers?: Record<string,string>, timeout?: number, retries?: number }} opts
 */
export async function request(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES
  } = opts;

  const url = makeUrl(path);
  const fetchInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };

  if (body !== undefined) {
    fetchInit.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let attempt = 0;
  while (true) {
    attempt += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { ...fetchInit, signal: controller.signal });
      clearTimeout(timer);

      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      let data = null;
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (err) {
          return { ok: false, status: res.status, data: null, error: "Invalid JSON response" };
        }
      } else {
        try {
          data = await res.text();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        const error = (data && data.error) || (typeof data === "string" && data) || res.statusText || "Request failed";
        return { ok: false, status: res.status, data, error };
      }

      return { ok: true, status: res.status, data };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err && err.name === "AbortError";
      const isNetwork = err instanceof TypeError;

      if (attempt > retries || (!isAbort && !isNetwork)) {
        const message = isAbort ? "Request timed out" : (err && err.message) || "Network error";
        // Keep a short console notice for debugging
        // eslint-disable-next-line no-console
        console.warn(`API ${method} ${url} failed: ${message}`);
        return { ok: false, status: 0, data: null, error: message };
      }

      // exponential backoff before retrying
      const backoff = 150 * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

/**
 * Basic validation for userId
 * @param {any} userId
 */
function assertUserId(userId) {
  if (typeof userId !== "string" || !userId.trim()) {
    throw new TypeError("userId must be a non-empty string");
  }
}

/**
 * Authenticate / create session
 * @param {string} userId
 */
export async function apiLogin(userId) {
  assertUserId(userId);
  return request("/auth", { method: "POST", body: { userId } });
}

/**
 * Trigger a payment for a user
 * @param {string} userId
 * @param {number} amount
 */
export async function apiPay(userId, amount) {
  assertUserId(userId);
  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    throw new TypeError("amount must be a positive number");
  }
  return request("/pay", { method: "POST", body: { userId, amount } });
}

/**
 * Start KYC flow
 * @param {string} userId
 */
export async function apiKYC(userId) {
  assertUserId(userId);
  return request("/kyc", { method: "POST", body: { userId } });
}

export default {
  request,
  apiLogin,
  apiPay,
  apiKYC
};
