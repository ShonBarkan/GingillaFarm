.PHONY: sniff bite check-all

sniff:
	@echo "🐕 HealthDog is sniffing for messy code..."
	uv run ruff check . --fix
	uv run ruff format .
	uv run mypy .

bite:
	@echo "🐕 HealthDog is testing the logic..."
	uv run pytest --cov=app

check-all: sniff bite

#######################################################################################################################


.PHONY: health-check

health-check:
	@python3 watchDogs/healthDog/healthDog.py