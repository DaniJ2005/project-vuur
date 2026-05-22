# Deploy guide — Vuur frontend

Stap-voor-stap instructies om de React frontend van Vuur te deployen op de
schoolserver (`145.24.237.105`) via Docker + Docker Hub + GitHub Actions.

> Doe **fase 1 t/m 4 één keer** als initiele setup. Daarna doet GitHub Actions
> bij elke push naar `main` automatisch een nieuwe deploy.

---

## Fase 1 — Server klaarmaken (1x, op de schoolserver)

SSH naar de server:

```bash
ssh <jouw-user>@145.24.237.105
```

Installeer Docker (Engine + Compose plugin in 1 keer) via de officiele script:

```bash
curl -fsSL https://get.docker.com | sudo sh

# Zorg dat je zonder sudo docker kunt draaien
sudo usermod -aG docker $USER

# Log uit en weer in zodat de groep actief wordt
exit
```

Log opnieuw in en check:

```bash
docker --version
docker compose version    # let op: spatie, geen streepje
```

Maak een projectmap voor het compose-bestand:

```bash
mkdir -p ~/vuur
```

> De `docker-compose.yml` zelf zet je in **Fase 4** met `scp` op deze plek.

---

## Fase 2 — Docker Hub account + access token (1x)

1. Maak een account op **https://hub.docker.com/** als je die nog niet hebt.
2. Onthoud je **username** — die komt straks in GitHub Secrets en in je
   `docker-compose.yml`.
3. Maak een **access token** aan: rechtsboven op je avatar →
   **Account settings** → **Personal access tokens** → **Generate new token**.
   - Naam: `github-actions-vuur` (of iets dergelijks)
   - Permissions: **Read, Write, Delete**
   - Klik **Generate** en **kopieer het token meteen** (je ziet het maar 1x).

Het Docker Hub repo (`<username>/project-vuur-frontend`) wordt **automatisch
aangemaakt** zodra GitHub Actions de eerste image pusht. Standaard wordt die
public — voor een schoolproject prima en het bespaart je een `docker login` op
de server.

> **Check**: staat je Docker Hub username gelijk aan `danij2005` in
> `docker-compose.yml`? Zo niet, pas die regel aan voordat je commit:
> `image: <jouw-dockerhub-username>/project-vuur-frontend:latest`

---

## Fase 3 — SSH deploy key uitwisselen (1x, op je eigen laptop)

GitHub Actions heeft een private key nodig om in te kunnen loggen op de server.
Genereer een **aparte** sleutel speciaal voor deploys — gebruik nooit je
persoonlijke SSH key in CI.

```bash
ssh-keygen -t ed25519 -f vuur_deploy_key -C "github-actions" -N ""
```

Dit geeft twee bestanden:

- `vuur_deploy_key`     → **private key** (komt straks in GitHub Secrets)
- `vuur_deploy_key.pub` → **public key**  (komt op de server)

Zet de public key op de server:

```bash
ssh-copy-id -i vuur_deploy_key.pub <jouw-user>@145.24.237.105
```

Of handmatig: log in op de server en plak de inhoud van `vuur_deploy_key.pub`
onderaan `~/.ssh/authorized_keys`.

---

## Fase 4 — GitHub Secrets instellen (1x)

Ga naar **https://github.com/DaniJ2005/project-vuur** →
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Voeg deze vijf secrets toe:

| Secret                | Inhoud                                                       |
|-----------------------|--------------------------------------------------------------|
| `SERVER_HOST`         | `145.24.237.105`                                             |
| `SERVER_USER`         | je login-username op de schoolserver                         |
| `SSH_PRIVATE_KEY`     | de **inhoud** van `vuur_deploy_key` (private)                |
| `DOCKERHUB_USERNAME`  | je Docker Hub username (bv `danij2005`)                      |
| `DOCKERHUB_TOKEN`     | het access token uit Fase 2                                  |

> Hint: open `vuur_deploy_key` in een editor en kopieer de **hele** inhoud
> incl. `-----BEGIN OPENSSH PRIVATE KEY-----` regels.

### Eerder gemaakte secrets opruimen

Als je in een eerdere setup deze secrets al had aangemaakt voor ghcr.io —
verwijder ze nu, ze zijn niet meer nodig:

- ~~`GHCR_PULL_USER`~~
- ~~`GHCR_PULL_TOKEN`~~

