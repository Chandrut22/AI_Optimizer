# -------- Stage 1: Build --------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy all files and build the application
COPY . .
RUN mvn clean package -DskipTests

# -------- Stage 2: Run --------
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built jar from the first stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the port (Render sets $PORT)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
