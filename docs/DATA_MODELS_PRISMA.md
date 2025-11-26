# Data Models (Prisma)

_Last updated: 2025-11-26_

Defines all Prisma models used by Automation Studio.

---

## 1. Conversation & Message Models

Prisma schema:

    model Conversation {
      id        String    @id @default(cuid())
      createdAt DateTime  @default(now())
      messages  Message[]
    }

    model Message {
      id             String       @id @default(cuid())
      createdAt      DateTime     @default(now())
      role           String       // "user" | "assistant"
      content        String
      conversation   Conversation @relation(fields: [conversationId], references: [id])
      conversationId String
    }

Notes:
- Conversations are created only when the first message is sent (no empty conversations).
- Messages store plain text plus a role.
- Ordered by createdAt.

---

## 2. Uploaded File Model

Prisma schema:

    model UploadedFile {
      id         String   @id @default(cuid())
      fileId     String
      filename   String
      uploadedAt DateTime @default(now())
    }

Notes:
- Used for chatbot uploads.
- Tracks file metadata and optional OpenAI storage linkage.

---

## 3. Automation Models

Prisma schema:

    model Automation {
      id        String         @id @default(cuid())
      name      String
      type      String
      createdAt DateTime       @default(now())
      runs      AutomationRun[]
    }

    model AutomationRun {
      id           String      @id @default(cuid())
      automation   Automation  @relation(fields: [automationId], references: [id])
      automationId String

      input        String
      output       String?
      status       String      @default("None")
      error        String?

      createdAt    DateTime    @default(now())
      finishedAt   DateTime?
    }

Notes:
- Status values: pending → running → success/error
- input/output always JSON strings

---

## 4. Future Models (Planned)

InventoryItem  
- For CSV → database workflows.

AutomationConfig  
- For custom prompts and field mappings.