En als je een Personal Access Token op GitHub had aangemaakt voor `read:packages`,
kun je die ook intrekken: GitHub → Settings (account) → Developer settings →
Personal access tokens.

---

## Fase 5 — compose-file naar de server kopieren (1x)

Vanaf je laptop, vanuit de projectmap:

```bash
# Doelmap bestaat al, maar voor de zekerheid:
ssh <jouw-user>@145.24.237.105 "mkdir -p ~/vuur"

# Kopieer de compose file:
scp docker-compose.yml <jouw-user>@145.24.237.105:~/vuur/
```

Check op de server:

```bash
ssh <jouw-user>@145.24.237.105
cat ~/vuur/docker-compose.yml      # moet de frontend + filebrowser tonen
```

---

## Fase 6 — Eerste handmatige deploy om de keten te testen (1x)

Voor je op GitHub Actions vertrouwt: doe eerst 1x handmatig de hele cyclus.
Zo isoleer je waar het eventueel misgaat.

**Op je laptop:**

```bash
# Inloggen op Docker Hub (1x, blijft opgeslagen).
docker login -u <jouw-dockerhub-username>
# Plak je access token als wachtwoord.

# Bouw en push de image:
cd App
docker build -t <jouw-dockerhub-username>/project-vuur-frontend:latest .
docker push <jouw-dockerhub-username>/project-vuur-frontend:latest
```

**Op de server:**

```bash
cd ~/vuur
docker compose pull frontend
docker compose up -d frontend

docker compose ps              # frontend moet "running" zijn
docker compose logs frontend   # mag geen errors tonen
```

Open in de browser: **http://145.24.237.105** → de Vuur catalog moet er staan.

---

## Fase 7 — Filebrowser starten

```bash
cd ~/vuur
docker compose up -d filebrowser
docker compose logs filebrowser | grep -i "randomly generated"
```

In de logs staat de eerste keer een random admin-wachtwoord. Open dan:

**http://145.24.237.105:8080**

- gebruiker: `admin`
- wachtwoord: uit de logs

Verander het wachtwoord direct in de UI (rechtsboven → Settings → User Management).

---

## Fase 8 — Automatische deploys aanzetten

Push een wijziging in `App/` naar `main`:

```bash
git add App/ .github/ docker-compose.yml DEPLOY.md
git commit -m "Setup Docker Hub deploy pipeline"
git push origin main
```

Volg de run via de **Actions** tab op GitHub. Bij succes refresh je
http://145.24.237.105 en zie je de update live.

---

## Fase 9 — API + databases erbij zetten

Vanaf nu draait er naast de frontend ook een ASP.NET API met Postgres,
MongoDB en Redis. Lokaal werkt iedereen tegen z'n eigen containers; de server
draait een identieke stack op productie-credentials.

### Lokaal (1x per teamlid)

```bash
# In de root van de repo:
cp .env.example .env
# Open .env en zet voor elke variabele een sterke waarde.
# Daarna:
docker compose up -d
docker compose ps         # alles op "healthy" / "running"
docker compose logs api   # migrations + Now listening on :8080
```

Test de API: `http://localhost:8080/swagger`.

De DB-ports (5432, 27017, 6379) zijn lokaal exposed via
`docker-compose.override.yml` — handig voor pgAdmin / Mongo Compass / redis-cli.

### Op de server (1x)

```bash
# Vanaf je laptop, vanuit project root:
scp .env.example <jouw-user>@145.24.237.105:~/vuur/
scp docker-compose.yml <jouw-user>@145.24.237.105:~/vuur/

# Op de server:
ssh <jouw-user>@145.24.237.105
cd ~/vuur
cp .env.example .env
nano .env       # vul ECHTE productie wachtwoorden in, lange JWT secret
chmod 600 .env  # alleen jij mag dit lezen
```

> Belangrijk: kopieer `docker-compose.override.yml` NIET naar de server.
> Op productie willen we de DB-ports NIET extern bereikbaar hebben.

### `docker-compose.yml` + `mongo-init.js` naar de server kopieren (handmatig)

De GitHub Actions workflow synct deze files **niet** automatisch — `scp`
vanaf een Actions runner werkt niet betrouwbaar door de schoolfirewall.
Doe het dus met de hand vanaf je laptop, telkens als een van deze twee
files is veranderd:

