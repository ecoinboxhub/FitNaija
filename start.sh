#!/bin/bash
set -e

echo "=== FitNaija Backend Startup ==="

# Run database migrations
echo "Running Alembic migrations..."
cd backend
alembic upgrade head
echo "Migrations complete."

cd ..

# Start the API server
echo "Starting uvicorn..."
uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-10000}
