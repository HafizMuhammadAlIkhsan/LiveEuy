# ==========================================
# Stage 1: Build Application with Maven
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml and pre-fetch dependencies for caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build final jar
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Lightweight Runtime Image
# ==========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership to appuser
RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8081

# JVM options optimized for container environments
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
