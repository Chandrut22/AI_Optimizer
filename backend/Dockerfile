# Stage 1: Build the application using Maven and Java 21
FROM maven:3.9.8-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code and build the package
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final, slim image using Java 21
# ---- This line has been fixed ----
FROM eclipse-temurin:21-jdk-slim
WORKDIR /app

# Copy the built .jar file from the builder stage
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]