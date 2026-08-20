import fs from "node:fs"

const version = process.argv[2]
const versionPattern = /^v?[0-9]+(\.[0-9]+){2}([.-][0-9A-Za-z.-]+)?$/
const installerPath = new URL("../install.sh", import.meta.url)
const repoRoot = new URL("..", import.meta.url)

if (!version || !versionPattern.test(version)) {
  console.error("✗ Invalid version. Use a tag such as v0.1.0.")
  process.exit(1)
}

const source = fs.readFileSync(installerPath, "utf8")
const defaultVersionPattern = /^DEFAULT_VERSION="[^"]+"$/m

if (!defaultVersionPattern.test(source)) {
  console.error("✗ DEFAULT_VERSION was not found in install.sh")
  process.exit(1)
}

const updated = source.replace(defaultVersionPattern, `DEFAULT_VERSION="${version}"`)
if (updated !== source) fs.writeFileSync(installerPath, updated)

const replacements = new Map([
  ["Makefile", [/^VERSION \?= .+$/m, `VERSION ?= ${version}`]],
  ["package.json", [/(\"version\": \")([^\"]+)(\")/, `$1${version.slice(1)}$3`]],
  ["README.md", [/v[0-9]+\.[0-9]+\.[0-9]+/g, version]],
  ["docs/INSTALL.md", [/v[0-9]+\.[0-9]+\.[0-9]+/g, version]],
  ["docs/DEV.md", [/v[0-9]+\.[0-9]+\.[0-9]+/g, version]],
  ["install.sh", [/v[0-9]+\.[0-9]+\.[0-9]+/g, version]],
])

for (const [relativePath, ...fileReplacements] of replacements) {
  const fileUrl = new URL(relativePath, repoRoot)
  let next = fs.readFileSync(fileUrl, "utf8")
  for (const [pattern, replacement] of fileReplacements) next = next.replace(pattern, replacement)
  const file = fs.readFileSync(fileUrl, "utf8")
  if (next !== file) fs.writeFileSync(fileUrl, next)
}

console.log(`✓ Default installer version set to ${version}`)
