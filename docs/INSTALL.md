# Install

## Latest tagged version

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/main/install.sh \
  | bash
```

The `main` installer uses the default version set for the latest release.

## Install from a checkout

Clone the repository, then install the checkout:

```sh
git clone https://github.com/nisrulz/opencode-local-models.git
cd opencode-local-models
make install
```

To install a specific version, pass its tag to Make. Make checks out the tag
before it runs the installer.

```sh
make install VERSION=v0.1.1
```

If the tag does not exist, Make prints the available tags.

For a project-level install, pass `.opencode/plugins` to the installer:

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/main/install.sh \
  | bash -s -- .opencode/plugins
```

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
