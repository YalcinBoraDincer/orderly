# ── AŞAMA 1: BUILD ──────────────────────────────────────────
# Maven + Java 21 içeren bir image ile projeyi derle
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Container içinde çalışma klasörünü belirle
WORKDIR /app

# Önce sadece pom.xml'i kopyala (dependency cache için)
COPY pom.xml .

# Bağımlılıkları indir (kod değişmese bile bu katman cache'de kalır)
RUN mvn dependency:go-offline -B

# Kaynak kodunu kopyala
COPY src ./src

# Uygulamayı derle ve JAR oluştur (testleri atla)
RUN mvn clean package -DskipTests

# ── AŞAMA 2: RUN ────────────────────────────────────────────
# Sadece Java 21 olan küçük bir image kullan (Maven yok = daha küçük)
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Build aşamasından sadece JAR dosyasını al
COPY --from=build /app/target/*.jar app.jar

# Uygulamanın dinleyeceği port
EXPOSE 8080

# Container başlarken çalışacak komut
ENTRYPOINT ["java", "-jar", "app.jar"]
