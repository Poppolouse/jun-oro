const DEFAULT_API_URL = "https://api.jun-oro.com/api";
const BLOCKED_HOST_TOKENS = ["localhost", "127.0.0.1", "0.0.0.0"];

const appendApiSuffix = (url) => {
  const normalized = url.replace(/\/+$/, "");
  if (normalized.endsWith("/api")) {
    return normalized;
  }
  return `${normalized}/api`;
};

export const resolveApiBaseUrl = () => {
  const rawValue = (import.meta?.env?.VITE_API_URL || "").trim();
  if (!rawValue) {
    return DEFAULT_API_URL;
  }

  const candidate = rawValue.startsWith("http")
    ? rawValue
    : `https://${rawValue.replace(/^\/+/, "")}`;

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase();
    const isBlocked = BLOCKED_HOST_TOKENS.some((token) =>
      hostname.includes(token),
    );

    if (isBlocked) {
      console.warn(
        "⚠️ Localhost API URL tespit edildi, otomatik olarak cloud backend kullanılacak.",
      );
      return DEFAULT_API_URL;
    }

    return appendApiSuffix(parsed.origin + parsed.pathname);
  } catch (error) {
    console.warn(
      "⚠️ Geçersiz VITE_API_URL değeri, cloud backend kullanılacak:",
      error.message,
    );
    return DEFAULT_API_URL;
  }
};

export const API_BASE_URL = resolveApiBaseUrl();
