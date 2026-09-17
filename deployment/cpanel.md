# cPanel Shared Hosting Deployment Guide

This guide details step-by-step instructions to deploy the **Personal Life Management & Digital Assistant Web App** on standard cPanel shared hosting (Apache / LiteSpeed, PHP 8.2+, MySQL / MariaDB) without needing VPS, Docker, Redis, or Node.js.

---

## 1. Prerequisites on cPanel
- **PHP Version**: 8.2 or 8.3 (Select via *cPanel -> MultiPHP Manager* or *Select PHP Version*).
  - Required PHP Extensions: `pdo_mysql`, `session`, `json`, `mbstring`, `openssl`.
- **MySQL / MariaDB**: MySQL 8.0+ or MariaDB 10.5+.
- **SSL Certificate**: Let's Encrypt / AutoSSL (HTTPS enabled).

---

## 2. Directory Structure on Hosting Server

```text
/home/username/
├── api/                             <-- PHP Backend (outside public root for security)
│   ├── config/
│   │   ├── bootstrap.php
│   │   ├── database.php
│   │   └── app.php
│   ├── controllers/
│   ├── core/
│   ├── cron/
│   │   └── process_reminders.php
│   ├── middleware/
│   └── public/                      <-- (or route through public_html/api)
└── public_html/                     <-- Web Root
    ├── index.html                   <-- From frontend/dist/index.html
    ├── assets/                      <-- From frontend/dist/assets/
    ├── manifest.json                <-- PWA Manifest
    ├── sw.js                        <-- Service Worker
    ├── api/                         <-- Symlink or files from api/public/
    │   ├── index.php
    │   └── .htaccess
    └── .htaccess
```

---

## 3. Step-by-Step Deployment Steps

### Step 3.1: Create MySQL Database in cPanel
1. Go to **cPanel -> MySQL Database Wizard**.
2. Create database: `username_plm`.
3. Create user: `username_plmuser` with a strong password.
4. Assign user to database with **ALL PRIVILEGES**.
5. Go to **cPanel -> phpMyAdmin**, select `username_plm`, and import the SQL files in order from `database/migrations/`:
   - `001_create_roles_and_users.sql`
   - `002_create_contacts_and_mosques.sql`
   - `003_create_activities.sql`
   - `004_create_courses_and_class_sessions.sql`
   - `005_create_jumua_and_programmes.sql`
   - `006_create_reminders_and_notifications.sql`
   - `007_create_audit_logs_and_settings.sql`
   - `database/seeds/001_initial_seed.sql`

*(Alternatively, run `php scripts/migrate.php --seed` via cPanel Terminal / SSH).*

### Step 3.2: Configure Environment Variables
Create `.env` file in the root directory (or update `api/config/database.php`):
```env
APP_NAME="Mokhter Ahmad Personal Assistant"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_HOST=localhost
DB_PORT=3306
DB_NAME=username_plm
DB_USER=username_plmuser
DB_PASS=YourStrongPasswordHere
DB_CHARSET=utf8mb4

SESSION_SECURE=true
CRON_SECRET=your_secret_cron_token_here
```

### Step 3.3: Build & Upload Frontend
1. Locally in project directory:
   ```bash
   cd frontend
   npm run build
   ```
2. Compress contents of `frontend/dist/` into a zip file (`dist.zip`).
3. In **cPanel File Manager**, navigate to `public_html/` and extract `dist.zip`.

### Step 3.4: Configure Apache / LiteSpeed `.htaccess`
In `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # If request is for /api, rewrite to api/public/index.php
    RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

    # Frontend SPA routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
</IfModule>
```

### Step 3.5: Configure 5-Minute cPanel Cron Job
In **cPanel -> Cron Jobs**:
- Common Settings: `Once Per 5 Minutes (* / 5 * * * *)`
- Command:
  ```bash
  /usr/local/bin/php /home/username/api/cron/process_reminders.php >/dev/null 2>&1
  ```
*(Replace `/home/username/` with your actual cPanel home directory path).*

---

## 4. Default Accounts & Verification
- **Scholar / Owner Login**:
  - Email: `admin@mokhterahmad.com`
  - Password: `password123` *(Change immediately upon first login)*
- **Personal Secretary (PS) Login**:
  - Email: `ps@mokhterahmad.com`
  - Password: `password123`

The application is now running securely on your shared hosting server!
