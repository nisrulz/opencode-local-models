# Under the hood

1. On startup, opencode calls the plugin's `config` hook.
2. The plugin fetches engine model lists in parallel:
   - Ollama: `GET /api/tags`
   - LM Studio: `GET /api/v1/models`
3. It maps each chat model to `{ id: { name } }` and writes it to
   `config.provider.<id>.models`. For LM Studio only, the model's context window
   is also captured from `max_context_length` (or the loaded instance) so
   opencode budgets tokens correctly.
4. The provider's `whitelist` is set to the discovered model ids. opencode merges
   models.dev preset models for a matching provider id, so the whitelist is what
   keeps stale presets out of the picker.
5. If a provider has no chat models, `models` and `whitelist` stay empty and the
   provider is not shown in the picker at all. It reappears once the engine
   serves a chat model.

Discovery runs once, at startup. Adding or removing models on an engine later
needs an opencode restart so the picker catches up.

That's all there is to it.