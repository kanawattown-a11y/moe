const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('Connected to DB for manual migration.');

    const queries = [
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الرمز_الوزاري" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الوزارة" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "المديرية" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "العمل_مفصل" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الرقم_الوطني_رقمي" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الرقم_التأميني" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "مكان_القيد" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "رقم_القيد" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الهاتف_الأرضي" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "الموبايل_دولي" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "معرف_المعتمد" INTEGER;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "عام_الحصول_عليها" TEXT;',
        'ALTER TABLE "جدول_الذاتيات" ADD COLUMN IF NOT EXISTS "السنة_التي_أتمها" TEXT;'
    ];

    for (const q of queries) {
        try {
            console.log(`Executing: ${q}`);
            await client.query(q);
        } catch (e) {
            console.log(`Error on ${q}: ${e.message}`);
        }
    }

    await client.end();
    console.log('Manual migration finished.');
}

migrate();
