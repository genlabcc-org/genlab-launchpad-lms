# Stage 1: Build application using JDK 25
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B || true

# Copy application source code and compile production JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:25-jre
WORKDIR /app

# Run as non-root user for security best practices
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy built JAR artifact from build stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (Render automatically sets the PORT environment variable)
ENV PORT=8080
EXPOSE ${PORT}

# Start Spring Boot app, binding server.port to Render's dynamic $PORT with IPv6/dual-stack enabled
ENTRYPOINT ["sh", "-c", "java -Djava.net.preferIPv4Stack=false -Djava.net.preferIPv6Addresses=true -Dserver.port=${PORT:-8080} -jar app.jar"]
