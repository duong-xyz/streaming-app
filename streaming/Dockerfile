# Stage 1: Dùng Maven bản mới kết hợp OpenJDK 21 để build dự án
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Chỉ lấy file .jar sau khi build sang một môi trường JRE 21 gọn nhẹ để chạy
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
