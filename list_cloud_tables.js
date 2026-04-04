const { Client } = require('pg');
require('dotenv').config();

async function listTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('--- LISTING ALL PRODUCTION CLOUD TABLES ---');
        
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        for (const row of res.rows) {
            const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(`Table: [${row.table_name}] | Rows: ${countRes.rows[0].count}`);
        }

    } catch (err) {
        console.error('Audit failed:', err.message);
    } finally {
        await client.end();
    }
}

listTables();
