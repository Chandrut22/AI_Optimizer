# Stage 1: Build the application using Maven and Java 21
FROM maven:3.9.8-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
# Path is relative to the backend folder
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code and build the package
# Path is relative to the backend folder
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final, slim image using Java 21
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the built .jar file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]