# Automations – Frontend UI

_Last updated: 2025-11-26_

Describes the UI behavior for the automations page at /automation.

---

## 1. File Location

    src/app/automation/page.tsx

Client component.

---

## 2. State Variables

- automations
- selectedId
- runs
- text
- running
- loadingRuns
- expandedRunId
- selectedFile

---

## 3. Layout

Three columns:

1. Left: Automation Types
2. Middle: Run Automation
3. Right: Recent Runs

Container layout:

    <div className="flex gap-6 items-start">

items-start prevents column height stretching.

---

## 4. Left Column – Automation Types

- Lists all automations.
- Active style: bg-slate-800 text-slate-100
- Inactive style: text-slate-400 hover:bg-slate-900 hover:text-slate-100
- Clicking changes selectedId and reloads runs.

---

## 5. Middle Column – Running an Automation

### Upload
- Hidden file input.
- POST /api/automations/upload.
- On success: text area is filled with file content.
- Shows filename and Remove button.

### Textarea
- Height: h-32
- Dark theme
- Placeholder depends on automation.type.

### Run Button
- Disabled when running or text empty.
- POST /api/automations/[selectedId]/run.
- Prepends new run to runs.

---

## 6. Right Column – Recent Runs

States:
- loadingRuns → shows loading message
- empty runs → "No runs yet"

Each run displays:
- Status with color (success=green, error=red)
- Timestamp
- Error message if present

Buttons:
- Re-run (loads previous input into textarea)
- View output JSON (toggles expandedRunId)

prettyJson:
- Parses JSON or returns raw string.

