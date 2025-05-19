## Công nghệ sử dụng

- **Backend**: PHP Laravel 12
- **Frontend**: React với Inertia.js
- **Bản đồ**: Leaflet và React-Leaflet
- **Giao diện**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **Môi trường**: Docker

## Cài đặt và chạy ứng dụng bằng Docker

### Yêu cầu hệ thống

- Docker và Docker Compose
- Git

### Các bước cài đặt

1. **Clone dự án**

```bash
git clone https://github.com/yourusername/guland_claude.git
cd guland_claude
```

2. **Tạo các tệp Docker cần thiết**

Tạo tệp `Dockerfile`:

```dockerfile
FROM php:8.2-fpm

# Cài đặt các phụ thuộc
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    nodejs \
    npm

# Cài đặt các extension PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip
RUN docker-php-ext-install pdo_pgsql

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Sao chép mã nguồn ứng dụng
COPY . .

# Thiết lập quyền cho thư mục storage
RUN chmod -R 777 storage bootstrap/cache
```

Tạo thư mục `docker/nginx` và tệp `default.conf`:

```bash
mkdir -p docker/nginx
```

Nội dung của tệp `docker/nginx/default.conf`:

```nginx
server {
    listen 80;
    index index.php index.html;
    server_name localhost;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
    root /var/www/html/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
```

Tạo tệp `docker-compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: guland_app
    restart: unless-stopped
    volumes:
      - app-storage:/var/www/html/storage
      - app-bootstrap:/var/www/html/bootstrap/cache
      - .:/var/www/html
    networks:
      - guland_network

  nginx:
    image: nginx:alpine
    container_name: guland_nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - .:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - guland_network

  db:
    image: mysql:8.0
    container_name: guland_db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: guland
      MYSQL_ROOT_PASSWORD: root
      MYSQL_PASSWORD: password
      MYSQL_USER: guland
    volumes:
      - dbdata:/var/lib/mysql
    networks:
      - guland_network

  node:
    image: node:18
    container_name: guland_node
    ports:
      - "5173:5173"
    volumes:
      - .:/var/www/html
    working_dir: /var/www/html
    command: bash -c "npm install && npm run dev -- --host"
    networks:
      - guland_network

networks:
  guland_network:
    driver: bridge

volumes:
  app-storage:
  app-bootstrap:
  dbdata:
```

3. **Cập nhật tệp Vite config**

Cập nhật tệp `vite.config.js` để cho phép truy cập từ bên ngoài:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost'
        },
    },
});
```

4. **Tạo tệp .env từ .env.example**

```bash
cp .env.example .env
```

Cấu hình kết nối cơ sở dữ liệu trong tệp `.env`:

```
DB_CONNECTION=pgsql
DB_HOST=ep-morning-base-a15xz8tn.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=guland
DB_USERNAME=guland_owner
DB_PASSWORD=npg_MABxCujO9h1d
```

5. **Khởi chạy các container Docker**

```bash
docker-compose up -d
```

6. **Cài đặt các phụ thuộc PHP**

```bash
docker-compose exec app composer install
```

7. **Tạo khóa ứng dụng**

```bash
docker-compose exec app php artisan key:generate
```

8. **Chạy migration (nếu cần)**

```bash
docker-compose exec app php artisan migrate
```

9. **Cấp quyền cho thư mục storage và bootstrap/cache**

```bash
docker-compose exec app chmod -R 777 /var/www/html/storage
docker-compose exec app chmod -R 777 /var/www/html/bootstrap/cache
```

10. **Xóa cache của Laravel**

```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan config:clear
```

### Truy cập ứng dụng

Sau khi hoàn thành các bước trên, bạn có thể truy cập ứng dụng tại địa chỉ:

```
http://localhost:8000
```

## Các tính năng chính

1. **Trang chủ**: Hiển thị thông tin giới thiệu và các tùy chọn đăng nhập/đăng ký
2. **Trang bản đồ**: Hiển thị bản đồ với các lớp quy hoạch và điểm đánh dấu
   - Có thể thêm điểm đánh dấu bằng cách nhấp chuột phải vào bản đồ
   - Có thể chuyển đổi giữa các chế độ hiển thị điểm đánh dấu
   - Có thể bật/tắt các lớp bản đồ tùy chỉnh
3. **Trang báo cáo**: Hiển thị báo cáo về các điểm đánh dấu (yêu cầu đăng nhập)
4. **Trang trợ lý**: Giao diện trợ lý AI
5. **Quản lý tài khoản**: Đăng nhập, đăng ký, quản lý hồ sơ

## Các lệnh Docker hữu ích

- Xem log của các container:
```bash
docker-compose logs -f
```

- Dừng các container:
```bash
docker-compose down
```

- Khởi động lại các container:
```bash
docker-compose restart
```

- Chạy lệnh artisan:
```bash
docker-compose exec app php artisan <lệnh>
```

- Chạy lệnh npm:
```bash
docker-compose exec node npm <lệnh>
