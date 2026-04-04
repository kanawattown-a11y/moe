const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
console.log('Force reading table from:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('File not found!');
    process.exit(1);
}

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

try {
    const table = reader.getTable('جدول_الذاتيات');
    console.log(`Table: [جدول_الذاتيات] | Reported RowCount: ${table.rowCount}`);
    
    // Attempt to get data regardless of count
    const rows = table.getData({ limit: 5 });
    if (rows && rows.length > 0) {
        console.log(`--- SUCCESS: EXTRACTED ${rows.length} ROWS ---`);
        console.log('Sample Data:', JSON.stringify(rows[0], null, 2));
    } else {
        console.log('--- FAILURE: TABLE IS TRULY EMPTY ---');
    }
} catch (e) {
    console.error('Error during forced read:', e.message);
}
