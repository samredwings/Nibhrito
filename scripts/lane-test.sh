#!/usr/bin/env bash
set -euo pipefail

lane="${1:-}"
if [[ -z "$lane" ]]; then
  echo "Usage: pnpm lane:test <contracts|context-engine|ai-providers|api>" >&2
  exit 2
fi
case "$lane" in
  contracts|context-engine|ai-providers|api)
    exec pnpm --filter "@nibhrito/$lane" test
    ;;
  *)
    echo "Unsupported lane: $lane" >&2
    echo "Supported lanes: contracts, context-engine, ai-providers, api" >&2
    exit 2
    ;;
esac
