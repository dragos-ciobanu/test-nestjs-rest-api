.PHONY = init up node health test down

# include ./.env.dist
# -include ./.env

init:
	cp ./.env.dist ./.env

up:
	docker-compose up -d

node: up
	docker-compose exec app bash

health: up
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console monitor:health"
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console monitor:health --env=test"


test: up
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console doctrine:schema:validate --em=postgresql --env=test"
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console doctrine:schema:validate --em=mysql --skip-sync --env=test"
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console doctrine:fixtures:load --em=postgresql --purge-with-truncate --no-interaction --env=test"
	docker-compose exec php sh -c "XDEBUG_MODE=off php ./bin/console hautelook:fixtures:load --manager=mysql --purge-with-truncate --no-interaction --env=test"
	docker-compose exec php sh -c "XDEBUG_MODE=off php -d memory_limit=1G ./bin/phpunit"

down:
	docker-compose down --remove-orphans
