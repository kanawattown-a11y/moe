const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

// Try to find the file with Arabic name using regex to handle mangled terminal output
const parentDir = 'c:/Users/Dell/Desktop/MOE';
const files = fs.readdirSync(parentDir);
const targetFile = files.find(f => f.endsWith('.accdb') && f.includes('2026'));

if (!targetFile) {
    console.error('TARGET DB NOT FOUND IN PARENT DIR');
    process.exit(1);
}

const dbPath = path.join(parentDir, targetFile);
console.log('Testing DB at:', dbPath);

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

const tableNames = reader.getTableNames();
console.log('--- ALL TABLES AND ROW COUNTS ---');
for (const name of tableNames) {
    try {
        const table = reader.getTable(name);
        console.log(`${name}: ${table.rowCount} rows`);
    } catch (e) {
        console.log(`${name}: Error reading rows`);
    }
}
