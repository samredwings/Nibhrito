# Nibhrito Build Status

**Last Updated:** Batch 2.1 · 2026-11-24
**Baseline:** Batch 2 commit `30c79ce`; Batch 2.1 changes are under validation.

## Status rules

- **Not Started:** no implementation of the catalogue acceptance criterion.
- **In Progress:** some scaffolding or behavior exists, but the complete acceptance criterion has not passed.
- **Lane Verified / Integrated / Released:** reserved for repeatable acceptance evidence; none of the features below qualifies yet.

A passing unit test for one helper does not prove the complete feature. The commands below are the closest relevant automated suites; the notes explain what they do and do not verify.

**Acceptance-verified catalogue features: 0 / 34.** Batch 2.1 verifies components and routes, not all 34 complete acceptance criteria.

## Feature catalogue (34 features)

| ID | Feature | Status | Lane | Test Command / Evidence |
|---|---|---|---|---|
| F-01 | Character creation | In Progress | L1 | `pnpm --filter @nibhrito/api test` — request validation only; CRUD/cascade is not yet covered. |
| F-02 | Visual identity | Not Started | L1 | — (no visual-profile acceptance test) |
| F-03 | Cast & relationships | Not Started | L1 | — (no relationship model or acceptance test) |
| F-04 | Character templates | Not Started | L1 | — |
| F-05 | Mode 1 — character-first | In Progress | L4 | — (session mode exists; full character-first flow is not tested) |
| F-06 | Mode 2 — story-first | Not Started | L4 | — |
| F-07 | Mode 3 — ensemble-first | Not Started | L4 | — |
| F-08 | Streaming chat | Not Started | L4 | — (the API currently buffers provider output and returns one JSON response; SSE/stop/regenerate acceptance is deferred) |
| F-09 | Multi-character scenes | Not Started | L4 | — |
| F-10 | Scene director | Not Started | L2 | — |
| F-11 | Interactive intimate scenes | Not Started | L2 | — |
| F-12 | Session control | In Progress | L1 | — (basic session CRUD exists; branch/export/archive semantics are not verified) |
| F-13 | Memory system | In Progress | L2 | `pnpm --filter @nibhrito/context-engine test` + `pnpm --filter @nibhrito/api test` — ranking and validation are tested; DB lifecycle/approval workflow is not. |
| F-14 | Memory audit | In Progress | L2 | `pnpm --filter @nibhrito/api test` — response provenance fields exist; durable audit and review UI are not tested or implemented. |
| F-15 | Rolling summary | In Progress | L2 | `pnpm --filter @nibhrito/context-engine test` — pure compaction is tested; long-session persistence/budget acceptance is not. |
| F-16 | Relationship growth | Not Started | L2 | — |
| F-17 | Character learning | Not Started | L2 | — |
| F-18 | Lorebook | In Progress | L2 | `pnpm --filter @nibhrito/context-engine test` + `pnpm --filter @nibhrito/api test` — keyword trigger and request validation are tested; DB CRUD is not. |
| F-19 | Standard Bengali output | Not Started | L6 | — |
| F-20 | Story corpus library | Not Started | L6 | — |
| F-21 | Style & vocabulary controls | Not Started | L6 | — |
| F-22 | Voice notes | Not Started | L7 | — |
| F-23 | Voice call mode | Not Started | L7 | — |
| F-24 | Video-style call | Not Started | L7 | — |
| F-25 | POV scene mode | Not Started | L7 | — |
| F-26 | Scene & portrait images | Not Started | L8 | — |
| F-27 | Appearance consistency | Not Started | L8 | — |
| F-28 | Provider panel | In Progress | L3 | `pnpm --filter @nibhrito/ai-providers test` — fake adapter and recorded Hugging Face/OpenRouter SSE fixtures pass; provider selection/persistence/UI are absent. |
| F-29 | Media library | Not Started | L8 | — |
| F-30 | Export / import everything | Not Started | L1 | — |
| F-31 | Privacy indicators | In Progress | L4 | — (`dataLeftDevice` metadata exists; opt-in enforcement and UI are absent.) |
| F-32 | Settings & tone controls | In Progress | L2 | — (intensity is accepted by the chat input; persistent settings and scene-engine behavior are not verified.) |
| F-33 | Local auth | In Progress | L4 | `pnpm --filter @nibhrito/api test` — middleware is mounted; current implementation checks only for header presence in production and does not verify a PIN. |
| F-34 | Job system | Not Started | L8 | — |

## Batch 2.1 automated checks

| Command | What it verifies |
|---|---|
| `pnpm typecheck` | TypeScript checks for all configured workspace packages/apps. |
| `pnpm build` | Builds the workspace packages, API and Next.js web app. |
| `pnpm test` | Runs the offline unit/API route test suites in packages that define tests. |
| `pnpm lane:test context-engine` | Runs the focused context-engine suite through the lane script. |

## Known gaps / explicit deferrals

- The message endpoint still buffers generated deltas and responds with JSON. True SSE delivery, client-visible stop/regenerate and matching streamed/persisted output remain unimplemented; F-08 is **Not Started**.
- Memory and lorebook CRUD routes exist, but their database-backed CRUD/approval lifecycle still requires integration acceptance tests against a PostgreSQL test database.
- Rolling summary is wired to persist after the session exceeds the configured message threshold; its long-session DB behavior still needs integration coverage.
- `localAuth` is mounted under `/api`, but its present production check only requires an `x-local-pin` header. It does **not** validate the PIN against `LocalProfile.pinHash`; F-33 remains **In Progress** and must not be treated as secure authentication.
- Corpus retrieval remains a hardcoded empty list in the message pipeline; provider selection and persisted provider configuration remain unfinished.
- The four reserved lane packages are workspace stubs, not implementations.
- The GitHub repository description is already set, but differs from the requested wording; repository topics are empty. Updating description/topics requires the repository-settings UI, which is not exposed by the available code/contents write action.

**Traceability rule:** a feature is Done only after its complete acceptance criterion passes a repeatable test or scripted walkthrough. A route, table, helper, fixture or UI component alone is not completion evidence.
