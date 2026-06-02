# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM gradle:8.4-jdk17-alpine AS builder

WORKDIR /app

# Αντιγραφή gradle files πρώτα (cache layer)
COPY build.gradle settings.gradle ./

# Download dependencies (cache - δεν ξανακατεβαίνουν αν δεν αλλάξει το build.gradle)
RUN gradle dependencies --no-daemon || true

# Αντιγραφή πηγαίου κώδικα και build
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

# Non-root user για ασφάλεια
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
