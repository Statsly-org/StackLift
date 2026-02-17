#!/bin/sh
cd "$(dirname "$0")/.."
echo "Installing backend deps..."
(cd backend && npm install) || exit 1
echo "Installing frontend deps..."
(cd frontend && npm install) || exit 1
echo "Install done."
