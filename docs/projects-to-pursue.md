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
- **What exists**: step 1 of 7 of a selfie-to-avatar pipeline (Vite, MediaPipe, a Python GPU server). Private repo `BinyamMamo/twin`.
- **What is missing**: steps 2 to 7 (mesh fitting, rigging, expressions, voice, lip sync).
- **Why**: a very visual portfolio piece that builds on avatar-kit.

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
- **What exists**: video dubbing pipelines (yt-dlp, Demucs, Whisper, NLLB, TTS). Revoice has a FastAPI backend and a React frontend; Dub (`~/products/es/ind`) has a strong README.
- **What is missing**: a GPU host or a Colab notebook, and a short demo video.

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

## Needs keys

Nothing yet. Projects are added here when a deployment is blocked on API keys or credentials that belong to that project. Keys from one project are never reused for another project's database.

## Fix before linking

- **RIMA**: a working Gemini key (`NEXT_PUBLIC_GEMINI_API_KEY`) ships in the client JavaScript, so anyone can use your quota. Move the calls behind a server route and rotate the key. Also, any message containing "hi" (for example "which") gets a canned greeting, because the check matches the substring.
- **VisionAid app repo** (`VISUAL-AID/experiment`, private): `.env` with `GEMINI_API_KEY` is committed. Rotate the key and remove it from the history.
- **Clixa Tools**: the assistant says it has no breast cancer staging tool, although the staging tool exists. Category chips draw over the search dropdown on the home page.
- **LabAId**: the public repo has a committed `.env` with a Gemini API key. Rotate the key in Google AI Studio, then remove the file from the repo and its history.
- **PeerSphere** and **QuestEureka**: Firebase config is committed in `.env`. Firebase web config is not secret on its own, but check the security rules before linking the repos.
- **Dead Vercel deployments** (404): `signspeak`, `mindwave`, `funkey`, `lab` and the old Astro `portfolio`. Delete the ones you do not plan to fix.
- **Wrong homepage links on GitHub**: `yakal` points to yakal-jade.vercel.app and `PeerSphere` to peer-sphere-lake.vercel.app, and both return 404.
- **Horan HMS README**: its module table still says "Not started", and it tells you to run `pnpm start:dev`, but the script is now called `dev`.
