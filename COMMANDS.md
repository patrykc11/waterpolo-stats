# 🔧 Przydatne komendy

Szybki spis najważniejszych komend dla projektu WTS Stats.

## 📦 Setup i instalacja

```bash
# Instalacja zależności
npm install

# Setup z Dockerem (NAJSZYBSZE)
docker-compose up -d

# Prisma generate
npx prisma generate

# Migracje
npx prisma migrate dev
npx prisma migrate deploy  # production

# Seed (przykładowe dane)
npx prisma db seed
```

## 🚀 Uruchamianie

```bash
# Development
npm run dev                 # http://localhost:3000

# Production build
npm run build
npm run start

# Docker
docker-compose up -d        # Start w tle
docker-compose up           # Start z logami
docker-compose down         # Stop
docker-compose restart      # Restart
```

## 🗄️ Baza danych

```bash
# Prisma Studio (GUI)
npx prisma studio           # http://localhost:5555

# Migracje
npx prisma migrate dev --name nazwa
npx prisma migrate deploy
npx prisma migrate reset    # UWAGA: usuwa dane!

# Backup
./scripts/backup.sh
docker exec waterpolo-db pg_dump -U waterpolo waterpolo_stats > backup.sql

# Restore
./scripts/restore.sh backups/backup.sql.gz
docker exec -i waterpolo-db psql -U waterpolo waterpolo_stats < backup.sql

# Połącz się do bazy
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats
# lub lokalnie:
psql -U waterpolo waterpolo_stats
```

## 🐳 Docker

```bash
# Status kontenerów
docker-compose ps

# Logi
docker-compose logs -f              # wszystkie
docker-compose logs -f app          # tylko app
docker-compose logs -f postgres     # tylko db

# Restart usług
docker-compose restart app
docker-compose restart postgres

# Przebuduj obrazy
docker-compose up -d --build

# Usuń wszystko (z danymi!)
docker-compose down -v

# Shell w kontenerze
docker exec -it waterpolo-app sh
docker exec -it waterpolo-db bash

# Stats kontenerów
docker stats
```

## 🔍 Debugging

```bash
# Check czy port wolny
lsof -i :3000
lsof -i :5432

# Kill process na porcie
lsof -ti:3000 | xargs kill
lsof -ti:5432 | xargs kill

# Sprawdź logi Next.js
docker-compose logs -f app | grep error

# Sprawdź logi PostgreSQL
docker-compose logs -f postgres | grep ERROR

# Healthcheck bazy
docker exec waterpolo-db pg_isready -U waterpolo
```

## 📊 SQL Queries (przydatne)

```bash
# Wejdź do psql
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats

# W psql:
\dt                          # Lista tabel
\d events                    # Struktura tabeli events
\q                           # Wyjście

# SQL queries:
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM matches;
SELECT * FROM settings;
SELECT * FROM players ORDER BY number;

# Najnowsze eventy
SELECT * FROM events ORDER BY timestamp DESC LIMIT 10;

# Stats dla meczu
SELECT player_name, SUM(is_goal_from_play) as goals
FROM events
WHERE match_id = 'mecz_001'
GROUP BY player_name
ORDER BY goals DESC;

# Wyczyść wszystkie eventy (OSTROŻNIE!)
DELETE FROM events;
```

## 🧪 Development

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Format (jeśli masz prettier)
npx prettier --write .

# Check bundle size
npm run build
ls -lh .next/static/

# Environment info
node -v
npm -v
docker --version
docker-compose --version
```

## 🚀 Deployment

```bash
# Build production
npm run build

# Test production build lokalnie
npm run start

# Deploy script (jeśli na serwerze)
./scripts/deploy.sh production

# PM2 (Node.js process manager)
pm2 start npm --name "waterpolo" -- start
pm2 restart waterpolo
pm2 logs waterpolo
pm2 stop waterpolo
pm2 delete waterpolo

