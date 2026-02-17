#!/bin/sh
cd "$(dirname "$0")/.."
echo "Building backend..."
(cd backend && npm run build) || exit 1
echo "Building frontend..."
(cd frontend && npm run build) || exit 1
echo "Build done."
