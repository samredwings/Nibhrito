# Freeze the seams once. Then ten lanes never wait.

01 / name

## Name recommendation: Nibhrito

Working English app name: **Nibhrito**. Bengali script: **নিভৃত**. The word conveys a private, secluded space — intimate without putting explicit subject matter in the brand.

Why it fits

Short enough for a phone launcher, culturally rooted, and aligned with the product promise: a personal space where stories continue. The brand does not promise a public platform, a marketplace, or paid cloud features.

Technical label suggestion

Display name: `Nibhrito`
Android application id: `app.nibhrito.companion`
Workspace scope: `@nibhrito/*`
Repository slug: `nibhrito`

Important caveat

This is a creative recommendation, not a trademark, Play Store, domain, or package-name availability check. Keep it as a working name until you check any public release plans. For a private APK the app label and package id can be chosen now.

### Other good options

| Name | Sense | What it emphasizes |
| --- | --- | --- |
| Nibhrito · নিভৃত | private / secluded | Personal, quiet, intimate space — **recommended**. |
| Golpoghor · গল্পঘর | story room | Warm and clearly story-led; less companion-like. |
| Chhowa · ছোঁয়া | touch | Short, warm, evocative; may sound more like a lifestyle brand. |
| Ontor · অন্তর | inner self / heart | Minimal and poetic; less distinctive at first glance. |

02 / blueprint

## Is the master blueprint final?

**Yes as the product-scope baseline; no as the only build document.** Keep *AI Story Companion — Master Build Blueprint v2.0* unchanged as the feature catalogue. Add this parallel-build playbook beside it. Do not keep revising the feature scope while implementation begins; changes after the freeze go through a small RFC.

**The existing blueprint already covers the product vision.**

It records all 34 features, their acceptance criteria, architecture, context/memory, provider strategy, Bengali, Android, cost constraints, phases, and risks. This addendum does not remove or replace any feature. It answers the missing execution question: how different AI coding agents can work at once without sharing unfinished code.

### Five build-time decisions to add, not reopen the scope

| Decision | Recommended baseline | Why freeze it now |
| --- | --- | --- |
| Runtime/deployment | Local/home-computer API and model first; phone connects over private home network. Hosted free tiers optional, never required. | Prevents cloud hosting and secret management from leaking into every lane. |
| Client strategy | Keep the current Next.js + Capacitor shell through initial delivery; revisit native Kotlin only with a tested need. | Avoids a costly simultaneous rewrite. |
| Data store | Keep the current schema and migration history for Phase 0; freeze a v1 contract only after backup and drift review. | Prevents parallel agents writing conflicting migrations. |
| Package manager | Use the manager indicated by the verified root lockfile; one lockfile only. | Do not assume a manager from an old README or casually regenerate locks. |
| Content settings | Never default a relationship type or secretly change the user’s chosen setting; keep fictional-character assumptions explicit and user-controlled. | Removes the dangerous legacy behavior of inferring a relationship from a generic request. |

**“No one has to wait” has a precise meaning.**

Lane implementation and lane-level tests can run concurrently after the contract is frozen. Final integration, conflict resolution, and APK verification still require a short serialized merge/release pass. That unavoidable integration step is not a reason for lanes to block one another while building.

03 / seam

## One short serial step: freeze the interfaces

This is the only planned dependency. Do it once, review it, commit it, and then all lanes can work independently against it.

PHASE 0.5 · one owner · one pull request · merge before any parallel lane

## Create the shared contract kit

Assign one coding agent and one human reviewer. The agent inspects the actual current branch, makes no broad feature changes, and produces the files below. Once approved, lanes treat them as read-only.

#### A · Request/response contracts

Zod schemas and inferred TS types for character, session, participant, message, memory, lorebook, corpus, asset, job, provider health, settings, and typed errors. Shared by API, UI, tests.

#### B · Stream contract

One chat stream envelope, e.g. `delta`, `done`, `error`, `heartbeat`. The same events drive typed chat, voice transcripts, and future call UI.

#### C · Ports (interface only)

Repository, provider, context, media-storage, job-queue, speech, and session-service interfaces. A lane may implement its port but cannot redefine it.

#### D · Schema & migration owner

Audit the actual DB; create or document one compatible baseline. One designated owner controls Prisma schema and migrations. Other lanes use ports, fixtures, and fakes.

#### E · Mock API + fixtures

Local deterministic server for every contract route, with success, empty, and failure fixtures. UI, Android, and QA lanes work without waiting for the real API.

#### F · Test and folder boundaries

