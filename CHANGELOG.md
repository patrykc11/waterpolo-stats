# Changelog

Wszystkie istotne zmiany w projekcie WTS Stats.

## [1.0.0] - 2025-10-13

### ✨ Added - Pierwsza wersja

#### Funkcjonalność

- ✅ Scorekeeper (asystent meczowy) z real-time zapisywaniem akcji
- ✅ Panel statystyk z tabelami per zawodnik/kwarta
- ✅ Admin panel do dodawania meczów i składów
- ✅ System flag dla wszystkich typów akcji (30+ kolumn)
- ✅ Cofanie ostatniej akcji (window 3 minuty)
- ✅ Auto-polling dla synchronizacji między urządzeniami (2s)
- ✅ Zapisywanie wyników kwart i końcowego

#### Technologia

- ✅ Next.js 14 z App Router
- ✅ TypeScript
- ✅ PostgreSQL 16 + Prisma ORM
- ✅ Docker Compose setup
- ✅ Responsywny design (desktop/tablet/mobile)
- ✅ Zoptymalizowane dla iPada

#### UI/UX

- ✅ Dark mode design
- ✅ Segmented controls dla trybów ataku
- ✅ Dynamiczne renderowanie przycisków akcji
- ✅ Toast notifications
- ✅ Loading states
- ✅ Burger menu z drawer
- ✅ Sticky header

#### Baza danych

- ✅ 6 głównych tabel: Settings, Users, Players, Matches, MatchRoster, Events
- ✅ Relacje i constraints
- ✅ Cascade delete
- ✅ Indexy dla wydajności

#### API

- ✅ 10+ API endpoints
- ✅ Autoryzacja przez PIN
- ✅ Batch saving eventów
- ✅ Stats aggregation
- ✅ Roster management

#### DevOps

- ✅ Docker + Docker Compose
- ✅ Skrypty backup/restore
- ✅ Prisma migrations
- ✅ Seed data

#### Dokumentacja

- ✅ README.md (pełna dokumentacja)
- ✅ QUICKSTART.md (3 minuty do startu)
- ✅ SETUP.md (szczegółowy setup)
- ✅ MIGRATION.md (migracja z Google Sheets)
- ✅ PROJECT_OVERVIEW.md (przegląd projektu)

### 🔄 Migracja z Google Apps Script

#### Improved

- 🚀 10x szybsze operacje zapisu (batch vs. pojedyncze)
- 📊 Zaawansowane statystyki i grupowanie
- 💾 Pełna kontrola nad danymi (własny serwer)
- 🔒 Lepsze bezpieczeństwo (role, PIN)
- 📱 Lepsza responsywność (PWA-ready)

#### Zachowane

- ✅ Cała logika statystyk 1:1
- ✅ Ten sam model danych (rozszerzony)
- ✅ Identyczny UI flow
- ✅ Wszystkie typy akcji

## [Planowane] - Future releases

### [1.1.0] - Q1 2025

- [ ] Eksport statystyk do Excel/CSV
- [ ] Wykresy i wizualizacje (Chart.js)
- [ ] PWA support (offline)
- [ ] Print-friendly reports
- [ ] Dark/Light mode toggle

### [1.2.0] - Q2 2025

- [ ] Porównywanie meczów
- [ ] Profile zawodników z historią
- [ ] Statystyki drużynowe (season totals)
- [ ] Video clips integration
- [ ] Advanced filters

### [2.0.0] - Q3 2025

- [ ] Real-time collaboration (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Cloud hosting option
- [ ] Multi-language support
- [ ] Advanced analytics (ML predictions)

### Backlog

- [ ] Calendar view dla meczów
- [ ] Notifications system
- [ ] Email reports
- [ ] API dla external apps
- [ ] Integration z federacją
- [ ] Live streaming overlay

---

## Konwencje wersjonowania

Projekt używa [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x) - Breaking changes
- **MINOR** (x.1.x) - Nowe funkcje (backward compatible)
- **PATCH** (x.x.1) - Bug fixes

## Kategorie zmian

- **Added** - Nowe funkcje
- **Changed** - Zmiany w istniejącej funkcjonalności
- **Deprecated** - Funkcje do usunięcia w przyszłości
- **Removed** - Usunięte funkcje
- **Fixed** - Bug fixes
- **Security** - Poprawki bezpieczeństwa
