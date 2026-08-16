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
export GIN_MODE=release
# Go's scheduler sizes its OS-thread pool off GOMAXPROCS, which defaults to
# the visible core count -- 64 on this host (the hypervisor's count, not what
# this hosting account is actually entitled to). Left unset, this server sits
# idle holding ~25 OS threads that count against the account's shared
# process/task limit before a single real request arrives. Override via the
# environment if 4 turns out to be too tight under real load.
export GOMAXPROCS="${GOMAXPROCS:-4}"
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
