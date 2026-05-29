# 🎬 Movie Intelligence System (Full-Stack)

A professional, full-stack movie management application built with **Spring Boot** and **Angular**. This system features a dual-interface architecture: a sleek, Netflix-inspired dashboard for users and a robust command center for administrators to manage global movie assets.

---

## 🚀 Core Features

### 👤 User Experience
* **Netflix-Style UI:** High-impact hero section with cinematic previews and integrated video player.
* **Centered 5-Column Grid:** Custom CSS Grid layout for optimal movie browsing.
* **Intelligence Modals:** Deep-dive into movie metadata (Plot, Director, Genres, IMDb ratings).
* **Interactive Rating:** Star-based rating system (1-10) using `PATCH` requests for real-time updates.
* **Pagination:** Smooth catalog navigation with paginated data fetching.

### 🛡️ Administrative Control (Admin Mode)
* **OMDB Scanner:** Live integration with the OMDB API to pull real-world movie intelligence.
* **Batch Deployment:** Select multiple search results and deploy them to the local H2 database in a single transaction.
* **Asset Decommissioning:** Individual or Batch delete operations to manage the database inventory.
* **User Management:** Monitor registered users and system access levels.

---

## 📡 API Documentation

### 🎬 Movie Endpoints (`/api/Movies`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/Movies?page=0&size=10` | User/Admin | Fetch paginated list of local movies. |
| **GET** | `/api/Movies/search/{title}` | Admin | Proxy search query to the OMDB API. |
| **GET** | `/api/Movies/MovieDetails/{imdbId}`| User/Admin | Fetch detailed metadata for a specific IMDB ID. |
| **POST** | `/api/Movies/AddMovie` | Admin | Manually add a single movie to the database. |
| **POST** | `/api/Movies/AddMoviesBatch` | Admin | Deploy a list of movies to the database. |
| **PATCH** | `/api/Movies/{movieId}` | User/Admin | Update a specific movie's user rating. |
| **DELETE** | `/api/Movies/DeleteMovie/{id}` | Admin | Remove a single movie from the database. |
| **DELETE** | `/api/Movies/DeleteMoviesBatch` | Admin | Remove a list of movies (IDs in body). |

### 👤 User Endpoints (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users/register` | Public | Register a new user account. |
| **POST** | `/api/users/login` | Public | Authenticate user and return session data. |
| **GET** | `/api/users/all` | Admin | Retrieve a list of all registered users. |
| **GET** | `/api/users/{username}` | Admin | Retrieve profile data for a specific username. |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3.x, Spring Security (Basic Auth), Spring Data JPA |
| **Frontend** | Angular 17+ (Standalone Components), RxJS, CSS Grid |
| **Database** | H2 In-Memory Database |
| **Integration** | OMDB API |

---

## ⚙️ Configuration & Installation

### Backend Setup
1.  **OMDB API Key:** Ensure your key is set in `src/main/resources/application.properties`.

2.  **Run Server:**
    ```bash
    mvn spring-boot:run
    ```
    *Access the H2 Console at: `http://localhost:8080/h2-console`*

### Frontend Setup
1.  **Install Dependencies:**
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

The system utilizes **Role-Based Access Control (RBAC)**.
* **Public:** Registration and Login.
* **User Role:** Browsing library, viewing details, and rating movies.
* **Admin Role:** Full CRUD control, batch operations, and user management.

**CORS Policy:** Explicitly configured to allow the Angular frontend (`localhost:4200`) to interact with the Spring Boot API.

---

## 📜 License
Developed for the Movie Web App Project. All rights reserved.
