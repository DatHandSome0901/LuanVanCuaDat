FROM python:3.11-slim-bookworm

# Environment flags for Python and default port
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=utf-8 \
    PYTHONUTF8=1 \
    PORT=8000

WORKDIR /app

# Minimal system runtime dependencies (libgomp1 is required by faiss-cpu)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy only backend application code
COPY app/ app/
COPY chatbot/ chatbot/
COPY ingestion/ ingestion/
COPY vietnam_history_language_agent/ vietnam_history_language_agent/
COPY data/ data/
COPY output/ output/
COPY database.db* ./
COPY main.py .
COPY run_api.py .
COPY update_mobile_ip.py .

# blitz.cloud requires non-root execution (UID 1000)
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

