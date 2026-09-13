# Binyam Mamo, Portfolio

Personal portfolio at [binyammamo.vercel.app](https://binyammamo.vercel.app), built with Next.js (App Router), TypeScript and Tailwind CSS.

## Getting started

Requires Node.js 20.9 or newer and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Start the dev server             |
| `pnpm build`     | Production build                 |
| `pnpm start`     | Serve the production build       |
| `pnpm lint`      | ESLint                           |
| `pnpm typecheck` | TypeScript without emitting      |
| `pnpm format`    | Prettier with Tailwind class sort |

## Editing content

Content is typed data, separate from the UI. Most updates only touch `src/content`.

| File                          | Contents                                        |
| ----------------------------- | ----------------------------------------------- |
| `src/content/site.ts`         | Name, role, email, resume path, social links    |
| `src/content/projects.ts`     | Projects, media, featured flag, detail page text |
| `src/content/career.ts`       | Experience and education timelines              |
| `src/content/skills.ts`       | Skill groups on the home page                   |
| `src/content/navigation.ts`   | Top bar links and dropdowns                     |
| `src/lib/tech.ts`             | Technology names and their logos                |

### Adding a project

1. Put media in `public/media/projects/<slug>/`. Screen recordings should be MP4 with a WebP poster of the same name. To convert a GIF:

   ```bash
   ffmpeg -i demo.gif -vf "scale='min(1280,iw)':-2,format=yuv420p" -c:v libx264 -crf 26 -movflags +faststart -an demo.mp4
   ffmpeg -i demo.gif -vf "thumbnail=40,scale='min(1280,iw)':-2" -frames:v 1 demo.webp
   ```

2. Add an entry to `projects` in `src/content/projects.ts`. Set `featured: true` to show it on the home page and in the Projects dropdown.

### Adding a technology logo

Download the SVG (for example from [svgl.app](https://svgl.app)) into `public/icons/`, then register it in `src/lib/tech.ts`. When a logo has a separate version for dark backgrounds, pass it as the second argument to `logo()`.

## Deployment

Deployed on Vercel. Every push to `main` builds and publishes automatically.
