# Binyam Mamo, Portfolio

Personal portfolio at [binyammamo.vercel.app](https://binyammamo.vercel.app), built with Next.js (App Router), TypeScript and Tailwind CSS. A private local dashboard edits all content, and the CV PDF is generated from the same data.

## Getting started

Requires Node.js 20.9 or newer, pnpm, and ffmpeg (for GIF and video uploads).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Start the dev server                                 |
| `pnpm build`         | Production build                                     |
| `pnpm start`         | Serve the production build                           |
| `pnpm lint`          | ESLint                                               |
| `pnpm typecheck`     | TypeScript without emitting                          |
| `pnpm format`        | Prettier with Tailwind class sort                    |
| `pnpm content:check` | Validate every file in `content/` and cross-references |
| `pnpm cv:pdf`        | Render a CV to `cv-out/` (see below)                 |
| `pnpm media:add`     | Add an image, GIF or video to a project              |
| `pnpm auth:hash`     | Print a password hash for the dashboard login        |

## Content

Everything shown on the site and the CV lives in JSON files, validated by the schemas in `src/lib/schemas.ts`.

| File                         | Contents                                                  |
| ---------------------------- | --------------------------------------------------------- |
| `content/profile.json`       | Name, role, intro, summary, contact details, links, highlights |
| `content/projects.json`      | Projects in display order, with media and detail page text |
| `content/experience.json`    | Experience timeline                                       |
| `content/education.json`     | Education timeline                                        |
| `content/skills.json`        | Skill groups                                              |
| `content/navigation.json`    | Project groups and the featured project in the header menu |
| `content/cv/settings.json`   | Default CV template, file name and projects               |
| `content/cv/variants/*.json` | Tailored CV versions                                      |

Media lives in `public/media`, and technology logos in `public/icons` (registered in `src/lib/tech.ts`).

## Dashboard

The dashboard at `/dashboard` edits all of the above: profile, projects (with drag and drop uploads), experience, education, skills and the CV. It only runs locally and returns 404 on Vercel.

Set it up once in `.env.local` (never commit it or add these to Vercel):

```bash
DASHBOARD_ENABLED=true
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=...   # from `pnpm auth:hash`
SESSION_SECRET=...        # any random string of 32+ characters
```

Then sign in at `/login`. Saving writes the JSON files directly. **Publish** on the overview page commits the changes in `content/` and `public/media/` with a one-line message and pushes the current branch; a push to `main` deploys the site.

Uploads are optimized on the way in: images become WebP (max 1600px wide), GIFs and videos become an MP4 clip with a WebP poster.

## CV

The CV is rendered with `@react-pdf/renderer` from the content files. Templates live in `src/cv/templates`:

- **Classic**: single column with ruled sections, the safest for applicant tracking systems.
- **Modern**: single column with dates in a margin and green accents.
- **Sidebar**: two columns with contact, skills and education on the side.

The public `/resume.pdf` is built at deploy time from the default settings. Tailored versions in `content/cv/variants/<slug>.json` override the headline, summary, project and experience selection, skill order, and can add extra bullet points per entry (`extraPoints`, keyed by experience or education id). Anything left out falls back to the default CV.

```bash
pnpm cv:pdf                                   # default CV
pnpm cv:pdf --template sidebar                # another template
pnpm cv:pdf --variant acme                    # a tailored version
pnpm cv:pdf --variant acme --out ~/acme.pdf   # custom output path
```

## Adding media from the terminal

```bash
pnpm media:add path/to/demo.gif --project funkey --alt "Practice mode"
pnpm media:add cover.png --project funkey --cover
```

## Deployment

Deployed on Vercel. Every push to `main` builds and publishes automatically. The build reads the committed content, so publish from the dashboard (or commit `content/` and `public/media/`) before expecting changes online.
