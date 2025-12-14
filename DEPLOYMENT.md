# DEVELOPMENT GUIDE: API KINERJA PERUSAHAAN

Dokumen ini berisi panduan lengkap untuk development, troubleshooting, verifikasi, dan maintenance *backend API Kinerja Perusahaan*. Dokumen ini disusun berdasarkan hasil sesi debugging dan implementasi aktual di lingkungan server.


## 1. Informasi Proyek dan Lingkungan

| Item                      | Detail                                                    |
| ------------------------- | --------------------------------------------------------- |
| **Repository GitHub**     | `https://github.com/FadhilAlrifa/laporan-kinerja-api.git` |
| **Base URL (Dev / Prod)** | `http://98.81.197.255`                                    |
| **Health Check URL**      | `http://98.81.197.255/health`                             |


## 2. Detail Server (AWS EC2)

| Item                 | Nilai                     |
| -------------------- | ------------------------- |
| **Instance ID**      | `i-09f1a76b9535d6005`     |
| **Instance Type**    | `t2.micro`                |
| **Public IPv4**      | `98.81.197.255`           |
| **Private IPv4**     | `172.31.21.206`           |
| **Region**           | `us-east-1`               |
| **Operating System** | Ubuntu 20.04 LTS          |
| **Status**           | Running                   |


## 3. Struktur Proyek

```bash
laporan-kinerja-api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── controllers/
│   ├── routes/
│   └── middlewares/
├── dist/              
├── .env
├── package.json
└── tsconfig.json
```


## 4. Setup Development Environment
### 4.1. Akses Server (SSH)

```bash
ssh -i my-project-key.pem ubuntu@98.81.197.255
cd ~/laporan-kinerja-api
```


### 4.2. Update Sistem & Dependensi

```bash
sudo apt update && sudo apt upgrade -y
npm install
```


## 5. Konfigurasi Environment (.env)

Bisa dilihat di .env file

## 6. Database & Prisma

### 6.1. Migrasi Database

```bash
npx prisma migrate deploy
```

### 6.2. Seeder (Opsional)

```bash
npx prisma db seed
```

### 6.3. Prisma Studio (Development)

```bash
npx prisma studio
```


## 7. Build & Run Aplikasi

### 7.1. Build TypeScript

```bash
npm run build
```

### 7.2. Menjalankan Aplikasi dengan PM2

```bash
pm2 delete AplikasiKinerja || true
pm2 start dist/app.js --name AplikasiKinerja
pm2 save
```

Cek status:

```bash
pm2 list
```


## 8. Konfigurasi Nginx (Reverse Proxy)

### 8.1. Edit Konfigurasi

```bash
sudo nano /etc/nginx/sites-available/default
```

### 8.2. Konfigurasi Server

```nginx
server {
    listen 80;
    server_name 98.81.197.255;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.3. Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. Verifikasi API (Postman)

1. **Health Check**
   `GET http://98.81.197.255/` → `200 OK`

2. **Login**
   `POST /api/auth/login`

3. **Endpoint Terproteksi**
   `GET /api/report/kategori` (Bearer Token)

---

## 10. Monitoring & Debugging

### 10.1. PM2 Monitoring

| Command                    | Fungsi                  |
| -------------------------- | ----------------------- |
| `pm2 list`                 | Status aplikasi         |
| `pm2 logs AplikasiKinerja` | Log realtime            |
| `pm2 monit`                | Monitoring CPU & Memory |

---

## 11. Prosedur Update Kode (Development Flow)

```bash
git pull origin main
npm install
npm run build
npx prisma migrate deploy
pm2 reload AplikasiKinerja
```

---

## 12. Troubleshooting Umum

| Masalah                | Penyebab                 | Solusi                           |
| ---------------------- | ------------------------ | -------------------------------- |
| `Connection timed out` | Port AWS tertutup        | Periksa Security Group (80 / 22) |
| `502 Bad Gateway`      | Node.js mati             | `pm2 list` / restart             |
| `403 Forbidden`        | JWT `unitKerjaId = null` | Perbaiki logic login controller  |
| API tidak update       | Build lama               | Pastikan `dist/` ter-*rebuild*   |



