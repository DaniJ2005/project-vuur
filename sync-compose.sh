#!/usr/bin/env bash
# sync-compose.sh
set -e
USER="ubuntu-1111384"
HOST="145.24.237.105"

ssh "$USER@$HOST" "mkdir -p ~/vuur/Vuur.Api"
scp -p docker-compose.yml         "$USER@$HOST:~/vuur/docker-compose.yml"
scp -p Vuur.Api/mongo-init.js     "$USER@$HOST:~/vuur/Vuur.Api/mongo-init.js"
ssh "$USER@$HOST" "cd ~/vuur && docker compose config > /dev/null && docker compose up -d && docker compose ps"