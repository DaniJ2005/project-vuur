#!/usr/bin/env bash
# =============================================================================
# sync-compose.sh — kopieer docker-compose.yml + mongo-init.js naar de
# schoolserver en pas de wijzigingen direct toe.
#
# Wordt handmatig gebruikt omdat de schoolfirewall geen scp vanuit GitHub
# Actions runners doorlaat. Zie DEPLOY.md voor de achtergrond.
#
# Usage:
#   ./scripts/sync-compose.sh                     # vraagt om username
#   SCHOOL_USER=jurjevic ./scripts/sync-compose.sh
#   ./scripts/sync-compose.sh jurjevic
# =============================================================================
set -euo pipefail

HOST="${SCHOOL_HOST:-145.24.237.105}"
USER="${SCHOOL_USER:-${1:-}}"

# Run vanuit de project-root, niet vanuit scripts/.
# Dit pakt de map waar dit script in staat, en gaat 1 niveau omhoog.
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ -z "$USER" ]]; then
  read -r -p "School-server username: " USER
fi
if [[ -z "$USER" ]]; then
  echo "Geen username opgegeven. Gebruik SCHOOL_USER=... of geef hem als arg mee." >&2
  exit 1
fi

echo "→ Sync naar $USER@$HOST:~/vuur/"

# Zorg dat de Vuur.Api submap bestaat (eerste keer).
ssh "$USER@$HOST" "mkdir -p ~/vuur/Vuur.Api"

# Kopieer met timestamps zodat je later op de server kunt zien wanneer
# de laatste sync was.
scp -p docker-compose.yml     "$USER@$HOST:~/vuur/docker-compose.yml"
scp -p Vuur.Api/mongo-init.js "$USER@$HOST:~/vuur/Vuur.Api/mongo-init.js"

# Validate compose-file (resolvet .env + checkt syntax) en herstart alleen
# wat veranderd is. Op deze manier zien we eventuele fouten meteen.
ssh "$USER@$HOST" "set -e
  cd ~/vuur
  echo '→ docker compose config (eerste 20 regels):'
  docker compose config | head -20
  echo '→ docker compose up -d'
  docker compose up -d
  echo '→ docker compose ps'
  docker compose ps
"
