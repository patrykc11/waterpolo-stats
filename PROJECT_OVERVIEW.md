# 📊 WTS Stats - Przegląd Projektu

## 🎯 Cel projektu

Nowoczesna aplikacja webowa do prowadzenia statystyk meczów piłki wodnej w czasie rzeczywistym, zoptymalizowana pod iPada i inne urządzenia mobilne.

## 🏗️ Architektura

### Stack technologiczny

- **Frontend**: Next.js 14 (React) + TypeScript
- **Backend**: Next.js API Routes
- **Baza danych**: PostgreSQL 16
- **ORM**: Prisma 5
- **Deployment**: Docker + Docker Compose
- **Styling**: CSS Modules (inline w globals.css)

### Struktura projektu

```
waterpolo-stats/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── bootstrap/           # Inicjalizacja danych
│   │   ├── events/              # Zapisywanie akcji meczowych
│   │   │   └── undo/           # Cofanie ostatniej akcji
│   │   ├── matches/             # Zarządzanie meczami
│   │   │   └── previous-roster/ # Kopiowanie składu
│   │   ├── players/             # Zarządzanie zawodnikami
│   │   ├── roster/[matchId]/    # Skład dla meczu
│   │   ├── settings/            # Ustawienia globalne
│   │   │   ├── match/          # Zmiana aktywnego meczu
│   │   │   └── quarter/        # Zmiana kwarty
│   │   └── stats/               # Statystyki
│   │       ├── [matchId]/      # Statystyki dla meczu
│   │       └── score/          # Zapisywanie wyniku
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Główna strona (dashboard)
│   └── globals.css              # Style globalne
│
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   └── auth.ts                  # Autoryzacja (PIN)
│
├── prisma/
│   ├── schema.prisma            # Schema bazy danych
│   ├── seed.js                  # Dane startowe
│   └── seed.ts                  # (TypeScript version)
│
├── scripts/
│   ├── backup.sh                # Backup bazy danych
│   ├── restore.sh               # Przywracanie z backup
│   └── deploy.sh                # Deployment na serwer
│
├── docker-compose.yml           # Docker setup (app + db)
├── Dockerfile                   # Container dla aplikacji
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.js               # Next.js config
│
└── Dokumentacja/
    ├── README.md                # Główna dokumentacja
    ├── QUICKSTART.md            # Szybki start (3 minuty)
    ├── SETUP.md                 # Szczegółowy setup
    ├── MIGRATION.md             # Migracja z Google Sheets
    └── PROJECT_OVERVIEW.md      # Ten plik
```

## 📊 Model danych

### Tabele

1. **settings** - Globalne ustawienia

   - `activeMatch` - ID aktywnego meczu
   - `quarter` - Aktualna kwarta (1-4)
   - `editorPIN` - PIN do edycji

2. **users** - Użytkownicy systemu

   - `email` - Email użytkownika
   - `role` - Rola (viewer/editor)

3. **players** - Baza wszystkich zawodników

   - `playerId` - Unikalny ID
   - `number` - Numer zawodnika
   - `name` - Imię i nazwisko
   - `team` - Drużyna (my/opponent)

4. **matches** - Mecze

   - `matchId` - Unikalny ID meczu
   - `date` - Data meczu
   - `opponent` - Przeciwnik
   - `place` - Miejsce
   - `q1_my, q1_opp, ...` - Wyniki kwart
   - `final_my, final_opp` - Wynik końcowy

5. **match_roster** - Składy per mecz

   - `matchId` - ID meczu
   - `playerId` - ID zawodnika
   - `number` - Numer w tym meczu
   - Relacje: Match, Player

6. **events** - Akcje/zdarzenia z meczów
   - Podstawowe: `matchId`, `quarter`, `playerId`, `timestamp`
   - Faza: `phase` (positional/man_up/penalty)
   - 30+ kolumn flag: `is_goal_from_play`, `is_assist`, etc.
   - Lokalizacje: `excl_drawn_location`, etc.

### Relacje

```
Match (1) ----< (N) MatchRoster (N) >---- (1) Player
  |                                           |
  |                                           |
  v                                           v
Event (N) ---------------------------------> (1) Player
```

## 🎨 UI Components

### Główne sekcje

1. **Header**

   - Wybór meczu (dropdown)
   - Wybór kwarty (Q1-Q4 buttons)
   - Cofnij ostatnią akcję
   - Burger menu

2. **Scorekeeper (Asystent)**

   - Lista zawodników (grid 2 kolumny)
   - Wybrany zawodnik (highlight)
   - Sekcja Atak:
     - Przełącznik: Atak pozycyjny / Gra w przewadze
     - Dynamiczne przyciski akcji
   - Sekcja Obrona:
     - Stałe przyciski (wykluczenia, karne, etc.)
   - Pole notatki

3. **Stats (Statystyki)**

   - Filtry (cały mecz / kwarta / split)
   - Zapis wyniku (per kwarta + finał)
   - Tabele z pogrupowaniem:
     - Atak pozycyjny
     - Przewaga
     - Karny
     - Obrona
   - Suma bramek per zawodnik

