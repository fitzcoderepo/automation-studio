# File Uploads

_Last updated: 2025-11-26_

Describes file upload behavior for chatbot and automations.

---

## 1. Automation Uploads

Endpoint:

    POST /api/automations/upload

Accepted:
- text/*
- .txt
- .csv

Flow:
1. Read file with arrayBuffer.
2. Decode UTF-8.
3. Return:
       { filename, text }

UI:
- Shows uploaded filename.
- Allows removal.
- Fills textarea with file text.

---

## 2. Chatbot Uploads

Endpoint:

    POST /api/chatbot/upload

Flow:
- Saves metadata to UploadedFile.
- Chatbot posts a system-like message:
      📄 File uploaded: "filename"

---

## 3. Future Enhancements

- PDF ingestion
- XLSX ingestion
- Linking files to automations automatically
