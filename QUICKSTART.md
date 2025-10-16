# ⚡ QUICKSTART - 3 minuty do działającej aplikacji

## Szybki start dla niecierpliwych 🚀

### Krok 1: Zainstaluj Docker (jeśli nie masz)

**macOS / Windows:**

- Pobierz [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Zainstaluj i uruchom

**Linux:**

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
```

### Krok 2: Uruchom aplikację

```bash
# W terminalu, w folderze projektu:
docker-compose up -d

# Poczekaj 30 sekund na inicjalizację
```

### Krok 3: Otwórz w przeglądarce

➡️ **http://localhost:3000**

## ✅ To wszystko!

Masz działającą aplikację z:

- ✅ Bazą danych PostgreSQL
- ✅ 10 przykładowymi zawodnikami
- ✅ Gotowym interfejsem

---

## 🎯 Co teraz?

### 1. Dodaj pierwszy mecz

1. Kliknij **☰** (burger menu w prawym górnym rogu)
2. Wybierz **"Dodaj nowy mecz"**
3. Wypełnij dane:
   ```
   match_id: mecz_001
   data: 2025-10-15
   przeciwnik: Test Team
   miejsce: Hala Sportowa
   ```
4. Zaznacz zawodników (kliknij checkboxy)
5. Przypisz numery (1-13)
6. Kliknij **"Utwórz/Zapisz mecz"**

### 2. Rozpocznij statystyki

1. W menu wybierz **"Asystent"**
2. Kliknij na zawodnika z listy po lewej
3. Wybierz kwartę (Q1)
4. Klikaj akcje:
   - **Gol** → z akcji / z kontrataku / z centra
   - **Asysta** → Asysta
   - **Strata** → Obrona bramkarza / Niecelny rzut
   - **Obrona** → Przejęcie / Blok

### 3. Zobacz statystyki

1. W menu wybierz **"Statystyki"**
2. Zobacz tabelę z akcjami zawodników
3. Zapisz wynik meczu w sekcji "Wynik"

---

## 📱 Użycie na iPadzie

### Dodaj do ekranu początkowego

1. Otwórz aplikację w Safari
2. Kliknij ikonę "Udostępnij" (kwadrat ze strzałką)
3. Wybierz **"Dodaj do ekranu początkowego"**
4. Gotowe! Ikona jak natywna aplikacja

### Tips

- 🔄 Obróć iPada poziomo dla lepszego widoku tabel
- 👆 Przytrzymaj przycisk akcji dla szybkiego powtórzenia
- ⏪ Funkcja "Cofnij" działa przez 3 minuty od akcji

---

## 🔧 Przydatne komendy

```bash
# Sprawdź czy działa
docker-compose ps

# Zobacz logi
docker-compose logs -f app

# Restart
docker-compose restart

# Zatrzymaj
docker-compose down

# Całkowicie wyczyść (z danymi!)
docker-compose down -v

# GUI do bazy danych
npx prisma studio
```

---

## 🆘 Coś nie działa?

### Port 3000 zajęty

```bash
# Zmień port na 3001 w docker-compose.yml:
#   ports:
#     - "3001:3000"

docker-compose up -d
```

### Aplikacja nie startuje

```bash
# Sprawdź logi
docker-compose logs app

# Pełny restart
docker-compose down
docker-compose up -d --build
```

### Baza danych pusta

```bash
# Wykonaj seed ponownie
docker-compose exec app npx prisma db seed
```

---

## 📚 Więcej informacji

- **Pełna dokumentacja**: Zobacz `README.md`
- **Setup krok po kroku**: Zobacz `SETUP.md`
- **Backup bazy**: `./scripts/backup.sh`

---

## 💡 Domyślne dane

- **PIN edytora**: `1234` (zmień w Prisma Studio!)
- **Przykładowi zawodnicy**: 10 zawodników z numerami 1-10

---

## 🎉 Gotowe!

Masz działającą profesjonalną aplikację do statystyk piłki wodnej!

**Miłego użytkowania! 🏊‍♂️🤽‍♂️**

---

### Kolejne kroki po opanowaniu podstaw:

1. **Zmień PIN**: `npx prisma studio` → Settings → editorPIN
2. **Dodaj swoich zawodników**: Edytuj w Prisma Studio
3. **Backup przed meczem**: `./scripts/backup.sh`
4. **Deploy na serwer**: Zobacz README.md sekcja "Deployment"
