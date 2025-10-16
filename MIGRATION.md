# 📦 Migracja z Google Sheets

Przewodnik migracji danych z obecnego systemu Google Apps Script do nowej aplikacji Next.js.

## Przegląd

Twój obecny system używa Google Sheets z następującymi arkuszami:

- **Settings** - ustawienia (ActiveMatch, Quarter, EditorPIN)
- **Users** - użytkownicy i role
- **Players** - baza zawodników
- **Matches** - lista meczów z wynikami
- **Match_Roster** - składy per mecz
- **Events** - zdarzenia/akcje z meczów
- **Events\_[matchId]** - osobne arkusze per mecz

## Automatyczna migracja (planowana)

> 🚧 W przygotowaniu - skrypt automatycznej migracji

## Ręczna migracja danych

### 1. Eksport danych z Google Sheets

#### Krok 1: Pobierz dane z każdego arkusza

1. Otwórz swój arkusz Google Sheets
2. Dla każdego arkusza:
   - Kliknij **File → Download → CSV**
   - Zapisz jako: `[nazwa_arkusza].csv`

Potrzebujesz:

- `Settings.csv`
- `Users.csv`
- `Players.csv`
- `Matches.csv`
- `Match_Roster.csv`
- `Events_[matchId].csv` (dla każdego meczu)

### 2. Import do PostgreSQL

#### Opcja A: Przez Prisma Studio (GUI)

```bash
# Uruchom Prisma Studio
npx prisma studio
```

1. Otwórz każdą tabelę
2. Kliknij "Add record"
3. Wklej dane z CSV (wiersz po wierszu)

#### Opcja B: Przez skrypt SQL

Stwórz plik `migration.sql`:

```sql
-- Przykład: Import zawodników
INSERT INTO players (player_id, number, name, team) VALUES
  ('p1', 1, 'Jan Kowalski', 'my'),
  ('p2', 2, 'Piotr Nowak', 'my'),
  -- ... kolejne wiersze
;

-- Import meczów
INSERT INTO matches (match_id, date, opponent, place, q1_my, q1_opp, q2_my, q2_opp, q3_my, q3_opp, q4_my, q4_opp, final_my, final_opp) VALUES
  ('mecz_001', '2025-10-01', 'Team A', 'Hala 1', 3, 2, 4, 3, 2, 5, 3, 2, 12, 12),
  -- ... kolejne mecze
;

-- Import składów
INSERT INTO match_roster (match_id, player_id, number, name, team) VALUES
  ('mecz_001', 'p1', 1, 'Jan Kowalski', 'my'),
  ('mecz_001', 'p2', 2, 'Piotr Nowak', 'my'),
  -- ... kolejni zawodnicy
;

-- Import eventów
INSERT INTO events (
  match_id, quarter, team, player_id, player_name,
  phase, is_goal_from_play, is_assist, is_shot_saved_gk
  -- ... pozostałe kolumny
) VALUES
  ('mecz_001', 1, 'my', 'p1', 'Jan Kowalski', 'positional', 1, 0, 0),
  -- ... kolejne eventy
;
```

Wykonaj:

```bash
# Docker
docker exec -i waterpolo-db psql -U waterpolo waterpolo_stats < migration.sql

# Lokalna PostgreSQL
psql -U waterpolo waterpolo_stats < migration.sql
```

### 3. Mapowanie kolumn

#### Settings

| Google Sheets | PostgreSQL  |
| ------------- | ----------- |
| ActiveMatch   | activeMatch |
| Quarter       | quarter     |
| EditorPIN     | editorPIN   |

#### Players

| Google Sheets | PostgreSQL |
| ------------- | ---------- |
| player_id     | playerId   |
| number        | number     |
| name          | name       |
| team          | team       |

#### Matches

| Google Sheets | PostgreSQL |
| ------------- | ---------- |
| match_id      | matchId    |
| date          | date       |
| opponent      | opponent   |
| place         | place      |
| q1_my         | q1My       |
| q1_opp        | q1Opp      |
| ...           | ...        |

#### Events - mapowanie flag

Stary system → Nowy system:

| Stare kolumny                             | Nowe kolumny               |
| ----------------------------------------- | -------------------------- |
| event_type: "goal", subtype: "from_play"  | is_goal_from_play: 1       |
| event_type: "goal", subtype: "penalty_5m" | is_goal_5m: 1              |
| event_type: "goal", subtype: "advantage"  | is_goal_man_up: 1 (legacy) |
| event_type: "assist"                      | is_assist: 1               |
| event_type: "exclusion_drawn"             | is_excl_drawn: 1           |
| event_type: "exclusion_caused"            | is_excl_committed: 1       |
| event_type: "turnover"                    | is_turnover: 1             |
| event_type: "steal"                       | is_steal: 1                |

### 4. Skrypt konwersji CSV → SQL (przykład)

```javascript
// convert.js
const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("Players.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    const sql = results
      .map(
        (row) =>
          `INSERT INTO players (player_id, number, name, team) VALUES ('${row.player_id}', ${row.number}, '${row.name}', '${row.team}');`
      )
      .join("\n");

    fs.writeFileSync("players_import.sql", sql);
    console.log("✅ SQL generated: players_import.sql");
  });
```

Użycie:

```bash
npm install csv-parser
node convert.js
psql -U waterpolo waterpolo_stats < players_import.sql
```

## Porównanie systemów

### Google Sheets (stary)

- ✅ Łatwy setup (bez instalacji)
- ✅ Auto-backup przez Google
- ❌ Wolniejsze przy wielu danych
- ❌ Ograniczone możliwości zapytań
- ❌ Wymaga internetu

### Next.js + PostgreSQL (nowy)

- ✅ Bardzo szybkie (nawet z tysiącami eventów)
- ✅ Zaawansowane statystyki i raporty
- ✅ Działa offline (po załadowaniu)
- ✅ Pełna kontrola nad danymi
- ❌ Wymaga serwera/Dockera

## Testowanie po migracji

### 1. Sprawdź liczbę rekordów

```sql
SELECT
  (SELECT COUNT(*) FROM players) as players_count,
  (SELECT COUNT(*) FROM matches) as matches_count,
  (SELECT COUNT(*) FROM match_roster) as roster_count,
  (SELECT COUNT(*) FROM events) as events_count;
```

### 2. Porównaj statystyki

Wybierz jeden mecz i porównaj statystyki między systemami:

```bash
# Stary system: otwórz Google Sheets, zakładka Stats
# Nowy system: http://localhost:3000 → Statystyki
```

### 3. Test smoke

1. Dodaj testowy mecz
2. Zapisz kilka akcji
3. Sprawdź statystyki
4. Cofnij akcję
5. Zapisz wynik

## Backup przed migracją

```bash
# Zrób backup Google Sheets
# File → Download → Excel / CSV (wszystkie arkusze)

# Po migracji do PostgreSQL:
./scripts/backup.sh
```

## Rollback (w razie problemów)

Jeśli coś pójdzie nie tak:

```bash
# Usuń wszystkie dane
docker-compose down -v

# Uruchom ponownie
docker-compose up -d

# Spróbuj migracji od nowa
```

## Wsparcie

Jeśli masz problemy z migracją:

1. Sprawdź logi: `docker-compose logs app`
2. Otwórz Prisma Studio: `npx prisma studio`
3. Przywróć backup: `./scripts/restore.sh`

---

**Pro tip**: Zmigruj najpierw jeden mecz jako test, zanim przeniesiesz wszystkie dane!
