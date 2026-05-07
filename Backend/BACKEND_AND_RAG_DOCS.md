# VitalWatch Backend and RAG Documentation

This document explains how the backend works and how the RAG pipeline powers the Mr.Vital chat feature for uploaded outbreak reports.

## Backend Overview

The backend is a Node.js Express API using ES modules. It runs on port `6001` and connects to MongoDB through Mongoose. Uploaded report files are stored in MongoDB GridFS, while report metadata, extracted outbreak chunks, users, audit logs, and stats are stored in normal MongoDB collections.

Main entry points:

- `src/server.js` starts the HTTP server, connects MongoDB, initializes GridFS, and listens on port `6001`.
- `src/app.js` configures Express middleware, CORS, JSON parsing, cookies, and route mounting.
- `src/db/db.js` connects to MongoDB.
- `src/db/gridfs.js` initializes the `reports` GridFS bucket used for uploaded files.

Important dependencies:

- `express` for HTTP routes.
- `mongoose` for MongoDB models.
- `mongodb` GridFS through Mongoose's active connection.
- `multer` for in-memory file uploads.
- `jsonwebtoken` and `cookie-parser` for authentication.
- `openai` for metadata extraction, embeddings, intent classification, and answer generation.
- `pdfjs-dist` for extracting text from PDF report files.

## Server Startup Flow

Run the backend with:

```bash
npm run dev
```

The script changes into `src` and runs:

```bash
node --watch server.js
```

Startup sequence:

1. `server.js` imports environment variables with `dotenv/config`.
2. `connectDB()` opens the MongoDB connection.
3. `connectGridFS()` creates a GridFS bucket named `reports`.
4. Express starts listening on port `6001`.

The frontend is expected to run at `http://localhost:5173`, because CORS in `src/app.js` only allows that origin and enables credentials.

## Route Layout

Routes are mounted in `src/app.js`:

```text
/auth        -> auth.routes.js
/superadmin  -> superadmin.routes.js
/admin       -> admin.routes.js
/user        -> user.routes.js
/chat        -> chat.routes.js
/dashboard   -> dashboard.routes.js
/report      -> reportProcessing.routes.js
```

### Auth Routes

Defined in `src/routers/auth.routes.js`.

- `POST /auth/register` creates a public user account.
- `POST /auth/login` logs in users, admins, and superadmins.
- `POST /auth/logout` clears the auth cookie.
- `GET /auth/me` returns the currently authenticated user.

Login checks the `User` collection first, then the `SuperAdmin` collection. On success it creates a JWT using the account model method, stores it in an `accessToken` HTTP-only cookie, and also returns the token in the JSON response.

### Auth Middleware

Defined in `src/middleware/auth.middleware.js`.

- `verifyToken` reads the JWT from `req.cookies.accessToken` or an `Authorization: Bearer ...` header.
- It verifies the token, loads the account from `User` or `SuperAdmin`, checks `isActive`, attaches the account to `req.user`, and increments API usage stats.
- `isAdmin` allows users with role `admin` or `superadmin`.
- `isSuperAdmin` allows only `superadmin`.

### User Routes

Defined in `src/routers/user.routes.js`.

- `GET /user/profile` returns the authenticated user's profile.
- `PATCH /user/profile` updates profile fields.

All user routes require `verifyToken`.

### Admin Routes

Defined in `src/routers/admin.routes.js`.

All admin routes require `verifyToken` and `isAdmin`.

- `POST /admin/report/upload` uploads a report file and starts RAG ingestion in the background.
- `GET /admin/report/all` lists uploaded reports.
- `GET /admin/report/download/:id` downloads the original file from GridFS.
- `PATCH /admin/report/:id/status` manually updates report processing status.
- `DELETE /admin/report/:id` deletes the report metadata and GridFS file.
- `GET /admin/users` lists normal users if the admin has permission.

The upload route uses `multer.memoryStorage()` with a 20 MB limit. Allowed MIME types are PDF, DOC, and DOCX, although the current RAG parsing path is PDF-oriented.

### Superadmin Routes

Defined in `src/routers/superadmin.routes.js`.

All superadmin routes require `verifyToken` and `isSuperAdmin`.

