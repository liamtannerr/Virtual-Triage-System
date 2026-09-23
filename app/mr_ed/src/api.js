import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
});

export function clearUser() {
  ["email", "token", "user_type", "name", "inTriage"].forEach((key) =>
    localStorage.removeItem(key),
  );
}

export function rememberUser(user) {
  localStorage.removeItem("token");
  // Display hints only. Every protected screen rechecks the session with the server.
  ["email", "user_type", "name", "inTriage"].forEach((key) =>
    localStorage.setItem(key, user[key]),
  );
}

localStorage.removeItem("token");
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearUser();
    // Do not expose Axios request config: it can contain passwords and patient data.
    const safeError = new Error(
      error.response?.data?.detail || "Request failed. Please try again.",
    );
    safeError.response = {
      status: error.response?.status,
      data: { detail: safeError.message },
    };
    return Promise.reject(safeError);
  },
);

export default api;