Decide test command, formatting, package manager, error map, branch naming, and the exact directory ownership table in §06.

### The central interfaces

```
// Shared stream events — names and fields frozen in packages/contracts
 type StreamEvent =
   | { type: "delta"; text: string }
   | { type: "done"; messageId: string; provider: string; model: string;
       latencyMs: number; dataLeftDevice: boolean; injectedMemoryIds: string[]; injectedLoreIds: string[] }
   | { type: "error"; code: AppErrorCode; retryable: boolean; message: string }
   | { type: "heartbeat" };

// Provider port: concrete adapters implement it; the API depends only on this interface
 interface ProviderAdapter {
   id: string;
   capabilities(): Capability[];
   health(): Promise<HealthStatus>;
   generate(input: GenerationInput, signal: AbortSignal): AsyncIterable<StreamEvent>;
 }

// Context port: input already fetched; pure assembly, so memory lane can test without a DB
 interface ContextAssembler {
   assemble(input: ContextInput): Promise<ContextBundle>;
 }

// Rule: a UI lane can render mock events; an API lane can use fake providers/repositories.
// Neither has to wait for another lane's implementation.
```

#### Seam exit checklist

- All lane contracts have a named owner and version; imports compile.
- Mock server answers UI requests and can simulate provider down, empty history, and stream error.
- Every lane has a separate directory owner; overlapping ownership is resolved before parallel work.
- Clean install and baseline tests pass; no secrets or real user data enter fixtures.
- The owner commits this checkpoint and tags it `contract-v1`.

04 / work lanes

## Independent lanes: the work map

One lane = one branch/worktree, one model session, one owned folder set, one acceptance test. The model suggestions are a starting assignment, not a claim that one provider is inherently better. Swap assignments freely; preserve ownership boundaries.

L1

**Persistence adapters**Repository implementations, queries, ownership checks, test database fixtures

Claude or ChatGPT

ports only

L2

**Context & continuity engine**Memory ranking, prompt-budget assembly, summaries, lore triggers, provenance logs

ChatGPT or Claude

pure functions

L3

**Provider gateway**Local GGUF/Ollama, Hugging Face, OpenRouter, health/errors, test fake

Gemini or ChatGPT

ports only

L4

**HTTP / stream orchestration**Route wiring, send-message pipeline, validation, SSE, cancellation, auth

Grok or ChatGPT

fakes only

L5

**Web UX**Character builder, session modes, chat timeline, memory drawer, provider panel

ChatGPT or Grok

mock API

L6

**Bengali corpus & evaluation**Unicode normalization, file ingestion, chunks, retrieval, standard Bengali test rubric

Local model + human review

isolated package

L7

**Voice interfaces**STT/TTS ports, push-to-talk UI state, captions, interruption, transcript mapping

Gemini or Claude

mock speech

L8

**Media & background jobs**Local asset store, metadata, image adapter port, progress/cancel/retry jobs

Gemini or local

fake worker

L9

**Android / Capacitor hardening**App identity, lifecycle, back navigation, safe areas, debug APK build pipeline

ChatGPT or Grok

web stub

L10

**Independent QA / documentation**Contract tests, fixtures, acceptance-test script, feature traceability and release checklist

One reviewer model

no prod edits

**Important for the local “unrestricted” model:** it can implement an isolated, spec-defined package such as Unicode normalization, chunking, or pure memory ranking. Treat it like any other code generator: no secrets, no direct writes to the protected main branch, run tests, inspect diffs, and do not rely on it to decide product policy or architecture.

05 / briefs

## Paste-ready briefs, one per lane

Each block is a complete, self-contained instruction. Paste it into a fresh session for that model, together with the repository and the frozen contract. Every brief states what it owns, what it must not open for writing, which mocks to use, and the test that proves it is finished.

L1Persistence adaptersClaude or ChatGPT

owns
:   `apps/api/src/repositories/` and its tests

never writes
:   `packages/contracts/`, `prisma/schema.prisma`, routes, UI

proof
:   Repository integration tests against a disposable test database

