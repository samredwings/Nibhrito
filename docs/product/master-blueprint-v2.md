# AI Story Companion Master Build Blueprint

01 / product

## Product definition and boundaries

A single-user, locally controlled creative companion — not a social platform, not a research lab, not a collection of disconnected feature screens.

What it is

An Android-first app where the owner creates or imports fictional adult characters, plays open-ended or story-led roleplay with one or several of them, talks by voice, and views immersive first-person scenes — with memory that survives restarts.

What it is not

Not a trained-from-scratch model (it directs existing open models), not a public service (no other users, no signup funnel), and not a promise of photorealistic free video — the deferred list in §14 is explicit about that.

Hard boundaries

Fictional adult characters only; the owner supplies or licenses every imported story and reference image; content stays within local law; no real-person likenesses without rights; every claim the UI makes (memory used, provider chosen, data leaving the device) must be true.

Owner
:   Single user, product owner, and operator of the AI coding agent — one person.

Budget
:   Zero recurring cost. Free tiers and owner hardware only. Paid upgrades are never required for the core loop.

Platforms
:   Android (daily use) + desktop browser (authoring and administration). One codebase.

Source
:   Current live repository, stabilized and consolidated — not a rewrite. History: three earlier codebases exist; §12 decides what survives.

Success metric
:   A session reopened after a week still knows the characters, the facts, and where the story left off — provable by test, not by README.

02 / catalogue

## Complete feature catalogue

Every requested feature, numbered and owned. Priority is the build phase: P0 core loop · P1 modes & continuity · P2 language & presence · P3 advanced. Nothing is deleted from scope; low-priority items are scheduled, not dropped.

### A · Character & cast

| ID | Feature | What it does | Acceptance criterion (verified when…) | Pri |
| --- | --- | --- | --- | --- |
| F-01 | Character creation | Full persona builder: name, age (adult), appearance, personality, backstory, voice style, boundaries, preferences, default language. | …a character is created, edited, deleted, and reloaded with every field intact. | P0 |
| F-02 | Visual identity | Attach an uploaded image/video as reference, or generate a portrait from a description; store a visual profile sheet per character. | …a reference asset is attached, shown in chat headers, and survives app restarts. | P0 |
| F-03 | Cast & relationships | Define several characters and named relationships between them; relationships are queryable context. | …a cast of 3+ characters with relationships round-trips through the API. | P1 |
| F-04 | Character templates | Save a character as a template; duplicate into new sessions. | …a duplicated character starts a session with independent memory. | P2 |

### B · Sessions & chat

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-05 | Mode 1 — character-first | Pick a character and a premise; open-ended roleplay where the plot can turn anywhere. | …a session started this way continues across restarts with full history. | P0 |
| F-06 | Mode 2 — story-first | Import a story the owner controls; map characters; play through it as a living scene that can diverge on request. | …an imported story is chunked, searchable, and its excerpts appear in the prompt audit. | P1 |
| F-07 | Mode 3 — ensemble-first | Give several characters + relationships; the app drafts the scenario and starts the play. | …a generated scenario lists every cast member with a speaking turn in the first 10 messages. | P1 |
| F-08 | Streaming chat | Replies stream token-by-token; stop button; regenerate; retry on provider failure with a visible reason. | …a reply streams, is interruptible, and the saved message matches what was shown. | P0 |
| F-09 | Multi-character scenes | Several characters in one conversation with speaker labels, turn order, and per-character knowledge (who knows what). | …character A does not reveal a fact marked private to character B in a scripted test. | P1 |
| F-10 | Scene director | Tracks location, time, present characters, and scene state; user can change scene mid-session. | …a scene change is reflected in the next reply and the state panel. | P1 |
| F-11 | Interactive intimate scenes | A phase-gated scene engine driven by the written situation: intensity setting, escalation ladder, climax/release phase, aftercare — state machine, not canned text. | …a scripted scene walks all phases, respects the intensity setting, and logs each transition. | P2 |
| F-12 | Session control | Pause/resume, rename, archive, branch a session from any message, export a session as text. | …a branch diverges without mutating the original timeline. | P1 |

