import { redis } from "../../lib/redis";

export default async function handler(req, res) {
  await redis.ping();
  res.status(200).json({ ok: true });
}