```
You are implementing lane L1 (persistence adapters) of Nibhrito, a private single-user AI story
companion. Read the project README, docs/contracts.md, and docs/lanes/L1.md before any edit.

OWNERSHIP
- You may create and edit files only under apps/api/src/repositories/ and its adjacent test files.
- packages/contracts/ is frozen: read it, import it, never modify it.
- prisma/schema.prisma is owned by the schema owner. If you need a schema change, stop and write
  docs/rfc/RFC-.md describing the change and why the existing model cannot serve.

TASK
Implement the repository ports for: character, visual profile, session, participant, message,
memory, lorebook entry, relationship, scene state, corpus document and chunk, media asset, job,
and provider configuration.

REQUIREMENTS
1. One module per aggregate. Every read and write takes an explicit owner identifier; no ambient
   global user. A foreign identifier must behave exactly like a missing row.
2. Return contract types from packages/contracts, never ad-hoc shapes.
3. Cursor-based pagination only. No unbounded queries.
4. Timestamps come from the database. Never accept a client-supplied timestamp.
5. No HTTP concerns, no prompt strings, no provider calls in this layer.
6. Write the test fixtures you need, but no real personal data and no secrets.

ACCEPTANCE TESTS YOU MUST ADD
- Create-read-update-delete round trip for every aggregate.
- Ownership rejection: a foreign id returns not-found for every method.
- Deleting a session removes dependent rows and leaves no orphans.
- A 500-message pagination walk returns each message exactly once.

FINISH BY REPORTING: files created or changed, tests added, the exact command to run them, and any
RFC you opened. Do not claim a task is complete without a passing test run.
```

L2Context & continuity engineChatGPT or Claude

owns
:   `packages/context-engine/`

never writes
:   `packages/contracts/`, anything touching a database, network, or file system

proof
:   Pure unit tests with no I/O at all

```
You are implementing lane L2 (context and continuity engine) of Nibhrito. Read docs/contracts.md
and docs/lanes/L2.md first.

OWNERSHIP
- You may create and edit files only under packages/context-engine/.
- The ContextAssembler port in packages/contracts is frozen. Implement it; do not redefine it.
- This package is pure: it receives already-fetched data and returns a prompt bundle. No database,
  no network, no file system, no environment variables, no clock reads except through an injected
  clock. It must be testable with plain objects.

BUILD
1. assemble(input): produce ordered blocks — character identity, scene state and present cast,
   recent turns, rolling summary, ranked memories, triggered lorebook entries, retrieved corpus
   excerpts, then the user message. Apply a configurable token budget and record every block
   dropped for budget, with the reason.
2. Memory ranking: relevance x importance x recency with deterministic tie-breaking and a top-K cap.
3. Lore triggers: keyword match, priority order, enabled and scope filters.
4. Summary compaction: a pure function that folds oldest turns into a bounded summary string; any
   model call happens outside this package.
5. Decay: unpinned episodic memories lose importance on a schedule; factual memories do not decay.
6. Provenance: every block lists the source ids that produced it so the UI can audit a reply.

ACCEPTANCE TESTS YOU MUST ADD
- Block order asserted individually and as a whole.
- Budget exhaustion drops the lowest-priority blocks first and reports each drop.
- Ranking is stable for shuffled input with equal scores.
- A memory scoped privately to character A never appears for character B.
- Identical input produces identical token counts.

FINISH BY REPORTING: files, tests, test command, and the knobs a future maintainer can tune.
```

L3Provider gatewayGemini or ChatGPT

owns
:   `packages/ai-providers/`

never writes
:   `packages/contracts/`, routes, schema, UI

proof
:   Recorded HTTP fixtures; no live network call in any test

```
You are implementing lane L3 (AI provider gateway) of Nibhrito. Read docs/contracts.md and
docs/lanes/L3.md first.

OWNERSHIP
- You may create and edit files only under packages/ai-providers/.
- The ProviderAdapter port and StreamEvent type are frozen.

BUILD ADAPTERS
- local Ollama over HTTP, streaming, with model discovery.
- local GGUF endpoint compatible with llama.cpp, with documented launch requirements.
- Hugging Face inference or Space endpoint; map unreachable or sleeping endpoints to the proper
  error code rather than a generic failure.
- OpenRouter with free-model selection; map rate limiting to the quota error code.
- A fake adapter used by other lanes: deterministic output, scriptable, able to emit every error
  code on demand.

RULES
1. Every failure maps to a defined error code with a correct retryable flag. Raw SDK errors never
   escape this package.
2. health() is cheap, hard-timeout bounded, and never throws.
3. Streaming is incremental and cancellable through an AbortSignal; after abort, no further events.
4. No network call at import time and none in tests. Credentials arrive through an injected config
   object, never from a hard-coded literal and never logged.
5. No automatic fallback between providers here. Selection is a caller decision.

ACCEPTANCE TESTS YOU MUST ADD
- Each adapter produces the correct event sequence from recorded fixtures.
- Each error path maps to the right code and retryable flag.
- Abort mid-stream stops emission immediately.
- The fake adapter reproduces every error code, so other lanes can test failure handling.

FINISH BY REPORTING: files, tests, and a short docs file stating how to run a local model and what
each adapter requires. Never state that a provider is permanently free or always available.
```

