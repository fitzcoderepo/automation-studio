# Automation Studio – Architecture Overview

_Last updated: 2025-11-26_

This document gives a high-level overview of the Automation Studio architecture and links out to more focused docs (Automations, Chatbot, etc.). It’s intentionally stable and extendable as the project grows.

---

## 1. Tech Stack

**Core:**

- **Framework:** Next.js App Router (Next 16+)
- **Language:** TypeScript (many components are JS-friendly)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** None yet (developer-mode dashboard only)
- **Styling:** TailwindCSS with a dark dashboard theme (slate palette)

**AI / OpenAI:**

- **Library:** `openai@6.9.1`
- **API:** Responses API (`openai.responses.create`)
- **Important constraints:**
  - No `response_format`
  - No `json_schema`
  - No structured outputs
- **Implication:** All structured responses use prompt-enforced JSON + `JSON.parse` on the server.

---

## 2. Application Layout & Navigation

The app uses a global dashboard shell with feature pages rendered inside it.

**Core layout component:**

- `src/components/dashboard-shell.tsx`
  - Left sidebar: app title + navigation
  - Right content: page-specific UI (`{children}`)

**Sidebar routes (current / planned):**

- `/users` (placeholder)
- `/chatbot` – AI assistant + conversation list
- `/conversations` – conversation-centric views (future)
- `/files` – file management (future)
- `/automation` – automation definitions & runs
- `/inventory` – inventory management (future, fed by CSV importer)

See: `docs/DASHBOARD_SHELL_LAYOUT.md` (planned).

---

## 3. Core Domain Areas

### 3.1 Chatbot & Conversations

**Goal:** Provide an AI chat interface with persistent conversations stored in the database.

Key pieces:

- Page: `src/app/chatbot/page.tsx` (`"use client"`)
- Sidebar: `src/components/conversation-sidebar.tsx`
- New Chat button: `src/components/new-chat-btn.tsx`
- API routes:
  - `GET /api/conversations`
  - `GET /api/conversations/[id]`
  - `DELETE /api/conversations/[id]`
  - `POST /api/chatbot` (send message + call OpenAI)
  - `POST /api/chatbot/upload` (file uploads, high level)

**Important design choice:**

- No “empty” conversations are stored.
  - The “New Chat” button only resets UI state.
  - The **first user message** sent via `/api/chatbot` creates the `Conversation` and first `Message` rows.

See: `docs/CHATBOT_FEATURE.md` (planned) for full behavior and UX details.

---

### 3.2 Automations

**Goal:** Run reusable, OpenAI-powered tasks on text or uploaded files, with history of runs.

**Current built-in automation types:**

- `invoice_extraction` – extract vendor, invoice number, date, currency, total.
- `spreadsheet_summary` – treat input as spreadsheet/CSV-like text and summarize.
- `text_summarization` – summarize arbitrary text.
- `csv_importer` – parse CSV-like content into structured JSON (columns + rows).

**Key pieces:**

- Seed route:
  - `src/app/api/automations/seed/route.ts`
  - Ensures default Automation rows exist.
- List automations:
  - `GET /api/automations`
- List runs:
  - `GET /api/automations/[automationId]/runs`
- Run automation:
  - `POST /api/automations/[automationId]/run`
  - Synchronously:
    - Creates `AutomationRun`
    - Calls OpenAI with an instruction describing the JSON shape
    - Parses JSON
    - Updates `AutomationRun` with output and status
- Upload for automations:
  - `POST /api/automations/upload`
  - Accepts `.csv` / `.txt` / `text/*` and returns `{ filename, text }`

**Frontend page:**

- `src/app/automation/page.tsx`
  - Left: automation list
  - Center: textarea + file upload + “Run Automation”
  - Right: recent runs with status, error, re-run, and JSON output preview

See: `docs/AUTOMATIONS_FEATURE.md` and `docs/AUTOMATION_UI.md` (planned) for deep details.

---

### 3.3 File Uploads

There are currently two primary upload paths:

1. **Chatbot uploads**  
   - Endpoint: `/api/chatbot/upload`  
   - Uses `UploadedFile` records.
   - Intended to make files available as context for future chatbot responses.

