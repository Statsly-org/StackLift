#!/bin/sh
cd "$(dirname "$0")/.."
echo "Linting backend..."
(cd backend && npm run lint) || exit 1
echo "Linting frontend..."
(cd frontend && npm run lint) || exit 1
echo "Lint done."
