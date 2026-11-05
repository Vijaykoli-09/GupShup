# ---------- Stage 1: build the jar ----------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy the Maven wrapper and pom first so dependencies are cached between builds
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q dependency:go-offline

# Copy the source (includes the single application.properties) and build
COPY src src
RUN ./mvnw -q -DskipTests package

# ---------- Stage 2: run ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as a non-root user
RUN useradd --system --no-create-home appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser

# The "prod" profile no longer loads a file. It only switches on ProdSafetyCheck,
# which refuses to start with a weak JWT secret, a weak admin password, demo data on,
# or localhost in CORS. All values still come from application.properties Option A
# and the 7 environment variables on Render.
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_TOOL_OPTIONS="-Xmx320m -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]