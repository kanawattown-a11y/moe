const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

function walkDir(dir, callback) {
    try {
        fs.readdirSync(dir).forEach(f => {
            let dirPath = path.join(dir, f);
            try {
                let isDirectory = fs.statSync(dirPath).isDirectory();
                if (isDirectory) {
                    // Skip some system dirs to save time
                    if (!f.startsWith('.') && f !== 'node_modules' && f !== 'AppData' && f !== 'Windows') {
                        walkDir(dirPath, callback);
                    }
                } else {
                    callback(path.join(dir, f));
                }
            } catch (e) {}
        });
    } catch (e) {}
}

const root = 'C:/Users/Dell';
console.log('--- STARTING ULTIMATE FORENSIC SEARCH FOR 34K EMPLOYEES ---');

walkDir(root, (filePath) => {
    if (filePath.toLowerCase().endsWith('.accdb') || filePath.toLowerCase().endsWith('.mdb')) {
        try {
            const stats = fs.statSync(filePath);
            if (stats.size > 20 * 1024 * 1024) { // Only check files > 20MB
                const buffer = fs.readFileSync(filePath);
                const reader = new MdbReader(buffer);
                const tableNames = reader.getTableNames();
                if (tableNames.includes('جدول_الذاتيات')) {
                    const table = reader.getTable('جدول_الذاتيات');
                    if (table.rowCount > 1000) {
                        console.log(`[GOLDEN FILE FOUND!!] Path: ${filePath}`);
                        console.log(`Table: جدول_الذاتيات | Rows: ${table.rowCount}`);
                        console.log('--- STOPPING SEARCH ---');
                        process.exit(0);
                    }
                }
            }
        } catch (e) {}
    }
});

console.log('Search finished. No golden file found in current scan scope.');