- `GET /superadmin/stats` returns platform stats.
- `GET /superadmin/users` lists all users and admins.
- `PATCH /superadmin/promote/:userId` promotes a user to admin and assigns permissions.
- `PATCH /superadmin/demote/:userId` demotes an admin to user.
- `PATCH /superadmin/ban/:userId` deactivates a user.
- `PATCH /superadmin/unban/:userId` reactivates a user.
- `DELETE /superadmin/delete/:userId` permanently deletes a user.
- `GET /superadmin/audit-logs` returns recent audit logs.

### Dashboard Routes

Defined in `src/routers/dashboard.routes.js`.

These routes read from `ReportChunk`, which means dashboard data depends on successful RAG ingestion.

- `GET /dashboard/outbreaks-by-state`
  - Optional query params: `week`, `year`.
  - Groups outbreak chunks by state and returns total outbreaks, cases, deaths, diseases, and districts.

- `GET /dashboard/outbreaks-by-week`
  - Groups data by year, week, and disease.

- `GET /dashboard/state-detail/:state`
  - Returns up to 50 outbreak chunks for one state, without embeddings.

- `GET /dashboard/user-risk?state=...`
  - Computes a simple risk label from total cases, deaths, and outbreak count for a state.

- `GET /dashboard/disease-summary`
  - Groups by disease and returns top diseases by case count.

- `GET /dashboard/alerts`
  - Scores outbreaks by deaths, large case counts, and latest week. Returns the top 20 alerts.

### Chat Routes

Defined in `src/routers/chat.routes.js`.

Both chat endpoints require authentication.

- `POST /chat/message`
  - Non-streaming chat.
  - Calls `askReportRag(message)` and returns one JSON response with answer and sources.

- `POST /chat/stream`
  - Streaming chat over Server-Sent Events.
  - Calls `retrieveContext(message)`, streams the OpenAI answer token by token, then sends sources and a final done event.

## Data Models

### Report

Defined in `src/models/Report.js`.

Stores one uploaded report's metadata:

- `originalName`
- `gridfsFileId`
- `mimeType`
- `sizeBytes`
- `source`
- `description`
- `status`: `uploaded`, `processing`, `processed`, or `failed`
- `uploadedBy`
- timestamps

The actual file bytes are not stored in this model. They live in GridFS.

### ReportChunk

Defined in `src/models/ReportChunk.js`.

Stores one extracted outbreak entry from a report:

- `reportId`
- `text`: the original outbreak block text
- `embedding`: OpenAI embedding vector
- `metadata.state`
- `metadata.district`
- `metadata.disease`
- `metadata.cases`
- `metadata.deaths`
- `metadata.startDate`
- `metadata.status`
- `metadata.uniqueId`
- `metadata.year`
- `metadata.weekNumber`
- `metadata.chunkType`

Indexes exist for report lookup, state, district, disease, year, week, and common compound filters.

## Report Upload Flow

Main implementation: `src/controllers/admin.controller.js`.

Flow for `POST /admin/report/upload`:

1. Admin uploads a file as multipart form data using field name `file`.
2. `multer` keeps the file in memory.
3. The backend streams the memory buffer into GridFS using bucket `reports`.
4. A `Report` document is created with status `uploaded`.
5. An audit log records the upload.
6. The API immediately responds to the frontend.
7. After the response, `ingestReport(report)` runs in the background.
8. If ingestion succeeds, the report status becomes `processed` and processed-report stats are incremented.
9. If ingestion fails, the report status becomes `failed` and an audit log is written.

This design keeps uploads responsive. The user does not wait for PDF parsing, LLM extraction, and embedding creation to finish.

## RAG Pipeline Overview

The RAG system has two big phases:

1. Ingestion: convert uploaded reports into structured, embedded outbreak chunks.
2. Question answering: retrieve relevant chunks or aggregate stored metadata, then generate an answer.

Core files:

- `src/services/rag/ingest.service.js`
- `src/utils/pdfParser.js`
- `src/utils/outbreakExtractor.js`
- `src/utils/embedding.js`
- `src/services/reportRag.js`
- `src/utils/cosineSimilarity.js`
- `src/models/ReportChunk.js`

## RAG Ingestion Flow

Main function: `ingestReport(report)` in `src/services/rag/ingest.service.js`.

Step-by-step:

1. Check idempotency.
   - The service counts `ReportChunk` documents for the report.
   - If chunks already exist, it skips ingestion and marks the report as `processed`.

2. Mark the report as `processing`.

