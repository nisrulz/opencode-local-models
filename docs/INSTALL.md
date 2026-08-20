# Install

## Project-level install

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/v0.1.0/install.sh \
  | bash -s -- .opencode/plugins
```

Use a release tag to install a fixed version. The installer uses `v0.1.0` by
default when you run it from a checkout or with `make install`.

```sh
make install VERSION=v0.1.0
```

For a different release, use its tag in the URL. The tag and the default
installer version normally match, so users do not need to pass `--version`.

## Manual install

```sh
git clone https://github.com/nisrulz/opencode-local-models
mkdir -p ~/.config/opencode/plugins
cp opencode-local-models/opencode-local-models.js ~/.config/opencode/plugins/
```

## Provider config

Then make sure your config declares both providers. The install script does
this for you:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama (local)",
      "options": { "baseURL": "http://localhost:11434/v1" }
    },
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LM Studio (local)",
      "options": { "baseURL": "http://127.0.0.1:1234/v1" }
    }
  }
}
```
