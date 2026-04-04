const { Client } = require('pg');
require('dotenv').config();

async function auditCloud() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('--- PRODUCTION CLOUD DB AUDIT ---');
        
        const tables = [
            'جدول_الذاتيات',
            'جدول_المدارس',
            'جدول_المحافظات_مفصل',
            'جدول_المجمع_التربوي',
            'User'
        ];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
                console.log(`Table: [${table}] | Rows: ${res.rows[0].count}`);
            } catch (e) {
                console.log(`Table: [${table}] | Not Found or Error: ${e.message}`);
            }
        }

    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

auditCloud();
