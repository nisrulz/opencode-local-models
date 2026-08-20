# Options

Pass options to override the defaults. Handy when your engines run on custom
ports, or you want longer timeouts or debug logging:

```json
{
  "plugin": [
    {
      "package": "opencode-local-models",
      "options": {
        "ollamaUrl": "http://localhost:11434/api/tags",
        "lmStudioUrl": "http://127.0.0.1:1234/api/v1/models",
        "timeout": 4000,
        "debug": false
      }
    }
  ]
}
```

- `ollamaUrl`: Ollama tags endpoint. Default: `http://localhost:11434/api/tags`.
- `lmStudioUrl`: LM Studio native models endpoint. Default: `http://127.0.0.1:1234/api/v1/models`.
- `timeout`: Per-request timeout in milliseconds. Default: `4000`.
- `debug`: Log engine discovery failures to stderr when `true`. Default: `false`.