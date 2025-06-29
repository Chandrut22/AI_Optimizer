# -------- Stage 1: Build the app --------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy all project files
COPY . .

# Build the project (skip tests for faster build)
RUN mvn clean package -DskipTests

# -------- Stage 2: Run the app --------
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (Render will use $PORT automatically)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