4. **Admin (Nowy mecz)**

   - Formularz meczu (ID, data, przeciwnik, miejsce)
   - Grid zawodników z checkboxami
   - Przypisywanie numerów
   - Kopiowanie składu z poprzedniego meczu
   - Podgląd składu

5. **Drawer (Menu boczne)**
   - Asystent / Statystyki / Dodaj mecz
   - Otwórz Index (legacy - usunięte)

### Responsywność

- **Desktop (>1024px)**: 2-kolumnowy layout
- **Tablet (600-1024px)**: 1 kolumna, szersze komponenty
- **Mobile (<600px)**: Stack layout, większe przyciski

## 🔄 Przepływ danych

### 1. Bootstrap (start aplikacji)

```
Browser -> GET /api/bootstrap
       <- { settings, players, matches, rosterActive, user }
```

### 2. Zapisywanie akcji

```
User clicks button -> submitEvent()
                   -> POST /api/events { events: [...], pin }
                   -> Prisma.event.createMany()
                   -> Success toast
```

### 3. Cofanie akcji

```
User clicks "Cofnij" -> undoLast()
                     -> POST /api/events/undo { windowMinutes: 3, pin }
                     -> Find last event (< 3 min ago)
                     -> Prisma.event.delete()
```

### 4. Statystyki

```
User switches to Stats -> refreshStats()
                       -> GET /api/stats/[matchId]
                       -> Aggregate all events by flags
                       -> Return perPlayerAll, perPlayerByQ, totals
                       -> Render tables
```

### 5. Polling (real-time sync)

```
Every 2 seconds:
  GET /api/settings
  Compare with current state
  If changed -> update UI + refresh stats
```

## 🚀 Deployment

### Docker Compose (zalecane)

```yaml
services:
  postgres: # Baza danych
  app: # Aplikacja Next.js
```

Proces:

1. `docker-compose up -d`
2. Aplikacja czeka na healthcheck PostgreSQL
3. Uruchamia migracje (`prisma migrate deploy`)
4. Seeduje dane (`prisma db seed`)
5. Startuje Next.js

### Standalone

- **PM2**: `npm run build && pm2 start npm -- start`
- **Systemd**: Własna usługa systemowa
- **Nginx**: Reverse proxy na port 3000

## 🔒 Bezpieczeństwo

### Obecne

- PIN dla edytorów (zapisany w bazie)
- Role użytkowników (viewer/editor)
- Walidacja danych po stronie API
- CORS domyślnie wyłączony (same-origin)

### Do dodania w przyszłości

- JWT/Session authentication
- Rate limiting
- HTTPS only
- Input sanitization
- SQL injection prevention (Prisma już chroni)

## 📈 Wydajność

### Optymalizacje

1. **Batching eventów**

   - Kolejka `WRITE_QUEUE`
   - Flush co 200ms
   - Zmniejsza liczbę requestów

2. **Polling**

   - Co 2s zamiast WebSocket (prostsze)
   - Tylko sprawdzenie Settings (lekkie)

3. **Next.js**

   - Server Components (gdzie możliwe)
   - Standalone output (mniejszy Docker image)
   - SWC minification

4. **PostgreSQL**
   - Indexy na `matchId`, `quarter`
   - Cascade delete (automatyczne czyszczenie)

## 📊 Statystyki

### Agregacja danych

```typescript
// Zliczanie per zawodnik per kwarta
for (const event of events) {
  const q = event.quarter;
  const pid = event.playerId;

  flagFields.forEach((flag) => {
    perPlayerByQ[q][pid][flag] += event[flag];
    perPlayerAll[pid][flag] += event[flag];
    totalsByQ[q][flag] += event[flag];
    totalsAll[flag] += event[flag];
  });
}
```

### Grupowanie kolumn w tabelach

- **Atak pozycyjny**: gole, asysty, straty, rzuty
- **Przewaga**: gole z 2m, 5m
- **Karny**: gole, sprowokowane, popełnione
- **Obrona**: wykluczenia, przejęcia, bloki

## 🧪 Testing (TODO)

Planowane:

- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests
- Load testing (k6)

## 🔮 Roadmap

### v1.1 (najbliższe)

- [ ] Eksport do Excel
- [ ] Wykresy (Chart.js)
- [ ] PWA (offline support)
- [ ] Dark/Light mode toggle

### v1.2

- [ ] Multi-match comparison
- [ ] Player profiles
- [ ] Team statistics
- [ ] Video highlights integration

### v2.0

- [ ] Real-time collaboration (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (ML)
- [ ] Cloud hosting option

## 📞 Kontakt i wsparcie

- Dokumentacja: `README.md`, `SETUP.md`, `QUICKSTART.md`
- Issues: GitHub Issues (jeśli publiczny repo)
- Logs: `docker-compose logs -f app`

## 📄 Licencja

Prywatny projekt - wszystkie prawa zastrzeżone.

---

**Ostatnia aktualizacja**: 2025-10-13
**Wersja projektu**: 1.0.0
**Autor**: Patryk Cebo
