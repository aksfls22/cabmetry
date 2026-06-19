// Best-effort in-memory rate limiter (per server instance).
//
// On serverless (Vercel) each instance has its own memory, so this does not give
// a global limit — but it still throttles naive enumeration bursts hitting a warm
// instance. For a hard guarantee use a shared store (e.g. Upstash Redis).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic prune so the map cannot grow unbounded.
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => {
      if (now >= b.resetAt) buckets.delete(k);
    });
  }

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
