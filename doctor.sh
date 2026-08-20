#!/usr/bin/env bash
set -uo pipefail

fail=0

check_cmd() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    echo "✔ $name found"
  else
    echo "✗ $name not found"
    fail=1
  fi
}

echo "→ Checking prerequisites"

if command -v node >/dev/null 2>&1; then
  v="$(node --version)"
  major="${v#v}"
  major="${major%%.*}"
  if (( major >= 18 )); then
    echo "✔ node $v"
  else
    echo "✗ node >= 18 required, you have $v"
    fail=1
  fi
else
  echo "✗ node not found"
  fail=1
fi

check_cmd bash
check_cmd curl
check_cmd git

if which opencode >/dev/null 2>&1; then
  echo "✔ opencode found at $(which opencode)"
else
  echo "✗ opencode not found"
  fail=1
fi

PLUGIN_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/plugins"
if [[ -f "$PLUGIN_DIR/opencode-local-models.js" ]]; then
  echo "✔ plugin installed at ~/.config/opencode/plugins/opencode-local-models.js"
else
  echo "✗ plugin not installed yet. Run make install."
  fail=1
fi

if (( fail )); then
  echo "✗ Doctor found issues."
  exit 1
fi
echo "✔ All good."