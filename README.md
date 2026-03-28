
# 🥗 SlimMom Backend — REST API pentru Tracking Caloric și Managementul Utilizatorilor

SlimMom Backend este un API REST construit cu Node.js și Express, creat pentru a susține aplicația SlimMom (frontend). Oferă funcționalități de autentificare, calcul caloric, gestionarea produselor consumate și stocarea datelor utilizatorilor. Proiectul demonstrează abilități solide în arhitectură backend, securitate, validare și integrare cu baze de date.

---

## 🚀 Funcționalități principale

- **Autentificare completă**: înregistrare, login, logout, sesiune persistentă.
- **Protecție JWT** pentru rutele private.
- **Calcul caloric** pe baza datelor utilizatorului.
- **CRUD pentru produse consumate** (add, list, delete).
- **Gestionarea profilului utilizatorului**.
- **Validare request-uri** cu biblioteci dedicate.
- **Structură modulară**, ușor de extins.
- **Integrare cu MongoDB** pentru stocarea datelor.

---

## 🛠️ Tehnologii utilizate

| Tehnologie | Rol |
|-----------|------|
| **Node.js** | runtime backend |
| **Express.js** | framework API |
| **MongoDB + Mongoose** | baza de date |
| **JWT (jsonwebtoken)** | autentificare |
| **bcryptjs** | hash parole |
| **Joi / Yup** | validare |
| **dotenv** | variabile de mediu |
| **CORS** | acces cross‑origin |
| **Nodemon** | dezvoltare locală |

---

## 📂 Structura proiectului

```
SlimMom-backend/
│── controllers/
│── models/
│── routes/
│── middleware/
│── helpers/
│── config/
│── server.js
│── package.json
│── .env.example
│── README.md
```

---

## 🔐 Autentificare și autorizare

Backend-ul implementează un sistem complet de autentificare:

- **POST /auth/register** — creare cont
- **POST /auth/login** — login + generare token
- **POST /auth/logout** — invalidare token
- **GET /auth/current** — datele utilizatorului logat

Token-ul este trimis în header:

```
Authorization: Bearer <token>
```

Middleware-ul `auth` validează token-ul și permite accesul doar utilizatorilor autentificați.

---

## 📡 Endpoint-uri principale

### 🔑 Autentificare
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/current`

### 🧮 Calculator caloric
- `POST /daily-rate` — calculează necesarul caloric pe baza datelor utilizatorului

### 🥗 Produse consumate
- `GET /day` — lista produselor consumate în ziua curentă
- `POST /day` — adaugă un produs consumat
- `DELETE /day/:id` — șterge un produs

### 📦 Produse (bază de date)
- `GET /products` — listă completă de produse alimentare
- `GET /products?search=` — căutare produse după nume

---

## 🧪 Cum rulezi local

### 1. Clonează repository-ul
```
git clone https://github.com/anisoara1/SlimMom-backend.git
cd SlimMom-backend
```

### 2. Instalează dependențele
```
npm install
```

### 3. Configurează variabilele de mediu
Creează un fișier `.env`:

```
PORT=5000
MONGO_URI=...
JWT_SECRET=...
```

### 4. Rulează serverul
```
npm run dev
```

Serverul va porni pe:

```
http://localhost:5000
```

---

## 🧱 Arhitectură și bune practici

Backend-ul este organizat pe principii clare:

- **controllers** — logică pentru fiecare resursă
- **routes** — definirea endpoint-urilor
- **models** — schema bazei de date
- **middleware** — autentificare, validare, erori
- **helpers** — funcții reutilizabile
- **config** — conexiune la baza de date

Această structură permite scalare ușoară și mentenanță simplă.

---

## 🎯 Obiectivul proiectului

SlimMom Backend demonstrează:

- implementarea unui API REST complet și sigur  
- gestionarea utilizatorilor și produselor  
- integrarea autentificării JWT  
- validare robustă a datelor  
- organizare modulară și scalabilă  
- lucrul cu baze de date NoSQL  
