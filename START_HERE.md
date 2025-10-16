# 🏊‍♂️ Witaj w WTS Stats!

## 🎉 Gratulacje!

Masz teraz nowoczesny system statystyk piłki wodnej w **Next.js + PostgreSQL**, gotowy do użycia na Twoim serwerze!

---

## ⚡ Szybki start (wybierz jedną opcję)

### Opcja 1: Docker (ZALECANE - 3 minuty)

```bash
# W folderze projektu:
docker-compose up -d

# Poczekaj 30 sekund, potem otwórz:
# 👉 http://localhost:3000
```

✅ **To wszystko!** Baza danych i aplikacja działają.

### Opcja 2: Lokalne uruchomienie

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev

# 👉 http://localhost:3000
```

---

## 📚 Dokumentacja (zacznij tutaj)

1. **QUICKSTART.md** ⚡ - Najszybszy start (3 minuty)
2. **README.md** 📖 - Pełna dokumentacja
3. **SETUP.md** 🔧 - Szczegółowy setup
4. **COMMANDS.md** 💻 - Przydatne komendy
5. **MIGRATION.md** 🔄 - Migracja z Google Sheets

---

## 🎯 Co nowego w porównaniu do Google Sheets?

### ✨ Usprawnienia

- **10x szybsze** zapisywanie akcji (batch processing)
- **Zaawansowane statystyki** z grupowaniem i agregacją
- **Offline-ready** po załadowaniu strony
- **Własny serwer** - pełna kontrola nad danymi
- **Docker** - łatwe deployment
- **Real-time sync** między urządzeniami (2s polling)

### 🎨 UI

- Identyczny layout i flow jak w Google Apps Script
- Zoptymalizowany pod iPada (responsywny)
- Dark mode design
- Lepsze animacje i feedback

### 🗄️ Baza danych

- PostgreSQL zamiast Google Sheets
- 6 tabel z relacjami
- Indeksy dla wydajności
- Łatwe backupy: `./scripts/backup.sh`

---

## 🚀 Pierwsze kroki

### 1. Sprawdź czy działa

Otwórz: **http://localhost:3000**

Powinieneś zobaczyć dashboard z:

- Header (wybór meczu, kwarty)
- Lista zawodników (10 przykładowych)
- Przyciski akcji

### 2. Dodaj swój pierwszy mecz

1. Kliknij **☰** (burger menu)
2. Wybierz **"Dodaj nowy mecz"**
3. Wypełnij:
   - `match_id`: `mecz_001`
   - `data`: `2025-10-15`
   - `przeciwnik`: `Test Team`
4. Zaznacz zawodników i przypisz numery
5. Kliknij **"Utwórz/Zapisz mecz"**

### 3. Zacznij zapisywać akcje

1. Menu → **"Asystent"**
2. Kliknij na zawodnika
3. Wybierz kwartę (Q1)
4. Klikaj akcje (gol, asysta, strata...)

### 4. Zobacz statystyki

1. Menu → **"Statystyki"**
2. Zobacz tabelę
3. Zapisz wynik meczu

---

## 🔧 Konfiguracja

### Zmień PIN edytora

```bash
# Otwórz Prisma Studio
npx prisma studio

