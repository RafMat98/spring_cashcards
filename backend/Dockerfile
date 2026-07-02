# ── Stage 1: Build 
FROM gradle:8.4-jdk17-alpine AS builder

WORKDIR /app

# cache layer
COPY build.gradle settings.gradle ./

# Download dependencies (cache)
RUN gradle dependencies --no-daemon || true


COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── Stage 2: Run 
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

# Non-root user for safety
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
