.PHONY: build run start build-frontend build-backend

build: build-frontend build-backend

build-frontend:
	cd frontend && bun run build

build-backend:
	GIN_MODE=release go build -o bin main.go

run:
	(go run main.go) & (cd frontend && bun run dev)

start: build-backend
	./bin
