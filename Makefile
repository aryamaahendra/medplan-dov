.PHONY: up down restart shell tinker test lint format fix dev build migrate seed

SAIL := ./vendor/bin/sail

up:
	$(SAIL) up -d

down:
	$(SAIL) down

restart:
	$(SAIL) restart

shell:
	$(SAIL) shell

tinker:
	$(SAIL) artisan tinker

test:
	$(SAIL) artisan test

lint:
	$(SAIL) npm run lint

format:
	$(SAIL) npm run format

# Combined fix command as requested: pint && format && lint
fix:
	$(SAIL) bin pint
	$(SAIL) npm run format
	$(SAIL) npm run lint

npm-dev:
	$(SAIL) npm run dev

npm-build:
	$(SAIL) npm run build

migrate:
	$(SAIL) artisan migrate

seed:
	$(SAIL) artisan db:seed
