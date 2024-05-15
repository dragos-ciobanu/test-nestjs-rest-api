.PHONY = init up node test down

init:
	cp ./.env.dist ./.env

up:
	docker-compose up -d

node: up
	docker-compose exec app sh


test: up
	docker-compose exec app sh -c "npm run test"
	docker-compose exec app sh -c "npm run test:e2e"

down:
	docker-compose down --remove-orphans
