A lightweight Pastebin-like service built with Next.js and Redis (Upstash) that allows users to create temporary text pastes with expiration time and view limits.

This project was implemented as a take-home assignment, focusing on clean API design, correctness, and production deployment.

🚀 Live Demo

Production URL (Vercel):
👉 https://pastebin-lite-nine.vercel.app

📦 Features

✅ Create text pastes via REST API

✅ Auto-generated short IDs

✅ Optional expiration (TTL-based)

✅ Optional maximum view count

✅ Automatic cleanup on expiration or view limit

✅ Redis-backed persistence (Upstash)

✅ Deployed on Vercel

🛠 Tech Stack

Framework: Next.js (Pages Router)

Database: Upstash Redis (REST-based)

Deployment: Vercel

Utilities: nanoid

🔐 Environment Variables

The following environment variables are required:

UPSTASH_REDIS_REST_URL=xxxx_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=xxxx_upstash_redis_rest_token


These must be configured both locally (.env.local) and in Vercel → Project → Settings → Environment Variables.

🔍 API Endpoints
1️⃣ Health Check

GET /api/healthz

Response

{ "ok": true }

2️⃣ Create a Paste

POST /api/pastes

Request Body

{
  "content": "Hello Pastebin Lite",
  "expiresIn": 3600,
  "maxViews": 3
}


expiresIn (optional): Expiration time in seconds

maxViews (optional): Maximum number of allowed views

Response

{
  "id": "AbC123",
  "url": "/p/AbC123"
}

3️⃣ Retrieve a Paste

GET /api/pastes/:id

Response

{
  "content": "Hello Pastebin Lite",
  "remaining_views": 2,
  "expires_at": "2025-01-01T10:30:00.000Z"
}


Error Cases

404 – Paste not found

404 – Paste expired

404 – View limit exceeded

View count is decremented only on API access, not on UI page renders.

🖥 Paste Viewer UI

Each paste can be viewed in the browser using:

/p/:id


Example:

https://pastebin-lite-nine.vercel.app/p/AbC123


This page fetches the paste content via the API and displays it in a minimal UI.

🧠 Implementation Details
🔹 Expiration (TTL)

Expiration is enforced using a timestamp (expires_at)

Expired pastes are deleted automatically on access

🔹 View Limits

remaining_views is decremented on each successful API fetch

When it reaches zero, the paste is deleted

🔹 Redis Key Format
paste:<id>


Each key stores a JSON payload:

{
  "content": "text",
  "remaining_views": 3,
  "expires_at": 1735713000000
}

🧪 Testing the API (Example)

Open DevTools Console on the deployed site and run:

fetch("/api/pastes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Hello from Vercel",
    expiresIn: 60,
    maxViews: 2
  })
})
.then(res => res.json())
.then(console.log);


Then open:

/p/<id>

🚀 Deployment

Continuous deployment via GitHub → Vercel

Each push to the main branch triggers a new deployment

📌 Submission Links

GitHub Repository:
https://github.com/shubham-dethe/pastebin-lite

Live Deployment:
https://pastebin-lite-nine.vercel.app
