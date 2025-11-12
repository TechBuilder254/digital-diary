#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker compose down --remove-orphans >/dev/null 2>&1 || true
docker compose up -d "$@"

URL="http://localhost:3000"

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    DISPLAY="${DISPLAY:-:0}" xdg-open "$URL" >/dev/null 2>&1 && return 0
  fi

  if command -v sensible-browser >/dev/null 2>&1; then
    sensible-browser "$URL" >/dev/null 2>&1 & return 0
  fi

  if command -v python3 >/dev/null 2>&1; then
    python3 -m webbrowser "$URL" >/dev/null 2>&1 & return 0
  fi

  case "${OSTYPE:-}" in
    darwin*)
      open "$URL" >/dev/null 2>&1 && return 0
      ;;
    cygwin*|msys*|mingw*)
      cmd.exe /c start "" "$URL" >/dev/null 2>&1 && return 0
      ;;
  esac

  return 1
}

open_browser &

