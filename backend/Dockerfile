# Use OpenJDK base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built jar file
COPY target/*.jar app.jar

# Expose port (optional)
# EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
