import { nanoid } from "nanoid";
import { redis } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, ttl_seconds, max_views } = req.body;

  // ---- Validation (required by spec) ----
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds <= 0)
  ) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views <= 0)
  ) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);

  // ---- Time handling (TEST_MODE safe base) ----
  const now =
    process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
      ? Number(req.headers["x-test-now-ms"])
      : Date.now();

  const expiresAt =
    ttl_seconds !== undefined ? now + ttl_seconds * 1000 : null;

  const pasteData = {
    content,
    remaining_views: max_views ?? null,
    expires_at: expiresAt,
  };

  // ---- Save to Redis ----
  await redis.set(`paste:${id}`, JSON.stringify(pasteData));

  if (ttl_seconds !== undefined) {
    await redis.expire(`paste:${id}`, ttl_seconds);
  }

  // ---- Absolute URL (MANDATORY) ----
  const baseUrl = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

  return res.status(201).json({
    id,
    url: `${baseUrl}/p/${id}`,
  });
}