# Systemd service
sudo systemctl start waterpolo
sudo systemctl restart waterpolo
sudo systemctl status waterpolo
sudo systemctl enable waterpolo  # autostart on boot
```

## 🔒 Security

```bash
# Zmień PIN (przez Prisma Studio lub SQL)
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats \
  -c "UPDATE settings SET editor_pin = '9999' WHERE id = 1;"

# Zmień hasło do bazy
docker exec -it waterpolo-db psql -U waterpolo \
  -c "ALTER USER waterpolo WITH PASSWORD 'new_secure_password';"

# Następnie zaktualizuj DATABASE_URL w .env
```

## 📦 Backup automatyczny (cron)

```bash
# Dodaj do crontab
crontab -e

# Backup codziennie o 3:00 AM
0 3 * * * cd /path/to/waterpolo-stats && ./scripts/backup.sh

# Backup co godzinę
0 * * * * cd /path/to/waterpolo-stats && ./scripts/backup.sh

# Backup przed każdym meczem (ręcznie)
./scripts/backup.sh
```

## 🧹 Czyszczenie

```bash
# Usuń node_modules
rm -rf node_modules

# Usuń .next
rm -rf .next

# Usuń wszystko i reinstall
rm -rf node_modules .next
npm install

# Wyczyść Docker
docker system prune -a
docker volume prune

# Reset bazy (OSTROŻNIE!)
npx prisma migrate reset
docker-compose down -v && docker-compose up -d
```

## 📱 Testing na urządzeniach

```bash
# Sprawdź IP komputera
ifconfig | grep inet    # macOS/Linux
ipconfig               # Windows

# Uruchom dev server dostępny w sieci
npm run dev -- --hostname 0.0.0.0

# Teraz otwórz na iPadzie:
# http://192.168.1.XXX:3000 (twoje IP)
```

## 🔄 Update dependencies

```bash
# Check outdated
npm outdated

# Update wszystkiego
npm update

# Update Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

## 💾 Export/Import danych

```bash
# Export wszystkich graczy do JSON
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats \
  -c "COPY (SELECT * FROM players) TO STDOUT CSV HEADER" > players.csv

# Export eventów dla meczu
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats \
  -c "COPY (SELECT * FROM events WHERE match_id='mecz_001') TO STDOUT CSV HEADER" > mecz_001_events.csv

# Import z CSV (najpierw przygotuj plik import.sql)
docker exec -i waterpolo-db psql -U waterpolo waterpolo_stats < import.sql
```

## 📊 Monitoring

```bash
# Disk usage
docker system df

# Memory usage
docker stats --no-stream

# Database size
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats \
  -c "SELECT pg_size_pretty(pg_database_size('waterpolo_stats'));"

# Liczba rekordów
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats \
  -c "SELECT
    (SELECT COUNT(*) FROM events) as events,
    (SELECT COUNT(*) FROM matches) as matches,
    (SELECT COUNT(*) FROM players) as players;"
```

## 🆘 Troubleshooting

```bash
# App nie startuje
docker-compose down
docker-compose up -d --build
docker-compose logs -f app

# Baza się nie łączy
docker-compose restart postgres
docker exec waterpolo-db pg_isready -U waterpolo

# Port zajęty
lsof -ti:3000 | xargs kill
docker-compose down
docker-compose up -d

# Pełny reset (OSTATECZNOŚĆ)
docker-compose down -v
rm -rf node_modules .next
npm install
docker-compose up -d --build
npx prisma migrate deploy
npx prisma db seed
```

---

## 💡 Pro Tips

```bash
# Alias dla często używanych komend (dodaj do ~/.bashrc lub ~/.zshrc)
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias ps='npx prisma studio'
alias wts='cd /path/to/waterpolo-stats'

# Użycie:
wts        # cd do projektu
dcu        # start
dcl app    # logi
ps         # prisma studio
```

---

**Zachowaj ten plik pod ręką podczas pracy z projektem!** 📋
