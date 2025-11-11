# ===============================
# Stage 1: Build the Spring Boot JAR
# ===============================
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the Maven build files from backend/
COPY backend/pom.xml .

# Pre-download dependencies
RUN mvn dependency:go-offline -B

# Copy the source code from backend/src
COPY backend/src ./src

# Build the application
RUN mvn clean package -DskipTests

# ===============================
# Stage 2: Run the Spring Boot app
# ===============================
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