3. Download the uploaded file from GridFS.
   - The report stores `gridfsFileId`.
   - The GridFS file stream is converted back into a buffer.

4. Extract raw PDF text.
   - `extractPdfText(buffer)` in `src/utils/pdfParser.js` uses `pdfjs-dist`.
   - It loops through PDF pages, reads text content, joins text items, and returns one raw string.

5. Split the raw text into outbreak entries.
   - `extractOutbreakChunks(rawText)` in `src/utils/outbreakExtractor.js` cleans OCR artifacts and splits entries by IDSP unique IDs.
   - Expected unique ID pattern looks like `AP/GUN/2026/12/453`.

6. Extract structured metadata with OpenAI.
   - Outbreak blocks are processed in batches of 5.
   - `gpt-4o-mini` extracts JSON fields such as state, district, disease, cases, deaths, start date, status, year, and week number.
   - The extractor uses retries and normalizes some possible JSON wrapper shapes.

7. Build chunk objects.
   - Each chunk contains the original block text plus extracted metadata.
   - If year or week are missing but `uniqueId` exists, they are parsed from the ID.

8. Create embeddings.
   - `getEmbeddingsBatch()` in `src/utils/embedding.js` calls OpenAI `text-embedding-3-small`.
   - Each embedding input combines disease, state, district, and the outbreak text.
   - Chunks are embedded in batches of 100.

9. Save chunks.
   - The service inserts `ReportChunk` documents with `reportId`, `text`, `embedding`, and `metadata`.

10. Mark report status.
   - Success sets `Report.status` to `processed`.
   - Failure sets `Report.status` to `failed`.

## RAG Chat Flow

Main implementation: `src/services/reportRag.js`.

There are two public entry points:

- `askReportRag(question)` for non-streaming responses.
- `retrieveContext(question)` plus `streamAnswer(messages, onToken)` for streaming responses.

Both paths use the same retrieval logic.

### 1. No Data Check

Before doing any AI work, the service checks:

```js
ReportChunk.countDocuments()
```

If there are no chunks, it returns a clear message telling the user to upload an IDSP report first.

### 2. Intent Classification

The user's question is classified with `gpt-4o-mini`.

The classifier returns JSON:

```json
{
  "intent": "aggregation | lookup | general",
  "state": "string or null",
  "district": "string or null",
  "disease": "string or null",
  "wantsDeaths": true,
  "timeFrame": "latest | all | specific_week",
  "weekNumber": 10,
  "year": 2026
}
```

The prompt has an important year rule: the model must only set `year` if the user explicitly mentions a 4-digit year. It should not guess the current year.

### 3. Temporal Filtering

`buildTemporalFilter(intent)` creates MongoDB filters for time:

- `latest`: finds the highest year and week number available in `ReportChunk`, then filters to that week.
- `specific_week`: filters by `metadata.weekNumber`, and by `metadata.year` only if the user explicitly provided a year.
- `all`: no time filter.

### 4. Aggregation Path

If the intent is `aggregation`, the backend does not rely on vector similarity first. It uses MongoDB aggregation over structured metadata.

Used for questions like:

- "How many measles cases are there?"
- "Total deaths from cholera"
- "Which states have outbreaks?"

Aggregation groups by:

```text
metadata.disease
metadata.state
```

It computes:

- total cases
- total deaths
- outbreak count
- districts
- weeks

If no results match exactly, the backend relaxes filters:

1. Try without the time filter.
2. If district was used, try without district and time.

The aggregated rows are then passed to `gpt-4o-mini` with the system prompt so the final answer is readable, direct, and grounded in the computed totals.

### 5. Semantic Lookup Path

If the intent is `lookup` or `general`, the backend uses vector retrieval.

Used for questions like:

- "What is happening in Kerala?"
- "Tell me about Shigellosis"
- "What happened in week 10?"

Flow:

1. Embed the user's question with `text-embedding-3-small`.
2. Build MongoDB filters from detected state, district, disease, and time.
3. Load candidate `ReportChunk` documents.
4. Calculate cosine similarity between the question embedding and each chunk embedding.
5. Keep chunks with similarity at least `0.20`.
6. Sort by similarity.
7. Return the top 8 chunks.

Filter relaxation works like this:

