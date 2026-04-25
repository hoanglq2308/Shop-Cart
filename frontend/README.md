# Frontend Project - ShopCart

Dưới đây là các bước và thư viện đã được cài đặt cho dự án frontend này:

## 1. Khởi tạo dự án
Dự án được khởi tạo bằng Vite với template React:
```bash
# Tạo dự án react trong thư mục frontend
npm create vite@latest frontend -- --template react

# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các thư viện cơ bản
npm install
```

## 2. Thư viện nghiệp vụ
Các thư viện phục vụ cho việc gọi API và làm giao diện:
```bash
# Axios để gọi API lên Backend
npm install axios

# TailwindCSS để làm giao diện
npm install -D tailwindcss@3 postcss autoprefixer

# Khởi tạo file cấu hình Tailwind
npx tailwindcss init -p
```

## 3. Bộ công cụ Kiểm thử (Testing Tools)
Đây là phần quan trọng để đảm bảo chất lượng mã nguồn:

### Unit & Integration Test (Vitest & RTL)
```bash
# Vitest và môi trường giả lập trình duyệt (jsdom)
npm install -D vitest jsdom

# React Testing Library (Để test Component)
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### End-to-End Test (Playwright)
```bash
# Playwright (Để test E2E)
npm init playwright@latest
```

