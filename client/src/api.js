/**
 * Vintage Veda — API Service Layer
 * Centralized module for all backend API calls.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// ── Helper: get stored auth token ──
function getToken() {
  return localStorage.getItem("vv_access_token");
}

function setTokens(access, refresh) {
  localStorage.setItem("vv_access_token", access);
  localStorage.setItem("vv_refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("vv_access_token");
  localStorage.removeItem("vv_refresh_token");
}

// ── Fetch wrapper with auth header ──
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401, try refresh
  if (res.status === 401 && !options._retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(path, { ...options, _retried: true });
    }
  }

  return res;
}

// ── Token refresh ──
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("vv_refresh_token");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    }
  } catch (e) {
    console.error("Token refresh failed:", e);
  }
  clearTokens();
  return false;
}

// ═══════════════════════════════════════
//  AUTH ENDPOINTS
// ═══════════════════════════════════════

export async function signup(fullName, email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    setTokens(data.access_token, data.refresh_token);
  }
  return { ok: res.ok, data };
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (e) { /* ignore */ }
  clearTokens();
}

export function isLoggedIn() {
  return !!getToken();
}

export async function completeProfile(profileData) {
  const res = await apiFetch("/auth/complete-profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function updateProfile(profileData) {
  const res = await apiFetch("/auth/update-profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function submitContact(contactData) {
  const res = await fetch(`${API_BASE}/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
  return { ok: res.ok, data: await res.json() };
}

// ═══════════════════════════════════════
//  REMEDIES ENDPOINTS
// ═══════════════════════════════════════

export async function getFeaturedRemedies() {
  const res = await fetch(`${API_BASE}/remedies/featured`);
  if (!res.ok) return [];
  return res.json();
}

export async function getRemedyOfDay() {
  const res = await fetch(`${API_BASE}/remedies/remedy-of-day`);
  if (!res.ok) return null;
  return res.json();
}

export async function searchRemedies(type, query) {
  const res = await apiFetch(`/remedies/search?type=${type}&q=${encodeURIComponent(query)}`);
  if (!res.ok) return { results: [], count: 0 };
  return res.json();
}

export async function getAutocomplete(type, query) {
  const res = await fetch(`${API_BASE}/remedies/autocomplete?type=${type}&q=${encodeURIComponent(query)}`);
  if (!res.ok) return { suggestions: [] };
  return res.json();
}

export async function toggleUpvote(remedyId) {
  const res = await apiFetch(`/remedies/${remedyId}/upvote`, { method: "PUT" });
  if (!res.ok) return null;
  return res.json();
}

// ═══════════════════════════════════════
//  SPICES ENDPOINTS
// ═══════════════════════════════════════

export async function getSpices() {
  const res = await fetch(`${API_BASE}/spices/`);
  if (!res.ok) return [];
  return res.json();
}

export async function getSpice(slug) {
  const res = await fetch(`${API_BASE}/spices/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

// ═══════════════════════════════════════
//  BOOKMARKS ENDPOINTS
// ═══════════════════════════════════════

export async function getBookmarks() {
  const res = await apiFetch("/bookmarks/");
  if (!res.ok) return [];
  return res.json();
}

export async function addBookmark(remedyId) {
  const res = await apiFetch(`/bookmarks/${remedyId}`, { method: "POST" });
  return { ok: res.ok, data: await res.json() };
}

export async function removeBookmark(remedyId) {
  const res = await apiFetch(`/bookmarks/${remedyId}`, { method: "DELETE" });
  return { ok: res.ok };
}

// ═══════════════════════════════════════
//  DOSHA QUIZ
// ═══════════════════════════════════════

export async function getDoshaQuiz() {
  const res = await fetch(`${API_BASE}/dosha/quiz`);
  if (!res.ok) return null;
  return res.json();
}

export async function submitDoshaResult(answers) {
  const res = await apiFetch("/dosha/result", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ═══════════════════════════════════════
//  SEASONAL CONTENT
// ═══════════════════════════════════════

export async function getSeasonalTips() {
  const res = await fetch(`${API_BASE}/content/seasonal`);
  if (!res.ok) return null;
  return res.json();
}

// ═══════════════════════════════════════
//  VEDABOT CHATBOT
// ═══════════════════════════════════════

export async function sendChatMessage(message, history = []) {
  const res = await apiFetch("/chatbot/message", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ═══════════════════════════════════════
//  PASSWORD RESET
// ═══════════════════════════════════════

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  return { ok: res.ok, data: await res.json() };
}
