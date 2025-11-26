# Chatbot Feature

_Last updated: 2025-11-26_

Describes conversation flow, state management, UI behavior, and chatbot APIs.

---

## 1. File Location

    src/app/chatbot/page.tsx

Client component.

---

## 2. State Structure

- messages (array of { role, content })
- conversationId (string or null)
- input (text area)
- loading (boolean)
- initializing (boolean)
- hasStartedNewConversation (boolean)
- isExistingConversation (boolean)

---

## 3. Loading Conversations

### When URL has ?conversationId:
1. Fetch /api/conversations/[id]
2. Hydrate messages
3. Set isExistingConversation = true

### When no conversationId:
- Show empty state until user selects or starts a chat.

---

## 4. Sending a Message

Flow:

1. Add user message to UI immediately.
2. POST /api/chatbot with:
       { message: "...", conversationId: "optional" }
3. Backend:
   - Creates or increments conversation
   - Saves user message
   - Calls OpenAI
   - Saves assistant reply
4. Frontend:
   - Updates conversationId if newly created
   - Appends assistant response

---

## 5. New Chat Behavior

- New Chat button resets UI only.
- Conversation is created on first message via /api/chatbot.

---

## 6. Chatbot File Uploads

- Uses hidden <input type="file"> element.
- POST to /api/chatbot/upload.
- Stores file using UploadedFile model.
- Chat UI prints:
      📄 File uploaded: "filename"

---

## 7. Conversation Sidebar

Location:

    src/components/conversation-sidebar.tsx

Behavior:
- Fetches /api/conversations on mount.
- Displays a list with preview + timestamp.
- Delete button calls DELETE /api/conversations/[id].
- If deleting active conversation, navigates back to /chatbot.

---

## 8. Conversation APIs

- GET  /api/conversations
  Returns list of conversations with preview.

- GET  /api/conversations/[id]
  Returns full conversation messages.

- DELETE /api/conversations/[id]
  Removes conversation + messages.

- POST /api/chatbot
  Core endpoint performing OpenAI call and message persistence.
