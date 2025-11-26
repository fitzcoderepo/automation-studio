# Automations – Backend Feature

_Last updated: 2025-11-26_

Describes automation creation, structure, run execution, and API behavior.

---

## 1. Seed Route

File:
    src/app/api/automations/seed/route.ts

Ensures the following automations exist:

- invoice_extraction
- spreadsheet_summary
- text_summarization
- csv_importer

Each has an id, name, type.

---

## 2. List Automations

GET /api/automations  
Returns sorted list of Automation rows.

---

## 3. List Runs

GET /api/automations/[automationId]/runs  
Returns runs for the given automation in descending createdAt order.

---

## 4. Running an Automation

POST /api/automations/[automationId]/run  
Body: { text }

Flow:

1. Validate automationId and text.
2. Create AutomationRun with status "pending".
3. Update to "running".
4. Build instruction string based on automation.type.
5. Call callOpenAI(instruction, text).
6. JSON.parse output.
7. If success:
     - status "success"
     - store output JSON
     - set finishedAt
8. If error:
     - status "error"
     - store error message
     - set finishedAt

---

## 5. callOpenAI Helper

Flow:

- Sends system + user messages to OpenAI.
- Extracts first text output.
- Throws error if missing or invalid.
- Attempts JSON.parse and returns object.

---

## 6. Output JSON Shapes

invoice_extraction:

    {
      vendor: string | null,
      invoiceNumber: string | null,
      invoiceDate: string | null,
      currency: string | null,
      totalAmount: number | null
    }

spreadsheet_summary:

    {
      columns: string[] | null,
      rowCount: number | null,
      summary: string,
      insights: string[]
    }

text_summarization:

    {
      summary: string,
      keyPoints: string[]
    }

csv_importer:

    {
      columns: string[],
      rows: array of objects,
      rowCount: number
    }

---

## 7. Error Handling

- Missing OpenAI output → error.
- Invalid JSON → error.
- All errors stored in AutomationRun.error.
