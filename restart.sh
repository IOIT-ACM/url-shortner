#!/bin/bash

APP_NAME="links-server"
TARGET_DIR="/home/ioithosting/links.ioit.acm.org"
PORT=5937

cd $TARGET_DIR

fuser -k $PORT/tcp || pkill -f $APP_NAME || true
sleep 2

chmod +x $APP_NAME

nohup ./$APP_NAME >>$TARGET_DIR/app.log 2>&1 &
