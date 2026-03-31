// mobile/app/utils/api.js
import * as SecureStore from "expo-secure-store";

// Configure BASE_URL for your environment:
// - Local emulator (Android):  "http://10.0.2.2:5000"
// - Physical device:           "http://<your-local-IP>:5000"
// - Production:                "https://your-api-domain.com"
export const BASE_URL = "http://localhost:5000";

async function getToken() {
  try {
    return await SecureStore.getItemAsync("mah_token");
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