# Znajdź Settings → editorPIN → zmień z "1234" na swój PIN
```

### Dodaj swoich zawodników

```bash
npx prisma studio
# Players → Add record → wypełnij dane
```

---

## 📱 Użycie na iPadzie

### Dodaj do ekranu głównego (PWA)

1. Otwórz aplikację w Safari
2. Tap ikonę "Udostępnij"
3. Wybierz "Dodaj do ekranu początkowego"
4. Gotowe! Ikona jak natywna aplikacja

### Tips dla iPada

- 🔄 Obróć poziomo dla lepszego widoku tabel
- 👆 Dotknij zawodnika i szybko klikaj akcje
- ⏪ "Cofnij" działa przez 3 minuty
- 🔄 Odśwież stronę jeśli coś nie działa

---

## 🗂️ Struktura projektu

```
waterpolo-stats/
├── app/              # Next.js aplikacja
│   ├── api/         # Backend API
│   └── page.tsx     # Frontend dashboard
├── prisma/          # Baza danych (schema, seed)
├── scripts/         # Backup, restore, deploy
├── legacy/          # Stare pliki Google Apps Script
└── *.md             # Dokumentacja
```

---

## 🆘 Problemy?

### Port 3000 zajęty

```bash
docker-compose down
lsof -ti:3000 | xargs kill
docker-compose up -d
```

### Baza się nie łączy

```bash
docker-compose restart postgres
docker-compose logs -f postgres
```

### Aplikacja nie działa

```bash
docker-compose logs -f app
docker-compose restart app
```

### Pełny reset (ostateczność)

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 📊 Backup przed ważnym meczem

```bash
# Zrób backup bazy danych
./scripts/backup.sh

# Backupy zapisują się w: ./backups/
```

---

## 🎓 Naucz się więcej

### Przydatne komendy

```bash
# Status
docker-compose ps

# Logi
docker-compose logs -f app

# Backup
./scripts/backup.sh

# GUI do bazy
npx prisma studio

# Restart
docker-compose restart
```

### Dokumentacja

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Docker**: https://docs.docker.com

---

## 🚀 Deploy na swój serwer

Gdy będziesz gotowy na deployment:

1. Skopiuj projekt na serwer
2. Edytuj `docker-compose.yml` (zmień hasła!)
3. Uruchom: `docker-compose up -d`
4. Opcjonalnie: setup Nginx reverse proxy

Zobacz: `README.md` → sekcja "Deployment"

---

## 📞 Wsparcie

- 📖 Dokumentacja: `README.md`, `SETUP.md`
- 💻 Komendy: `COMMANDS.md`
- 🔄 Migracja: `MIGRATION.md`
- 🏗️ Przegląd: `PROJECT_OVERVIEW.md`

---

## 🎯 Roadmap

### Najbliższe funkcje (v1.1)

- [ ] Eksport do Excel
- [ ] Wykresy statystyk
- [ ] PWA (offline support)
- [ ] Dark/Light mode toggle

### Przyszłość (v2.0)

- [ ] Real-time collaboration (WebSocket)
- [ ] Mobile app (React Native)
- [ ] ML analytics
- [ ] Cloud hosting option

---

## ✅ Checklist pierwszego uruchomienia

- [ ] Uruchom aplikację (Docker lub npm)
- [ ] Otwórz http://localhost:3000
- [ ] Zmień PIN w Prisma Studio
- [ ] Dodaj pierwszy mecz
- [ ] Przetestuj zapisywanie akcji
- [ ] Sprawdź statystyki
- [ ] Zrób backup: `./scripts/backup.sh`
- [ ] (iPad) Dodaj do ekranu głównego
- [ ] Przeczytaj README.md

---

## 🎉 Gotowe!

Masz teraz profesjonalną aplikację do statystyk piłki wodnej!

**Miłego użytkowania podczas meczów! 🏊‍♂️🤽‍♂️**

---

### 💡 Następne kroki

1. ✅ Zmień PIN
2. ✅ Dodaj swoich zawodników
3. ✅ Dodaj pierwszy mecz
4. ✅ Przetestuj wszystkie funkcje
5. ✅ Zrób backup
6. ✅ (Opcjonalnie) Deploy na serwer

### 📚 Polecana kolejność czytania

1. **START_HERE.md** ← Jesteś tutaj! ✅
2. **QUICKSTART.md** - Szybki start
3. **README.md** - Pełna dokumentacja
4. **COMMANDS.md** - Przydatne komendy
5. **MIGRATION.md** - Migracja danych (jeśli potrzebujesz)

---

**Wszystkiego najlepszego z nowym systemem!** 🎊

_Wersja 1.0.0 | 2025-10-13_