L4HTTP & stream orchestrationGrok or ChatGPT

owns
:   `apps/api/src/routes/`, `apps/api/src/services/`, `apps/api/src/sse/`, middleware

never writes
:   `packages/contracts/`, package implementations, schema, web UI

proof
:   API tests with injected fake repositories, fake context assembler, fake provider

```
You are implementing lane L4 (HTTP and stream orchestration) of Nibhrito. Read docs/contracts.md,
docs/lanes/L4.md, and the existing API bootstrap before editing.

OWNERSHIP: apps/api/src/routes/**, apps/api/src/services/**, apps/api/src/sse/**, apps/api/src/middleware/**
NEVER WRITE: packages/**, prisma/**, apps/web/**, repository implementations

Build routes for character/session/participants/messages/memories/lorebook/corpus/media/jobs/providers
and local PIN auth. The send-message endpoint is the central path: validate → load owned session and
context input through injected ports → assemble context → call the selected provider → emit stream
 events → persist turns → update summary → queue memory proposals → return provider and provenance metadata.

RULES
- Every input and output uses frozen contracts. Do not duplicate schemas or invent fields.
- Every dependency is injected into a route factory. No global Prisma/provider singleton in route code.
- Foreign-owned resources respond the same as missing resources.
- Map typed app errors to HTTP status in one tested table.
- SSE supports heartbeat, AbortSignal on disconnect, and cancellation. Do not log user message text.
- A failed generation never fabricates a character reply. Persist the user turn with a retry state.

ACCEPTANCE TESTS
- Happy path through fake ports: send input → deltas + done event → one persisted reply.
- Provider error emits typed error, user turn remains, no assistant reply is invented.
- Client disconnect aborts generation and leaves no dangling stream.
- Foreign ownership returns not-found on every protected route.
- IDs in done-event provenance exactly equal the fake context assembler output.

DONE: lane test command passes with fakes only; list routes, tests, and commands. Do not wire real
provider implementations in this lane; the bootstrap owner does that after merge.
```

L5Web product experienceChatGPT or Grok

owns
:   `apps/web/src/app/` and feature folders except voice; web styles and web tests

never writes
:   `apps/web/android/`, Capacitor config, API, package implementations, contracts

proof
:   Component/E2E tests using frozen mock API; usable at phone width

```
You are implementing lane L5 (web UI) of Nibhrito. Read docs/contracts.md, docs/mock-api.md,
and docs/lanes/L5.md. Use the mock server only; the live API may not exist yet.

OWNERSHIP: apps/web/src/app/**, apps/web/src/features/{characters,sessions,chat,memory,providers}/**,
apps/web/src/styles/**, UI tests. Exclude apps/web/src/features/voice/** and apps/web/android/**.
NEVER WRITE: apps/api/**, packages/**, prisma/**, Capacitor/Android config.

SCREENS
1. Library/dashboard: recent sessions, search, start Character / Story / Ensemble session.
2. Character builder: editable identity/profile, reference image upload, language/tone settings.
3. Chat timeline: stream deltas, stop, retry, regenerate, clear speaker labels for multi-character turns.
4. Context drawer: pending memory proposals, approve/edit/reject, pinned facts; per-reply list of injected
   memory/lore/corpus IDs from the done-event metadata.
5. Provider panel: capabilities, health, local/cloud indicator, explicit selection, typed failure states.
6. Settings: local PIN lock, privacy state, export/import entry point, accessibility and text size.

RULES
- Import types from contracts. Never invent fields; render unknown errors accessibly.
- Every network operation has loading, empty, offline, and retry states.
- Keep unsent text on provider error. Never auto-switch a local session to a remote provider.
- At 360px viewport, no horizontal page scroll; keyboard and safe-area inset must not cover composer.
- Use semantic controls, visible focus, screen-reader labels, and reduced-motion support.

ACCEPTANCE TESTS
- Each of the three start paths opens a session via mock.
- Streaming, stop, provider error, and retry states render correctly.
- Memory drawer reflects exact provenance fixture; rejecting a memory removes it from pending list.
- Screenshot-free component tests at 360px + keyboard-visible state assert composer remains reachable.

DONE: lane tests pass using mock server, not an API branch. List screens, files, accessibility checks,
and exact command.
```

