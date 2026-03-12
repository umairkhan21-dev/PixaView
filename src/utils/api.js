function normalizeApiBase(rawValue) {
  const value = rawValue?.trim();

  if (!value) {
    return import.meta.env.PROD ? "" : "http://localhost:5000";
  }

  if (!import.meta.env.PROD) {
    return value.replace(/\/+$/, "");
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return "";
    }
  } catch {
    return value.replace(/\/+$/, "");
  }

  return value.replace(/\/+$/, "");
}

export const API = normalizeApiBase(import.meta.env.VITE_API_URL);
