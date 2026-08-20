#!/usr/bin/env bash
set -euo pipefail

# Install opencode-local-models for opencode.
#
# Copies the plugin into your plugins directory as opencode-local-models.js,
# then adds the ollama and lmstudio providers to your opencode config.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/v0.1.0/install.sh | bash -s -- --version v0.1.0
#   # project-level install instead of global:
#   curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/v0.1.0/install.sh | bash -s -- --version v0.1.0 .opencode/plugins
#
# The file is auto-loaded from the plugins directory at opencode startup.
# No "plugin" entry is needed in the config.

DEFAULT_VERSION="v0.1.0"
VERSION="${PLUGIN_VERSION:-$DEFAULT_VERSION}"
POSITIONAL=()

while (($# > 0)); do
  case "$1" in
    --version)
      if (($# < 2)); then
        echo "✗ --version requires a tag, for example v0.1.0." >&2
        exit 1
      fi
      VERSION="$2"
      shift 2
      ;;
    --version=*)
      VERSION="${1#--version=}"
      shift
      ;;
    --)
      shift
      break
      ;;
    -* )
      echo "✗ Unknown option: $1" >&2
      exit 1
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

while (($# > 0)); do
  POSITIONAL+=("$1")
  shift
done

if ((${#POSITIONAL[@]} > 2)); then
  echo "✗ Expected at most a plugin directory and a config file." >&2
  exit 1
fi

if [[ ! "$VERSION" =~ ^v?[0-9]+(\.[0-9]+){2}([.-][0-9A-Za-z.-]+)?$ ]]; then
  echo "✗ Invalid version tag: $VERSION" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-.}")" 2>/dev/null && pwd || pwd)"
LOCAL_SOURCE="$SCRIPT_DIR/opencode-local-models.js"
if [[ -z "${PLUGIN_SOURCE:-}" && -f "$LOCAL_SOURCE" ]]; then
  PLUGIN_SOURCE="$LOCAL_SOURCE"
fi
PLUGIN_SOURCE="${PLUGIN_SOURCE:-https://raw.githubusercontent.com/nisrulz/opencode-local-models/$VERSION/opencode-local-models.js}"
PLUGIN_NAME="opencode-local-models.js"

if [[ "$PLUGIN_SOURCE" == http://* ]]; then
  echo "✗ Refusing to download the plugin over insecure HTTP." >&2
  exit 1
fi

display_path() {
  if [[ "$1" == "$HOME"* ]]; then
    echo "~${1#$HOME}"
  else
    echo "$1"
  fi
}

CONFIG_ROOT="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
PLUGIN_DIR="${POSITIONAL[0]:-$CONFIG_ROOT/plugins}"
if [[ "$PLUGIN_DIR" == "$CONFIG_ROOT/plugins" ]]; then
  CONFIG_FILE="${POSITIONAL[1]:-$CONFIG_ROOT/opencode.json}"
else
  CONFIG_FILE="${POSITIONAL[1]:-opencode.json}"
fi

echo "→ Installing plugin to $(display_path "$PLUGIN_DIR")"
mkdir -p "$PLUGIN_DIR"
if [[ "$PLUGIN_SOURCE" == https://* || "$PLUGIN_SOURCE" == file://* ]]; then
  curl -fsSL "$PLUGIN_SOURCE" -o "$PLUGIN_DIR/$PLUGIN_NAME"
else
  cp "$PLUGIN_SOURCE" "$PLUGIN_DIR/$PLUGIN_NAME"
fi
echo "✓ Plugin written to $(display_path "$PLUGIN_DIR")/$PLUGIN_NAME"

echo "→ Adding ollama/lmstudio providers to $(display_path "$CONFIG_FILE")"
node - "$CONFIG_FILE" "$(display_path "$CONFIG_FILE")" <<'NODE'
const fs = require("fs")
const path = require("path")
const configPath = process.argv[2]
const displayPath = process.argv[3]

let cfg = {}
if (fs.existsSync(configPath)) {
  cfg = JSON.parse(fs.readFileSync(configPath, "utf8"))
}

cfg.$schema ??= "https://opencode.ai/config.json"
cfg.provider ??= {}

const defaults = {
  ollama: {
    npm: "@ai-sdk/openai-compatible",
    name: "Ollama (local)",
    options: { baseURL: "http://localhost:11434/v1" },
  },
  lmstudio: {
    npm: "@ai-sdk/openai-compatible",
    name: "LM Studio (local)",
    options: { baseURL: "http://127.0.0.1:1234/v1" },
  },
}

let changed = false
for (const [id, def] of Object.entries(defaults)) {
  const provider = (cfg.provider[id] ??= {})
  for (const [key, value] of Object.entries(def)) {
    if (provider[key] === undefined) {
      provider[key] = JSON.parse(JSON.stringify(value))
      changed = true
    }
  }
}

if (changed) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n")
  console.log("✓ Providers added to " + displayPath)
} else {
  console.log("✓ Providers already present, config left as-is")
}
NODE

echo "✓ Done. Restart opencode, run /models, then search for ollama/lmstudio."
