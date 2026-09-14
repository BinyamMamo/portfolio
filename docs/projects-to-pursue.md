# Projects to pursue

Projects that are not on the portfolio yet, or are only partly there, and what it would take to get them there. Grouped so it is clear why each one is waiting.

- **Worth finishing**: promising ideas with real work behind them, but not done.
- **Hard to run**: probably working code that could not be started for screenshots without a lot of setup.
- **Needs keys**: blocked only on API keys or credentials that belong to that project.
- **Fix before linking**: live projects with a problem worth fixing first.

Last updated: 2026-09-14.

## Worth finishing

### CertiScan
- **What exists**: a React and Vite frontend for education certificate attestation (upload, QR verification, admin dashboard, chatbot, voice chat, payment modal) at [certiscan.vercel.app](https://certiscan.vercel.app), plus a small FastAPI backend using Azure AI Language ([certiscan](https://github.com/BinyamMamo/certiscan), [certiscan-backend](https://github.com/BinyamMamo/certiscan-backend)).
- **What is missing**: a real backend for the attestation workflow (accounts, document storage, verification records, QR issuing, payments), and wiring the frontend to it instead of mock data. The README is still the Vite template.
- **Why**: a concrete, real-world workflow with a clear demo story.
- **Next steps**: define the data model (applicant, document, attestation request, verifier), build the API, deploy it on Render, then replace the frontend mocks.

### twin
- **What exists**: step 1 of 7 of a selfie-to-avatar pipeline. Private repo `BinyamMamo/twin`.
  - The browser analyzes a selfie with MediaPipe: 478 face points, hair, skin and clothes masks, face proportions, glasses, and white-balanced skin, hair, eye and lip colors, with warnings for bad photos.
  - About 1,300 lines of analysis plus a 950-line screen, with unit and e2e tests on public-domain portraits.
  - A voice cloning experiment with Chatterbox fits the RTX 5050's 8 GB but runs slower than real time.
- **What is missing** (about 6 to 10 weeks in total):

  | Step | Work | Effort | GPU server |
  | --- | --- | --- | --- |
  | 2. Photo puppet | Your photo on a face mesh driven by the webcam, with blinking eyes, a mouth cavity and hair warping. The hardest graphics step | 1 to 2 weeks | No |
  | 3. Stylized cartoon | A cartoon fitted to your measurements, hair templates, a gallery | 1 to 2 weeks | No |
  | 4. Lip sync | A small audio-to-mouth-shape model in a Web Worker, with in-browser speech | About 1 week | No |
  | 5. Style profile | Guided recording of blink, sway and brow habits, a personal idle animation | About 1 week | No |
  | 6. Voice clone | FastAPI with Chatterbox, sentence streaming, loudness fixes | 3 to 5 days | Yes, or a rented GPU |
  | 7. Motion matching | Reusing recorded motion with smooth blends, mouth calibration | 1 to 2 weeks | No |

- **Why**: steps 2 to 4 alone, with no server, would make a standout demo that builds on avatar-kit.

### Greens Al Madina
- **What exists**: a Telegram Mini App and PWA for a Dubai restaurant with the full 471-dish menu in English and Arabic (`~/products/et/madina/mini`). The ordering flow is complete, but orders are simulated.
- **What is missing**: an order backend (orders, kitchen view, status updates, Telegram notifications).
- **Next steps**: a small API with Postgres and a Telegram bot for the kitchen, then a client demo.

### MedScribe (Hakim Click)
- **What exists**: a Next.js frontend (`HakimClick`, live at hakim-click.vercel.app) and a FastAPI backend (`hakimclick-backend`) that transcribes consultation audio and turns it into a structured clinical note with a PDF export.
- **What is missing**: both repos have 2 commits. Connecting them, deploying the backend and testing with real consultation audio.

### UD Students (digital ID card)
- **What exists**: an Expo app with NFC card emulation, reader mode, events, careers and a campus map (`~/ud/ud-students`, 25 uncommitted changes).
- **What is missing**: commit the pending work, and get approval from UD IT before it uses university systems.

### eml-search
- **What exists**: a backend with Postgres full-text search over medical email archives, PDF.js previews and docker-compose (`~/products/med/eml-search`).
- **What is missing**: finishing the search UI and packaging a demo dataset without real patient data.

### SignSpeak and Learn2Sign
- **What exists**: a Next.js sign language app with TensorFlow.js and MediaPipe (`signspeak`, its Vercel URL returns 404), and a Vite ASL learning studio with a pitch deck (Learn2Sign).
- **What is missing**: pick one, merge the best parts, and get a working recognition demo deployed.

### Revoice and Dub
- **What exists**: video dubbing pipelines (yt-dlp, Demucs, Whisper, NLLB, TTS). Revoice has a FastAPI backend and a React frontend; Dub (`~/products/es/ind`) has a strong README, and now `dub_colab.ipynb` for a Colab T4 GPU (uncommitted, not yet run).
- **What is missing**: a short demo made from a video you own the rights to. The only existing outputs are dubs of YouTube videos, which cannot be shown. Then a public repo, so the Colab link works for visitors.

### Aging GAN
- **What exists**: a CycleGAN trained on UTKFace (`~/aging-gan`, no repo) with a Gradio demo, a trained checkpoint (`serve.pt`, epoch 59) and now `aging_gan_colab.ipynb`. CPU inference works and produces aging, de-aging and round-trip sheets.
- **What is missing**: showable samples. UTKFace includes web and press photos, and some existing comparison sheets look like well-known people, so the portfolio does not use them yet. Use faces you have consent for, or a synthetic face set. The effect is also mild on some faces.
- **Next steps**: pick consented sample faces, publish a public repo with the notebook, then add it to the portfolio.

### YAMNet cough classifier
- **What exists**: on the portfolio with charts from the committed results (87% accuracy, macro F1 0.86 on 243 held-out clips). There is a Colab notebook on the `colab-notebook` branch of the private `yamnet` repo.
- **What is missing**: a public repo, so the Source and Colab buttons can show. The dataset needs `HF_TOKEN` (`CoughMamba/datasets`); check whether access is gated.

### Manim Generator
- **What exists**: a Colab notebook on the public `colab-notebook` branch, and three rendered clips on the portfolio.
- **What is missing**: merge the branch. The repo still uses the retired Gemini Python package, which the notebook replaces with `google-genai`. A Riemann sum prompt failed twice (an invalid Manim option, then busy servers), so the error retry loop could be smarter.

### Mindwave
- **What exists**: a React mental wellness micro-interactions app with face-api.js. Its Vercel URL returns 404.
- **What is missing**: fix the deployment and finish the core feed.

### SonicPay
- **What exists**: an Expo and Supabase demo of two-phone contactless payment (Windows `projects/sonicpay`, no git).
- **What is missing**: the payment handshake and a recorded demo.

### dawalker
- **What exists**: a Gymnasium environment where a pedestrian learns to reach a goal around obstacles (private repo `BinyamMamo/dawalker`).
- **What is missing**: the training example the README mentions, and a trained policy worth showing.

### Wails launcher
- **What exists**: a Raycast-style desktop launcher in Go and React with clipboard history and snippets (`launcher-clone`).
- **What is missing**: extensions, packaging and a release build.

## Hard to run

### QuestEureka (logged-in app)
- **Tried**: email signup on the live site. Firebase rejects it (`auth/operation-not-allowed`) and there is no demo or guest mode.
- **Blocked by**: only Google sign-in is enabled.
- **To fix**: enable email and password sign-in in the Firebase console and create a test account, or add a demo route. The portfolio screenshots come from a local build with made-up demo data.
- **Also unfinished**: Practice, Quests, Shop and Calendar are in the sidebar but have no pages. The upload page never calls the Gemini lesson generator. The course page shows its top bar twice. "Welcome Binyam" and "Notes on Motivation" are hardcoded. Opening `/dashboard` signed out shows a blank page.

### VisionAid (Flutter app)
- **Tried**: skipped the web build. The Windows Flutter install fails under WSL (CRLF line endings).
- **Blocked by**: camera, TensorFlow Lite and ML Kit plugins that do not run on the web.
- **To fix**: capture screens from an Android phone or emulator. The landing page still says the app is in development and shows a "Notify me" form instead of a download.

### Hakim Click (answer service)
- **Tried**: asking questions on the live site, reopening saved conversations, and waiting about 8 minutes for hakim-api.onrender.com.
- **Blocked by**: the web app sends questions to a Tailscale address that now returns 502 (the local service stopped), and the Render deployment never answered.
- **To fix**: restart the clinical service (Postgres with pgvector in Docker, plus Ollama) or get the Render deploy answering, then recapture the chat, a cited PDF page, the conversation list and the usage page. The portfolio currently shows the landing page, its built-in cited answer demo, and the sign-in screen.

## Needs keys

Keys from one project are never reused for another project's database, so these wait for their own credentials.

### Funkey (original Express app)
- **Needs**: `MONGODB_URI` (also used for sessions), `API_KEY` (Gemini), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`. No `.env` or `.env.example` exists anywhere on this machine.
- **Also fix before deploying**:
  - `vercel.json` builds `src/server.js`, which does not exist (the app starts from `src/app.js`). That is why funkey.vercel.app returns 404.
  - The session secret is hardcoded as `'your_secret_key'` in `src/app.js`.
  - The React rewrite (funkey-frontend.vercel.app) calls `http://localhost:2748` for songs, so song pages load without lyrics for every visitor. It also has no piano mode.
  - The `funkey` and `Funkey-Frontend` repos are private; only `funkey-backend` is public.

### LabAId (AI features)
- **Needs**: a new Gemini key (the current one is public, see below) and a current model name. Photo uploads call `gemini-2.0-flash-exp`, which now returns 404.
- **Also**: opening a tool page directly returns 404, because there is no SPA rewrite rule (clicking through from home works).

## Fix before linking

- **RIMA**: a working Gemini key (`NEXT_PUBLIC_GEMINI_API_KEY`) ships in the client JavaScript, so anyone can use your quota. Move the calls behind a server route and rotate the key. Also, any message containing "hi" (for example "which") gets a canned greeting, because the check matches the substring.
- **VisionAid app repo** (`VISUAL-AID/experiment`, private): `.env` with `GEMINI_API_KEY` is committed. Rotate the key and remove it from the history.
- **Clixa Tools**: the assistant says it has no breast cancer staging tool, although the staging tool exists. Category chips draw over the search dropdown on the home page.
- **LabAId**: the public repo has a committed `.env` with a Gemini API key, and the same key ships twice in the deployed JavaScript bundle. Rotate the key in Google AI Studio, move the calls behind a server, then remove the file from the repo and its history.
- **PeerSphere**: the mock sessions are dated April 2025, so today the calendars and tutor dashboard look empty. The "suggested tutors" page shows "No Tutors Found". Moving the mock dates relative to today would fix both.
- **Flight Plan**: no deployment could be found. The README mentions Cloudflare Pages but names no project, and flightplan.pages.dev is an unrelated site. The repo is private.
- **UD smart building dashboard**: ha-dashboard-delta.vercel.app now serves a different app (a Thai "Pawin Home" dashboard), so the portfolio has no live link. CCTV is a "coming soon" placeholder and the parking feed is black. Live readings need `VITE_HA_URL` and `VITE_HA_TOKEN`.
- **KSK Homes**: the facilities carousel uses unrelated stock photos (a walrus, the Statue of Liberty), and the portal's housekeeping, reports and performance pages return 404. The staff portal opens without a login.
- **UD Students web build**: the two Android-only NFC libraries crash on web, and `App.tsx` is missing a `SafeAreaProvider`. The screenshots come from a patched copy with stubs.
- **Flight Plan**: the page is titled with the student's first name, so it should stay private or get a generic version before any public deploy. The portfolio uses screenshots only.
- **Chess Turtle**: the pieces need a font with chess symbols; on some Linux setups they render as escape text.
- **PeerSphere** and **QuestEureka**: Firebase config is committed in `.env`. Firebase web config is not secret on its own, but check the security rules before linking the repos.
- **Dead Vercel deployments** (404): `signspeak`, `mindwave`, `funkey`, `lab` and the old Astro `portfolio`. Delete the ones you do not plan to fix.
- **Wrong homepage links on GitHub**: `yakal` points to yakal-jade.vercel.app (and yakal.onrender.com), and `PeerSphere` to peer-sphere-lake.vercel.app. All return 404. Yakal's live site is [yakal.me](https://yakal.me).
- **Yakal**: yakal.me sleeps when idle (Render shows a "waking up" page on the first visit), although `render.yaml` asks for a starter plan. The seed data has no session rows, so session counts, tutor earnings and parent payments are empty. The K-12 Mathematics course has placeholder assignments ("test task", "t", "a"), and the seeded tutor chat is a moderation test. Better demo data would make every dashboard presentable.
- **Horan HMS** (horantech org, so these are suggestions for the team):
  - The root README says Next.js 14, the API on port 3000, `pnpm start:dev` (which no longer exists) and every module "Not started". `frontend/.env.example` has `NEXT_PUBLIC_WS_URL=http://localhost:000`.
  - The frontend `dev` script hardcodes port 3001 and deletes `.next` on every start; backend `pnpm dev` always runs `docker compose up`.
  - `backend/.env` holds live Telegram, Gemini, Groq, Chapa and Cloudinary keys with bot polling on, so running it locally as-is polls the real bots.
  - UI bugs:
    - The reservations and check-in stat cards still show fake "+2.4%" trends (`ReservationsStats.tsx`).
    - Seasonal pricing shows amounts as percentages such as "+6750%" (`seasonal-pricing/page.tsx:189`).
    - Invoice categories BREAKFAST and TELEPHONE show raw keys like `Enums.Category.BREAKFAST`.
    - Reservation detail says "Tax (10%)" while invoices charge 10% service plus 15% VAT.
    - The housekeeping cards read 98% done and 99% cleaning at once.
    - The Amharic dashboard still has English strings.
    - In the guest Mini App, the check-out field overflows at 390px wide and the paid page uses emoji.
