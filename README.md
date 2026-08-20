# opencode-local-models

Auto-discovers **Ollama** and **LM Studio** chat models in [opencode](https://opencode.ai)
at startup. No hardcoded model lists to keep in sync.

## Requirements

- Ollama running on `http://localhost:11434` (optional)
- LM Studio local server running on `http://127.0.0.1:1234` (optional)
- Either engine can be absent. The plugin simply skips it.

## Quick start

Install the plugin into opencode's global plugins directory:

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/main/install.sh | bash
```

The script copies the plugin to `~/.config/opencode/plugins/opencode-local-models.js`
and adds the `ollama` and `lmstudio` providers to `~/.config/opencode/opencode.json`.

opencode auto-loads every file in the plugins directory when it starts, so the
plugin needs no extra config. For a project-level or manual install, see the
[install instructions](/docs/INSTALL.md).

Restart opencode, run `/models`, and search for `ollama` or `lmstudio`. Once an
engine is running with a chat model loaded, you will see live entries like
`ollama/llm2.5:8b`.

Models are discovered when opencode starts, not while it runs. If you add or
remove models on an engine, restart opencode so the picker catches up.

## Docs

- [Options](/docs/OPTIONS.md)
- [Under the hood](/docs/HOW-IT-WORKS.md)
- [Development](/docs/DEV.md)

### License

[Apache License, Version 2.0](/LICENSE)
