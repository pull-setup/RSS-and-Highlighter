/**
 * Client-side cache utility with TTL support
 * Cache duration: 4 hours (14400000ms)
 */

const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const CACHE_PREFIX = "reedsync_cache_";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CachedFetchResult<T> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

interface CachedFetchOptions extends RequestInit {
  noCache?: boolean;
}

function getCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || "GET";
  const body = options?.body ? JSON.stringify(options.body) : "";
  return `${CACHE_PREFIX}${method}_${url}_${body}`;
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return Date.now() > entry.expiresAt;
}

function getCachedEntry<T>(url: string, options?: RequestInit): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  
  try {
    const key = getCacheKey(url, options);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (isExpired(entry)) {
      localStorage.removeItem(key);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

export function getCached<T>(url: string, options?: RequestInit): T | null {
  const entry = getCachedEntry<T>(url, options);
  return entry ? entry.data : null;
}

export function setCache<T>(url: string, data: T, options?: RequestInit): void {
  if (typeof window === "undefined") return;

  try {
    const key = getCacheKey(url, options);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn("Failed to cache data:", error);
  }
}

export function invalidateCache(pattern?: string): void {
  if (typeof window === "undefined") return;

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        if (!pattern || key.includes(pattern)) {
          keys.push(key);
        }
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to invalidate cache:", error);
  }
}

export function clearExpiredCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (isExpired(entry)) {
              keys.push(key);
            }
          } catch {
            // Invalid cache entry, remove it
            keys.push(key);
          }
        }
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to clear expired cache:", error);
  }
}

/**
 * Cached fetch wrapper that returns metadata about cache status
 */
export async function cachedFetch<T>(
  url: string,
  options?: CachedFetchOptions
): Promise<CachedFetchResult<T>> {
  const { noCache, ...fetchOptions } = options || {};

  // Check cache first (only for GET requests, and not if aborted, and not if noCache)
  if (
    (!fetchOptions.method || fetchOptions.method === "GET") &&
    !fetchOptions.signal?.aborted &&
    !noCache
  ) {
    const cachedEntry = getCachedEntry<T>(url, fetchOptions);
    if (cachedEntry !== null) {
      return {
        data: cachedEntry.data,
        fromCache: true,
        timestamp: cachedEntry.timestamp,
      };
    }
  }

  // Fetch from network
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const data = (await response.json()) as T;
  const timestamp = Date.now();

  // Cache successful GET responses (only if not aborted and not noCache)
  if (
    (!fetchOptions.method || fetchOptions.method === "GET") &&
    !fetchOptions.signal?.aborted &&
    !noCache
  ) {
    setCache(url, data, fetchOptions);
  }

  return {
    data,
    fromCache: false,
    timestamp,
  };
}

/**
 * Force fetch without cache (always fetches fresh data from server)
 */
export async function freshFetch<T>(
  url: string,
  options?: RequestInit
): Promise<CachedFetchResult<T>> {
  return cachedFetch<T>(url, { ...options, noCache: true });
}

// Clean expired cache on module load
if (typeof window !== "undefined") {
  clearExpiredCache();
}
