const { Client } = require('pg');

async function auditLocal() {
    // Attempting to connect to the common local DB setup from previous sessions
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'moe_db',
        password: 'postgres',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('--- LOCAL DB AUDIT: SEARCHING FOR 34K RECORDS ---');
        
        // List all tables to see if they exist under different names
        const resTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        for (const row of resTables.rows) {
            const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            const count = parseInt(countRes.rows[0].count);
            if (count > 1000) {
                console.log(`[DATA FOUND!] Table: [${row.table_name}] | Rows: ${count}`);
            }
        }

    } catch (err) {
        console.error('Local connection failed (is PG running locally?):', err.message);
    } finally {
        await client.end();
    }
}

auditLocal();