```bash
# Vanuit project-root op je laptop:

# 1) Maak de Vuur.Api submap op de server (alleen de eerste keer nodig).
ssh <jouw-user>@145.24.237.105 "mkdir -p ~/vuur/Vuur.Api"

# 2) Kopieer beide files. -p behoudt timestamps, handig bij debuggen.
scp -p docker-compose.yml         <jouw-user>@145.24.237.105:~/vuur/docker-compose.yml
scp -p Vuur.Api/mongo-init.js     <jouw-user>@145.24.237.105:~/vuur/Vuur.Api/mongo-init.js

# 3) Verifieer en laat compose direct de wijzigingen oppakken.
ssh <jouw-user>@145.24.237.105 "cd ~/vuur && docker compose config | head -20 && docker compose up -d"
```

`docker compose config` parset je compose-file + `.env` en print het
resultaat — als hij zonder errors door komt, is je file syntactisch goed
en zijn alle `${VARS}` resolved. `up -d` daarna herstart alleen containers
waarvan de config of het image is veranderd.

> Kopieer `docker-compose.override.yml` **niet** mee. Die file zet de
> DB-poorten lokaal open; op productie willen we ze dicht houden.

### Eerste keer op de server: databases + api opstarten

Na de eerste push naar `main` heeft GitHub Actions de frontend + api image
gepushed naar Docker Hub. Wat nog mist: `.env` invullen, compose handmatig
kopieren (zie hierboven), en de databases voor het eerst opstarten. Daarna
blijven ze met `restart: unless-stopped` gewoon doordraaien.

```bash
ssh <jouw-user>@145.24.237.105
cd ~/vuur

# Pull alle images (DB images komen nu binnen vanaf Docker Hub).
docker compose pull

# Start alleen de DBs eerst, zodat hun healthchecks groen worden.
docker compose up -d postgres mongo redis
docker compose ps               # alle 3 moeten "healthy" worden

# Daarna api + frontend (die wachten via depends_on op gezonde DBs).
docker compose up -d api frontend
docker compose logs api         # check op migrations success + Now listening on :8080
```

Open: **http://145.24.237.105:8080/swagger** (alleen als
`ASPNETCORE_ENVIRONMENT` op Development staat — by default is dat Production,
zie compose).

### Wat is er veranderd in de poorten

| Poort  | Service     |
|--------|-------------|
| 80     | frontend    |
| 8080   | api         |
| 8081   | filebrowser (was 8080) |
| intern | postgres, mongo, redis |

### GitHub Actions — wat draait er automatisch

De workflow `.github/workflows/deploy.yml` doet bij elke push naar `main` die
iets in `App/`, `Vuur.Api/`, `docker-compose.yml`, of de workflow zelf raakt:

1. Bouwt frontend + api image **parallel** (matrix-strategie) en pusht ze naar Docker Hub.
2. SSH't naar de server, draait `docker compose pull frontend api` + `docker compose up -d`, en ruimt dangling images op.

> `docker-compose.yml` en `Vuur.Api/mongo-init.js` worden **handmatig** naar
> de server gekopieerd (zie sectie hierboven). De workflow gaat ervan uit dat
> die files al actueel zijn in `~/vuur/`.

Een handmatige deploy forceren? Ga naar **Actions → Deploy → Run workflow**.

---

## Veelgemaakte fouten

- **`unauthorized: incorrect username or password`** bij `docker push` in
  Actions → `DOCKERHUB_TOKEN` is verkeerd gekopieerd of het token mist
  Write-permissions. Maak een nieuw token aan in Docker Hub.
- **`manifest unknown`** bij `docker compose pull` op de server → het image
  is nooit gepushed, of de image-naam in `docker-compose.yml` matcht niet
  met je Docker Hub username. Check `<username>/project-vuur-frontend`.
- **`pull access denied`** → je Docker Hub repo staat per ongeluk op private.
  Ga naar hub.docker.com → je repo → Settings → Visibility → Public.
  (Of: log in op de server met `docker login` en hou hem private — meer werk.)
- **Port 80 already in use** → er draait al iets anders op poort 80 op de
  server (apache/nginx). Stop het of pas de port mapping aan naar `"8000:80"`.
- **React Router 404 op een sub-URL** → `nginx.conf` is niet meegekopieerd
  in de image, check Dockerfile en rebuild.