L6Bengali corpus & evaluationLocal model + owner review

owns
:   `packages/bengali-corpus/`, Bengali-only test fixtures containing synthetic examples

never writes
:   context-engine, provider prompts outside its package, UI, personal story files

proof
:   Unicode and retrieval unit tests; owner-reviewed Bengali rubric

```
You are implementing lane L6 (Bengali corpus tools) of Nibhrito. Read docs/contracts.md,
docs/lanes/L6.md, and the Bengali quality requirements. Do not ask for or commit the owner's stories.

OWNERSHIP: packages/bengali-corpus/** only. No user corpus, copyrighted uploads, secrets, or explicit
story text belongs in Git. Use short synthetic fixtures for tests.

IMPLEMENT
- File parser for supported text formats already named in contracts (start with plain UTF-8 text;
  add EPUB only if a maintained preinstalled parser already exists in the repo).
- Unicode normalization to NFC; preserve paragraph boundaries; report malformed input without loss.
- Deterministic chunking with configurable size/overlap; metadata for language, register, and source ID.
- Retrieval scoring API over supplied chunks (keyword baseline first; embedding provider remains optional).
- Standard written Bengali evaluation harness with an owner-editable rubric file and 10 synthetic
  test prompts. The harness reports scores; it must not claim a model passed without a recorded run.

RULES
- This package retrieves text at generation time; it does not fine-tune model weights.
- Preserve the original imported file as a local asset; never overwrite it during normalization.
- Tests do not include user-uploaded stories or sensitive content.

ACCEPTANCE TESTS
- Normalization handles Bengali combining marks and punctuation consistently.
- Chunking is deterministic; reconstructing ordered chunks preserves all original paragraphs.
- Retrieval returns a relevant chunk for a known fixture and respects a maximum result count.
- Unsupported/binary files fail with a clear typed result, not a crash.

DONE: offline package tests pass; document supported formats, size caps, and rubric use.
```

L7Voice interfacesGemini or Claude

owns
:   `packages/speech/`, `apps/web/src/features/voice/`

never writes
:   chat feature folders, API routes, provider implementations, Android native files

proof
:   Mock speech adapters and UI state-machine tests; no paid/live voice calls in tests

```
You are implementing lane L7 (voice) of Nibhrito. Read docs/contracts.md, docs/lanes/L7.md,
and the stream-event contract. The UI/API may be unfinished; implement against the frozen ports and fakes.

OWNERSHIP: packages/speech/** and apps/web/src/features/voice/** only.
NEVER WRITE: apps/api/**, packages/contracts/**, packages/ai-providers/**, chat feature folders,
apps/web/android/**.

IMPLEMENT
- SpeechToText and TextToSpeech interfaces in the speech package only if not already frozen; if frozen,
  implement those interfaces. Ship fake implementations for tests.
- Push-to-talk states: idle → recording → transcribing → sending → speaking → interrupted/ended/error.
- Captions and transcript mapping: voice input/output becomes ordinary user/character messages in the same
  session. No separate voice-only history.
- Barge-in/stop, mute, permission-denied, unsupported language, offline, and provider-unavailable states.
- Surface Bengali voice capability as unknown/unavailable until the selected adapter reports it; do not
  promise Bengali quality based only on the model name.

ACCEPTANCE TESTS
- Mock voice round trip creates the same ordered session messages as typed chat.
- Stop during speaking stops playback immediately and leaves the transcript intact.
- Denied microphone permission leaves typed chat usable.
- Every state has a visible, accessible UI label.

DONE: package and UI tests pass with fake audio; no live credentials, no generated voice assets committed.
```

L8Media storage & long jobsGemini or local model

owns
:   `packages/media/`, `apps/api/src/workers/`, media/job tests

never writes
:   schema, repository adapters, API routes, web UI, provider gateway

proof
:   Temporary-directory tests + fake generator; no external image/video service in CI

