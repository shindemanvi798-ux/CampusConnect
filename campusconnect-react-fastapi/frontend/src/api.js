const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the backend. Start FastAPI in the other terminal.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export const getHealth = () => request("/api/health");
export const getEvents = (q = "", category = "All") => {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category && category !== "All") params.set("category", category);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request(`/api/events${suffix}`);
};
export const sendFeedback = (payload) => request("/api/feedback", {
  method: "POST",
  body: JSON.stringify(payload),
});
