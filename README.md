# 🎬 Movie Intelligence System (Netflix-Style)

A high-performance, full-stack movie management application built with **Spring Boot** and **Angular**. This system features a dual-interface architecture: a sleek, Netflix-inspired dashboard for users and a robust command center for administrators to manage global movie assets.

---

## 🚀 Core Features

### 👤 User Experience
* **Netflix-Style UI:** High-impact hero section with cinematic previews and integrated video player.
* **Centered 5-Column Grid:** A custom-engineered CSS Grid layout that perfectly centers movie assets for a premium browsing experience.
* **Intelligence Modals:** Deep-dive into movie metadata, including plots, directors, genres, and IMDb ratings.
* **Watchlist Management:** A persistent "My List" feature for users to save titles.
* **Interactive Rating:** A star-based rating system (1-10) utilizing `PATCH` requests to update user-specific data without reloading.
* **Pagination:** Smooth navigation through the catalog with "Next" and "Previous" controls.

### 🛡️ Administrative Control (Admin Mode)
* **OMDB Scanner:** Live integration with the OMDB API to pull real-world movie intelligence.
* **Batch Deployment:** The ability to select multiple search results and deploy them to the local H2 database in a single `forkJoin` transaction.
* **Asset Decommissioning:** Individual or Batch delete operations to remove movies from the database.
* **User Management:** A protected view to monitor registered users and system access levels.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3.x, Spring Security (Basic Auth), Spring Data JPA |
| **Frontend** | Angular 17+ (Standalone Components), RxJS, CSS Grid/Flexbox |
| **Database** | H2 In-Memory Database |
| **Integration** | OMDB API (External Movie Intelligence) |
| **Build Tools** | Maven, npm |

---

## ⚙️ Configuration & Installation

### Backend Setup
1.  **OMDB API Key:** Ensure your key (`7f6fb6c7`) is active in `application.properties`.
2.  **Application Properties:** Located in `src/main/resources/application.properties`:
    ```properties
    spring.application.name=Movie_Web_App
    omdb.api.key=7f6fb6c7
    spring.datasource.url=jdbc:h2:mem:moviedb
    spring.jpa.hibernate.ddl-auto=update
    ```
3.  **Run Server:**
    ```bash
    mvn spring-boot:run
    ```
    *Access the H2 Console at: `http://localhost:8080/h2-console`*

### Frontend Setup
1.  **Dependencies:** Install via npm:
    ```bash
    npm install
    ```
2.  **Run Dashboard:**
    ```bash
    ng serve
    ```
    *Access the UI at: `http://localhost:4200`*

---

## 🔑 Security Architecture

The system utilizes **Role-Based Access Control (RBAC)** enforced by Spring Security.

* **Public Access:** Registration (`/api/users/register`) and Login (`/api/users/login`).
* **User Role:** Access to `AllMovies`, `MovieDetails`, `Watchlist`, and `Rating` (PATCH).
* **Admin Role:** Exclusive access to `AddMovie`, `AddMoviesBatch`, `DeleteMovie`, and `UserManagement`.

**Cross-Origin Resource Sharing (CORS):**
Configured to allow the Angular frontend (`localhost:4200`) to interact with the Spring Boot API (`localhost:8080`) using specific headers (`Authorization`, `Content-Type`).

---

## 📡 API Endpoints

### Movies
| Path | Method | Description |
| :--- | :--- | :--- |
| `/api/Movies` | `GET` | Paginated list of movies |
| `/api/Movies/MovieDetails/{imdbId}` | `GET` | Specific movie metadata |
| `/api/Movies/search/{title}` | `GET` | Proxy search to OMDB |
| `/api/Movies/AddMoviesBatch` | `POST` | Admin: Deploy multiple titles |
| `/api/Movies/{id}` | `PATCH` | User: Submit star rating |

---

## 📜 License
Developed for the Movie Web App Project. All rights reserved.
