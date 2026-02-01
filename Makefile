APP_NAME=links-server
HOST=ioithosting@ioit.acm.org
PORT=7822
KEY=~/.ssh/id_rsa
REMOTE_DIR=~/links.ioit.acm.org

build:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o $(APP_NAME) .
	chmod +x $(APP_NAME)

frontend:
	cd frontend && bun install && bun run build

stop:
	ssh -i $(KEY) $(HOST) -p $(PORT) 'pkill -f $(APP_NAME) || true; mkdir -p $(REMOTE_DIR)/frontend'

upload:
	scp -i $(KEY) -P $(PORT) $(APP_NAME) restart.sh $(HOST):$(REMOTE_DIR)/
	scp -i $(KEY) -P $(PORT) -r templates $(HOST):$(REMOTE_DIR)/
	scp -i $(KEY) -P $(PORT) -r frontend/dist/* $(HOST):$(REMOTE_DIR)/frontend/dist/

start:
	ssh -i $(KEY) $(HOST) -p $(PORT) 'cd $(REMOTE_DIR) && nohup ./$(APP_NAME) > output.log 2>&1 &'

deploy: build frontend stop upload start
