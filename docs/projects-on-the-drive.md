# Projects on the external drive

What the external drive held, what became of each project, and what it would take to finish
the ones still waiting. Companion to [projects-to-pursue.md](projects-to-pursue.md): that
file is the backlog of things already known about, this one is the record of the sweep.

- **Rescued**: now in the portfolio.
- **Ready to rescue**: runs today, nothing blocking, just not done yet.
- **Needs hardware or a GPU**: cannot be screenshotted on this machine as it stands.
- **Needs keys**: blocked on a credential that belongs to that project.
- **Not worth reviving**: with the reason, so this is not re-litigated later.

Drive: `/mnt/wsl/PHYSICALDRIVE1p1/home/binyam`, about 400 GB. 46 git repositories and a
similar number of folders that were never under version control.

Last updated: 2026-09-24.

## Rescued

### UAE Companies
From the internal disk rather than the drive, but it had never reached the portfolio.
225 companies with filters, a map, commute routing and provenance on every field.
Live at [uae-companies.vercel.app](https://uae-companies.vercel.app), repo
[uae-companies](https://github.com/BinyamMamo/uae-companies). Its Vercel deployments were
behind the login wall, so a public domain was attached to the project.

### Prompt Privacy Shield
`binux/mvp/redact`. Chrome extension that blocks a paste containing secrets into ChatGPT,
Gemini or Claude. Re-pushed under [BinyamMamo/redact](https://github.com/BinyamMamo/redact)
rather than the second account it was on. One fix was needed to demo it: ChatGPT serves a
different composer to logged-out sessions, so a selector was added.

### Arcade
`work/alabs/games/{cutzrope,snake-xenzia,tejie}`, none of which were under version control.
Now one repo, [arcade](https://github.com/BinyamMamo/arcade), and one deploy at
[arcade-jet.vercel.app](https://arcade-jet.vercel.app). Cutzrope and Snake Xenzia are live;
Tejie is in the repo but not linked from the arcade, see below.

## Ready to rescue

### Tejie's production build
- **What exists**: a complete colour sort puzzle in PixiJS 8 that runs under `npm run dev`,
  with a level generator that unsolves a solved board so every level is solvable.
- **What is missing**: the built bundle loads without a single console error and then never
  mounts its canvas, so the page stays black. Setting the Vite target to `esnext` fixed the
  build failing on PixiJS's top-level await, but not the blank render.
- **Why**: it is the most algorithmically interesting of the three games and it is already
  in the deployed repo, so it only needs the build fixed to go live.
- **Next steps**: bisect between the dev and built bundles, starting with whether
  `app.init()` ever resolves in the built output.

### Colab Copier
- **What exists**: `tmpbin/colab-copier`, a finished Manifest V3 extension that adds per-cell
  copy buttons to Google Colab (code only, output only, whole cell) plus a copy-all action.
- **What is missing**: a repo, a README, and screenshots taken against a real notebook.
- **Why**: small, genuinely complete, and it demonstrates the same extension skills as
  Prompt Privacy Shield in a much smaller surface.
- **Next steps**: load it unpacked against a public notebook, capture, publish.

### my-raycast
- **What exists**: a Raycast-style launcher for Linux in bash: an fzf menu over clipboard
  history, `pet` snippets and btop, a clipboard-watching daemon, and an installer that
  registers the shortcut.
- **What is missing**: a repo, a README, and a way to screenshot a terminal UI that reads
  well in a portfolio.
- **Why**: it is real daily-use tooling and the only shell work in the collection.
- **Next steps**: record a short terminal session rather than trying to screenshot it, and
  review `nohup.out` first, which is a captured clipboard log.

### Morph
- **What exists**: `binux/mvp/morph`, a Manifest V3 extension that injects a chat sidebar
  into any site, asks a model for CSS from a description and applies it live, with per-domain
  persistence and undo, redo and version history.
- **What is missing**: it has never been under version control at all, has no README, and
  needs a Pollinations key typed into the sidebar before it does anything.
- **Why**: the idea is good and the state handling is further along than it looks.
- **Next steps**: `git init`, a README, then a capture of one real before and after.

### Resume Tailor
- **What exists**: `mvp/tailor_cv`, a Manifest V3 extension that scrapes the job posting on
  the current page, has Gemini rewrite a stored CV against it, and renders a tailored PDF
  from a side panel with `@react-pdf/renderer`. It has been built at least once.
- **What is missing**: a repo, a README, and a Gemini key on the options page.
- **Why**: recruiters understand the problem immediately, and it screenshots in two minutes.
- **Next steps**: rebuild, load unpacked, capture against `mvp/index.html`, which is the
  mock job board it was tested with.

### Upcycling feed
- **What exists**: `ud/reuse`, an Express backend that turns a photo of a piece of waste into
  a three-step upcycling tutorial with generated images and narration, and a React feed that
  plays the steps vertically.
- **What is missing**: a repo, a README, error handling, and the key below. It falls back to
  a hard-coded mock response when no key is set, which is what makes it demoable at all.
- **Why**: the only genuinely new product idea in the `ud/` tree.
- **Next steps**: publish with the mock path as the default, and put the real key in a
  serverless route rather than the bundle.

### SignVerse
- **What exists**: on the internal disk, not the drive. An English to ASL prototype: gloss,
  a pose lookup per word from WLASL, concatenation with blending, and a browser pose viewer.
  12 commits, actively worked on.
- **What is missing**: a remote, and an honest framing. It looks up one sign per word and
  fingerspells the rest, so it is not fluent ASL and no deaf signer has reviewed it.
- **Why**: it is the interesting half of a hard problem, and the write-up can say exactly
  what does not work yet.
- **Next steps**: push it, then capture the pose viewer playing one sentence.

### SignSpeak
- **What exists**: on the internal disk at `jobs/pf/signspeak`, 48 commits, a remote already.
  A Duolingo-style ASL alphabet trainer: webcam, MediaPipe hand landmarks, a TensorFlow.js
  classifier with confusion handling for lookalike letters, lessons, streaks, a leaderboard,
  and Supabase-backed progress. It ships a `drops-app` mini-game alongside.
- **What is missing**: a deploy that works end to end. Its Supabase project needs to be
  awake, since free projects pause after a week idle.
- **Why**: the most complete product of the lot, and the client-side ML is real.
- **Next steps**: confirm Supabase, deploy to Vercel, capture the webcam flow.
- The copy of SignSpeak on the external drive is older and should be ignored.

## Needs hardware or a GPU

### ReVoice
- **What exists**: `binux/hasab/revoice`, the deepest engineering on the drive. A pipeline
  that takes a video URL, splits vocals from music with Demucs, transcribes with HasabAI or
  faster-whisper, translates, narrates with Edge TTS or an XTTS clone of the original
  speaker, then mixes the narration over the music-only stem and muxes it back with
  subtitles. Provider abstraction, automatic fallbacks, caching, about twenty documented
  environment overrides, and the best README on the disk.
- **What is missing**: a repo, and a clip that can actually be published. Every finished
  render in `outputs/` is a dub of someone else's YouTube video, which is the same rights
  problem already recorded for Dub.
- **Why**: it is the most technically substantial thing here by a distance.
- **Next steps**: re-render one short clip that you own, on the GPU, with the two keys set,
  and lead the write-up with a before and after rather than a live demo.

### NotebookLM, self-hosted
- **What exists**: `mvp/notebooklm.local`. Upload PDFs, documents or YouTube transcripts into
  notebooks and chat against them with inline citations, plus quizzes and flashcards. The
  retrieval is the real thing: heading-aware chunking, bge-m3 embeddings in LanceDB with a
  per-notebook BM25 index beside them, query rewriting, hybrid fusion, then a cross-encoder
  rerank. Runs fully offline against Ollama.
- **What is missing**: version control of any kind, tests, and a first run that pulls about
  2 GB of model weights.
- **Why**: architecturally the strongest piece of engineering on the drive.
- **Next steps**: put it in a repo, point it at a model that is already pulled locally
  rather than prefetching a new one, then record a video instead of deploying it. Nothing
  free hosts LanceDB, a reranker and an LLM.

### Jindoblu
- **What exists**: `mvp/jindoblu`, a Godot 4 local-multiplayer party game with four working
  mini-games behind a menu, player setup and win screen. No TODOs anywhere in it.
- **What is missing**: Godot is not installed here, so it cannot be opened or exported.
- **Why**: the only non-web, non-AI thing in the collection, which is exactly why it is
  worth having.
- **Next steps**: install Godot 4, export to HTML5, deploy the static export.

### brb
- **What exists**: `work/mvp/brb`, an Expo haircut try-on app: photograph your head, pick a
  style, a generative model renders it, and a before and after slider compares them. The
  interesting part is a four-provider abstraction over ComfyUI, fal, Gemini and Pollinations.
- **What is missing**: it is three screens, it needs a device with a camera, and its keys are
  `EXPO_PUBLIC_` prefixed, which means they ship inside the client bundle.
- **Why**: the only mobile app, and the provider layer is worth showing.
- **Next steps**: rotate those keys first. Then decide whether it is worth a device session.

### Kirar
- **What exists**: `code/experiments/kirar`, browser pitch detection for the kirar and
  guitar, with autocorrelation written from scratch, plus a Basic-Pitch CLI that emits a
  JSON the web app can load for time-synced notes.
- **What is missing**: a repo and a README. The web half needs only a microphone, so this is
  closer to ready than the rest of this section.
- **Why**: hand-rolled DSP is unusual and it is entirely self-contained.
- **Next steps**: publish the browser half; leave the Python CLI documented but local.

## Needs keys

- **ReVoice**: `HASAB_API_KEY` and `GEMINI_API_KEY`, plus a GPU.
- **Upcycling feed**: `GEMINI_API_KEY`. It runs without one thanks to a mock path.
- **Morph**: a Pollinations key, typed into the sidebar.
- **Resume Tailor**: a Gemini key, entered on the options page.
- **brb**: any one of Gemini, fal or Pollinations, or a local ComfyUI.

## Not worth reviving

**Excluded by decision**: everything Home Assistant (`ha/car_occupancy`, `ha/parking`,
`ha/voiceagentJan26`, the openwake folders), everything NFC (`ud/nfc/*`), the UD Home
Assistant dashboard, and the drive's stale copy of SignSpeak. These are either already
covered, superseded by the internal disk, or the user has ruled them out.

**Already in the portfolio, in older form**: `mvp/medscribe` and `deploy/hakim_front` are
Hakim Click, `horan/hms` and `horan/hms_backend` are Horan HMS, `ud/nfc/id-demo` is UD
Students, `ud/coughmamba/yamnet` is the YAMNet cough classifier. Of these, `mvp/medscribe`
is the fullest copy of Hakim Click and is the one worth keeping.

**Other people's work**: `softwares/STT` is a bootcamp team repo with 228 commits, none of
them yours. `ud/coughmamba/PANN_PROD` sits under a teammate's account. The `wyoming-*`
folders are untouched upstream clones. `Documents/project/raduavatar` is course code with a
thin layer on top.

**Scratch experiments**, each a handful of lines that tries one model and prints the result:
`binux/hasab/yeha`, `work/alabs/clonevoice`, `work/python/whisperx`, `work/python/comfy/grcomfy`,
`tmpbin/asr/EthioASR`, `tmpbin/seamlessm4t/speech2speech`, `tmpbin/talkpal`, `tmpbin/spli`,
`softwares/amharictts`, `learn/rag/gemini` (14 lines, and contains no RAG despite the name).
Most are better told as a paragraph inside the ReVoice or brb write-ups than as entries.

**Templates and duplicates**: `work/nodejs/expo/first` is the stock Expo template,
`Android/projects/emptyproject` the stock Flutter one, `work/nodejs/mvp/Learn2Sign` an
earlier AI Studio export of SignSpeak, `tmpbin/copy-colab` an earlier Colab Copier,
`softwares/chappm_whisper-amharic` a near-copy of `amscribe`, and `work/alabs/games/anadaj`
and `angryman` are empty folders.

**A note on the Amharic work**: `softwares/amscribe` contains something original, a regex
layer that rejoins the morphemes a CTC model splits apart, with an override table for
specific mis-splits. Everything else Amharic on this drive wraps a public checkpoint. No
Amharic model was trained anywhere on the disk, and any write-up should say so plainly.

## Secrets found on the drive

Paths and kinds only, no values. None of these are in git history, so nothing needs
rewriting, but the drive is a backup of unknown provenance and they should be rotated.

| Where | What |
| --- | --- |
| `work/python/whisperx/main.py` line 8 | a Hugging Face token hardcoded in source |
| `mvp/medscribe/id_ed25519_hf`, `.pub` | a private SSH key pair in a repo root |
| drive root: `fal.fal`, `groq.groq`, `deepseek.deep`, `elleven.labs` | single-line files holding provider keys |
| drive root: `ghp_token`, `hf.download.token`, `medscribe.git.token` | access tokens |
| `ud/signin/cookies.txt` | captured session cookies |
| `frigate/docker-compose.yml`, `ha/car_occupancy/main.py` | an RTSP camera password and MQTT credentials, inline |
| `work/mvp/brb/.env` | keys prefixed `EXPO_PUBLIC_`, which ships them in the client bundle |
| `.env` files in `revoice`, `reuse/backend`, `morph`, `signspeak` | untracked, excluded from every copy made during the rescue |
