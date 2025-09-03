# Spring Boot + PostgreSQL + Docker Setup

This guide helps you containerize a Spring Boot application and run it with PostgreSQL using Docker.

---

## Project Structure

```
your-springboot-project/
├── Dockerfile
├── .dockerignore
├── src/
├── pom.xml
├── target/
└── README.md
```

---

## Step 1: Build the Spring Boot Project

Generate the `.jar` file:

```bash
./mvnw clean package
```

The `.jar` will be created under `target/`, e.g. `target/your-app-name.jar`.

---

## Step 2: Create a Dockerfile

Create a file named `Dockerfile` in the root:

```Dockerfile
# Use lightweight OpenJDK base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy built JAR file into container
COPY target/*.jar app.jar

# Expose app port
EXPOSE 8080

# Command to run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Step 3: Edit .dockerignore

Make sure `target/` is **NOT ignored**. Open `.dockerignore` and **remove** this line if it exists:

```
target/
```

---

## Step 4: Configure `application.properties`

```properties
# src/main/resources/application.properties

spring.datasource.url=jdbc:postgresql://db:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

---

## Step 5: Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/mydb
      SPRING_DATASOURCE_USERNAME: postgres
      ee: postgres

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

---

## Step 6: Run with Docker Compose

```bash
docker-compose up --build
```

Your Spring Boot app should now be accessible at:

```
http://localhost:8080
```

---

## Common Troubleshooting

* **target not found in Docker build?**
  → Make sure `target/` is not ignored in `.dockerignore`.
* **JAR not being created?**
  → Run `./mvnw clean package` before building the Docker image.
* **Database connection issues?**
  → Ensure the Spring Boot app waits for PostgreSQL using `depends_on` in Compose.

---

Let me know if you want a version with `application.yml` or need help deploying this to Render or Docker Hub.
