const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
console.log('Testing DB at:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('DB NOT FOUND');
    process.exit(1);
}

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

try {
    const table = reader.getTable('جدول_الذاتيات');
    const rows = table.getData({ limit: 5 });
    console.log(`Found ${table.rowCount} total rows in جدول_الذاتيات`);
    console.log('First row columns:', Object.keys(rows[0] || {}));
    console.log('First row sample:', rows[0]);
} catch (e) {
    console.error('Error reading table:', e.message);
    const tables = reader.getTableNames();
    console.log('Available tables:', tables);
}
