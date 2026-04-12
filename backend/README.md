# Corelign Backend

FastAPI backend for the implemented document ingestion and retrieval system.

## Current API
- `POST /upload/upload` accepts one or more PDF or DOCX files.
- `POST /query` accepts a question and returns an answer with retrieved chunks and confidence.
- `POST /demo-request` accepts contact details, sends a notification to the owner inbox, and sends a confirmation email to the requester.
- `GET /` returns a simple health check response.

## Implemented Backend Areas
- `app/main.py` for application setup and CORS.
- `app/api/upload.py` for file ingestion and indexing.
- `app/api/query.py` for retrieval and answer generation.
- `app/ingestion/` for PDF/DOCX extraction and semantic chunking.
- `app/embeddings/embedder.py` for Hugging Face Inference API embeddings.
- `app/vector_store/` for FAISS and Chroma persistence.
- `app/llm/groq_llm.py` for optional Groq-backed answer generation.
- `app/utils/metrics.py` for query timing logs.
- `app/models/schemas.py` for request and response models.

## Data Flow
1. Uploaded files are saved under `data/raw_docs/`.
2. PDF and DOCX loaders extract paragraph-level text.
3. Headings are detected and contextual sections are assigned.
4. Semantic chunks are created with overlap and small-section merging.
5. Chunk texts are embedded with `all-MiniLM-L6-v2`.
6. FAISS stores vectors and Chroma stores chunk text plus metadata.
7. Query requests are embedded, searched, and optionally answered by Groq.

## Notes
- The backend code currently exposes direct upload/query endpoints rather than a full agent runtime.
- This README only documents code that exists in the backend repository.

## Railway Deployment
The backend is ready for Railway deployment using Docker.

### Files added for deployment
- `Dockerfile` builds and runs FastAPI with Uvicorn.
- `railway.toml` configures Railway build and health checks.
- `.dockerignore` reduces image size and avoids leaking local files.
- `.env.example` documents required and optional runtime variables.

### Environment variables
- `HF_TOKEN` (required): Hugging Face token for embeddings.
- `GROQ_API_KEY` (optional): Groq key for answer generation.
- `CORS_ORIGINS` (recommended): Comma-separated frontend origins.
- `CORS_ORIGIN_REGEX` (optional): Regex for allowed origins, defaults to Vercel and localhost.
- `DATA_DIR` (recommended): Persistent data path. Use `/data` with Railway Volume.
- `DATA_RESET_DAYS` (optional): Reset interval in days. Default is `3`.
- `DATA_RESET_CHECK_INTERVAL_HOURS` (optional): How often the app checks the reset timer. Default is `24`.
- `GOOGLE_CLIENT_ID` (required for demo email): Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET` (required for demo email): Google OAuth client secret.
- `GOOGLE_REFRESH_TOKEN` (required for demo email): OAuth refresh token with Gmail send scope.
- `GMAIL_SENDER_EMAIL` (required for demo email): Gmail address that sends demo emails.
- `DEMO_RECEIVER_EMAIL` (required for demo email): Inbox where demo requests are delivered.

### Gmail API setup for demo requests
1. Create a Google Cloud project and enable the Gmail API.
2. Configure OAuth consent screen and create OAuth client credentials.
3. Obtain a refresh token with scope `https://www.googleapis.com/auth/gmail.send`.
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` in Railway.
5. Set `GMAIL_SENDER_EMAIL` to the Gmail address authorized by OAuth.
6. Set `DEMO_RECEIVER_EMAIL=deoprakash364@gmail.com`.

### Railway setup
1. Create a new Railway service from the `backend` directory.
2. Attach a Volume and mount it at `/data`.
3. Set environment variables from `.env.example`.
4. Deploy. Railway uses `railway.toml` and `Dockerfile` automatically.

### Persistence note
FAISS, Chroma, and uploaded documents are stored under `DATA_DIR`.
Without a mounted volume, these files are ephemeral and can be lost on redeploy.

### Automatic reset
The backend clears `raw_docs`, `vector_store`, and `chroma_db` every `DATA_RESET_DAYS` days.
The reset runs once on startup and then on a background interval while the app is running.