### C · Continuity (the differentiator)

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-13 | Memory system | Typed memories (fact / episode / relationship / character / world) with importance, scope, and expiry; fully editable. | …memories are created, listed, edited, pinned, deleted — and deletion changes later replies. | P0 |
| F-14 | Memory audit | Every reply shows which memories and lore entries were injected; "remember this?" review for suggested facts. | …the audit list for a reply exactly matches what the context builder logged. | P0 |
| F-15 | Rolling summary | Compact conversation summary maintained in background; bounded context, never the whole transcript. | …a 200-message session's prompt stays within the token budget. | P0 |
| F-16 | Relationship growth | Affinity/intimacy levels and an event timeline per character–user pair; milestones and mood affect tone. | …a scripted interaction raises the tracked level and the reply tone measurably changes. | P1 |
| F-17 | Character learning | Characters accumulate attitudes, pet names, habits, and private jokes — user-approved, never silent. | …an approved learned trait appears in later replies; a rejected one never does. | P1 |
| F-18 | Lorebook | Keyword-triggered world entries with priority and scope, injected only when relevant. | …an entry triggers on its keyword and is absent from the audit when not triggered. | P0 |

### D · Bengali & language

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-19 | Standard Bengali output | Characters reply in চলিত মান বাংলা — standard written register, not regional dialect — with the requested genre vocabulary when the owner enables it. | …a 10-scenario evaluation set is scored by the owner and passes the agreed rubric. | P2 |
| F-20 | Story corpus library | Upload owner-controlled Bengali/English story files; Unicode-normalized, chunked, tagged, and retrieved as style/context excerpts (retrieval — not weight training). | …uploading a file makes its style observable in replies and auditable in the prompt. | P1 |
| F-21 | Style & vocabulary controls | Editable style guide and vocabulary list per character/session; language switch mid-session. | …toggling language changes the reply language on the next turn. | P2 |

### E · Presence (voice, call, POV)

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-22 | Voice notes | Push-to-talk in, spoken reply out, captions shown, text always available as fallback. | …a spoken exchange produces the same persisted turns as a typed one. | P2 |
| F-23 | Voice call mode | Continuous call UI on the same session engine: turn-taking, mute, end call, transcript saved as messages. | …a 5-minute call appends correctly ordered turns and ends cleanly on Android. | P2 |
| F-24 | Video-style call | Short "video calls": character portrait/avatar with audio-reactive motion — honest framing, not synthetic live video. | …a call runs 60+ seconds without frame drops on the target device. | P3 |
| F-25 | POV scene mode | Full-screen first-person presentation of the current scene: framing, motion, choices, scene state — the screen is the window, not a headset claim. | …entering POV mode shows the current scene state and exits without losing the timeline. | P2 |

### F · Visual generation

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-26 | Scene & portrait images | Optional image generation for portraits and scene beats, via the provider gateway, stored locally. | …a generated image is linked to the session and survives restart; failures surface honestly. | P2 |
| F-27 | Appearance consistency | Reference-conditioned generation from the character's visual profile; measured identity drift; LoRA training only as an owner-run experiment. | …same-character portraits are scored for consistency on a fixed test prompt set. | P3 |

### G · Platform

| ID | Feature | What it does | Acceptance criterion | Pri |
| --- | --- | --- | --- | --- |
| F-28 | Provider panel | Local GGUF/Ollama, Hugging Face, and OpenRouter adapters with live capability and health display; explicit selection; no silent fallback. | …switching providers changes the next reply's metadata; a dead provider shows a recoverable error. | P0 |
| F-29 | Media library | All generated and uploaded assets in one gallery, linked to sessions/characters, deletable. | …deleting an asset removes it from storage and UI. | P1 |
| F-30 | Export / import everything | One-file backup of characters, sessions, memories, corpus, settings; restore on a fresh install. | …a round-trip export→wipe→import restores a working session with memory intact. | P1 |
| F-31 | Privacy indicators | Every reply badge shows: local or cloud, which provider, latency. Cloud use requires prior opt-in. | …a local reply never touches the network in a capture test. | P0 |
| F-32 | Settings & tone controls | Intensity, verbosity, response style, auto-memory policy — all per session and per character. | …changing intensity alters the scene engine's escalation ladder measurably. | P1 |
| F-33 | Local auth | Single-owner local profile with PIN/biometric app lock; no public signup, no server accounts. | …wrong PIN blocks the app; correct PIN restores the session list. | P0 |
| F-34 | Job system | Persisted queue for long jobs (image, corpus processing) with progress, cancel, and retry. | …a cancelled job leaves no orphan rows or temp files. | P2 |

