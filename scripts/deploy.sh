#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---------------------------------------------------------
# Adjust these paths to match your server layout before using the script.
REPO_DIR="${REPO_DIR:-/var/www/MareaTatto}"
BRANCH="${BRANCH:-main}"
NGINX_ROOT="${NGINX_ROOT:-/var/www/html/mareatatto}"
NODE_ENV="${NODE_ENV:-production}"

# --- Helper functions ------------------------------------------------------
log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

# --- Workflow --------------------------------------------------------------
log "Switching to repository directory: ${REPO_DIR}"
cd "${REPO_DIR}"

log "Fetching latest code"
git fetch --all --prune
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

log "Installing dependencies"
if command -v npm >/dev/null 2>&1; then
  npm ci
else
  log "npm command not found. Install Node.js/npm before running this script."
  exit 1
fi

log "Building project for ${NODE_ENV}"
NODE_ENV="${NODE_ENV}" npm run build

if ! command -v rsync >/dev/null 2>&1; then
  log "rsync command not found. Install rsync or adjust the publish step."
  exit 1
fi

log "Publishing build artifacts to ${NGINX_ROOT}"
mkdir -p "${NGINX_ROOT}"
rsync -av --delete dist/ "${NGINX_ROOT}/"

if command -v systemctl >/dev/null 2>&1; then
  log "Reloading nginx service"
  sudo systemctl reload nginx
else
  log "systemctl not available; skipping nginx reload"
fi

log "Deployment completed successfully"

