import { redis } from "../../../lib/redis";

function getNow(req) {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    return Number(req.headers["x-test-now-ms"]);
  }
  return Date.now();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const key = `paste:${id}`;

  const raw = await redis.get(key);
  if (!raw) {
    return res.status(404).json({ error: "Paste not found or expired" });
  }

  const paste = typeof raw === "string" ? JSON.parse(raw) : raw;
  const now = getNow(req);

  // ---- TTL check ----
  if (paste.expires_at !== null && now >= paste.expires_at) {
    await redis.del(key);
    return res.status(404).json({ error: "Paste not found or expired" });
  }

  // ---- View count check ----
  if (paste.remaining_views !== null) {
    if (paste.remaining_views <= 0) {
      await redis.del(key);
      return res.status(404).json({ error: "Paste not found or expired" });
    }

    paste.remaining_views -= 1;
  }

  // ---- Persist updated state (PRESERVE TTL) ----
  if (paste.expires_at !== null) {
    const ttlSeconds = Math.ceil((paste.expires_at - now) / 1000);

    if (ttlSeconds > 0) {
      await redis.set(key, JSON.stringify(paste), {
        ex: ttlSeconds,
      });
    } else {
      await redis.del(key);
      return res.status(404).json({ error: "Paste not found or expired" });
    }
  } else {
    await redis.set(key, JSON.stringify(paste));
  }

  return res.status(200).json({
    content: paste.content,
    remaining_views: paste.remaining_views,
    expires_at:
      paste.expires_at !== null
        ? new Date(paste.expires_at).toISOString()
        : null,
  });
}
