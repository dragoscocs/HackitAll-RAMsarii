# EcoSync — HackItAll April 2026 | Echipa RAMsarii

Platformă AI de wellbeing și matchmaking sportiv pentru angajați corporativi.

---

## Cerinte de sistem

| Tool | Versiune minima |
|------|----------------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |

Verificare rapida:
```bash
java -version
mvn -version
node -version
npm -version
```

---

## Pornire rapida

### 1. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Serverul porneste pe **http://localhost:8080**

Prima pornire dureaza ~1-2 minute (Maven descarca dependentele). La pornirile urmatoare este mult mai rapid.

### 2. Frontend (React + Vite)

Intr-un terminal separat:

```bash
cd frontend
npm install
npm run dev
```

Aplicatia se deschide la **http://localhost:5173**

---

## Cum te conectezi si testezi aplicatia

### Pasul 1 — Deschide aplicatia

Navigheaza la [http://localhost:5173](http://localhost:5173)

### Pasul 2 — Creaza un cont

Apasa pe **Sign Up** si completeaza formularul:
- Nume
- Email
- Parola

### Pasul 3 — Logheaza-te

Foloseste credentialele create la pasul anterior.

### Pasul 4 — Exploreaza

Dupa login ai acces la:

| Sectiune | Descriere |
|----------|-----------|
| **Dashboard** | Vedere de ansamblu personalizata |
| **Matchmaking** | Gaseste colegi pentru activitati sportive (ex. Padel) |
| **Smart Break** | Sugestii AI de pauze bazate pe activitatea ta |
| **AI Assistant** | Chat cu asistentul AI (buton floating, dreapta-jos) |

---

## Structura proiectului

```
ING Hackaton/
├── backend/          # Java Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/com/ecosync/
│   │       │   ├── controller/   # REST endpoints
│   │       │   ├── service/      # Logica de business
│   │       │   ├── model/        # Entitati si modele
│   │       │   └── repository/   # Acces baza de date
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Componente UI
│   │   ├── context/      # AuthContext
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## API Endpoints

Base URL: `http://localhost:8080`

### Autentificare

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/auth/register` | Inregistrare cont nou |
| POST | `/api/auth/login` | Login |

**Exemplu register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ion Popescu","email":"ion@test.com","password":"parola123"}'
```

**Exemplu login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ion@test.com","password":"parola123"}'
```

### Matchmaking

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/matchmaking/{userId}?activity=Padel` | Gaseste colegi pentru o activitate |

### Wellbeing / Pauze

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/breaks/{userId}` | Sugestii de pauza pentru utilizator |

### AI Chat

| Metoda | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/chat` | Trimite un mesaj catre AI |

**Exemplu chat:**
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Ce activitati sportive imi recomanzi?"}'
```

---

## Baza de date

Aplicatia foloseste **H2** (baza de date embedded, nu necesita instalare separata).

Datele sunt salvate in `backend/data/ecosync_db.mv.db`.

### Consola H2 (optional, pentru debug)

Cu backend-ul pornit, acceseaza [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

| Camp | Valoare |
|------|---------|
| JDBC URL | `jdbc:h2:file:./data/ecosync_db` |
| Username | `sa` |
| Password | `password` |

---

## Configuratie AI (Gemini)

Aplicatia foloseste **Google Gemini 2.0 Flash**. Cheia API este deja configurata in `backend/src/main/resources/application.properties`.

Daca vrei sa folosesti propria cheie:
1. Obtine o cheie de la [Google AI Studio](https://aistudio.google.com/)
2. Editeaza `backend/src/main/resources/application.properties`:
```properties
gemini.api.key=CHEIA_TA_AICI
```

---

## Depanare

### Backend nu porneste

```bash
# Verifica daca portul 8080 e ocupat
netstat -ano | findstr :8080

# Curata si recompileaza
cd backend
mvn clean spring-boot:run
```

### Frontend nu porneste

```bash
# Sterge modulele si reinstaleaza
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Eroare CORS

Asigura-te ca backend-ul ruleaza pe portul **8080** si frontend-ul pe **5173**. CORS este configurat pentru aceste porturi.

---

## Tehnologii folosite

**Backend**
- Java 17
- Spring Boot 3.2.4
- Spring Data JPA
- H2 Database
- Google Gemini 2.0 Flash API

**Frontend**
- React 18
- Vite 5
- Tailwind CSS 3
- React Router DOM 6
- Lucide React (icons)
- Motion (animatii)
