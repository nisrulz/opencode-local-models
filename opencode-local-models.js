// Local model discovery for Ollama and LM Studio.
// This runs on opencode startup (config hook) and fills each provider's
// model list from the engine's live API. When an engine only has embeddings,
// its list stays empty. That keeps the provider out of the picker so you do
// not see stale built-in presets.

const DEFAULTS = {
  ollamaUrl: "http://localhost:11434/api/tags",
  lmStudioUrl: "http://127.0.0.1:1234/api/v1/models",
  timeout: 4000,
  debug: false,
}

function resolveOptions(options) {
  const o = options ?? {}
  return {
    ollamaUrl: typeof o.ollamaUrl === "string" ? o.ollamaUrl : DEFAULTS.ollamaUrl,
    lmStudioUrl: typeof o.lmStudioUrl === "string" ? o.lmStudioUrl : DEFAULTS.lmStudioUrl,
    timeout: Number.isFinite(o.timeout) ? o.timeout : DEFAULTS.timeout,
    debug: Boolean(o.debug),
  }
}

function debugLog(enabled, ...args) {
  if (enabled) console.error("[opencode-local-models]", ...args)
}

// Fetch JSON from a URL. Throw on network error or non-2xx response.
async function fetchJSON(url, timeout) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

// True when every reported capability is "embedding" (nothing can chat).
function isEmbeddingOnly(capabilities) {
  if (!Array.isArray(capabilities) || capabilities.length === 0) return false
  return capabilities.every((cap) => String(cap).toLowerCase() === "embedding")
}

// Ask Ollama for its local models and return a { id: { name } } map.
// Every discover* function resolves to a map even when the engine is
// unreachable, so the caller never has to guard against rejections.
async function discoverOllama(url, timeout, debug) {
  const models = {}
  try {
    const data = await fetchJSON(url, timeout)
    for (const model of data?.models ?? []) {
      const id = model?.name
      if (!id) continue
      if (isEmbeddingOnly(model?.capabilities)) continue
      models[id] = { name: id }
    }
  } catch (err) {
    debugLog(debug, `ollama discovery failed: ${err?.message ?? err}`)
  }
  return models
}

// Ask LM Studio for its models. Returns a { id: { name, context } } map.
async function discoverLmStudio(url, timeout, debug) {
  const models = {}
  try {
    const data = await fetchJSON(url, timeout)
    for (const model of data?.models ?? []) {
      if (model?.type === "embedding") continue
      const id = model?.key
      if (!id) continue
      const context =
        model?.loaded_instances?.[0]?.config?.context_length ||
        model?.max_context_length ||
        undefined
      models[id] = { name: model?.display_name || id, ...(context ? { context } : {}) }
    }
  } catch (err) {
    debugLog(debug, `lmstudio discovery failed: ${err?.message ?? err}`)
  }
  return models
}

// Set the provider's models and pin the visible set with a whitelist.
// opencode merges models.dev preset models for a matching provider id, so
// the whitelist keeps stale presets out. When the engine has no chat models,
// both stay empty and the provider is not shown at all.
function applyModels(config, providerId, models) {
  const provider = config.provider?.[providerId]
  if (!provider) return
  provider.models = models
  provider.whitelist = Object.keys(models)
}

export const LocalModels = async (_input, options) => {
  const cfg = resolveOptions(options)
  return {
    config: async (config) => {
      config.provider ??= {}
      const [ollama, lmStudio] = await Promise.all([
        discoverOllama(cfg.ollamaUrl, cfg.timeout, cfg.debug),
        discoverLmStudio(cfg.lmStudioUrl, cfg.timeout, cfg.debug),
      ])
      applyModels(config, "ollama", ollama)
      applyModels(config, "lmstudio", lmStudio)
    },
  }
}

export default LocalModels