1. Try exact metadata and time filters.
2. If time was requested and no results were found, retry without time.
3. If district was requested and still no results were found, retry without district and time.
4. As a final fallback, search all chunks semantically.

### 6. Prompt Construction

For semantic answers, retrieved chunks are converted into context blocks:

```text
[Source 1] State: ... | District: ... | Disease: ... | Cases: ... | Deaths: ... | Status: ... | Start: ... | Week: ...
original outbreak text
```

The system prompt tells the model to:

- use only the provided context
- never invent numbers, dates, locations, or outbreaks
- include cases, deaths, locations, status, and week/year when available
- clearly say when data is not reported
- lead with totals for aggregation questions

### 7. Response Shape

Non-streaming `POST /chat/message` returns:

```json
{
  "question": "user message",
  "answer": "final answer",
  "reply": "same as answer",
  "sources": [],
  "mode": "aggregation | semantic | no_data"
}
```

Streaming `POST /chat/stream` sends Server-Sent Events:

```text
data: {"type":"token","content":"..."}
data: {"type":"sources","sources":[...]}
data: {"type":"done","mode":"semantic","intent":{...}}
```

If retrieval returns a no-data or no-match message, the streaming route sends that message as a token and finishes without calling the OpenAI streaming answer endpoint.

## Dashboard and RAG Relationship

The dashboard does not parse PDF files directly. It reads the same `ReportChunk` documents created by RAG ingestion.

That means:

- Uploading a report only creates dashboard data after ingestion succeeds.
- If a report is stuck at `uploaded`, `processing`, or `failed`, its outbreak entries may not appear in dashboard charts.
- Most dashboard totals are based on extracted metadata, not raw report text.

## Environment Variables

Expected environment variables:

```env
OPENAI_API_KEY=...
JWT_SECRET=...
NODE_ENV=development
```

The current code has a hardcoded MongoDB connection string in `src/db/db.js`. For production or shared development, this should be moved into an environment variable such as `MONGODB_URI`.

## Important Implementation Notes

- Report upload is asynchronous after the initial file save. The API response can say ingestion is in progress while `Report.status` still reads `uploaded` or `processing`.
- `ReportChunk` stores embeddings directly in MongoDB arrays. Vector search is currently done in application code with cosine similarity, not MongoDB Atlas Vector Search.
- Aggregation questions use MongoDB metadata totals. This is more reliable for count questions than asking the LLM to count retrieved text snippets.
- Semantic lookup uses `TOP_K = 8` and `MIN_SIMILARITY = 0.20`.
- OpenAI chat calls use `gpt-4o-mini`.
- Embedding calls use `text-embedding-3-small`.
- The old `/report` router has public report list/download routes and a commented upload route. The active admin upload path is `/admin/report/upload`.

## Common Backend Flow Examples

### Admin uploads an IDSP PDF

```text
Frontend -> POST /admin/report/upload
Backend -> GridFS stores file
Backend -> Report document created
Backend -> response sent
Backend -> ingestReport runs in background
Backend -> PDF text extracted
Backend -> outbreak entries extracted by OpenAI
Backend -> embeddings generated
Backend -> ReportChunk documents inserted
Backend -> Report.status becomes processed
```

### User asks Mr.Vital a question

```text
Frontend -> POST /chat/message or /chat/stream
Backend -> verifyToken
Backend -> classify intent
Backend -> aggregation or semantic retrieval
Backend -> build grounded prompt
Backend -> OpenAI generates answer
Backend -> return answer and sources
Backend -> audit log and AI query stats updated
```

### Dashboard loads state data

```text
Frontend -> GET /dashboard/outbreaks-by-state
Backend -> aggregate ReportChunk by metadata.state
Backend -> return outbreak count, cases, deaths, diseases, districts
```

## Maintenance Checklist

When changing the backend RAG flow, check these files together:

- `src/controllers/admin.controller.js` for upload behavior.
- `src/services/rag/ingest.service.js` for ingestion sequencing.
- `src/utils/outbreakExtractor.js` for extraction quality.
- `src/utils/embedding.js` for embedding model and retry behavior.
- `src/services/reportRag.js` for retrieval, aggregation, prompt, and streaming behavior.
- `src/models/ReportChunk.js` for metadata fields and indexes.

When dashboard values look wrong, first inspect `ReportChunk` documents for missing or incorrect metadata. The dashboard usually reflects extraction quality rather than dashboard route logic.
