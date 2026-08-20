.PHONY: help install set-version test doctor

CHECKOUT_VERSION := $(shell git describe --tags --exact-match HEAD 2>/dev/null)
VERSION ?= $(if $(CHECKOUT_VERSION),$(CHECKOUT_VERSION),v0.1.0)
VERSION_SOURCE := $(origin VERSION)

.DEFAULT_GOAL := help

help: ## List all commands
	@echo "opencode-local-models"
	@echo ""
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-10s %s\n", $$1, $$2}'
	@echo ""
	@echo "For details, see https://github.com/nisrulz/opencode-local-models"

install: ## Install the plugin into opencode
	@if [ "$(VERSION_SOURCE)" = "command line" ]; then \
		echo "→ Checking out tag $(VERSION)"; \
		if ! git show-ref --verify --quiet "refs/tags/$(VERSION)" || ! git checkout --quiet "$(VERSION)"; then \
			echo "✗ Could not check out tag $(VERSION). Available tags:" >&2; \
			tags="$$(git tag --sort=-version:refname)"; \
			if [ -n "$$tags" ]; then printf '%s\n' "$$tags" | while IFS= read -r tag; do echo "  $$tag"; done; else echo "  No tags found."; fi; \
			exit 1; \
		fi; \
	fi; \
	bash install.sh --version "$(VERSION)" || (echo "✗ Install failed."; exit 1)

set-version: ## Set the default installer version
	@node scripts/set-version.js "$(VERSION)"

test: ## Run the tests
	@echo "→ Running tests"
	@npm test --silent || (echo "✗ Tests failed."; exit 1)

doctor: ## Check prerequisites
	@bash doctor.sh
