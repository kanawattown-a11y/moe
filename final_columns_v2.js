const fs = require('fs');
const MR = require('mdb-reader').default || require('mdb-reader');
const buffer = fs.readFileSync('prisma/moe.accdb');
const reader = new MR(buffer);

const missing = ['جدول_المدراء', 'جدول_الصلاحيات', 'جدول_الأرشيف'];
missing.forEach(tn => {
    try {
        const table = reader.getTable(tn);
        console.log('TABLE_NAME_START:' + tn);
        console.log('COLUMNS_START:' + table.getColumnNames().join(',') + ':COLUMNS_END');
        console.log('TABLE_NAME_END:' + tn);
    } catch(e) {
        console.log(tn + ' error: ' + e.message);
    }
});
process.exit(0);
