# Backend Project - ShopCart

Dự án này là phần backend của hệ thống ShopCart, được xây dựng bằng **Spring Boot**.

## 1. Yêu cầu hệ thống (Prerequisites)
- **Java**: Phiên bản 25 (hoặc phù hợp với cấu hình `java.version` trong `pom.xml`).
- **Maven**: Công cụ quản lý thư viện và build dự án (bạn cũng có thể dùng `mvnw` đi kèm).
- **Cơ sở dữ liệu**: H2 (In-memory cho dev/test) hoặc PostgreSQL.

## 2. Các công nghệ và thư viện chính
- **Spring Boot 4.x**
- **Spring WebMVC**: Xây dựng RESTful APIs.
- **Spring Data JPA**: Quản lý và làm việc với cơ sở dữ liệu.
- **Spring Security**: Xác thực và phân quyền.
- **Lombok**: Giảm thiểu việc viết mã rập khuôn (boilerplate code).
- **H2 / PostgreSQL**: Tùy thuộc vào profile và cấu hình.

## 3. Cài đặt và Chạy dự án

### Cài đặt thư viện (Dependencies)
Mở terminal trong thư mục `backend` và chạy lệnh sau để Maven tự động tải các thư viện cần thiết:
```bash
# Nếu dùng Maven cài sẵn:
mvn clean install

# Nếu dùng Maven Wrapper:
./mvnw clean install # (Trên Linux/macOS)
mvnw clean install   # (Trên Windows)
```

### Chạy ứng dụng
Khởi động server dự án Spring Boot:
```bash
# Dùng Maven Wrapper
./mvnw spring-boot:run # (Trên Linux/macOS)
mvnw spring-boot:run   # (Trên Windows)
```
Ứng dụng backend sẽ mặc định nội bộ chạy trên cổng `8080` (trừ khi bạn cấu hình port khác trong `application.properties`).

## 4. Kiểm thử (Testing)
Dự án được cấu hình sẵn môi trường test với `spring-boot-starter-test`, `spring-boot-starter-data-jpa-test`, `spring-boot-starter-security-test`, và `spring-boot-starter-webmvc-test` để chạy test:
```bash
./mvnw test
```
