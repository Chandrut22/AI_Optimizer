# Optimizer Backend Service

A secure and observable REST API built with Spring Boot 3.5.6 and Java 21. This service handles user authentication (JWT & OAuth2), user management, scan history tracking, and integrates with Prometheus and Grafana for monitoring.

## 🚀 Tech Stack

* **Framework:** Spring Boot 3.5.6
* **Language:** Java 21
* **Database:** PostgreSQL
* **Security:** Spring Security, JWT (JSON Web Tokens), OAuth2 Client (Google)
* **Monitoring:** Spring Boot Actuator, Micrometer, Prometheus
* **Build Tool:** Maven
* **Containerization:** Docker & Docker Compose

## 📋 Prerequisites

* Java 21 SDK
* Maven 3.x
* Docker & Docker Compose (optional, for running dependencies easily)
* PostgreSQL (if not running via Docker)

## ⚙️ Configuration

The application relies on environment variables for sensitive configuration. You can set these in a `.env` file in the root directory or export them in your shell.

| Variable                                 | Description                                | Default / Example                                 |
| :--------------------------------------- | :----------------------------------------- | :------------------------------------------------ |
| `PORT`                                 | Server port                                | `8080`                                          |
| `DB_URL`                               | JDBC URL for PostgreSQL                    | `jdbc:postgresql://localhost:5432/optimizer_db` |
| `DB_USERNAME`                          | Database username                          | `postgres`                                      |
| `DB_PASSWORD`                          | Database password                          | `password`                                      |
| `APPLICATION_SECURITY_JWT_PRIVATE_KEY` | RSA Private Key for signing JWTs           | *(Base64 encoded)*                              |
| `APPLICATION_SECURITY_JWT_PUBLIC_KEY`  | RSA Public Key for verifying JWTs          | *(Base64 encoded)*                              |
| `CORS_ALLOWED_ORIGINS`                 | Comma-separated list of allowed origins    | `http://localhost:5173`                         |
| `GOOGLE_CLIENT_ID`                     | Google OAuth2 Client ID                    | `...`                                           |
| `GOOGLE_CLIENT_SECRET`                 | Google OAuth2 Client Secret                | `...`                                           |
| `OAUTH_FRONTEND_REDIRECT_URL`          | Frontend URL to redirect after OAuth login | `http://localhost:5173/oauth/callback`          |
| `ADMIN_EMAIL`                          | Default admin email                        | `admin@optimizer.com`                           |
| `ADMIN_PASSWORD`                       | Default admin password                     | `admin123`                                      |

### Email Configuration (SMTP)

The application is pre-configured for Gmail SMTP in `application.properties`. Ensure you update the credentials or use an App Password if required:

* `spring.mail.username`
* `spring.mail.password`

## 🛠️ Installation & Running

### Option 1: Using Docker Compose (Recommended)

This will spin up the Backend container along with its environment configuration.

1. **Build and Run:**
   ```bash
   docker-compose up --build -d
   ```
2. **Access Services:**
   * **Backend API:** `http://localhost:8080`

### Option 2: Local Development (Maven)

1. **Start PostgreSQL:** Ensure your database is running and credentials match your environment variables.
2. **Install Dependencies:**
   ```bash
   ./mvnw clean install
   ```
3. **Run the Application:**
   ```bash
   ./mvnw spring-boot:run
   ```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)

| Method   | Endpoint             | Description                                               |
| :------- | :------------------- | :-------------------------------------------------------- |
| `POST` | `/register`        | Register a new user account.                              |
| `POST` | `/authenticate`    | Login with email/password to get Access & Refresh tokens. |
| `POST` | `/verify`          | Verify email account using OTP.                           |
| `POST` | `/refresh-token`   | Specific endpoint to refresh the JWT access token.        |
| `POST` | `/logout`          | Logout user (clears security context/cookies).            |
| `POST` | `/forgot-password` | Initiate password reset process.                          |
| `POST` | `/reset-password`  | Complete password reset with new credentials.             |
| `GET`  | `/token`           | Retrieve the raw access token for the current user.       |

### User Management (`/api/v1/users`)

| Method   | Endpoint         | Description                                     |
| :------- | :--------------- | :---------------------------------------------- |
| `GET`  | `/me`          | Get profile information for the logged-in user. |
| `GET`  | `/history`     | Fetch scan history for the logged-in user.      |
| `POST` | `/select-tier` | Update the user's account tier.                 |

### Scan Operations (`/api/v1/scans`)

| Method   | Endpoint | Description                              |
| :------- | :------- | :--------------------------------------- |
| `GET`  | `/`    | Get scan history (Alternative endpoint). |
| `POST` | `/`    | Create a new scan record.                |

## 🔒 Security

* **Stateless Authentication:** Uses JWT (RS256 signing) for stateless session management.
* **OAuth2:** Integrated with Google for social login.
* **Cookies:** HttpOnly cookies are used for securely storing Refresh Tokens.
* **CSRF:** Disabled (as it is a stateless REST API).
* **CORS:** Configurable via environment variables to allow specific frontend origins.