```
You are implementing lane L8 (media storage and jobs) of Nibhrito. Read docs/contracts.md and
docs/lanes/L8.md before editing.

OWNERSHIP: packages/media/** and apps/api/src/workers/** only.
NEVER WRITE: prisma/**, apps/api/src/repositories/**, routes, apps/web/**, packages/ai-providers/**.
Use storage and job-queue ports from contracts; do not add columns or change the database schema.

IMPLEMENT
- Local, app-private storage adapter with opaque IDs, content-type and size checks, safe filenames,
  and metadata. Never trust an uploaded path or extension alone.
- Job runner interface for image generation and corpus processing; use fake generators in tests.
- Persisted job state transitions: queued → running → succeeded / failed / cancelled.
- Progress events, cancellation, retry with idempotency key, and cleanup of temporary files on every exit.
- Provider-specific image generation stays behind the provider capability interface; if unsupported,
  return a typed unsupported-capability error. No implicit remote upload.

ACCEPTANCE TESTS
- Upload with invalid MIME/oversized body rejected before storage.
- Cancel leaves no orphan job row, temp file, or partially published asset.
- Retry with the same idempotency key does not duplicate the asset.
- Temporary-directory round-trip saves and retrieves a file; delete removes it.

DONE: tests run fully offline. Document storage location and backup behavior; never claim an image
provider is free or reliable unless the current provider reports that fact.
```

L9Android / Capacitor hardeningChatGPT or Grok

owns
:   `apps/web/android/`, Capacitor config, Android build docs

never writes
:   web UI, API, packages, Prisma schema, app feature behavior

proof
:   Clean checkout produces a debug APK; device/emulator checklist documented

```
You are implementing lane L9 (Android shell) of Nibhrito. Read docs/lanes/L9.md and inspect the
existing Capacitor/Android project before changing it. This is a stabilization task, not a Kotlin rewrite.

OWNERSHIP: apps/web/android/**, apps/web/capacitor.config.*, docs/android/** and Android-specific
build scripts only. Do not edit web app screens, API, package code, or database.

IMPLEMENT / VERIFY
- Set display name Nibhrito and application ID app.nibhrito.companion only after the owner approves
  the package ID. Keep app display branding separate from internal DB/API names.
- Back button navigates predictably; safe-area and keyboard-resize behavior documented and tested.
- Confirm app-private local asset path and lifecycle behavior; do not copy private files into public media.
- Make debug APK build repeatable from a clean checkout and document Java/Android SDK versions.
- Add a manual test checklist for process death/reopen, offline host, keyboard, permissions, and screen
  rotation. If a test requires a physical device, label it manual rather than claiming it passed.

ACCEPTANCE TESTS
- Clean Android build command succeeds using installed dependencies.
- APK installs on emulator/device and opens the existing web shell.
- System back does not immediately kill an active session without confirmation.
- App resume after process kill returns to the last session screen without corrupting local data.

DONE: attach command output and tested environment details; do not silently change product architecture.
```

L10Independent QA & governanceOne reviewer model; rotate if needed

owns
:   `docs/`, cross-lane contract tests, CI checks, integration reports

never writes
:   production feature implementation or other lane-owned code

proof
:   Contract/acceptance suite, traceability report, clean-checkout release checklist

```
You are implementing lane L10 (independent QA and governance) of Nibhrito. Your job is to find
missing, inconsistent, or unverified behavior — not to implement product features.

OWNERSHIP: docs/**, cross-lane tests under tests/contracts/** and CI workflows. Do not edit production
implementation files. If a production change is needed, create a finding for the owning lane.

BUILD
- Contract tests that assert request/response shapes against packages/contracts and mock API.
- One end-to-end acceptance script for: create character → create session → send message → verify
  stream and provider metadata → reopen session → verify history and memory provenance.
- Failure tests: provider down, provider quota, local server unreachable, user cancels mid-stream,
  invalid upload, app offline.
- docs/STATUS.md: one row per feature; planned / partial / verified; date and test command required for verified.
- docs/DECISIONS.md or ADRs for frozen deployment, local/cloud privacy, migration ownership, package name.
- docs/RELEASE-CHECKLIST.md: clean install, Android build, data backup/restore, secret scan, no placeholder replies.

ACCEPTANCE TESTS
- Every feature in the master blueprint has a status and a trace to a ticket and test.
- “Verified” is rejected if no test command and evidence are recorded.
- Contract suite can run against fakes without internet or real API keys.
- Weekly integration report lists passing, failing, and blocked tests with exact repro commands.

DONE: publish the report and the reproducible commands. Do not change another lane's source to make a
test pass; file a ticket to the owner instead.
```

06 / ownership

## Folder ownership, branches, and merge rules

This is how ten agents avoid overwriting one another. The owner is accountable for the folder, even if another model finds a bug outside that folder. Discoveries are filed to the owner; they are not opportunistically edited.