2. **Automations uploads**  
   - Endpoint: `POST /api/automations/upload`
   - Restriction: `text/*`, `.csv`, `.txt`
   - Reads content as UTF-8 and returns raw text to populate the automation textarea.

See: `docs/FILE_UPLOADS.md` (planned) for formats and future extensions (PDF/XLSX).

---

## 4. Data Model Summary (Prisma)

This is a quick overview of the main Prisma models. For full definitions and discussion, see `docs/DATA_MODELS_PRISMA.md` (planned).

### Conversation & Message

- `Conversation`
  - `id` (cuid)
  - `createdAt`
  - `messages` (relation)

- `Message`
  - `id` (cuid)
  - `createdAt`
  - `role` (`"user"` | `"assistant"`)
  - `content` (string)
  - `conversationId` (FK)

### UploadedFile

- `UploadedFile`
  - `id` (cuid)
  - `fileId` (OpenAI / storage id)
  - `filename`
  - `uploadedAt`

### Automation & AutomationRun

- `Automation`
  - `id` (cuid)
  - `name`
  - `type` (string identifier, e.g. `"invoice_extraction"`)
  - `createdAt`
  - `runs` (relation)

- `AutomationRun`
  - `id` (cuid)
  - `automationId` (FK)
  - `input` (JSON string, usually `{ text }`)
  - `output` (JSON string or `null`)
  - `status` (`"pending" | "running" | "success" | "error"`)
  - `error` (string or `null`)
  - `createdAt`
  - `finishedAt` (nullable)

---

## 5. OpenAI Integration – High-Level

**Chatbot:**

- Uses `openai.responses.create` with:
  - A single user input text chunk.
- Extracts the first output text:
  - If `text` is a string, use it directly.
  - If it's an object with `value`, use `value`.
  - Fallback: `"I couldn't generate a response."`

**Automations:**

- Use a helper pattern like `callOpenAI(instruction, text)`:
  - Instruction describes:
    - How to interpret the input (`invoice text`, CSV, free text, etc.).
    - The **exact JSON shape** to output.
  - The server:
    - Calls `openai.responses.create`.
    - Extracts the first text output.
    - Runs `JSON.parse` and handles errors.

**Key rule:**

> The model must be prompted to return **only** JSON. Validation is done in code, not via OpenAI’s structured outputs.

---

## 6. Current Constraints & Assumptions

- **Auth:** No authentication/authorization yet. Everything is dev-mode.
- **Concurrency:** Automation runs are handled synchronously per request.
- **Files:** Automations only support text-based uploads; PDF/XLSX planned.
- **Conversations:** No conversation titles yet; they are referenced by ID and preview text.
- **Automations:** Only system-defined via seed script (no user-created automations yet).

---

## 7. Future Directions (High Level)

Planned / suggested next steps (details live in `docs/ROADMAP_TODO.md`):

- **Automations:**
  - PDF & XLSX support in upload pipeline.
  - Add `InventoryItem` model and automation that writes CSV data into it.
  - Run detail page: `/automation/runs/[id]` with full input/output.

- **Chatbot:**
  - Let the bot trigger automations (e.g., “Run invoice extraction on my last uploaded file”).
  - Auto-title conversations based on first user message.

- **UX / DX:**
  - Syntax highlighting for JSON output.
  - Filters/search for automation runs.
  - Persistent URL state for selected automation (`?automationId=`).

---

## 8. Related Docs (Planned Structure)

These docs are either already drafted as notes or planned for the `docs/` folder:

- `docs/DATA_MODELS_PRISMA.md`
- `docs/DASHBOARD_SHELL_LAYOUT.md`
- `docs/CHATBOT_FEATURE.md`
- `docs/AUTOMATIONS_FEATURE.md`
- `docs/AUTOMATION_UI.md`
- `docs/FILE_UPLOADS.md`
- `docs/OPENAI_INTEGRATION_CORE.md`
- `docs/ROADMAP_TODO.md`

Each focuses on one slice of the system so they can grow independently without bloating this overview.

---
