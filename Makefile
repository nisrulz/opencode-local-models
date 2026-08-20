.PHONY: help install test doctor

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
	@bash install.sh || (echo "✗ Install failed."; exit 1)

test: ## Run the tests
	@echo "→ Running tests"
	@npm test --silent || (echo "✗ Tests failed."; exit 1)

doctor: ## Check prerequisites
	@bash doctor.sh