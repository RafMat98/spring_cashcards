# Cash Card Application — Πλήρης Τεκμηρίωση

## Πίνακας Περιεχομένων

1. [Περιγραφή Εφαρμογής](#1-περιγραφή-εφαρμογής)
2. [Τεχνολογίες](#2-τεχνολογίες)
3. [Αρχιτεκτονική](#3-αρχιτεκτονική)
4. [Δομή Project](#4-δομή-project)
5. [Βάση Δεδομένων](#5-βάση-δεδομένων)
6. [Backend — Spring Boot](#6-backend--spring-boot)
7. [Security](#7-security)
8. [REST API Endpoints](#8-rest-api-endpoints)
9. [Frontend — React](#9-frontend--react)
10. [Docker](#10-docker)
11. [Εκκίνηση Εφαρμογής](#11-εκκίνηση-εφαρμογής)
12. [Χρήστες & Roles](#12-χρήστες--roles)

---

## 1. Περιγραφή Εφαρμογής

Η εφαρμογή **Cash Card** είναι μια πλήρης web εφαρμογή διαχείρισης ψηφιακών καρτών (cash cards). Κάθε χρήστης μπορεί να δημιουργεί, να βλέπει, να ενημερώνει και να διαγράφει τις δικές του κάρτες. Ένας διαχειριστής (admin) έχει πλήρη εποπτεία όλων των χρηστών και καρτών, καθώς και τη δυνατότητα μεταφοράς χρημάτων μεταξύ καρτών.

---

## 2. Τεχνολογίες

### Backend

| Τεχνολογία        | Έκδοση   | Χρήση                          |
| ----------------- | -------- | ------------------------------ |
| Java              | 17       | Γλώσσα προγραμματισμού         |
| Spring Boot       | 3.1.4    | Framework backend              |
| Spring Security   | 6.x      | Authentication & Authorization |
| Spring Data JDBC  | 3.1.4    | Πρόσβαση στη βάση δεδομένων    |
| Spring Validation | 6.x      | Επικύρωση δεδομένων            |
| BCrypt            | built-in | Κρυπτογράφηση κωδικών          |
| Gradle            | 8.4      | Build tool                     |

### Frontend

| Τεχνολογία   | Έκδοση | Χρήση                   |
| ------------ | ------ | ----------------------- |
| React        | 18.2   | UI Framework            |
| React Router | 6.20   | Client-side routing     |
| Axios        | 1.6    | HTTP requests           |
| Vite         | 5.0    | Build tool & dev server |

### Βάση Δεδομένων

| Τεχνολογία | Έκδοση | Χρήση                |
| ---------- | ------ | -------------------- |
| PostgreSQL | 16     | Κύρια βάση δεδομένων |

### Infrastructure

| Τεχνολογία     | Χρήση                                |
| -------------- | ------------------------------------ |
| Docker         | Containerization                     |
| Docker Compose | Orchestration                        |
| nginx          | Web server για το React (production) |

---

## 3. Αρχιτεκτονική

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│              React (Client Side)                    │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP
                    ▼
┌─────────────────────────────────────────────────────┐
│               nginx (port 3000)                     │
│  • Σερβίρει στατικά αρχεία (HTML/JS/CSS)            │
│  • Proxy /api/* → Spring Boot                       │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP (proxy)
                    ▼
┌─────────────────────────────────────────────────────┐
│           Spring Boot (port 8080)                   │
│  • REST API                                         │
│  • Spring Security (Basic Auth)                     │
│  • Business Logic                                   │
└───────────────────┬─────────────────────────────────┘
                    │ JDBC
                    ▼
┌─────────────────────────────────────────────────────┐
│           PostgreSQL (port 5432)                    │
│  • Πίνακας users                                    │
│  • Πίνακας cash_card                                │
└─────────────────────────────────────────────────────┘
```

### Client Side Rendering (CSR)

Η εφαρμογή χρησιμοποιεί **Client Side Rendering**. Αυτό σημαίνει ότι:

- Ο nginx στέλνει ένα άδειο `index.html` στον browser
- Ο browser κατεβάζει το JavaScript bundle
- Το React τρέχει **μέσα στον browser** και δημιουργεί το UI
- Όλα τα API calls γίνονται από τον browser προς το Spring Boot

Αυτό διαφέρει από το **Server Side Rendering (SSR)** όπου ο server παράγει το HTML.

---

## 4. Δομή Project

```
cashcard-project/
│
├── docker-compose.yml          ← Ορισμός όλων των services
├── README.md
├── DOCUMENTATION.md            ← Αυτό το αρχείο
│
├── backend/
│   ├── Dockerfile              ← Multi-stage build (Gradle → JRE)
│   ├── build.gradle            ← Dependencies & build config
│   ├── settings.gradle
│   └── src/
│       └── main/
│           ├── java/example/cashcard/
│           │   ├── CashCardApplication.java    ← Main class
│           │   ├── CashCard.java               ← Model (record)
│           │   ├── CashCardRepository.java     ← DB queries
│           │   ├── CashCardController.java     ← REST endpoints (USER)
│           │   ├── AdminController.java        ← REST endpoints (ADMIN)
│           │   ├── User.java                   ← Model + Repository
│           │   └── SecurityConfig.java         ← Security configuration
│           └── resources/
│               ├── application.properties      ← DB config
│               └── schema.sql                  ← DDL + αρχικά δεδομένα
│
└── frontend/
    ├── Dockerfile              ← Multi-stage build (Node → nginx)
    ├── nginx.conf              ← nginx config με proxy
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx             ← Router setup
        ├── main.jsx            ← Entry point
        ├── context/
        │   └── AuthContext.jsx ← Global auth state
        ├── components/
        │   └── ProtectedRoute.jsx  ← Route guard
        └── pages/
            ├── LoginPage.jsx   ← Σελίδα σύνδεσης
            ├── Dashboard.jsx   ← Σελίδα χρήστη
            └── AdminPanel.jsx  ← Σελίδα admin
```

---

## 5. Βάση Δεδομένων

### Πίνακας `users`

| Στήλη    | Τύπος              | Περιγραφή                     |
| -------- | ------------------ | ----------------------------- |
| id       | BIGSERIAL PK       | Αυτόματο ID                   |
| username | VARCHAR(50) UNIQUE | Μοναδικό όνομα χρήστη         |
| password | VARCHAR(255)       | BCrypt hash (ποτέ plain text) |
| role     | VARCHAR(20)        | "USER" ή "ADMIN"              |

### Πίνακας `cash_card`

| Στήλη  | Τύπος            | Περιγραφή                       |
| ------ | ---------------- | ------------------------------- |
| id     | BIGSERIAL PK     | Αυτόματο ID                     |
| amount | DOUBLE PRECISION | Ποσό κάρτας                     |
| owner  | VARCHAR(50) FK   | Αναφορά στο username του χρήστη |

### Σχέσεις

```
users (1) ──────── (N) cash_card
         username      owner (FK)
```

Κάθε χρήστης μπορεί να έχει πολλές κάρτες. Κάθε κάρτα ανήκει σε έναν χρήστη.

### Αρχικά Δεδομένα (schema.sql)

Κατά την εκκίνηση δημιουργούνται αυτόματα:

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| Rafail   | rafail123  | USER  |
| Michael  | michael456 | USER  |
| admin    | admin123   | ADMIN |

Τα passwords αποθηκεύονται ως **BCrypt hashes** — ποτέ ως plain text.

---

## 6. Backend — Spring Boot

### CashCard.java — Model

```java
@Table("cash_card")
public record CashCard(@Id Long id, Double amount, String owner) {}
```

Χρησιμοποιεί Java `record` — immutable data class με αυτόματο constructor, getters, equals/hashCode. Δεν υπάρχουν setters, οπότε για αλλαγές δημιουργείται νέο object.

### CashCardRepository.java

Επεκτείνει `CrudRepository` και `PagingAndSortingRepository` του Spring Data JDBC. Παρέχει αυτόματα CRUD operations και custom queries:

```java
CashCard findByIdAndOwner(Long id, String owner);        // ownership check
Page<CashCard> findByOwner(String owner, PageRequest p); // pagination
boolean existsByIdAndOwner(Long id, String owner);       // existence check
```

### CashCardController.java — Endpoints χρήστη

Όλα τα endpoints απαιτούν `ROLE_USER` και κάνουν **ownership check** — ο χρήστης βλέπει μόνο τα δικά του cards.

Χρησιμοποιεί το `Principal` object που παρέχει το Spring Security για να αναγνωρίσει τον logged-in χρήστη:

```java
CashCard card = repository.findByIdAndOwner(id, principal.getName());
```

### AdminController.java — Endpoints admin

Όλα τα endpoints απαιτούν `ROLE_ADMIN`. Δεν υπάρχει ownership check — ο admin βλέπει τα πάντα.

Χρησιμοποιεί `@PreAuthorize("hasRole('ADMIN')")` σε επίπεδο κλάσης.

### User.java — Model + Repository

Ο `User` είναι επίσης `record` με πεδία `id`, `username`, `password`, `role`.

Το `UserRepository` χρησιμοποιεί `@Modifying @Query` για το DELETE γιατί το Spring Data JDBC δεν παράγει αυτόματα DELETE queries από το όνομα της μεθόδου (σε αντίθεση με το JPA):

```java
@Modifying
@Query("DELETE FROM users WHERE username = :username")
void deleteByUsername(String username);
```

### Ασφαλιστική δικλείδα στο `deleteUser` (AdminController.java)

Το `DELETE /admin/users/{username}` **δεν** διαγράφει αυτόματα όλα τα cards του χρήστη. Διαγράφει μόνο όσα έχουν `amount == 0`:

```java
cashCardRepository.findAll().forEach(card -> {
    if (card.owner().equals(username) && card.amount() == 0) {
        cashCardRepository.deleteById(card.id());
    }
});
```

Αυτό είναι σκόπιμο: αποτρέπει τον admin να διαγράψει «κατά λάθος» χρήματα που βρίσκονται ακόμα σε ενεργά cards. Αν ένας χρήστης έχει card με μη μηδενικό υπόλοιπο, ο admin πρέπει πρώτα να το μεταφέρει αλλού (`/admin/transfer`) ή να το μηδενίσει, πριν ο χρήστης διαγραφεί καθαρά χωρίς να μείνουν πίσω orphaned cards με θετικό υπόλοιπο.

---

## 7. Security

### HTTP Basic Authentication

Η εφαρμογή χρησιμοποιεί **HTTP Basic Authentication**. Δεν υπάρχει login endpoint — ο χρήστης στέλνει username+password σε **κάθε** request μέσα στο `Authorization` header:

```
Authorization: Basic c2FyYWgxOmFiYzEyMw==
                      ↑ Base64("sarah1:abc123")
```

### Γιατί δεν εμφανίζεται το browser popup

Το Spring Security από default στέλνει `WWW-Authenticate: Basic` header με κάθε 401 response, που κάνει τον browser να δείχνει το native popup. Το έχουμε απενεργοποιήσει με custom `authenticationEntryPoint`:

```java
.httpBasic(basic -> basic
    .authenticationEntryPoint((request, response, ex) -> {
        response.setStatus(401);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized\"}");
    })
)
```

### BCrypt Password Hashing

Τα passwords **ποτέ δεν αποθηκεύονται ως plain text**. Χρησιμοποιείται BCrypt με cost factor 10:

```
"abc123" → BCryptPasswordEncoder → "$2a$10$p4Mq4YMm..."
```

Το BCrypt είναι **μονόδρομο** (one-way hash) — δεν αποκρυπτογραφείται. Κατά το login το Spring Security:

1. Παίρνει το password που έγραψε ο χρήστης
2. Κάνει hash με τον ίδιο αλγόριθμο
3. Συγκρίνει τα δύο hashes

Κάθε hash έχει τυχαίο **salt** ενσωματωμένο, οπότε ακόμα και το ίδιο password δίνει διαφορετικό hash κάθε φορά — προστασία από rainbow tables.

### Role-Based Access Control (RBAC)

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .requestMatchers("/cashcards/**").hasRole("USER")
    .anyRequest().authenticated()
)
```

| Role  | Endpoints       | Περιγραφή               |
| ----- | --------------- | ----------------------- |
| USER  | /cashcards/\*\* | Μόνο τα δικά του cards  |
| ADMIN | /admin/\*\*     | Όλοι οι χρήστες & cards |

Ο ADMIN **δεν μπορεί** να καλέσει `/cashcards/**` (403 Forbidden) και αντίστροφα ο USER δεν μπορεί να καλέσει `/admin/**`.

### CORS Configuration

Επιτρέπει requests μόνο από `http://localhost:3000` (το React frontend):

```java
config.setAllowedOrigins(List.of("http://localhost:3000"));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowCredentials(true);
```

Σε production το nginx κάνει proxy τα requests οπότε δεν χρειάζεται CORS.

---

## 8. REST API Endpoints

### User Endpoints (`/cashcards/**`) — Απαιτεί ROLE_USER

| Method | URL                 | Περιγραφή                                | Response              |
| ------ | ------------------- | ---------------------------------------- | --------------------- |
| GET    | /cashcards          | Όλα τα cards του χρήστη                  | 200 + JSON array      |
| GET    | /cashcards/{id}     | Ένα συγκεκριμένο card                    | 200 ή 404             |
| POST   | /cashcards/transfer | Μεταφορά χρημάτων μεταξύ δικών του cards | 200 ή 400 ή 403 ή 404 |

> **Σημείωση:** Ο απλός χρήστης **δεν** μπορεί να δημιουργήσει, ενημερώσει ή διαγράψει card μόνος του — αυτές οι ενέργειες γίνονται μόνο από τον ADMIN (`/admin/cards`). Ο χρήστης μπορεί μόνο να δει τα cards του και να μεταφέρει χρήματα ανάμεσα σε δικά του cards.

#### Pagination & Sorting

```
GET /cashcards?page=0&size=10&sortBy=amount&direction=desc
```

#### Παράδειγμα POST /cashcards/transfer body:

```json
{
  "fromCardId": 1,
  "toCardId": 2,
  "amount": 50.0
}
```

Το backend ελέγχει ότι **και τα δύο** cards (`fromCardId`, `toCardId`) ανήκουν στον logged-in χρήστη· αλλιώς επιστρέφει 403.

### Admin Endpoints (`/admin/**`) — Απαιτεί ROLE_ADMIN

| Method | URL                     | Περιγραφή                                      | Response             |
| ------ | ----------------------- | ---------------------------------------------- | -------------------- |
| GET    | /admin/users            | Όλοι οι χρήστες (χωρίς passwords)              | 200 + JSON array     |
| GET    | /admin/cards            | Όλα τα cards                                   | 200 + JSON array     |
| POST   | /admin/users            | Δημιουργία χρήστη                              | 201 ή 409 (conflict) |
| POST   | /admin/cards            | Δημιουργία card για χρήστη                     | 201 ή 404            |
| POST   | /admin/transfer         | Μεταφορά χρημάτων                              | 200 ή 400 ή 404      |
| DELETE | /admin/users/{username} | Διαγραφή χρήστη (+ cards με μηδενικό υπόλοιπο) | 204 ή 404            |
| DELETE | /admin/cards/{id}       | Διαγραφή card                                  | 204 ή 404            |

#### Παράδειγμα POST /admin/users body:

```json
{
  "username": "newuser",
  "password": "mypassword",
  "role": "USER"
}
```

#### Παράδειγμα POST /admin/transfer body:

```json
{
  "fromCardId": 1,
  "toCardId": 3,
  "amount": 50.0
}
```

#### Ownership Check

Κάθε request στο `/cashcards/**` ελέγχει ότι το card ανήκει στον logged-in χρήστη. Αν ο `kumar2` προσπαθήσει να δει card του `sarah1`, παίρνει **404** (όχι 403) — σκόπιμα, για να μην αποκαλύψει ότι το card υπάρχει.

#### @Transactional στη μεταφορά

Το transfer endpoint χρησιμοποιεί `@Transactional`:

```java
@PostMapping("/transfer")
@Transactional
ResponseEntity<?> transfer(@RequestBody TransferRequest request) { ... }
```

Αυτό εξασφαλίζει ότι **ή γίνονται και τα δύο saves, ή κανένα** — αποφυγή απώλειας χρημάτων σε περίπτωση σφάλματος.

---

## 9. Frontend — React

### Αρχιτεκτονική Frontend

```
App.jsx (Router)
├── /login       → LoginPage.jsx
├── /dashboard   → ProtectedRoute → Dashboard.jsx   (ROLE_USER)
└── /admin       → ProtectedRoute → AdminPanel.jsx  (ROLE_ADMIN)
```

### AuthContext.jsx — Global State

Κρατάει τα credentials στη μνήμη (React state) και δημιουργεί το axios instance:

```js
const createApi = (username, password) =>
  axios.create({
    baseURL: BASE_URL,
    auth: { username, password }, // ← αυτό φτιάχνει το Basic Auth header
  });
```

Κατά το login δοκιμάζει πρώτα το `/admin/users` endpoint για να ανιχνεύσει το role:

- Αν επιστρέψει 200 → ADMIN
- Αν επιστρέψει 403 → USER (δοκιμάζει `/cashcards`)
- Αν επιστρέψει 401 → λάθος credentials

### ProtectedRoute.jsx — Route Guard

Αποτρέπει μη εξουσιοδοτημένη πρόσβαση:

```jsx
if (!auth) return <Navigate to="/login" />;
if (requiredRole === "ADMIN" && auth.role !== "ADMIN")
  return <Navigate to="/dashboard" />;
```

### LoginPage.jsx

Απλή φόρμα username/password. Μετά την επιτυχή σύνδεση ανακατευθύνει:

- ADMIN → `/admin`
- USER → `/dashboard`

### Dashboard.jsx — Σελίδα Χρήστη

Επιτρέπει στον χρήστη να:

- Βλέπει όλα τα cards του (ταξινομημένα κατά ποσό)
- Μεταφέρει χρήματα ανάμεσα σε δύο δικά του cards

Η δημιουργία νέου card γίνεται μόνο από τον ADMIN, μέσω του AdminPanel.

### AdminPanel.jsx — Σελίδα Admin

Επιτρέπει στον admin να:

- Βλέπει στατιστικά (χρήστες, cards, συνολικό ποσό)
- Δημιουργεί card για συγκεκριμένο χρήστη
- Δημιουργεί νέο χρήστη (με επιλογή role)
- Μεταφέρει χρήματα μεταξύ cards
- Βλέπει όλους τους χρήστες με tab
- Βλέπει όλα τα cards με tab
- Διαγράφει χρήστες (μαζί με τα cards τους)
- Διαγράφει cards

### BASE_URL — Development vs Production

```js
const BASE_URL = import.meta.env.PROD
  ? "/api" // Docker: nginx proxy
  : "http://localhost:8080"; // Local dev: απευθείας
```

Σε development (`npm run dev`) τα requests πηγαίνουν απευθείας στο Spring Boot. Σε production (Docker) πηγαίνουν στο nginx που τα κάνει proxy.

---

## 10. Docker

### Αρχιτεκτονική Docker

```
docker-compose.yml
├── postgres    (image: postgres:16-alpine)
├── backend     (build: ./backend)
└── frontend    (build: ./frontend)
```

### Multi-Stage Build — Backend

```dockerfile
# Stage 1: Build (βαρύ - JDK + Gradle)
FROM gradle:8.4-jdk17-alpine AS builder
RUN gradle bootJar --no-daemon -x test

# Stage 2: Run (ελαφρύ - μόνο JRE)
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /app/build/libs/*.jar app.jar
```

Το τελικό image περιέχει **μόνο το JRE** — όχι το JDK ή το Gradle. Πολύ μικρότερο μέγεθος.

### Multi-Stage Build — Frontend

```dockerfile
# Stage 1: Build (βαρύ - Node.js)
FROM node:20-alpine AS builder
RUN npm run build   # παράγει στατικά αρχεία

# Stage 2: Serve (ελαφρύ - nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

Το τελικό image περιέχει **μόνο το nginx** — όχι το Node.js. Πολύ μικρότερο μέγεθος.

### nginx Configuration

Υπάρχουν **δύο** εναλλακτικά configs, επιλέγονται μέσω build arg `NGINX_ENV` στο `frontend/Dockerfile`:

| Αρχείο                      | Πότε χρησιμοποιείται                  | Πώς                                                      |
| --------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `frontend/nginx.local.conf` | Τοπικά, χωρίς domain/SSL              | `docker compose up --build` (default: `NGINX_ENV=local`) |
| `frontend/nginx.prod.conf`  | Production, `spring.rmat.gr` με HTTPS | `docker compose -f docker-compose.prod.yml up --build`   |

Το `nginx.local.conf` σερβίρει απευθείας στο HTTP (`:80`) και κάνει proxy `/api/` στο backend — δεν χρειάζεται certificates. Το `nginx.prod.conf` κάνει redirect `:80 → :443`, χρησιμοποιεί πραγματικά Let's Encrypt certificates (μέσω του `certbot` service) και σερβίρει HTTPS.

**Γιατί δύο ξεχωριστά αρχεία και όχι ένα combined:** αν βάλεις σε ένα conf ταυτόχρονα ένα ενεργό `listen 443 ssl` block, το nginx θα αρνηθεί να ξεκινήσει όποτε δεν βρίσκει τα cert αρχεία (π.χ. τοπικά, χωρίς certbot) — δηλαδή θα σου σπάσει και το localhost testing. Με δύο αρχεία, κάθε environment χτίζει μόνο ό,τι μπορεί πραγματικά να τρέξει.

```nginx
# nginx.local.conf
location /api/ {
    proxy_pass http://backend:8080/;
    proxy_hide_header WWW-Authenticate;    # αποτρέπει browser popup
    proxy_set_header Authorization $http_authorization;
}
location / {
    try_files $uri $uri/ /index.html;      # React Router support
}
```

Το `try_files` είναι απαραίτητο για το React Router — χωρίς αυτό, αν κάνεις refresh στο `/dashboard` θα πάρεις 404.

### Health Check

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    retries: 10

backend:
  depends_on:
    postgres:
      condition: service_healthy # περιμένει να είναι έτοιμη η βάση
```

Ο backend **δεν ξεκινά** αν η βάση δεν είναι έτοιμη.

### Named Volume

```yaml
volumes:
  postgres_data:
```

Τα δεδομένα της βάσης **επιμένουν** ακόμα και αν σταματήσεις τα containers. Διαγράφονται μόνο με `docker compose down -v`.

---

## 11. Εκκίνηση Εφαρμογής

### Με Docker (συνιστάται)

```bash
# Εκκίνηση όλων
docker compose up --build

# Εκκίνηση στο background
docker compose up --build -d

# Σταμάτημα
docker compose down

# Σταμάτημα + διαγραφή δεδομένων βάσης
docker compose down -v

# Rebuild μετά από αλλαγές κώδικα
docker compose down -v
docker compose up --build
```

### Χωρίς Docker (local development)

**Backend:**

```bash
# Ξεκίνα μόνο τη βάση με Docker
docker compose up postgres

# Τρέξε το Spring Boot τοπικά
cd backend
./gradlew bootRun
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

### URLs

| Service  | URL                   | Περιγραφή       |
| -------- | --------------------- | --------------- |
| Frontend | http://localhost:3000 | React App       |
| Backend  | http://localhost:8080 | Spring Boot API |
| Database | localhost:5432        | PostgreSQL      |

### Έλεγχος Βάσης Δεδομένων

```bash
# Σύνδεση στη βάση
docker exec -it cashcard-db psql -U postgres -d cashcarddb

# Εντολές μέσα στο psql
\dt                                           # λίστα πινάκων
SELECT id, username, role FROM users;         # χρήστες
SELECT * FROM cash_card;                      # cards
\q                                            # έξοδος
```

### Test με curl

```bash
# GET όλα τα cards του Rafail
curl -u Rafail:rafail123 http://localhost:8080/cashcards

# POST μεταφορά χρημάτων μεταξύ δικών του cards
curl -u Rafail:rafail123 -X POST http://localhost:8080/cashcards/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromCardId": 1, "toCardId": 2, "amount": 50.00}'

# DELETE card (admin)
curl -u admin:admin123 -X DELETE http://localhost:8080/admin/cards/1

# Μεταφορά χρημάτων (admin)
curl -u admin:admin123 -X POST http://localhost:8080/admin/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromCardId": 1, "toCardId": 2, "amount": 50.00}'
```

---

## 12. Χρήστες & Roles

### Αρχικοί Χρήστες

| Username | Password   | Role  | Περιγραφή         |
| -------- | ---------- | ----- | ----------------- |
| Rafail   | rafail123  | USER  | Κανονικός χρήστης |
| Michael  | michael456 | USER  | Κανονικός χρήστης |
| admin    | admin123   | ADMIN | Διαχειριστής      |

### Δικαιώματα ανά Role

#### ROLE_USER

| Ενέργεια                  | Επιτρέπεται |
| ------------------------- | ----------- |
| Βλέπει τα δικά του cards  | ✓           |
| Δημιουργεί νέο card       | ✓           |
| Ενημερώνει δικό του card  | ✓           |
| Διαγράφει δικό του card   | ✓           |
| Βλέπει cards άλλου χρήστη | ✗ (404)     |
| Πρόσβαση σε /admin/\*\*   | ✗ (403)     |

#### ROLE_ADMIN

| Ενέργεια                                    | Επιτρέπεται |
| ------------------------------------------- | ----------- |
| Βλέπει όλους τους χρήστες                   | ✓           |
| Βλέπει όλα τα cards                         | ✓           |
| Δημιουργεί χρήστη                           | ✓           |
| Δημιουργεί card για χρήστη                  | ✓           |
| Διαγράφει χρήστη (μόνο cards με υπόλοιπο 0) | ✓           |
| Διαγράφει card                              | ✓           |
| Μεταφέρει χρήματα                           | ✓           |
| Διαγράφει τον εαυτό του                     | ✗           |
| Πρόσβαση σε /cashcards/\*\*                 | ✗ (403)     |

### Security Notes

- Τα passwords αποθηκεύονται ως **BCrypt hashes** — ποτέ plain text
- Το BCrypt είναι **μονόδρομο** (non-reversible) — δεν αποκρυπτογραφείται
- Κάθε hash έχει τυχαίο **salt** — προστασία από rainbow table attacks
- Το cost factor 10 κάνει το hashing σκόπιμα αργό (~100ms) — προστασία από brute force
- Χωρίς HTTPS τα credentials ταξιδεύουν κωδικοποιημένα με Base64 (όχι κρυπτογραφημένα) — για production **πάντα HTTPS**

---

## 13. Πρώτη Εγκατάσταση SSL (μόνο μία φορά, στον production server)

Το `nginx.prod.conf` απαιτεί να υπάρχει **ήδη** το certificate για να ξεκινήσει (`listen 443 ssl`). Αλλά το certificate παίρνεται _μέσω_ ενός nginx που ήδη τρέχει (webroot challenge) — άρα υπάρχει ένα chicken-and-egg πρόβλημα την πρώτη φορά που στήνεις τον server.

### Λύση: `init-letsencrypt.sh`

Το script κάνει αυτόματα 4 βήματα:

1. Χτίζει το frontend με `nginx.bootstrap.conf` — μόνο HTTP, **δεν** ζητάει certs, άρα ξεκινάει πάντα.
2. Σηκώνει `postgres` + `backend` + `frontend` με αυτό το config.
3. Ζητάει το πρώτο certificate από το Let's Encrypt (webroot challenge μέσω `/var/www/certbot`).
4. Ξαναχτίζει το frontend με το κανονικό `nginx.prod.conf` (SSL) και το κάνει `--force-recreate`.

```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh spring.rmat.gr www.spring.rmat.gr your@email.com
```

Μετά από αυτό, οι επόμενες ανανεώσεις (renewals) γίνονται **αυτόματα** από το `certbot` service στο `docker-compose.prod.yml` (τρέχει `certbot renew` κάθε 12 ώρες, χρησιμοποιώντας ξανά webroot μέσω του location `/.well-known/acme-challenge/` που υπάρχει ήδη στο `nginx.prod.conf`). Δεν χρειάζεται να ξανατρέξεις το script, εκτός αν αλλάξεις domain ή χάσεις το volume `./certbot/conf`.

### Τι πήγε λάθος στο πρώτο deploy

Το σφάλμα `cannot load certificate ".../fullchain.pem": ... No such file or directory` σημαίνει ακριβώς αυτό: έγινε `docker compose -f docker-compose.prod.yml up` απευθείας με το `nginx.prod.conf`, χωρίς να έχει προηγηθεί το βήμα απόκτησης certificate. Το frontend container έμπαινε σε loop restart επειδή δεν έβρισκε ποτέ το `.pem` αρχείο. Λύση: τρέξε πρώτα το `init-letsencrypt.sh`, και μετά χρησιμοποίησε κανονικά `docker compose -f docker-compose.prod.yml up -d`.
