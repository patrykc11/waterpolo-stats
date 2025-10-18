# WTS Stats - Water Polo Statistics Dashboard

Nowoczesny dashboard do prowadzenia statystyk na meczach piłki wodnej, zbudowany w Next.js z PostgreSQL.

## 🚀 Funkcje

- **Asystent meczowy** - szybkie wprowadzanie akcji w czasie rzeczywistym
- **Statystyki** - szczegółowe zestawienia per zawodnik, kwarta i mecz
- **Zarządzanie meczami** - łatwe dodawanie nowych meczów i składów
- **Responsywny design** - zoptymalizowany dla iPada i innych urządzeń
- **Real-time sync** - automatyczna synchronizacja między urządzeniami

## 📋 Wymagania

- Docker & Docker Compose (zalecane)
- lub Node.js 20+ i PostgreSQL 16+

## 🐳 Szybki start z Docker

### 1. Uruchomienie całej aplikacji

**Pierwszy raz:**

```bash
# Sklonuj repozytorium
git clone <repo-url>
cd waterpolo-stats

# Uruchom aplikację
docker-compose up -d

# Poczekaj aż baza się uruchomi, potem uruchom migracje
docker-compose exec app npx prisma migrate deploy

# Uruchom seed (tworzy domyślne settings)
docker-compose exec app npm run prisma:seed
```

**Kolejne uruchomienia:**

```bash
docker-compose up -d
```

```bash
# Skopiuj plik .env.example
cp .env.example .env

# Uruchom wszystko (PostgreSQL + aplikacja)
docker-compose up -d

# Sprawdź logi
docker-compose logs -f app
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

### 2. Zatrzymanie

```bash
docker-compose down

# Zatrzymanie z usunięciem danych
docker-compose down -v
```

## 💻 Development (lokalnie)

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja bazy danych

Utwórz plik `.env`:

```env
DATABASE_URL="postgresql://waterpolo:password@localhost:5432/waterpolo_stats?schema=public"
NODE_ENV="development"
```

### 3. Uruchom PostgreSQL

```bash
# Opcja A: Docker
docker run -d \
  --name waterpolo-db \
  -e POSTGRES_USER=waterpolo \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=waterpolo_stats \
  -p 5432:5432 \
  postgres:16-alpine

# Opcja B: Zainstaluj lokalnie PostgreSQL
```

### 4. Migracja bazy danych

```bash
# Wygeneruj Prisma Client
npx prisma generate

# Wykonaj migracje
npx prisma migrate dev --name init

# Wypełnij bazę przykładowymi danymi
npx prisma db seed
```

### 5. Uruchom aplikację

```bash
npm run dev
```

Aplikacja będzie dostępna pod: **http://localhost:3000**

## 🗄️ Zarządzanie bazą danych

### Prisma Studio (GUI)

```bash
npx prisma studio
```

### Migracje

```bash
# Stwórz nową migrację
npx prisma migrate dev --name nazwa_migracji

# Zastosuj migracje w produkcji
npx prisma migrate deploy

# Reset bazy (UWAGA: usuwa wszystkie dane!)
npx prisma migrate reset
```

### Backup i Restore

```bash
# Backup
docker exec waterpolo-db pg_dump -U waterpolo waterpolo_stats > backup.sql

# Restore
docker exec -i waterpolo-db psql -U waterpolo waterpolo_stats < backup.sql
```

## 📱 Użycie

### Domyślne dane logowania

- **PIN edytora**: `1234` (zmień w Seeds lub przez Prisma Studio)
- **Email**: `admin@waterpolo.pl` (role: editor)

### Główne sekcje

1. **Asystent (Scorekeeper)**

   - Wybierz zawodnika z listy
   - Kliknij odpowiednią akcję (gol, asysta, strata, etc.)
   - Wybierz kwarty Q1-Q4
   - Użyj "Cofnij ostatnią akcję" w razie pomyłki

2. **Statystyki**

   - Przeglądaj statystyki per mecz/kwarta
   - Zapisuj wyniki kwart i końcowy
   - Eksportuj dane (planowane)

3. **Dodaj nowy mecz**
   - Wprowadź dane meczu (ID, data, przeciwnik, miejsce)
   - Wybierz zawodników do składu
   - Przypisz numery
   - Opcja: skopiuj skład z poprzedniego meczu

## 🏗️ Architektura

```
waterpolo-stats/
├── app/
│   ├── api/              # API routes (Next.js)
│   │   ├── bootstrap/    # Początkowe dane
│   │   ├── events/       # Zapisywanie akcji
│   │   ├── stats/        # Statystyki
│   │   ├── matches/      # Zarządzanie meczami
│   │   └── ...
│   ├── page.tsx          # Główna strona (dashboard)
│   ├── layout.tsx        # Layout aplikacji
│   └── globals.css       # Style globalne
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── auth.ts           # Autoryzacja
├── prisma/
│   ├── schema.prisma     # Schema bazy danych
│   └── seed.ts           # Dane startowe
├── docker-compose.yml    # Docker setup
└── package.json          # Zależności
```

## 🚀 Deployment na własnym serwerze

### Opcja 1: Docker Compose (zalecane)

```bash
# Na serwerze
git clone [twoje-repo]
cd waterpolo-stats

# Zmień hasło do bazy w docker-compose.yml
nano docker-compose.yml

# Uruchom
docker-compose up -d

# Opcjonalnie: nginx reverse proxy
# Zobacz sekcję poniżej
```

### Opcja 2: PM2 (Node.js)

```bash
# Zainstaluj PM2
npm install -g pm2

# Build
npm run build

# Uruchom
pm2 start npm --name "waterpolo" -- start

# Auto-restart po reboot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Bezpieczeństwo

- **Zmień domyślny PIN** w Seeds lub Prisma Studio
- **Użyj silnych haseł** do PostgreSQL w produkcji
- **Włącz HTTPS** (Let's Encrypt + Nginx)
- **Regularnie rób backup** bazy danych

## 🛠️ Development Tips

### Hot Reload

Next.js automatycznie przeładowuje zmiany w dev mode.

### Debugging

```bash
# Logi aplikacji
docker-compose logs -f app

# Połącz się do bazy
docker exec -it waterpolo-db psql -U waterpolo waterpolo_stats
```

### Testowanie

```bash
# (Do dodania w przyszłości)
npm test
```

## 📊 Struktura bazy danych

- **settings** - globalne ustawienia (aktywny mecz, kwarta, PIN)
- **users** - użytkownicy i ich role
- **players** - baza zawodników
- **matches** - mecze (z wynikami)
- **match_roster** - składy per mecz
- **events** - akcje/zdarzenia z meczów (główna tabela statystyk)

## 🤝 Wsparcie

W razie problemów:

1. Sprawdź logi: `docker-compose logs -f`
2. Zrestartuj: `docker-compose restart`
3. Przebuduj: `docker-compose up -d --build`

## 📝 TODO / Planowane funkcje

- [ ] Eksport statystyk do Excel
- [ ] Wykresy i wizualizacje
- [ ] Porównywanie meczów
- [ ] System powiadomień
- [ ] Aplikacja mobilna (PWA)
- [ ] Multi-user real-time collaboration

## 📄 Licencja

Prywatny projekt - wszystkie prawa zastrzeżone.

---

**Miłego użytkowania! 🏊‍♂️🤽‍♂️**

npx prisma migrate dev --name init
npx prisma db seed
npm run dev
