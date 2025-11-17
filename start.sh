#!/usr/bin/env sh
# Cross-platform wrapper - delegates to Node.js script
exec node "$(dirname "$0")/start.js" "$@"

