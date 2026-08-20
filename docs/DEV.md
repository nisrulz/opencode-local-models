# Development

Developer notes for `opencode-local-models`.

## Prerequisites

- Node.js 18 or newer
- bash
- curl
- git

Run `make doctor` to check all of them at once.

## Make commands

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `make help`      | List all available commands.                      |
| `make doctor`    | Check that prerequisites and the plugin are in place. |
| `make install`   | Install the plugin into opencode.                 |
| `make test`      | Run the e2e test suite.                           |

## Developer focus

### The plugin

`opencode-local-models.js` is the whole plugin. It exports `LocalModels`, a
function that returns a `config` hook. opencode calls that hook at startup.

The hook does three things:

1. Fetches the model list from Ollama (`/api/tags`) and LM Studio
   (`/api/v1/models`) in parallel.
2. Filters out embedding-only models.
3. Writes the chat models into `config.provider.<id>.models` and pins the
   visible set with `whitelist`.

If an engine is unreachable, its provider keeps an empty list and stays out of
the picker. No crash, no stale entries.

### Options

The plugin reads options from the second argument of `LocalModels`. The
defaults live in `DEFAULTS` at the top of the file. See
[`docs/OPTIONS.md`](/docs/OPTIONS.md) for the full list.

### Tests

The tests live in `tests/`. They are end-to-end tests, not unit tests. Each
test starts fake Ollama and LM Studio HTTP servers, feeds them fixture JSON,
runs the real plugin hook, and asserts on the resulting config. That covers
the full discovery path without needing the real engines.

`tests/reporter.js` turns node's test output into clean ✔/✗ lines. You do not
need to touch it unless you change how results print.

To add a test:

1. Add a fixture in `tests/e2e.test.js`.
2. Start the fake engine with `startEngine`.
3. Assert on the config the plugin produces.

### Install script

`install.sh` copies the plugin into the opencode plugins directory and merges
the provider block into the opencode config. Running it from a checkout uses
the local files. Piping it through `curl` from GitHub works too, because it
falls back to the remote source when no local copy is present.

### Versioned installs

Release tags pin both the installer and the plugin source. Use the same tag in
both URLs:

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/v0.1.0/install.sh \
  | bash
```

For a project-level install, pass the plugin directory after the version:

```sh
curl -fsSL https://raw.githubusercontent.com/nisrulz/opencode-local-models/v0.1.0/install.sh \
  | bash -s -- .opencode/plugins
```

From a checkout, select the release with Make:

```sh
make install VERSION=v0.1.0
```

Prepare the next release with Make. This updates the default used by the
installer in the next tag:

```sh
make set-version VERSION=v0.2.0
make test
git diff -- install.sh
```

The Make target calls `scripts/set-version.js`. Run the script directly when
you need to use it outside Make:

```sh
node scripts/set-version.js v0.2.0
```

Then commit the change and create the matching tag. The version must use a
release-tag format such as `v0.1.0` or `v0.1.0-rc.1`.

### Doctor

`doctor.sh` checks node, bash, curl, git, opencode, and the installed plugin.
`make doctor` runs it and exits non-zero when something is missing.

## Keeping this repo healthy

- Run `make doctor` after a fresh clone.
- Run `make test` before pushing.
- Add an e2e test when you change discovery behavior.
- Keep the plugin file self-contained. It has no runtime dependencies.

That's about all there is to it.
