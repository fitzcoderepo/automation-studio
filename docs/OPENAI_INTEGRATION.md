# OpenAI Integration Core

_Last updated: 2025-11-26_

Documents how Automation Studio interacts with OpenAI using openai@6.9.1.

---

## 1. Library

Version:

    openai@6.9.1

API used:

    openai.responses.create

Limitations:
- No response_format
- No json_schema
- No structured outputs
→ All enforcement done via prompts + JSON.parse.

---

## 2. Chatbot Usage

Basic call structure:

    openai.responses.create({
      model: "gpt-5.1",
      input: [
        { role: "user", content: [{ type: "input_text", text: message }] }
      ]
    })

Extraction:
- Reads first output block.
- Supports string or { value } forms.

Fallback:
- "I couldn't generate a response."

---

## 3. Automations Usage

callOpenAI helper:
- Sends instruction and input text.
- Forces JSON output.
- Parses JSON manually.
- Throws on empty or invalid output.

---

## 4. Error Patterns

- Missing output → error
- Invalid JSON → error
- All failures stored in AutomationRun.error

---

## 5. Future Upgrades

- Upgrade to API with schema support.
- Add retry/fallback strategies.
