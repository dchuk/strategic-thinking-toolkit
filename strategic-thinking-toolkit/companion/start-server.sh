#!/usr/bin/env bash
# Launch the visual-companion server for a strategic thinking exercise.
#
# Usage: start-server.sh <exercise> [context]
#
# Writes session state under ./strategic-sessions/.companion/<session-id>/
# (relative to the caller's CWD), launches Node in the background via nohup,
# waits for the server to write state/server-info.json, then prints that JSON
# to stdout so the caller (Claude or a human) can pick up the URL.

set -euo pipefail

EXERCISE="${1:-}"
CONTEXT="${2:-}"

if [[ -z "$EXERCISE" ]]; then
  echo "usage: $(basename "$0") <exercise> [context]" >&2
  exit 2
fi

# Resolve plugin root from the location of this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXERCISE_DIR="$PLUGIN_ROOT/companion/exercises/$EXERCISE"

if [[ ! -d "$EXERCISE_DIR" ]]; then
  echo "unknown exercise: $EXERCISE (looked in $EXERCISE_DIR)" >&2
  echo "available:" >&2
  ls "$PLUGIN_ROOT/companion/exercises" >&2 || true
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required but not on PATH" >&2
  exit 3
fi

# Verify Node version >= 18 (need readBigUInt64BE etc.).
NODE_MAJOR="$(node -e 'process.stdout.write(String(process.versions.node.split(".")[0]))')"
if (( NODE_MAJOR < 18 )); then
  echo "node 18+ required (found $NODE_MAJOR)" >&2
  exit 3
fi

SESSION_ID="${EXERCISE}-$$-$(date +%s)"
SESSION_ROOT="${PWD}/strategic-sessions/.companion/$SESSION_ID"
mkdir -p "$SESSION_ROOT/state"

# Best effort: keep the .companion/ dir out of git.
GITIGNORE="${PWD}/strategic-sessions/.gitignore"
if [[ ! -f "$GITIGNORE" ]]; then
  printf '.companion/\n' > "$GITIGNORE"
fi

LOG_FILE="$SESSION_ROOT/server.log"
INFO_FILE="$SESSION_ROOT/state/server-info.json"

# Watch the *grandparent* of this script, not the immediate parent.
#
# Process tree when launched from a Claude Code Bash tool call:
#   claude-code-harness (long-lived)
#     └── bash subshell  (the Bash tool's shell — exits when the call returns)
#         └── start-server.sh
# Watching $PPID (the bash subshell) means the server dies a few seconds after
# the launch turn. Watching its parent (the harness) keeps the server alive
# across turns, until the harness itself exits or the idle timeout fires.
#
# In a regular interactive terminal the grandparent is usually the terminal
# emulator (or login shell), which is also what the user expects: server
# survives until the window closes.
#
# Override with COMPANION_OWNER_PID if you want to watch a specific process.
if [[ -n "${COMPANION_OWNER_PID:-}" ]]; then
  OWNER_PID="$COMPANION_OWNER_PID"
else
  OWNER_PID="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ' || true)"
  if [[ -z "$OWNER_PID" || "$OWNER_PID" -le 1 ]]; then
    OWNER_PID="$PPID"
  fi
fi

# nohup so the server survives the launching shell exiting; the server itself
# watches OWNER_PID and exits when the harness goes away.
COMPANION_DIR="$SESSION_ROOT" \
COMPANION_EXERCISE="$EXERCISE" \
COMPANION_CONTEXT="$CONTEXT" \
COMPANION_OWNER_PID="$OWNER_PID" \
COMPANION_PLUGIN_ROOT="$PLUGIN_ROOT" \
COMPANION_PORT="0" \
nohup node "$PLUGIN_ROOT/companion/server.cjs" >"$LOG_FILE" 2>&1 &

SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true

# Poll for server-info.json. ~5s budget.
for _ in $(seq 1 50); do
  if [[ -s "$INFO_FILE" ]]; then
    cat "$INFO_FILE"
    echo
    exit 0
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "server died before writing $INFO_FILE; see $LOG_FILE" >&2
    tail -n 50 "$LOG_FILE" >&2 || true
    exit 1
  fi
  sleep 0.1
done

echo "timed out waiting for $INFO_FILE; see $LOG_FILE" >&2
tail -n 50 "$LOG_FILE" >&2 || true
exit 1
