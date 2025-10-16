# 🚀 Szybki Setup - Krok po kroku

## Metoda 1: Docker Compose (ZALECANE - najłatwiejsze)

### 1. Zainstaluj Docker

- macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: `curl -fsSL https://get.docker.com | sh`

### 2. Uruchom projekt

```bash
# W folderze projektu
docker-compose up -d

# Poczekaj ~30 sekund na start
# Sprawdź czy działa:
docker-compose ps
```

### 3. Otwórz w przeglądarce

➡️ **http://localhost:3000**

✅ Gotowe! Wszystko działa (baza + aplikacja)

---

## Metoda 2: Lokalne uruchomienie (Dev)

### 1. Wymagania

- Node.js 20+ ([pobierz](https://nodejs.org))
- PostgreSQL 16+ lub Docker

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Uruchom bazę danych

**Opcja A: Docker (łatwiejsza)**

```bash
docker run -d \
  --name waterpolo-db \
  -e POSTGRES_USER=waterpolo \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=waterpolo_stats \
  -p 5432:5432 \
  postgres:16-alpine
```

**Opcja B: Lokalna instalacja PostgreSQL**

- Zainstaluj PostgreSQL
- Stwórz bazę `waterpolo_stats`

### 4. Skonfiguruj .env

```bash
# Skopiuj przykładowy plik
cp .env.example .env

# Edytuj jeśli potrzeba
nano .env
```

### 5. Migracja bazy

```bash
# Wygeneruj Prisma Client
npx prisma generate

# Utwórz tabele
npx prisma migrate dev --name init

# Wypełnij przykładowymi danymi
npx prisma db seed
```

### 6. Uruchom aplikację

```bash
npm run dev
```

➡️ **http://localhost:3000**

---

## 🔧 Pierwsze kroki po uruchomieniu

### 1. Dodaj pierwszy mecz

1. Kliknij **☰** (burger menu)
2. Wybierz **"Dodaj nowy mecz"**
3. Wypełnij:
   - match_id: `mecz_001`
   - data: `2025-10-15`
   - przeciwnik: `Test Team`
4. Zaznacz zawodników i przypisz numery
5. Kliknij **"Utwórz/Zapisz mecz"**

### 2. Rozpocznij statystyki

1. W menu wybierz **"Asystent"**
2. Wybierz zawodnika (kliknij na jego kafelek)
3. Wybierz kwartę (Q1, Q2, Q3, Q4)
4. Klikaj akcje (gol, asysta, strata, etc.)
5. Wszystko zapisuje się automatycznie!

### 3. Zobacz statystyki

1. W menu wybierz **"Statystyki"**
2. Wybierz zakres (cały mecz / kwarta)
3. Zobacz tabelę ze statystykami
4. Zapisz wynik meczu

---

## 📱 Użycie na iPadzie

### Safari / Chrome

1. Otwórz aplikację w przeglądarce
2. Kliknij ikonę "Udostępnij"
3. Wybierz **"Dodaj do ekranu początkowego"**
4. Aplikacja działa jak natywna!

### Tips dla iPada

- Obróć urządzenie poziomo dla lepszego widoku
- Używaj gestów do przewijania tabel
- Funkcja "Cofnij" działa przez 3 minuty

---

## 🆘 Rozwiązywanie problemów

### Port 3000 zajęty

```bash
# Zmień port w docker-compose.yml lub:
docker-compose down
lsof -ti:3000 | xargs kill
docker-compose up -d
```

### Baza danych nie startuje

```bash
# Sprawdź logi
docker-compose logs postgres

# Zrestartuj
docker-compose restart postgres
```

### Błąd "Cannot connect to database"

```bash
# Poczekaj 10 sekund i odśwież
# Lub zrestartuj wszystko:
docker-compose down
docker-compose up -d
```

### Prisma migration error

```bash
# Reset bazy (UWAGA: usuwa dane!)
npx prisma migrate reset

# Lub ręcznie:
npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 Następne kroki

1. **Zmień domyślny PIN**

   ```bash
   npx prisma studio
   # Znajdź "settings" i zmień editorPIN
   ```

2. **Dodaj swoich zawodników**

   - W Prisma Studio dodaj do tabeli `players`
   - Lub przez aplikację: dodaj mecz i wybierz skład

3. **Backup bazy danych**

   ```bash
   docker exec waterpolo-db pg_dump -U waterpolo waterpolo_stats > backup.sql
   ```

4. **Deploy na serwer**
   - Zobacz sekcję "Deployment" w README.md

---

## 💡 Przydatne komendy

```bash
# Status kontenerów
docker-compose ps

# Logi aplikacji
docker-compose logs -f app

# Restart aplikacji
docker-compose restart app

# Zatrzymanie
docker-compose down

# Całkowite usunięcie (z danymi)
docker-compose down -v

# Prisma Studio (GUI do bazy)
npx prisma studio
```

---

**Gotowe! Jeśli masz pytania, sprawdź README.md** 🎉
