# =======================================================
# Stage 1: Build Application with Maven & Temurin JDK 21
# =======================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Maven descriptor and pre-fetch dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package application (skip tests as verified in CI/Gate)
COPY src ./src
RUN mvn clean package -DskipTests

# =======================================================
# Stage 2: Minimal Production JRE Runtime
# =======================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install wget for container healthcheck
RUN apk --no-cache add wget

# Create non-root system user for security
RUN addgroup -S finman && adduser -S finman -G finman

# Copy compiled jar from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Set ownership
RUN chown -R finman:finman /app

USER finman

EXPOSE 8080

# Configure JVM tuning options
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
