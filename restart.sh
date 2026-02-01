#!/bin/bash

APP_NAME="links-server"
TARGET_DIR="/home/ioithosting/links.ioit.acm.org"
PORT=5937

# Move to the application directory
cd $TARGET_DIR || exit

echo "Stopping existing $APP_NAME processes..."
# 1. Try pkill first (cleaner)
pkill -f $APP_NAME || true
sleep 2

# 2. Force kill if it's still hanging (safety check)
pgrep -f $APP_NAME | xargs kill -9 >/dev/null 2>&1 || true

echo "Setting permissions..."
chmod +x $APP_NAME

echo "Starting $APP_NAME..."
# Run with nohup and redirect output to app.log
# We use 'env GIN_MODE=release' to ensure it runs in production mode
nohup ./$APP_NAME >>$TARGET_DIR/app.log 2>&1 &

# Give it a second to start
sleep 1

# Check if it's actually running
if pgrep -f $APP_NAME >/dev/null; then
	echo "Successfully started $APP_NAME."
else
	echo "Error: $APP_NAME failed to start. Check $TARGET_DIR/app.log"
	exit 1
fi
