# ===============================
# Stage 1: Build the Spring Boot JAR
# ===============================
FROM maven:3.9.8-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy Maven project files
COPY pom.xml .

# Pre-download dependencies to speed up future builds
RUN mvn dependency:go-offline -B

# Copy the rest of the source code
COPY src ./src

# Package the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# ===============================
# Stage 2: Run the Spring Boot app
# ===============================
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (adjust if your app runs on a different port)
EXPOSE 8080

# Default command to run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
