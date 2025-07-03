# Đồ án: Ứng dụng quản lý công việc "Daily List"

Đây là đồ án xây dựng ứng dụng To-do list đa nền tảng sử dụng React Native cho Frontend và Node.js cho Backend.

## Công nghệ sử dụng

* **Frontend**: React Native
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (Server), SQLite (Client)
* **Xác thực**: JWT (JSON Web Tokens)

## Hướng dẫn cài đặt

### Yêu cầu
- Node.js (v18.x trở lên)
- PostgreSQL
- Môi trường React Native CLI (đã cài đặt JDK, Android Studio)

### 1. Cài đặt Backend (`/backend`)

1.  Di chuyển vào thư mục server: `cd backend`
2.  Cài đặt các gói phụ thuộc: `npm install`
3.  Tạo file `.env` từ file `.env.example` và điền thông tin CSDL PostgreSQL của bạn.
4.  Khởi tạo CSDL và các bảng cần thiết (chạy các file script SQL).

### 2. Cài đặt Frontend (`/frontend`)

1.  Di chuyển vào thư mục frontend: `cd frontend`
2.  Cài đặt các gói phụ thuộc: `npm install`
3.  Chạy ứng dụng: Cắm thiết bị Android hoặc khởi động máy ảo, sau đó chạy lệnh: `npx expo start`.

## Khởi chạy dự án

1.  **Chạy Backend**: Mở một terminal, `cd server` và chạy `npm run dev`.
2.  **Chạy Frontend**: Mở terminal thứ hai, `cd frontend` và chạy `npx react-native run-android`.