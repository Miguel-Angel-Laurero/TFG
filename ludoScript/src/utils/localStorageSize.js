// Helper para estimar y loggear el tamaño de localStorage
const OWNER_MAP_KEY = "ludoscript_key_owners";
const CURRENT_USER_KEY = "ludoscript_current_user";

function safeJSONParse(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

export function estimateLocalStorageBytes() {
  if (typeof window === "undefined" || !window.localStorage) return 0;

  const hasBlob = typeof Blob !== "undefined";
  const hasTextEncoder = typeof TextEncoder !== "undefined";

  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    const value = localStorage.getItem(key) || "";
    if (hasBlob) {
      total += new Blob([key]).size + new Blob([value]).size;
    } else if (hasTextEncoder) {
      const enc = new TextEncoder();
      total += enc.encode(key).length + enc.encode(value).length;
    } else {
      // Fallback aproximado: 2 bytes por carácter (UTF-16)
      total += (key.length + value.length) * 2;
    }
  }
  return total;
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// --- owner mapping helpers -------------------------------------------------
export function setCurrentLocalUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }
    const minimal = {
      id: user.id ?? user.userId ?? user._id ?? null,
      username:
        user.username ?? user.name ?? user.displayName ?? user.email ?? null,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(minimal));
  } catch (e) {
    /* noop */
  }
}

export function getCurrentLocalUser() {
  try {
    return safeJSONParse(localStorage.getItem(CURRENT_USER_KEY));
  } catch (e) {
    return null;
  }
}

export function getOwnersMapping() {
  try {
    return safeJSONParse(localStorage.getItem(OWNER_MAP_KEY)) || {};
  } catch (e) {
    return {};
  }
}

export function attachOwnerToKey(key, user) {
  if (!key || !user) return;
  try {
    const owners = getOwnersMapping();
    const ownerObj = {
      userId: user.id ?? user.userId ?? user._id ?? null,
      username: user.username ?? user.name ?? user.displayName ?? null,
      at: Date.now(),
    };
    owners[key] = ownerObj;
    localStorage.setItem(OWNER_MAP_KEY, JSON.stringify(owners));
  } catch (e) {
    /* noop */
  }
}

export function tagLudoKeysWithCurrentUser(user) {
  if (!user) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("ludoscript_")) attachOwnerToKey(key, user);
    }
    setCurrentLocalUser(user);
  } catch (e) {
    /* noop */
  }
}

export function getKeyOwner(key) {
  const owners = getOwnersMapping();
  return owners[key] || null;
}

// --- logging/diagnóstico --------------------------------------------------
export function logLocalStorageSize(label = "localStorage", user = null) {
  try {
    const bytes = estimateLocalStorageBytes();
    const nItems =
      typeof localStorage !== "undefined" ? localStorage.length : 0;
    const ownerInfo = user
      ? ` — currentUser: ${user.username ?? user.name ?? user.id}`
      : "";
    console.info(
      `${nItems} keys${ownerInfo} - ${formatBytes(bytes)} (${bytes} bytes)`,
    );

    const owners = getOwnersMapping();
    // Listamos claves de ludoscript y su propietario si está disponible
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("ludoscript_")) continue;
      const value = localStorage.getItem(key) || "";
      const size =
        typeof Blob !== "undefined"
          ? new Blob([key]).size + new Blob([value]).size
          : typeof TextEncoder !== "undefined"
            ? new TextEncoder().encode(key).length +
              new TextEncoder().encode(value).length
            : (key.length + value.length) * 2;
      const owner = owners[key];
      const ownerLabel = owner
        ? `${owner.username ?? owner.userId} (id:${owner.userId})`
        : "unknown";
      console.info(
        `[ludoscript] key=${key} size=${formatBytes(size)} owner=${ownerLabel}`,
      );
    }
  } catch (e) {
    console.warn("[ludoscript] no se pudo medir localStorage", e);
  }
}

export function getLocalStorageSnapshot() {
  const out = {};
  if (typeof localStorage === "undefined") return out;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    out[key] = localStorage.getItem(key);
  }
  // añadimos mapping de propietarios
  out.__owners__ = getOwnersMapping();
  return out;
}