| Lane | Owned paths | Read-only shared paths | Forbidden writes |
| --- | --- | --- | --- |
| L1 persistence | `apps/api/src/repositories/**`; repository tests | Contracts, Prisma schema, fixtures | API routes/services, UI, contracts, schema |
| L2 context | `packages/context-engine/**` | Contracts; synthetic fixtures | All app folders, DB, network, contracts |
| L3 providers | `packages/ai-providers/**` | Contracts; recorded HTTP fixtures | All app folders, contracts, schema |
| L4 API | `apps/api/src/routes/**`, services, SSE, middleware | Contracts and port interfaces | Package implementations, schema, web |
| L5 web UI | `apps/web/src/**` except voice; web assets/tests | Contracts, mock API | Android config, API, packages, schema |
| L6 Bengali | `packages/bengali-corpus/**`; synthetic tests | Contracts; empty/synthetic corpus fixtures | Real user corpus, routes, UI, context package |
| L7 voice | `packages/speech/**`; `apps/web/src/features/voice/**` | Contracts, fake audio fixtures | Chat UI, API, provider implementation, Android config |
| L8 media/jobs | `packages/media/**`; `apps/api/src/workers/**` | Contracts; fake generators | Schema, repositories, routes, UI, provider package |
| L9 Android | `apps/web/android/**`, Capacitor config, Android docs | Web build output | Web source, API, packages, schema |
| L10 QA/docs | `docs/**`, `tests/contracts/**`, CI workflows | All code for review/test | Production implementation files |

Branch pattern

One isolated worktree or branch per lane: `lane/L1-persistence`, `lane/L2-context` … `lane/L10-qa`. A different AI never writes into another lane’s worktree. The agent reports a commit hash or patch; the owner/reviewer opens a PR.

Shared files

Only the seam owner edits `packages/contracts/**`, the lockfile, root config, and Prisma schema/migrations. Other agents report a missing field/interface as an RFC. A contract amendment is reviewed, versioned, and broadcast to every lane before any implementation depends on it.

**One physical Git repo can still support parallel work.**

Use separate branches/worktrees or let each model produce a patch bundle. Do not have several coding agents editing the same checkout at once. “Parallel” means independent branches and independent tests, not concurrent writes to the same files.

07 / mocks

## Mock-first development: the dependency breaker

Mocks are not temporary throwaways. They are a stable test fixture for every lane and a permanent way to reproduce errors without paying for, or waiting for, a remote provider.

UI mock

### API contract simulator

Serve fixture payloads for every screen: empty, normal, long text, multiple cast members, provider offline, quota exhausted, and network timeout. Include a streaming fixture with deltas and a stop event.

API mock

### Ports as injectable fakes

Routes receive fake repositories, a fake context engine, and a fake provider. Any path can be tested without PostgreSQL, Ollama, Hugging Face, or OpenRouter being available.

Media mock

### Recorded test assets

Generate tiny synthetic local image/audio fixtures at test time. Never check private user images, story files, API keys, or real conversations into Git.

### Minimum shared fixtures

```
fixtures/
  character.standard.json        # synthetic, non-real character profile
  session.single.json            # one character, standard written Bengali setting
  session.ensemble.json          # three synthetic characters and relationships
  messages.short.json            # turns with speaker ids and timestamps
  context.audit.json             # ids of injected memory/lore/corpus sources
  providers/
    ollama.stream.ndjson          # deterministic delta/done sequence
    hf.asleep.json                # sleeping/unavailable endpoint
    openrouter.quota.json         # rate limit/quota response
    all.error-codes.json          # one fixture per typed error
  corpus/
    synthetic-bengali.txt         # short fabricated text for Unicode/chunking tests
    synthetic-english.txt
```

**Fixture rule:** fabricated content only. Use opaque IDs, not names from real people. Fixtures stay small, deterministic, and clearly labeled synthetic.

08 / rhythm

## Parallel rhythm: independent building, serialized integration

Each lane can start as soon as the seam is frozen. Lanes do not wait for each other’s code. Integration is a separate repeatable check after each lane reaches its own “done” gate.

| When | Each lane does independently | Integrator / owner does | Dependency? |
| --- | --- | --- | --- |
| Start | Read frozen contract, create own branch/worktree, run lane starter tests | Verify baseline tag and permissions; give each AI only its lane brief | Contract already merged |
| Build | Implement against contracts, ports, fakes, and fixtures; add own tests | Review short status reports; resolve only contract RFCs, not implementation details | None between lanes |
| Lane gate | Run lane test command, lint/type-check its owned package, produce diff summary | Check diff touches owned paths only; mark lane status independently | None between lanes |
| Merge | Submit PR/patch with test output and acceptance checklist | Merge any lane whose contracts and tests pass; order is flexible except shared-file rules | Short serialized Git operation only |
| Integration | Keep lane green against contract tests; fix own failures if surfaced | Run cross-lane integration suite; file failures to owning lane; never hot-edit across ownership | Integration requires merged interfaces |
| Release | Provide release notes for lane-owned functionality | Clean install, DB backup/migration, APK build, manual phone smoke test, restore check | Always serialized; cannot be parallelized away |

