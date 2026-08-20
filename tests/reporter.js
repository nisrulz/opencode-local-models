import { inspect } from "node:util"

export default async function* (source) {
  let pass = 0
  let fail = 0
  for await (const event of source) {
    if (event.type === "test:pass") {
      pass++
      yield `✔ ${event.data.name}\n`
    } else if (event.type === "test:fail") {
      fail++
      yield `✗ ${event.data.name}\n`
      const err = event.data.details?.error ?? event.data.error
      const cause = err?.cause ?? err
      if (cause) {
        const lines = []
        if (cause.message) lines.push(cause.message)
        if (cause.actual !== undefined && cause.expected !== undefined) {
          lines.push(`actual:   ${inspect(cause.actual)}`)
          lines.push(`expected: ${inspect(cause.expected)}`)
        }
        if (lines.length > 0) yield lines.map((line) => `  ${line}`).join("\n") + "\n"
      }
    }
  }
  if (fail > 0) {
    yield `✗ ${fail} of ${pass + fail} tests failed\n`
  } else {
    yield `✔ All ${pass} tests passed\n`
  }
}