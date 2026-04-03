# دليل نشر نظام منظومة التربية (Professional Deployment Guide) 🚀

هذا الدليل مخصص لنشر التطبيق على **AWS Lightsail** باستخدام **PM2** لإدارة العمليات، مع ربطه بـ **AWS RDS** كقاعدة بيانات و **AWS S3** لتخزين الملفات.

---

## 1. المتطلبات والروابط الأساسية
- **الدومين المقترح:** `moe.gov-bashan.org`
- **نظام التشغيل:** `Ubuntu 22.04 LTS` (على Lightsail Instance).
- **قاعدة البيانات:** PostgreSQL 14+ (على AWS RDS).
- **تخزين الملفات:** AWS S3 Bucket.

---

## 2. إعداد الخدمات السحابية (RDS & S3)

### أ. إعداد تخزين الملفات (AWS S3)
1. أنشئ Bucket باسم `moe-assets-prod`.
2. اضبط **CORS** في تبويب (Permissions) للسماح بالرفع من الدومين الخاص بك:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["https://moe.gov-bashan.org"],
        "ExposeHeaders": []
    }
]
```
3. احصل على مفاتيح الوصول (`S3_ACCESS_KEY`, `S3_SECRET_KEY`) من IAM بصلاحيات `AmazonS3FullAccess`.

### ب. إعداد قاعدة البيانات (AWS RDS)
1. أنشئ قاعدة بيانات PostgreSQL.
2. في **Security Groups**، افتح المنفذ `5432` لعنوان IP الخاص بسيرفر Lightsail فقط (لأمان قصوى).
3. احتفظ برابط الاتصال: `postgresql://USER:PASSWORD@ENDPOINT:5432/DB_NAME?schema=public`

---

## 3. تجهيز سيرفر Lightsail (Ubuntu + PM2)

### الخطوة 1: تحديث السيرفر وتثبيت Node.js
اتصل بالسيرفر عبر SSH ونفذ الأوامر التالية:
```bash
sudo apt update && sudo apt upgrade -y
# تثبيت NVM لإدارة إصدارات Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 20 # تثبيت إصدار Long Term Support
```

### الخطوة 2: تثبيت PM2 و Nginx
```bash
npm install -g pm2
sudo apt install nginx -y
```

---

## 4. تحميل ونشر التطبيق

### الخطوة 3: جلب الكود وضبط البيئة
1. قم بسحب الكود من GitHub: `git clone YOUR_REPO_URL`
2. ادخل للمجلد: `cd moe-system`
3. أنشئ ملف البيئة: `nano .env` وضبط القيم التالية:
   - `DATABASE_URL` (رابط RDS)
   - `NEXTAUTH_URL=https://moe.gov-bashan.org`
   - `AUTH_SECRET` (أنشئه عبر: `openssl rand -base64 32`)
   - `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`

### الخطوة 4: التثبيت والبناء (Build)
```bash
npm install
npx prisma db push    # تحديث جداول قاعدة البيانات
npm run build         # بناء نسخة الإنتاج
```

### الخطوة 5: التشغيل عبر PM2
```bash
# تشغيل التطبيق وإعطاؤه اسماً مميزاً
pm2 start npm --name "moe-app" -- start

# لضمان اشتغال التطبيق تلقائياً عند إعادة تشغيل السيرفر
pm2 save
pm2 startup
```

---

## 5. إعداد Nginx و SSL (الحماية والدومين)

### الخطوة 6: إعداد Reverse Proxy
أنشئ ملف إعدادات جديد: `sudo nano /etc/nginx/sites-available/moe`
وأضف الكود التالي:
```nginx
server {
    listen 80;
    server_name moe.gov-bashan.org;

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
تفعيل الرابط:
```bash
sudo ln -s /etc/nginx/sites-available/moe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### الخطوة 7: تفعيل HTTPS (SSL)
استخدم Certbot للحصول على شهادة مجانية من Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d moe.gov-bashan.org
```

---

## 🛡️ ملاحظات الصيانة الدورية
- **مشاهدة السجلات (Logs):** `pm2 logs moe-app`
- **إعادة التشغيل بعد تحديث الكود:**
  ```bash
  git pull
  npm install
  npm run build
  pm2 restart moe-app
  ```

> [!IMPORTANT]
> **تنبيه أمني**: تأكد من غلق كافة المنافذ في لوحة تحكم Lightsail Firewall عدا (80 للموقع، 443 للموقع المحمي، 22 للوصول عبر SSH).
