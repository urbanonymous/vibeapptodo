.PHONY: help up down build rebuild logs ps restart clean \
	frontend-install frontend-dev frontend-build \
	backend-dev

help:
	@echo "VibeTracker commands:"
	@echo ""
	@echo "Docker:"
	@echo "  make up         Start full stack (detached)"
	@echo "  make down       Stop stack"
	@echo "  make build      Build images"
	@echo "  make rebuild    Rebuild images (no cache)"
	@echo "  make logs       Tail logs"
	@echo "  make ps         Show containers"
	@echo "  make restart    Restart stack"
	@echo "  make clean      Stop + remove volumes (DANGEROUS: deletes Mongo data)"
	@echo ""
	@echo "Local dev (optional, non-docker):"
	@echo "  make frontend-install"
	@echo "  make frontend-dev"
	@echo "  make frontend-build"
	@echo "  make backend-dev"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

restart:
	docker compose restart

clean:
	docker compose down -v

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

backend-dev:
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

