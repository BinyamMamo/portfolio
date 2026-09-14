# Project captures

Raw screenshots and clips for the portfolio carousels. Compose them with `pnpm media:cinematic <slug>`, which frames each capture, optimizes it and adds it to `content/projects.json`.

## Layout

```
captures/raw/<slug>/            (gitignored)
  manifest.json                 shot list, see below
  project.json                  description draft for content/projects.json
  01-overview.png               raw captures
  clip-booking.webm
```

## manifest.json

```json
{
  "slug": "clixa-tools",
  "shots": [
    { "file": "01-overview.png", "caption": "Every calculator in one searchable list", "device": "desktop", "url": "clixa-tools.vercel.app" },
    { "file": "05-phone.png", "caption": "Works as an installable phone app", "device": "mobile" },
    { "file": "clip-staging.webm", "caption": "Staging a tumor step by step", "device": "desktop", "kind": "video" }
  ]
}
```

- `device`: `desktop` shots are captured with a 1440x900 viewport at deviceScaleFactor 2 (2880x1800 files). `mobile` shots use 390x844 at deviceScaleFactor 3. Consecutive mobile shots are paired side by side.
- `url`: the address shown in the browser frame (no protocol). Omit it for local apps, and the frame shows the project name instead.
- `kind`: `video` for clips (Playwright `recordVideo` at 1440x900, or an mp4). The first shot becomes the cover, so make it the most striking one.
- Order the shots like a story: the hero feature first, then 3 to 6 distinct features. No near-duplicates, empty states, cookie banners, dev overlays, error toasts or loading spinners.

## project.json

A draft entry matching `projectSchema` in `src/lib/schemas.ts`, without media (the cinematic script fills `cover` and `gallery`):

```json
{
  "slug": "clixa-tools",
  "name": "Clixa Tools",
  "tagline": "One line, under 90 characters.",
  "summary": "Two sentences a non-developer understands.",
  "category": "Health",
  "areas": ["health"],
  "kind": "personal",
  "client": { "name": "Hakim Click", "url": "https://...", "role": "Full-stack developer" },
  "year": "2026",
  "status": "live",
  "stack": ["react", "vite", "Cloudflare Workers"],
  "topics": ["clinical calculators", "PWA"],
  "highlight": "Optional single standout fact.",
  "liveUrl": "https://...",
  "repoUrl": "https://github.com/BinyamMamo/... (public repos only)",
  "notebookUrl": "https://colab.research.google.com/github/...",
  "demo": { "url": "https://...", "label": "Explore the 3D replay" },
  "featured": false,
  "overview": ["2 or 3 short paragraphs: the problem, who it helps, how it works"],
  "features": ["4 to 6 concrete things a user can do"],
  "challenges": ["2 to 4 real engineering problems and how they were solved"]
}
```

- `areas`: any of `health`, `platforms`, `ai`, `vision`, `robotics`, `learning`, `devtools`.
- `kind`: `client` for work done for a company or team (include `client`), otherwise `personal`.
- `status`: `live` (deployed and working), `prototype` (deployed or runnable, but unfinished), `local` or `archived`.
- `stack`: tech ids from `src/lib/tech.ts` where one exists (`react`, `nodejs`, `express`, `nestjs`, `flask`, `django`, `postgresql`, `mongodb`, `firebase`, `tailwindcss`, `vite`, `flutter`, `docker`, `gemini`, `python`, `javascript`, ...), otherwise the plain name (`Next.js`, `Supabase`, `Prisma`, `FastAPI`, `PixiJS`, `MediaPipe`, `Webots`).

## Writing style

Plain, human and specific, as if explaining the project to a curious friend. No em dashes or en dashes used as punctuation, no emojis, no hype words ("revolutionary", "seamless", "cutting-edge", "leverage"), and only the jargon a recruiter would still follow.
