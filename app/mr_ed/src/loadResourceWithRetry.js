import api from "./api";

const STARTUP_TIMEOUT = 120000;
const REQUEST_TIMEOUT = 10000;
const RETRY_DELAY = 3000;

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    function abort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

// Used for the homepage's array resource. The data request also wakes the API,
// avoiding any dependency on a separately routed readiness endpoint.
export default async function loadResourceWithRetry(path, signal) {
  const deadline = Date.now() + STARTUP_TIMEOUT;
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    try {
      const response = await api.get(path, {
        signal,
        timeout: Math.max(1, Math.min(REQUEST_TIMEOUT, deadline - Date.now())),
      });
      // A hosting provider's HTML startup page is not a ready API response.
      if (Array.isArray(response.data)) return response;
    } catch (error) {
      signal.throwIfAborted();
      const status = error.response?.status;
      if (status && ![408, 502, 503, 504].includes(status)) throw error;
    }
    const remaining = deadline - Date.now();
    if (remaining > 0) await delay(Math.min(RETRY_DELAY, remaining), signal);
  }
  throw new Error("The service is taking too long to start. Please try again.");
}
