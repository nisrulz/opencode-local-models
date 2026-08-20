.PHONY: help install set-version test doctor

VERSION ?= v0.1.0

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
	@bash install.sh --version "$(VERSION)" || (echo "✗ Install failed."; exit 1)

set-version: ## Set the default installer version
	@node scripts/set-version.js "$(VERSION)"

test: ## Run the tests
	@echo "→ Running tests"
	@npm test --silent || (echo "✗ Tests failed."; exit 1)

doctor: ## Check prerequisites
	@bash doctor.sh