### Progress statuses (use these exact words)

not started

Work has not begun.

in progress

Code exists; acceptance tests not yet passing.

lane verified

Owned-path tests pass; reviewer confirmed diff ownership.

“Integrated” and “released” are separate statuses after lane verification. A feature can be lane-verified but not yet integrated with the app.

09 / guardrails

## Failure modes to prevent

Several models help only if the coordination rules are stronger than model confidence. These are non-negotiable constraints for every coding session.

| Failure mode | Prevention | Recovery |
| --- | --- | --- |
| Two models edit the same file | Separate worktrees; explicit owned paths in every brief; no shared working checkout. | Discard one unmerged patch and re-apply only its non-conflicting changes after owner review. |
| One model changes the interface to suit itself | Contracts are read-only; CI checks contract hash/version; changes require RFC. | Revert interface edit; submit RFC; update the seam and notify all lanes. |
| Agent claims tests passed without running them | Require command + captured output; reviewer reruns critical tests from clean checkout. | Set status back to “in progress”; mark unsupported claims as unverified. |
| Provider key or private story leaks into prompt/repo | No secrets in chat prompts; use synthetic fixtures; provider keys in OS key store or ignored env. | Revoke leaked key, scrub Git history if needed, remove sensitive fixture and review logs. |
| Schema changes collide | One schema/migration owner; migrations not part of ordinary lane ownership. | Stop merges; backup DB; owner creates one ordered migration and tests rollback/forward path. |
| Cloud is called without permission | Adapter selection explicit; “data leaves device” metadata visible; no hidden fallback. | Disable remote adapter, inspect network logs, restore local-only setting. |
| Local model output treated as production-quality code | Use it for isolated packages; tests + diff review required exactly as for any model. | Revert unverified output; ask a second model to review, not blindly rewrite. |
| Parallel work becomes coordination overload | Start with 3–4 lanes for the first wave; add remaining lanes after merge flow proves itself. | Pause new lane starts, merge/review the current wave, then resume. Parallelism is optional, not a quota. |

**Suggested first wave**

After the contract is frozen, start L1 persistence, L2 context engine, L3 provider gateway, L5 web UI, and L10 QA/docs in parallel. L4 API can also work with fake implementations and the frozen ports; L6-L9 can start independently, but should not delay the first working text-chat product.

10 / start

## What to commit and do next

Commit the master blueprint and this parallel-playbook as separate documents. They answer different questions and should evolve on different tracks.

Suggested repository layout

```
docs/
  product/
    MASTER-BUILD-BLUEPRINT-v2.md   # scope, features, acceptance, phases
    PARALLEL-BUILD-PLAYBOOK-v1.md  # this document, lanes and briefs
  architecture/
    CONTRACTS.md                   # created in Phase 0.5
    ADR/                           # frozen choices / amendments
    RFC/                           # proposed seam changes
  lanes/
    L1-persistence.md ... L10-qa.md
  STATUS.md
  RELEASE-CHECKLIST.md
```

First 5 actions

1. Copy the master blueprint into `docs/product/`, preserve its version and date.
2. Copy this playbook into `docs/product/` as a separate file.
3. Do not let multiple agents edit the repo yet. First assign the one serial seam task.
4. After the contract checkpoint is reviewed and tagged, launch lanes in isolated branches/worktrees.
5. Start with 3–5 lanes, run the first integration, then expand to voice/media/Android work.

**Name recommendation is intentionally not a blocking dependency.**

Use `Nibhrito` as a working display name in the docs. Before changing package identifiers or public repo metadata, confirm you want it and check availability if you plan a public release. All architecture and lane work can proceed without renaming the repository first.

### One instruction to give any agent before its lane brief

```
Work only in your assigned lane and owned paths. Treat docs/architecture/CONTRACTS.md as read-only.
Do not edit another lane's files, change the database schema, introduce a paid dependency, or call a
remote provider in tests. If a required contract is missing, stop the code change and submit an RFC.
Before saying done, run your exact lane test command and report the command, result, files changed,
known limitations, and acceptance criteria not yet met. Never claim functionality you did not test.
```
