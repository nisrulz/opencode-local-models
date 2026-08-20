import fs from "node:fs"

const version = process.argv[2]
const versionPattern = /^v?[0-9]+(\.[0-9]+){2}([.-][0-9A-Za-z.-]+)?$/
const installerPath = new URL("../install.sh", import.meta.url)

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
console.log(`✓ Default installer version set to ${version}`)