**Traceability rule.**

A feature is DONE only when its acceptance criterion passes in a repeatable test or scripted walkthrough. A route, table, README bullet, or UI button alone marks it PLANNED or PARTIAL — the earlier codebases died of believing otherwise.

03 / architecture

## System architecture — one modular monolith

Keep the current repository and stack; reorganize into feature modules with strict boundaries. One API, one engine, many presentations.

**Character-first**F-01, F-05

**Story-first**F-06, F-20

**Ensemble-first**F-03, F-07

**Session engine**context builder → provider gateway → persistence → memory update

The one response pipeline

1. Validate session & ownership
2. Assemble context (§05 order, token-budgeted)
3. Select provider (user's explicit choice)
4. Stream reply to client
5. Persist both turns, complete
6. Update rolling summary
7. Propose memory changes (review queue)
8. Return metadata: provider, model, latency, injected memories

Every mode, every medium — text, voice, POV — calls this pipeline. No mode has its own generation path.

Target monorepo map

```
apps/
  web/        # Next.js UI + Capacitor Android shell (kept)
  api/        # Express modular monolith (kept, reorganized)
  worker/     # long jobs only when F-34 lands
packages/
  contracts/  # Zod schemas + shared types (single source)
  domain/     # character, scene, memory, relationship rules
  context-engine/  # prompt assembly, budgets, retrieval
  ai-providers/    # ollama | gguf | hf | openrouter adapters
  media/      # file validation, local storage
docs/
  FEATURES.v2.md  STATUS.md  ADR/  DATA-MIGRATION.md
```

### API surface (v2 contract)

| Group | Endpoints | Notes |
| --- | --- | --- |
| Characters | CRUD + visual profile + templates | All owned by the single local user; ownership checks stay (cheap, future-proof) |
| Sessions | CRUD, participants, branch, archive, export | One session model for all three modes |
| Messages | list (paginated), send → generate, regenerate, edit-saved | **send is the wired pipeline** — closes the known gap where message storage and generation were separate routes |
| Memory | CRUD, review queue, audit-by-message | Audit endpoint returns exactly what the builder injected |
| Lorebook | CRUD, keyword test | Priority + scope respected in assembly |
| Corpus | upload, list, delete, search | Chunking + tagging pipeline behind a job |
| Media / Jobs | asset CRUD, job status/cancel/retry | Local storage default |
| Providers | list, health-check, select, test | Never auto-switch without opt-in |

04 / data

## Data model (target schema)

Evolved from the 23-model schema of the largest earlier codebase, minus what never shipped, plus what the catalogue needs. Migrations forward only — after Phase 0 backup.

| Entity | Purpose / key fields | Feeds |
| --- | --- | --- |
| LocalProfile | Single owner, PIN hash, preferences, consent flags | F-33 |
| Character | Persona fields, language, voice style, boundaries, template flag | F-01 |
| VisualProfile | Reference assets, consistency notes, generated portraits | F-02, F-27 |
| Session | Mode, title, language, status, summary text, scene pointer | F-05/06/07 |
| Participant | Character per session, display name, knowledge scope | F-09 |
| Message | Role, participant, content, provider metadata, injected-context log | F-08, F-14 |
| Memory | Type, scope, importance, expiry, status (approved/pending) | F-13 |
| LorebookEntry | Keywords, priority, enabled, scope | F-18 |
| Relationship | Pair, type, level, timeline events | F-03, F-16 |
| SceneState | Location, time, present, phase, intensity | F-10, F-11 |
| CorpusDoc / Chunk | Uploaded story, tags, embedded chunks | F-20 |
| MediaAsset / GenerationJob | Files and long-running work with progress | F-26, F-34 |
| ProviderConfig | Adapter, endpoint, key reference (never the key itself) | F-28 |

**Schema-drift rule.**

This project's history includes hand-patched schema scripts and a drifted migration chain. From Phase 0: every change is `prisma migrate dev`, reviewed in the diff, with a backup taken first. No patch scripts, no manual SQL against the live DB.

05 / memory

## Context & memory engine

The feature that makes characters feel alive — and the one the earlier builds never wired end to end. It is application engineering, not model magic.

Per-reply assembly order

1. Core identity + response style of each speaking character
2. Session premise, active scene state, present cast, relationship levels
3. Latest N turns (verbatim)
4. Rolling summary of older turns
5. Approved memories — ranked by relevance × importance, top-K within budget
6. Triggered lorebook entries
7. Retrieved corpus excerpts (style/context)
8. The user's message

A deterministic builder with unit tests on every ordering rule. The full assembled prompt is logged per message for the audit view (F-14).

Memory lifecycle

1. **Capture:** after each turn the model may propose facts/relationship changes as structured output
2. **Review:** pending items queue for one-tap approve/edit/reject (auto-approve only for types the owner enabled)
3. **Use:** retrieval scores keyword + recency + importance; budget-capped
4. **Decay:** unpinned episodic memories lose importance over time; facts persist
5. **Control:** every memory visible, editable, pinnable, deletable — deletion provably changes future replies

No "infinite memory" claim anywhere in the UI. The honest claim is: curated, inspectable, budgeted.

**Example budget (7–8k-token window):**

identity 400 · scene/state 300 · last 12 turns 2,400 · summary 500 · memories top-8 ≈ 800 · lore hits ≈ 400 · corpus excerpts ≈ 600 · user message — remainder. Numbers are config, not code.

06 / ai

## AI provider strategy — free, plural, honest

One gateway, four adapter classes, explicit selection, visible capability. "Free" and "available" are provider facts that change; the app reports them, never promises them.

```
interface ProviderAdapter {
  id: string
  capabilities(): Cap[]            // text | vision | tts | stt | image
  healthCheck(): Promise<Status>   // latency, queue, quota signals
  generateText(req): AsyncIterable<Token>
  supports(task): boolean
}
// errors are typed: Quota | Asleep | Refused | Timeout | Network
// gateway logs provider, model, latency, tokens per message
```

| Class | Default role | Designed-around limits |
| --- | --- | --- |
| Local GGUF / Ollama (PC host or phone) | Default private text path — offline, zero cost, uncensored-capable open weights | RAM/speed tiers shown per model; phone-class quality honestly labeled; PC-host mode documented |
| Hugging Face (Inference API / Spaces) | Optional remote text + image experiments | Quota, sleeping Spaces, queues, model rotation — surfaced in health check |
| OpenRouter free models | Optional remote text, widest model choice | Free-list rotation, rate limits, routing/data notes per model shown before enabling |
| Image / TTS / STT adapters | Presence & visual features (P2+) | Free capacity is the bottleneck; every job is queued, cancellable, and failure-honest |

Selection & fallback policy

Fallback happens only if the owner enabled it, and the switch is announced in the reply badge. A private local conversation is never silently routed to a cloud provider. Failed generation returns a typed error with a retry — never a canned fake reply pretending to be the character.

Secrets

Keys live in the Android Keystore / OS keychain or a git-ignored `.env.local`; never in code, never in Git history. Phase 0 includes a secret-scan of the repo. The public repo contains zero real keys.

07 / bengali

## Bengali language & story corpus engine

Standard written Bengali (চলিত মান বাংলা) as a first-class output, with the owner's own story library steering style — by retrieval, with training as a separate experiment.

**Upload**txt / md / epub the owner controls

**Normalize**Unicode NFC, paragraph boundaries

**Chunk & taggenre, register, vocabulary markers**

**Retrieve**relevant excerpts into §05 slot 7

Register control

A per-character style guide states: standard written Bengali, no regional dialect slips, consistent pronoun forms, genre-appropriate vocabulary when enabled. The guide is a config file the owner edits — not hard-coded prompts scattered across routes.

Quality gate (F-19)

A fixed 10-scenario evaluation set with a simple rubric (register correctness, consistency, character voice, no dialect drift, correct Bengali orthography). Scored by the owner each time the model changes. Feature F-19 is DONE only when the rubric passes.

**What retrieval is not.**

Corpus retrieval changes prompts, not weights. It measurably steers style and vocabulary. Actual fine-tuning (LoRA) for voice or image identity needs capable hardware and is scheduled as an owner-run P3 experiment with go/no-go criteria — not as a free-tier promise.

08 / presence

## Voice, calls, and POV — staged realism

"Feels alive" is a latency, turn-taking, and continuity problem before it is a graphics problem. Each stage reuses the same engine and transcript.

Stage 1 · voice notes

### Push-to-talk in, speech out

STT → pipeline (§03) → TTS with captions and interrupt. Bengali STT/TTS quality is evaluated first with the §07 rubric; text fallback is always one tap away.

Stage 2 · voice call

### Continuous conversation

Call UI over the same session: barge-in, mute, end. Transcript persists as ordinary messages, so memory keeps growing during calls.

Stage 3 · POV scenes

### Full-screen first person

The screen becomes the scene: framing, ambient motion, choice buttons driven by SceneState and the intimate scene engine (F-11). Explicitly a screen mode — no headset or haptics claim.

**Video-style calls (F-24, P3):**

Character portrait with audio-reactive motion and blink/idle animation. Honest label in UI. True generated live video stays on the deferred list until hardware and free capacity make it real.

09 / android

## Android delivery

Keep the Capacitor shell for v2.0 — a rewrite buys nothing yet. Treat it as a real app, not a wrapped page.

Shell hardening checklist

- Back button = real navigation, not app exit
- Safe-area insets, keyboard resize, immersive POV mode
- App-private storage for DB, media, corpus; no public folders
- Lifecycle: process death restores the open session exactly
- Offline states and provider-down screens for every view
- Debug + release APK builds reproducible from a clean checkout

When native (Kotlin/Compose) is justified

- On-device GGUF inference needing NDK-level integration
- Sub-100ms audio paths for call realism
- Foreground services for long local jobs

Until then: Capacitor. Any native migration is its own phase with a data-migration doc — never a side task.

10 / cost

## Infrastructure & cost model

Zero recurring cost is an architectural requirement, not a hope. Pick the deployment shape early — it changes the design.

| Shape | Stack | Cost | Trade-off |
| --- | --- | --- | --- |
| A · Phone-first | API + SQLite-equivalent on device via Capacitor; local GGUF or remote text providers | 0 | Simplest to run daily; on-device model quality limited |
| B · Home PC host (recommended) | API + Postgres on the owner's PC; phone connects over LAN/tunnel; PC runs Ollama | 0 | Best quality/cost ratio; PC must be on for sessions |
| C · Free container | API on a free-tier host; DB on free-tier Postgres | 0 | Sleep/wake, quotas, key handling; acceptable as an experiment only |

**Recommendation:** build the engine provider- and host-agnostic (it already is, per §06), ship daily use on Shape B, keep Shape A as the offline fallback. Postgres stays for the PC host; the schema (§04) is portable enough that Shape A is a configuration, not a rewrite.

11 / roadmap

## Phased delivery with exit gates

Five phases. No phase starts until the previous gate passes. Every task is one vertical slice an AI agent can complete in a session — with an acceptance test attached.

Phase 0
Rescue & freeze

### Make the current repo safe and known

Backup, branch, inventory, build verification, secret scan, package-manager unification, schema-drift audit. Nothing is deleted; nothing new is built.

Gate: clean-checkout build matrix (web + Android) passes; inventory doc marks every earlier feature working / partial / stub / missing.

Phase 1
Core loop

### The one flow that makes it a product

Character CRUD → session → wired send-message pipeline (closing the storage/generation gap) → context engine with memory + lorebook injection → audit view → provider panel with one working adapter. All F-0 P0 features.

Gate: end-to-end test: create character, chat, restart app, reopen session — profile, history, and injected memories all present and audited.

Phase 2
Modes & continuity

### Three doors, growing characters

Story-first import + corpus retrieval, ensemble mode with per-character knowledge, relationship growth, character learning with review queue, session branching, export/import.

Gate: a story-led 3-character session runs 50 messages with correct knowledge scoping and measurable relationship progression.

Phase 3
Language & presence

### Bengali, voice, and POV

Bengali evaluation and register control, corpus style steering, voice notes, voice call mode, POV scene presentation with the intimate scene engine, first image adapter.

Gate: Bengali rubric passes; a voice session and a POV session both persist through the same pipeline as text.

Phase 4
Advanced

### Only what proves itself

Video-style calls (avatar), job worker for long media, consistency experiments (reference-conditioned images, optional LoRA), each with go/no-go criteria and no quota surprises.

Gate: every long job is cancellable and budgeted; no feature ships claiming more than it does.

### Task backlog (agent-ready)

T-01

**Backup, branch, freeze**Full repo backup, tag `pre-v2`, branch `v2-main`. **Accept:** restore-from-backup rehearsed and documented.

T-02

**Build matrix**Clean checkout → install → type-check → tests → web build → Android debug APK. **Accept:** all green on a fresh clone; failures logged as inventory items.

T-03

**Feature inventory verification**Trace every claimed feature: screen → API → DB → response. **Accept:** inventory doc with the four states per feature.

T-04

**Hygiene: package manager, secrets, drift**One package manager; secret scan of history; audit patch scripts and drifted migrations. **Accept:** no real keys anywhere; migration chain documented.

T-05

**contracts + domain packages**Extract Zod contracts and domain rules from routes. **Accept:** routes import from packages; no inline duplicate schemas.

T-06

**context-engine package**Deterministic §05 builder with budget config. **Accept:** unit tests for ordering, budget cap, and memory ranking.

T-07

**Provider gateway + first adapter**Gateway, typed errors, health check; local GGUF/Ollama adapter. **Accept:** streaming reply + typed failure surfaced in UI.

T-08

**Wire the send-message pipeline**Close the gap: message send → context → provider → persist → metadata. **Accept:** audit endpoint matches builder log for the same message.

T-09

**Memory + lorebook injection & audit**F-13/14/18 wired through the engine. **Accept:** deleting a memory changes the next reply's audit.

T-10

**Rolling summary**Background compaction of old turns. **Accept:** 200-message session prompt stays within budget.

T-11

**Phase-1 E2E suite**Restart-survival test, provider-failure test, ownership test. **Accept:** suite green in CI or scripted run.

T-12

**Corpus ingestion pipeline**Upload → normalize → chunk → tag as jobs. **Accept:** a 5k-word file ingests and is searchable.

T-13

**Corpus retrieval into context**Slot-7 injection with audit. **Accept:** style of replies measurably shifts with corpus on/off.

T-14

**Bengali style guide + evaluation set**Config-file register guide; 10-scenario rubric. **Accept:** owner-scored rubric recorded per model change.

T-15

**Story-first mode**F-06 end to end. **Accept:** imported story beats appear in audit; divergence on request works.

T-16

**Ensemble mode + knowledge scoping**F-07, F-09. **Accept:** private-fact leak test passes across 3 characters.

T-17

**Relationship growth + learning queue**F-16, F-17. **Accept:** scripted interaction raises level; rejected trait never resurfaces.

T-18

**Voice notes**F-22. **Accept:** spoken turn persists identically to typed; interrupt works.

T-19

**Voice call mode**F-23. **Accept:** 5-minute call → clean end, ordered transcript, no Android lifecycle loss.

T-20

**POV scene view + intimate scene engine**F-25, F-11. **Accept:** phase transitions logged; intensity setting changes the ladder; exit preserves timeline.

T-21

**Image adapter + consistency test set**F-26, start of F-27. **Accept:** fixed prompt set scored for same-character consistency.

T-22

**Video-style call (avatar)**F-24. **Accept:** 60s stable on target device; honest UI label.

T-23

**Job worker**F-34. **Accept:** cancel leaves no orphans; retry is idempotent.

T-24

**Export / import everything**F-30. **Accept:** round-trip restore verified on a fresh install.

12 / governance

## Governance: never lose this app again

Three codebases were built and lost features between them. The fix is process, not more code.

### Consolidation decision (from the repository comparison)

| Source | Decision |
| --- | --- |
| IMG-VDO (largest, 23-model schema, Docker, tests, Android) | **Base codebase.** Stabilized in place; schema evolved forward per §04. |
| intimate-rp-studio (context/ai injection, free-provider fallback, docs discipline) | **Port the context-injection approach and docs conventions** into the engine — they were the only working memory-injection in any build. |
| image-video-storybook (older 12-model version) | **Reference only.** Its dashboard API contract was consistent where the larger build regressed — use it to fix the dashboard response shape. |
| Live repo's separate message-storage and generation routes | **Close the wiring gap** via the §03 pipeline — the single most important fix in Phase 1. |
| carnal-roulette (standalone, imported by nothing) | **Decide explicitly:** archive out of the main tree or integrate behind the §08 stage plan. Not left ambiguous again. |

### Documents that own the truth

FEATURES.v2.md

§02 of this blueprint, verbatim, versioned. Scope changes are edits with a version bump — never silent. Superseded versions are kept in `docs/history/`.

STATUS.md

One line per feature: state (planned/partial/done), phase, last verified date, next task ID. Updated at the end of every agent session.

ADR/

Short decision records: provider choices, deployment shape, native migration triggers. One page each: context → decision → consequences.

### AI-agent session protocol

1. Open every session with: current task ID, its acceptance test, and the files allowed to change.
2. Agent must inspect before editing and present a short plan + file list first.
3. One vertical slice per session. Mixing tasks is refused.
4. No destructive DB commands without a same-day backup and explicit owner approval.
5. Session ends with: tests run + results, diff summary, STATUS.md and task checkbox updated, next task named.
6. A feature marked done without its acceptance test passing is a defect, logged as such.

13 / risks

## Risk register & testing strategy

Known failure modes — most of them already lived through in this project's history.

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Free-tier model list/quotas change or vanish | High | Provider-agnostic gateway (§06); local path always functional; capability display, no lock-in |
| Hugging Face Spaces sleep / queue at call time | High | Health check before session; typed Asleep error; explicit fallback opt-in |
| Phone RAM too small for good local models | Medium | Shape B (PC host) as primary; model-size guidance in UI |
| Bengali STT/TTS quality below bar | Medium | Rubric gate before shipping F-22/23; text fallback always present |
| Identity drift in generated portraits | High | Consistency test set (T-21); P3 label; no UI promise beyond what scores show |
| Schema drift / hand-patched migrations (history!) | Medium | §04 rule: forward migrations only, backup first, drift audit in T-04 |
| Agent marks features done unverified (history!) | High | Acceptance-test traceability (§02) + session protocol (§12) |
| Another silent feature loss between rebuilds | High | FEATURES.v2.md as single source; STATUS.md states; consolidation decision frozen (§12) |
| Secrets leak into the public repo | Medium | T-04 secret scan; Keystore/env-only storage; public repo stays clean |

### Test strategy

Automated

- **Unit:** context builder (ordering, budget, ranking), memory decay, scene state machine transitions
- **Integration:** every API group against a throwaway DB; ownership and validation paths
- **E2E:** Phase-1 restart-survival script; provider-failure simulation; branch/export round-trip
- **Build:** clean-checkout matrix green before any merge

Human (the owner)

- Bengali rubric per model change (T-14)
- Presence feel: call latency, interrupt responsiveness
- Monthly walkthrough: random 3 sessions reopened, memory audited

14 / appendix

## Deferred list, sources, glossary

Explicit honesty about what is NOT promised, so nothing silently fails later.

Explicitly deferred / best-effort

- Real-time synthetic video of the character (avatar stands in, F-24)
- Guaranteed face identity across all generated media (measured, not promised, F-27)
- Fine-tuned weights for voice/image on free tiers (owner-run experiment only)
- Headset VR / haptics (POV is a screen mode by design)
- Any claim of "infinite memory" (budgeted, curated, audited — by design)

Glossary

- **Session engine** — the single §03 pipeline all modes share
- **Register** — চলিত মান বাংলা, standard written Bengali
- **Corpus** — the owner's uploaded story library used for retrieval
- **Knowledge scope** — which facts each character may reveal
- **Gate** — the exit test a phase must pass before the next begins

This blueprint consolidates: the owner's full requirements (three start modes, cast scenes, memory and growth, standard Bengali with a story corpus, voice and call presence, POV scenes, visual consistency, multi-provider free AI, Android-first, zero cost); the three earlier codebase comparisons (IMG-VDO as base, intimate-rp-studio's injection approach, image-video-storybook's dashboard contract); and the previously identified wiring gap in the live repository's conversation routes. It is the planning document — execution happens in the repository through the §12 protocol.
