import { test } from "node:test"
import assert from "node:assert/strict"
import http from "node:http"
import LocalModels from "../opencode-local-models.js"

const OLLAMA_FIXTURE = {
  models: [
    { name: "llama3.2:3b", capabilities: ["completion", "tools"] },
    { name: "nomic-embed-text", capabilities: ["embedding"] },
    { name: "qwen2.5:8b", capabilities: ["completion"] },
  ],
}

const LMSTUDIO_FIXTURE = {
  models: [
    { key: "local-model-1", display_name: "Local Model 1", max_context_length: 8192, type: "chat" },
    { key: "embed-model", display_name: "Embed Model", type: "embedding" },
    {
      key: "local-model-2",
      display_name: "Local Model 2",
      max_context_length: 16384,
      type: "chat",
      loaded_instances: [{ config: { context_length: 4096 } }],
    },
  ],
}

async function startEngine(routes) {
  const server = http.createServer((req, res) => {
    const handler = routes[req.url]
    if (!handler) {
      res.writeHead(404)
      res.end()
      return
    }
    res.writeHead(200, { "content-type": "application/json" })
    res.end(JSON.stringify(handler()))
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address()
  return { port, close: () => new Promise((resolve) => server.close(resolve)) }
}

async function runPlugin(ollamaUrl, lmStudioUrl) {
  const plugin = await LocalModels(null, { ollamaUrl, lmStudioUrl })
  const config = { provider: { ollama: {}, lmstudio: {} } }
  await plugin.config(config)
  return config
}

test("discovers chat models from ollama and lmstudio", async () => {
  const ollama = await startEngine({ "/api/tags": () => OLLAMA_FIXTURE })
  const lmstudio = await startEngine({ "/api/v1/models": () => LMSTUDIO_FIXTURE })
  try {
    const config = await runPlugin(
      `http://127.0.0.1:${ollama.port}/api/tags`,
      `http://127.0.0.1:${lmstudio.port}/api/v1/models`,
    )

    assert.deepEqual(config.provider.ollama.models, {
      "llama3.2:3b": { name: "llama3.2:3b" },
      "qwen2.5:8b": { name: "qwen2.5:8b" },
    })
    assert.deepEqual(config.provider.ollama.whitelist, ["llama3.2:3b", "qwen2.5:8b"])

    assert.deepEqual(config.provider.lmstudio.models, {
      "local-model-1": { name: "Local Model 1", context: 8192 },
      "local-model-2": { name: "Local Model 2", context: 4096 },
    })
    assert.deepEqual(config.provider.lmstudio.whitelist, ["local-model-1", "local-model-2"])
  } finally {
    await ollama.close()
    await lmstudio.close()
  }
})

test("embedding-only models are excluded", async () => {
  const ollama = await startEngine({ "/api/tags": () => OLLAMA_FIXTURE })
  const lmstudio = await startEngine({ "/api/v1/models": () => LMSTUDIO_FIXTURE })
  try {
    const config = await runPlugin(
      `http://127.0.0.1:${ollama.port}/api/tags`,
      `http://127.0.0.1:${lmstudio.port}/api/v1/models`,
    )
    assert.ok(!("nomic-embed-text" in config.provider.ollama.models))
    assert.ok(!("embed-model" in config.provider.lmstudio.models))
  } finally {
    await ollama.close()
    await lmstudio.close()
  }
})

test("loaded instance context wins over max_context_length", async () => {
  const ollama = await startEngine({ "/api/tags": () => ({ models: [] }) })
  const lmstudio = await startEngine({ "/api/v1/models": () => LMSTUDIO_FIXTURE })
  try {
    const config = await runPlugin(
      `http://127.0.0.1:${ollama.port}/api/tags`,
      `http://127.0.0.1:${lmstudio.port}/api/v1/models`,
    )
    assert.equal(config.provider.lmstudio.models["local-model-2"].context, 4096)
  } finally {
    await ollama.close()
    await lmstudio.close()
  }
})

test("unreachable engines leave providers empty", async () => {
  const config = await runPlugin("http://127.0.0.1:1/api/tags", "http://127.0.0.1:1/api/v1/models")
  assert.deepEqual(config.provider.ollama, { models: {}, whitelist: [] })
  assert.deepEqual(config.provider.lmstudio, { models: {}, whitelist: [] })
})