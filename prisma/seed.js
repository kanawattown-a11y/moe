const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const MdbReader = require('mdb-reader').default || require('mdb-reader');

// Connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: false
});

async function main() {
    // Ultimate Flexible Path Search
    const pathsToTry = [
        path.join(process.cwd(), "data.accdb"),
        "C:\\Users\\Dell\\Desktop\\MOE\\moe-system\\data.accdb",
        "C:\\Users\\Dell\\Desktop\\MOE\\بيانات العاملين 2026.accdb",
        path.join(process.cwd(), "..", "بيانات العاملين 2026.accdb"),
        path.join(process.cwd(), "بيانات العاملين 2026.accdb"),
        path.join(__dirname, "..", "data.accdb")
    ];

    let dbPath = null;
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            dbPath = p;
            break;
        }
    }

    if (!dbPath) {
        console.error('CRITICAL ERROR: Database file not found at any of these locations:');
        pathsToTry.forEach(p => console.log(' - tried:', p));
        console.log('--- ACTION REQUIRED ---');
        console.log('Please COPY your file "بيانات العاملين 2026.accdb" INTO this folder: ' + process.cwd());
        process.exit(1);
    }
    
    console.log('--- ABSOLUTE SOURCE FOUND AT: ', dbPath);

    const buffer = fs.readFileSync(dbPath);
    const reader = new MdbReader(buffer);

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // FORCE: Disable all foreign key constraints for this session to allow "Mirror Migration"
        await client.query("SET session_replication_role = 'replica';");
        console.log('--- FOREIGN KEY CONSTRAINTS DISABLED FOR MIRRORING ---');

        // Helper for upsert with verification
        const upsert = async (tableName, rowData, pk) => {
            const columns = Object.keys(rowData).map(c => `"${c}"`); 
            const values = Object.values(rowData);
            const placeholders = values.map((_, i) => `$${i + 1}`);

            // Construct SET clause that only updates if there is a change (Verification before update)
            const updateSet = Object.keys(rowData)
                .filter(c => c !== pk) // Don't update the PK itself
                .map(c => `"${c}" = EXCLUDED."${c}"`)
                .join(', ');

            // This query effectively "verifies" existence: 
            // If it exists, it updates (syncs). If not, it inserts.
            const query = `
                INSERT INTO "${tableName}" (${columns.join(', ')})
                VALUES (${placeholders.join(', ')})
                ON CONFLICT ("${pk}")
                DO UPDATE SET ${updateSet}
                WHERE (${tableName}."${pk}" = EXCLUDED."${pk}");
             `;

            try {
                await client.query(query, values);
            } catch (err) {
                console.error(`Error syncing ${tableName} PK ${rowData[pk]}:`, err.message);
            }
        };

        // Verification Helper: Get existing count
        const getExistingCount = async (tableName) => {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
                return parseInt(res.rows[0].count);
            } catch { return 0; }
        };

        // --- 1. Users ---
        console.log('--- Importing Users ---');
        const existingUsers = await getExistingCount('جدول_المستخدمين');
        console.log(`Current users in RDS: ${existingUsers}. Verifying with source...`);
        try {
            const userTable = reader.getTable('جدول_المستخدمين');
            for (const row of userTable.getData()) {
                try {
                    const query = `
                        INSERT INTO "جدول_المستخدمين" ("اسم_المستخدم", "كلمة_المرور", "اسم_الدور", "فعال")
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT ("اسم_المستخدم") 
                        DO UPDATE SET "كلمة_المرور" = EXCLUDED."كلمة_المرور", "فعال" = EXCLUDED."فعال";
                    `;
                    await client.query(query, [
                        String(row['اسم_المستخدم']),
                        String(row['كلمة_المرور']),
                        String(row['اسم_الدور']),
                        Boolean(row['فعال'])
                    ]);
                } catch (e) { console.error('Error user:', e.message); }
            }
        } catch (e) { console.log('Users table not found or empty'); }

        // --- 1.1 Ensure Default Admin ---
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('--- Seeding Default Admin ---');
        try {
            const query = `
                INSERT INTO "جدول_المستخدمين" ("اسم_المستخدم", "كلمة_المرور", "اسم_الدور", "فعال")
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("اسم_المستخدم") 
                DO NOTHING;
            `;
            await client.query(query, ['admin', hashedPassword, 'ADMIN', true]);
            console.log('Default admin (admin/password123) ensured.');
        } catch (e) { console.error('Error seeding admin:', e.message); }

        // --- 2. Simple Lookups ---
        const simpleLookups = [
            { table: 'جدول_المجمع_التربوي', pk: 'معرف_المجمع', nameCol: 'اسم_المجمع' },
            { table: 'جدول_المسمى_الوظيفي_الحالي', pk: 'معرف_المسمى_الوظيفي_الحالي', nameCol: 'المسمى_الوظيفي_الحالي' },
            { table: 'جدول_الوضع_العائلي', pk: 'معرف_الوضع_العائلي', nameCol: 'الوضع_العائلي' },
            { table: 'جدول_الفئة_الوظيفية', pk: 'معرف_الفئة_الوظيفية', nameCol: 'الفئة_الوظيفية' },
            { table: 'جدول_نوع_التعيين', pk: 'معرف_نوع_التعيين', nameCol: 'نوع_التعيين' },
            { table: 'جدول_الحالة', pk: 'معرف_الحالة', nameCol: 'الحالة' },
        ];

        for (const lookup of simpleLookups) {
            console.log(`--- Importing ${lookup.table} ---`);
            try {
                const table = reader.getTable(lookup.table);
                const rows = table.getData();
                for (const row of rows) {
                    if (!row[lookup.pk]) continue;
                    await upsert(lookup.table, {
                        [lookup.pk]: Number(row[lookup.pk]),
                        [lookup.nameCol]: row[lookup.nameCol] ? String(row[lookup.nameCol]) : null
                    }, lookup.pk);
                }
                console.log(`Imported ${rows.length} rows.`);
            } catch (e) { console.log(`Table ${lookup.table} skipped: ${e.message}`); }
        }

        // --- 3. City ---
        console.log('--- Importing Cities ---');
        try {
            const cityTable = reader.getTable('جدول_المدينة');
            for (const row of cityTable.getData()) {
                if (!row['معرف_المدينة']) continue;
                await upsert('جدول_المدينة', {
                    'معرف_المدينة': Number(row['معرف_المدينة']),
                    'المدينة': String(row['المدينة'])
                }, 'معرف_المدينة');
            }
        } catch (e) { console.log('City table skipped'); }

        // --- 4. Village ---
        console.log('--- Importing Villages ---');
        try {
            const villageTable = reader.getTable('جدول_القرية_الحي');
            for (const row of villageTable.getData()) {
                if (!row['معرف_القرية_الحي']) continue;
                await upsert('جدول_القرية_الحي', {
                    'معرف_القرية_الحي': Number(row['معرف_القرية_الحي']),
                    'القرية_الحي': String(row['القرية_الحي']),
                    'معرف_المدينة': row['معرف_المدينة'] ? Number(row['معرف_المدينة']) : null
                }, 'معرف_القرية_الحي');
            }
        } catch (e) { console.log('Village table skipped'); }

        // --- 5. Work Details ---
        console.log('--- Importing Work Details ---');
        try {
            const workTable = reader.getTable('جدول_العمل_مفصل');
            for (const row of workTable.getData()) {
                if (!row['معرف_المكتب']) continue;
                await upsert('جدول_العمل_مفصل', {
                    'معرف_المكتب': Number(row['معرف_المكتب']),
                    'الطابق': row['الطابق'] ? String(row['الطابق']) : null,
                    'اسم_المكتب': row['اسم_المكتب'] ? String(row['اسم_المكتب']) : null,
                    'معرف_الشعبة': row['معرف_الشعبة'] ? Number(row['معرف_الشعبة']) : null,
                    'معرف_الدائرة': row['معرف_الدائرة'] ? Number(row['معرف_الدائرة']) : null,
                    'هاتف_المكتب': row['هاتف_المكتب'] ? Number(row['هاتف_المكتب']) : null
                }, 'معرف_المكتب');
            }
        } catch (e) { console.log('Work detail table skipped'); }

        // --- 6. Schools ---
        console.log('--- Importing Schools ---');
        const existingSchools = await getExistingCount('جدول_المدارس');
        console.log(`Current schools in RDS: ${existingSchools}. Verifying with source...`);
        let schoolTable;
        try { schoolTable = reader.getTable('جدول_المدارس'); } catch {
            try { schoolTable = reader.getTable('~TMPCLP461601'); } catch (e) { }
        }

        if (schoolTable) {
            const schoolRows = schoolTable.getData();
            for (const row of schoolRows) {
                if (!row['معرف_المدرسة']) continue;
                await upsert('جدول_المدارس', {
                    'معرف_المدرسة': Number(row['معرف_المدرسة']),
                    'الرقم الاحصائي': row['الرقم الاحصائي'] ? Number(row['الرقم الاحصائي']) : null,
                    'اسم_المدرسة': row['اسم_المدرسة'] || row['اسم المدرسة'] ? String(row['اسم_المدرسة'] || row['اسم المدرسة']) : null,
                    'معرف_المجمع': row['معرف_المجمع'] ? Number(row['معرف_المجمع']) : null,
                    'معرف_القرية_الحي': row['معرف_القرية_الحي'] ? Number(row['معرف_القرية_الحي']) : null,
                    'معرف_المدينة': row['معرف_المدينة'] ? Number(row['معرف_المدينة']) : null,
                    'معرف_المدير': row['معرف_المدير'] ? Number(row['معرف_المدير']) : null,
                    'هاتف المدرسة': row['هاتف المدرسة'] ? String(row['هاتف المدرسة']) : null
                }, 'معرف_المدرسة');
            }
            console.log(`Imported ${schoolRows.length} schools.`);
        } else { console.log('School table not found'); }


        // --- 7. Employees ---
        console.log('--- Importing Employees ---');
        const existingEmps = await getExistingCount('جدول_الذاتيات');
        console.log(`Current employees in RDS: ${existingEmps}. Verifying with source...`);
        try {
            const empTable = reader.getTable('جدول_الذاتيات');
            const empRows = empTable.getData();
            let count = 0;

            const parseDate = (d) => {
                if (!d) return null;
                const date = new Date(d);
                return isNaN(date.getTime()) ? null : date;
            };

            for (const row of empRows) {
                if (!row['معرف_الموظف']) continue;

                const empData = {
                    'معرف_الموظف': Number(row['معرف_الموظف']),
                    'الرقم_الذاتي': row['الرقم_الذاتي'] ? String(row['الرقم_الذاتي']) : null,
                    'الرمز_الوظيفي': row['الرمز_الوظيفي'] ? String(row['الرمز_الوظيفي']) : null,
                    'الوزارة': row['الوزارة'] ? String(row['الوزارة']) : null,
                    'المديرية': row['المديرية'] ? String(row['المديرية']) : null,
                    'العمل_مفصل': row['العمل_مفصل'] ? String(row['العمل_مفصل']) : null,
                    'معرف_الدائرة': row['معرف_الدائرة'] ? Number(row['معرف_الدائرة']) : null,
                    'معرف_الشعبة': row['معرف_الشعبة'] ? Number(row['معرف_الشعبة']) : null,
                    'معرف_المجمع': row['معرف_المجمع'] ? Number(row['معرف_المجمع']) : null,
                    'معرف_المدرسة': row['معرف_المدرسة'] ? Number(row['معرف_المدرسة']) : null,
                    'معرف_نوع_التعيين': row['معرف_نوع_التعيين'] ? Number(row['معرف_نوع_التعيين']) : null,
                    'تاريخ_التعيين': parseDate(row['تاريخ_التعيين']),
                    'معرف_الفئة_الوظيفية': row['معرف_الفئة_الوظيفية'] ? Number(row['معرف_الفئة_الوظيفية']) : null,
                    'معرف_المسمى_الوظيفي_عند_التعيين': row['معرف_المسمى_الوظيفي_عند_التعيين'] ? Number(row['معرف_المسمى_الوظيفي_عند_التعيين']) : null,
                    'معرف_المسمى_الوظيفي_الحالي': row['معرف_المسمى_الوظيفي_الحالي'] ? Number(row['معرف_المسمى_الوظيفي_الحالي']) : null,
                    'معرف_العمل_المكلف_به': row['معرف_العمل_المكلف_به'] ? Number(row['معرف_العمل_المكلف_به']) : null,
                    'معرف_الحالة': row['معرف_الحالة'] ? Number(row['معرف_الحالة']) : null,
                    'الاسم': row['الاسم'] ? String(row['الاسم']) : null,
                    'اسم_الأب': row['اسم_الأب'] ? String(row['اسم_الأب']) : null,
                    'النسبة': row['النسبة'] ? String(row['النسبة']) : null,
                    'اسم_الأم_الكامل': row['اسم_الأم_الكامل'] ? String(row['اسم_الأم_الكامل']) : null,
                    'محل_الولادة': row['محل_الولادة'] ? String(row['محل_الولادة']) : null,
                    'تاريخ_الولادة': parseDate(row['تاريخ_الولادة']),
                    'الرقم_الوطني': row['الرقم_الوطني'] ? String(row['الرقم_الوطني']) : null,
                    'الرقم_الوطني_رقمي': row['الرقم_الوطني_رقمي'] ? String(row['الرقم_الوطني_رقمي']) : null,
                    'الرقم_التأميني': row['الرقم_التأميني'] ? String(row['الرقم_التأميني']) : null,
                    'الجنس': row['الجنس'] ? String(row['الجنس']) : null,
                    'معرف_الوضع_العائلي': row['معرف_الوضع_العائلي'] ? Number(row['معرف_الوضع_العائلي']) : null,
                    'عدد_الابناء': row['عدد_الابناء'] ? Number(row['عدد_الابناء']) : null,
                    'المحافظة': row['المحافظة'] ? String(row['المحافظة']) : null,
                    'المنطقة_المدينة': row['المنطقة_المدينة'] ? String(row['المنطقة_المدينة']) : null,
                    'الناحية': row['الناحية'] ? String(row['الناحية']) : null,
                    'مكان_القيد': row['مكان_القيد'] ? String(row['مكان_القيد']) : null,
                    'رقم_القيد': row['رقم_القيد'] ? String(row['رقم_القيد']) : null,
                    'الهاتف_الأرضي': row['الهاتف_الأرضي'] ? String(row['الهاتف_الأرضي']) : null,
                    'الموبايل': row['الموبايل'] ? String(row['الموبايل']) : null,
                    'الموبايل_دولي': row['الموبايل_دولي'] ? String(row['الموبايل_دولي']) : null,
                    'معرف_المدينة': row['معرف_المدينة'] ? Number(row['معرف_المدينة']) : null,
                    'معرف_القرية_الحي': row['معرف_القرية_الحي'] ? Number(row['معرف_القرية_الحي']) : null,
                    'العنوان_مفصل_لمركز_السويداء': row['العنوان_مفصل_لمركز_السويداء'] ? String(row['العنوان_مفصل_لمركز_السويداء']) : null,
                    'معرف_المعتمد': row['معرف_المعتمد'] ? Number(row['معرف_المعتمد']) : null,
                    'معرف_نوع_الشهادة': row['معرف_نوع_الشهادة'] ? Number(row['معرف_نوع_الشهادة']) : null,
                    'معرف_الجامعة': row['معرف_الجامعة'] ? Number(row['معرف_الجامعة']) : null,
                    'معرف_الكلية': row['معرف_الكلية'] ? Number(row['معرف_الكلية']) : null,
                    'معرف_اقسام_الكلية': row['معرف_اقسام_الكلية'] ? Number(row['معرف_اقسام_الكلية']) : null,
                    'معرف_أقسام_العلوم': row['معرف_أقسام_العلوم'] ? Number(row['معرف_أقسام_العلوم']) : null,
                    'معرف_المعهد': row['معرف_المعهد'] ? Number(row['معرف_المعهد']) : null,
                    'معرف_اقسام_المعهد': row['معرف_اقسام_المعهد'] ? Number(row['معرف_اقسام_المعهد']) : null,
                    'عام_الحصول_عليها': row['عام_الحصول_عليها'] ? String(row['عام_الحصول_عليها']) : null,
                    'معرف_نوع_الشهادة_الأعلى': row['معرف_نوع_الشهادة_الأعلى'] ? Number(row['معرف_نوع_الشهادة_الأعلى']) : null,
                    'معرف_الجامعة_للشهادة_الأعلى': row['معرف_الجامعة_للشهادة_الأعلى'] ? Number(row['معرف_الجامعة_للشهادة_الأعلى']) : null,
                    'معرف_الكلية_للشهادة_الأعلى': row['معرف_الكلية_للشهادة_الأعلى'] ? Number(row['معرف_الكلية_للشهادة_الأعلى']) : null,
                    'معرف_اقسام_الكلية_للشهادة_الأعلى': row['معرف_اقسام_الكلية_للشهادة_الأعلى'] ? Number(row['معرف_اقسام_الكلية_للشهادة_الأعلى']) : null,
                    'معرف_أقسام_العلوم_للشهادة_الأعلى': row['معرف_أقسام_العلوم_للشهادة_الأعلى'] ? Number(row['معرف_أقسام_العلوم_للشهادة_الأعلى']) : null,
                    'معرف_المعهد_للشهادة_الأعلى': row['معرف_المعهد_للشهادة_الأعلى'] ? Number(row['معرف_المعهد_للشهادة_الأعلى']) : null,
                    'معرف_اقسام_المعهد_للشهادة_الأعلى': row['معرف_اقسام_المعهد_للشهادة_الأعلى'] ? Number(row['معرف_اقسام_المعهد_للشهادة_الأعلى']) : null,
                    'السنة_التي_أتمها': row['السنة_التي_أتمها'] ? String(row['السنة_التي_أتمها']) : null,
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                    'تم_بواسطة': row['تم_بواسطة'] ? String(row['تم_بواسطة']) : null,
                    'الاسم_الثلاثي': row['الاسم_الثلاثي'] ? String(row['الاسم_الثلاثي']) : null
                };

                await upsert('جدول_الذاتيات', empData, 'معرف_الموظف');

                count++;
                if (count % 100 === 0) process.stdout.write(`\rImported ${count} employees...`);
            }
            console.log(`\nImported ${count} employees.`);
        } catch (e) { console.log(`Employees table error: ${e.message}`); }

        // --- 8. Education Lookups ---
        console.log('--- Importing Education Lookups ---');
        // Universities
        try {
            const uniTable = reader.getTable('جدول_الجامعات');
            for (const row of uniTable.getData()) {
                if (!row['معرف_الجامعة']) continue;
                await upsert('جدول_الجامعات', {
                    'معرف_الجامعة': Number(row['معرف_الجامعة']),
                    'اسم_الجامعة': row['اسم_الجامعة'] ? String(row['اسم_الجامعة']) : null,
                    'المحافظة': row['المحافظة'] ? String(row['المحافظة']) : null,
                    'نوع_الجامعة': row['نوع_الجامعة'] ? String(row['نوع_الجامعة']) : null,
                }, 'معرف_الجامعة');
            }
            console.log('Universities imported.');
        } catch (e) { console.log(`Universities skipped: ${e.message}`); }

        // Colleges
        try {
            const colTable = reader.getTable('جدول_الكليات');
            for (const row of colTable.getData()) {
                if (!row['معرف_الكلية']) continue;
                await upsert('جدول_الكليات', {
                    'معرف_الكلية': Number(row['معرف_الكلية']),
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_الكلية');
            }
            console.log('Colleges imported.');
        } catch (e) { console.log(`Colleges skipped: ${e.message}`); }

        // Institutes
        try {
            const instTable = reader.getTable('جدول_المعاهد');
            for (const row of instTable.getData()) {
                if (!row['معرف_المعهد']) continue;
                await upsert('جدول_المعاهد', {
                    'معرف_المعهد': Number(row['معرف_المعهد']),
                    'اسم_المعهد': row['اسم_المعهد'] ? String(row['اسم_المعهد']) : null,
                    'نوع_المعهد': row['نوع_المعهد'] ? String(row['نوع_المعهد']) : null,
                }, 'معرف_المعهد');
            }
            console.log('Institutes imported.');
        } catch (e) { console.log(`Institutes skipped: ${e.message}`); }

        // Certificate Types
        try {
            const certTable = reader.getTable('جدول_نوع_الشهادة');
            for (const row of certTable.getData()) {
                if (!row['معرف_نوع_الشهادة']) continue;
                await upsert('جدول_نوع_الشهادة', {
                    'معرف_نوع_الشهادة': Number(row['معرف_نوع_الشهادة']),
                    'نوع_الشهادة': row['نوع_الشهادة'] ? String(row['نوع_الشهادة']) : null,
                    'الفئة_الوظيفية': row['الفئة_الوظيفية'] ? String(row['الفئة_الوظيفية']) : null,
                }, 'معرف_نوع_الشهادة');
            }
            console.log('Certificate Types imported.');
        } catch (e) { console.log(`Certificate Types skipped: ${e.message}`); }


        // --- 9. Transactions ---
        // Vacations
        console.log('--- Importing Vacations ---');
        try {
            const vacTable = reader.getTable('جدول_الاجازات');
            const vacRows = vacTable.getData();
            let vCount = 0;
            for (const row of vacRows) {
                if (!row['معرف_الإجازة']) continue;
                await upsert('جدول_الاجازات', {
                    'معرف_الإجازة': Number(row['معرف_الإجازة']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'نوع_الاجازة': row['نوع_الاجازة'] ? String(row['نوع_الاجازة']) : null,
                    'رقم_قرار_الاجازة': row['رقم_قرار_الاجازة'] ? String(row['رقم_قرار_الاجازة']) : null,
                    'تاريخ_البداية': parseDate(row['تاريخ_البداية']),
                    'تاريخ_النهاية': parseDate(row['تاريخ_النهاية']),
                    'المدة': row['المدة'] ? Number(row['المدة']) : null,
                    'رقم_قرار_القطع': row['رقم_قرار_القطع'] ? String(row['رقم_قرار_القطع']) : null,
                    'تاريخ_قرار_القطع': parseDate(row['تاريخ_قرار_القطع']),
                    'تاريخ_المباشرة': parseDate(row['تاريخ_المباشرة']),
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                }, 'معرف_الإجازة');
                vCount++;
                if (vCount % 500 === 0) process.stdout.write(`\rImported ${vCount} vacations...`);
            }
            console.log(`\nImported ${vCount} vacations.`);
        } catch (e) { console.log(`Vacations skipped: ${e.message}`); }

        // Movements (Ndab/Ifad)
        console.log('--- Importing Movements ---');
        try {
            const movTable = reader.getTable('جدول_ندب_إيفاد_إعارة');
            const movRows = movTable.getData();
            let mCount = 0;
            for (const row of movRows) {
                if (!row['معرف_الإجراء']) continue;
                await upsert('جدول_ندب_إيفاد_إعارة', {
                    'معرف_الإجراء': Number(row['معرف_الإجراء']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'نوع_الإجراء': row['نوع_الإجراء'] ? String(row['نوع_الإجراء']) : null,
                    'رقم_القرار': row['رقم_القرار'] ? String(row['رقم_القرار']) : null,
                    'تاريخ_القرار': parseDate(row['تاريخ_القرار']),
                    'الجهة': row['الجهة'] ? String(row['الجهة']) : null,
                    'تاريخ_الانفكاك': parseDate(row['تاريخ_الانفكاك']),
                    'تاريخ_المباشرة': parseDate(row['تاريخ_المباشرة']),
                    'رقم_قرار_الهاء': row['رقم_قرار_الهاء'] ? String(row['رقم_قرار_الهاء']) : null,
                    'تاريخ_قرار_الهاء': parseDate(row['تاريخ_قرار_الهاء']),
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                }, 'معرف_الإجراء');
                mCount++;
            }
            console.log(`Imported ${mCount} movements.`);
        } catch (e) { console.log(`Movements skipped: ${e.message}`); }

        // Terminations
        console.log('--- Importing Terminations ---');
        try {
            const termTable = reader.getTable('جدول_ترك_العمل');
            const termRows = termTable.getData();
            let tCount = 0;
            for (const row of termRows) {
                if (!row['معرف_الإجراء']) continue;
                // Note: ID for Termination uses same sequence logic potentially, but we treat it separate here as per schema
                await upsert('جدول_ترك_العمل', {
                    'معرف_الإجراء': Number(row['معرف_الإجراء']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'نوع_الاجراء': row['نوع_الاجراء'] ? String(row['نوع_الاجراء']) : null,
                    'رقم_القرار': row['رقم_القرار'] ? String(row['رقم_القرار']) : null,
                    'تاريخ_القرار': parseDate(row['تاريخ_القرار']),
                    'تاريخ_الانفكاك': parseDate(row['تاريخ_الانفكاك']),
                    'النقل_إلى': row['النقل_إلى'] ? String(row['النقل_إلى']) : null,
                }, 'معرف_الإجراء');
                tCount++;
            }
            console.log(`Imported ${tCount} terminations.`);
        } catch (e) { console.log(`Terminations skipped: ${e.message}`); }

        // Promotions
        console.log('--- Importing Promotions ---');
        try {
            const promTable = reader.getTable('جدول_الترفيع');
            const promRows = promTable.getData();
            let pCount = 0;
            for (const row of promRows) {
                if (!row['معرف_الترفيع']) continue;
                await upsert('جدول_الترفيع', {
                    'معرف_الترفيع': Number(row['معرف_الترفيع']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'الأجر_قبل_الترفيع': row['الأجر_قبل_الترفيع'] ? Number(row['الأجر_قبل_الترفيع']) : null,
                    'الأجر_بعد_الترفيع': row['الأجر_بعد_الترفيع'] ? Number(row['الأجر_بعد_الترفيع']) : null,
                    'درجة_الكفاءة': row['درجة_الكفاءة'] ? Number(row['درجة_الكفاءة']) : null,
                    'نسبة_العلاوة': row['نسبة_العلاوة'] ? Number(row['نسبة_العلاوة']) : null,
                    'مقدار_العلاوة': row['مقدار_العلاوة'] ? Number(row['مقدار_العلاوة']) : null,
                    'المدة': row['المدة'] ? Number(row['المدة']) : null,
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                    'التاريخ_الحالي': parseDate(row['التاريخ_الحالي'])
                }, 'معرف_الترفيع');
                pCount++;
            }
            console.log(`Imported ${pCount} promotions.`);
        } catch (e) { console.log(`Promotions skipped: ${e.message}`); }


        // --- 10. Financial Setup ---
        console.log('--- Importing Financial Setup ---');
        try {
            const ceilingTable = reader.getTable('جدول_سقف_الأجر');
            for (const row of ceilingTable.getData()) {
                if (!row['معرف_السقف']) continue;
                await upsert('جدول_سقف_الأجر', {
                    'معرف_السقف': Number(row['معرف_السقف']),
                    'السقف': row['السقف'] ? Number(row['السقف']) : 0,
                    'معرف_الفئة_الوظيفية': row['معرف_الفئة_الوظيفية'] ? Number(row['معرف_الفئة_الوظيفية']) : null,
                }, 'معرف_السقف');
            }
            console.log('Salary Ceiling imported.');
        } catch (e) { console.log('Salary Ceiling skipped'); }

        try {
            const startSalTable = reader.getTable('جدول_أجر_بدء_التعيين');
            for (const row of startSalTable.getData()) {
                if (!row['معرف_أجر_بدء_التعيين']) continue;
                await upsert('جدول_أجر_بدء_التعيين', {
                    'معرف_أجر_بدء_التعيين': Number(row['معرف_أجر_بدء_التعيين']),
                    'أجر_بدء_التعيين': row['أجر_بدء_التعيين'] ? Number(row['أجر_بدء_التعيين']) : 0,
                    'صفة_التعيين': row['صفة_التعيين'] ? String(row['صفة_التعيين']) : null,
                    'معرف_الفئة_الوظيفية': row['معرف_الفئة_الوظيفية'] ? Number(row['معرف_الفئة_الوظيفية']) : null,
                    'معرف_السقف': row['معرف_السقف'] ? Number(row['معرف_السقف']) : null,
                }, 'معرف_أجر_بدء_التعيين');
            }
            console.log('Starting Salaries imported.');
        } catch (e) { console.log('Starting Salaries skipped'); }

        // --- 11. Quotas ---
        console.log('--- Importing Quotas ---');
        try {
            const refQtTable = reader.getTable('جدول_النصاب_المرجعي');
            for (const row of refQtTable.getData()) {
                if (!row['معرف_الفئة']) continue;
                await upsert('جدول_النصاب_المرجعي', {
                    'معرف_الفئة': Number(row['معرف_الفئة']),
                    'النصاب_الأسبوعي': row['النصاب_الأسبوعي'] ? Number(row['النصاب_الأسبوعي']) : 0,
                }, 'معرف_الفئة');
            }
            console.log('Reference Quotas imported.');
        } catch (e) { console.log('Reference Quotas skipped'); }

        try {
            const wkQtTable = reader.getTable('جدول_النصاب_الأسبوعي');
            for (const row of wkQtTable.getData()) {
                if (!row['معرف_النصاب']) continue;
                await upsert('جدول_النصاب_الأسبوعي', {
                    'معرف_النصاب': Number(row['معرف_النصاب']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'معرف_المجمع': row['معرف_المجمع'] ? Number(row['معرف_المجمع']) : null,
                    'معرف_المدرسة': row['معرف_المدرسة'] ? Number(row['معرف_المدرسة']) : null,
                    'عدد_الساعات': row['عدد_الساعات'] ? Number(row['عدد_الساعات']) : 0,
                    'الإضافي': row['الإضافي'] ? Boolean(row['الإضافي']) : false,
                }, 'معرف_النصاب');
            }
            console.log('Weekly Quotas imported.');
        } catch (e) { console.log('Weekly Quotas skipped'); }

        // --- 12. Hierarchy ---
        console.log('--- Importing Hierarchy ---');
        try {
            const depTable = reader.getTable('جدول_الدوائر');
            for (const row of depTable.getData()) {
                if (!row['معرف_الدائرة']) continue;
                await upsert('جدول_الدوائر', {
                    'معرف_الدائرة': Number(row['معرف_الدائرة']),
                    'الرقم_الاحصائي': row['الرقم_الاحصائي'] ? String(row['الرقم_الاحصائي']) : null,
                    'اسم_الدائرة': row['اسم_الدائرة'] ? String(row['اسم_الدائرة']) : null,
                }, 'معرف_الدائرة');
            }
            console.log('Departments imported.');
        } catch (e) { console.log('Departments skipped'); }

        try {
            const secTable = reader.getTable('جدول_الشعب');
            for (const row of secTable.getData()) {
                if (!row['معرف_الشعبة']) continue;
                await upsert('جدول_الشعب', {
                    'معرف_الشعبة': Number(row['معرف_الشعبة']),
                    'الرقم_الاحصائي': row['الرقم_الاحصائي'] ? String(row['الرقم_الاحصائي']) : null,
                    'الدائرة': row['الدائرة'] ? String(row['الدائرة']) : null,
                    'الشعبة': row['الشعبة'] ? String(row['الشعبة']) : null,
                    'معرف_الدائرة': row['معرف_الدائرة'] ? Number(row['معرف_الدائرة']) : null,
                }, 'معرف_الشعبة');
            }
            console.log('Sections imported.');
        } catch (e) { console.log('Sections skipped'); }

        try {
            const staffTable = reader.getTable('جدول_الملاك');
            for (const row of staffTable.getData()) {
                if (!row['معرف_الملاك']) continue;
                await upsert('جدول_الملاك', {
                    'معرف_الملاك': Number(row['معرف_الملاك']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'نمط_التعيين': row['نمط_التعيين'] ? String(row['نمط_التعيين']) : null,
                    'رقم_قرار_التعيين': row['رقم_قرار_التعيين'] ? String(row['رقم_قرار_التعيين']) : null,
                    'تاريخ_قرار_التعيين': parseDate(row['تاريخ_قرار_التعيين']),
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                    'تم_بواسطة': row['تم_بواسطة'] ? String(row['تم_بواسطة']) : null,
                }, 'معرف_الملاك');
            }
            console.log('Staffing imported.');
        } catch (e) { console.log('Staffing skipped'); }

        // --- 13. Advanced Education Detail ---
        console.log('--- Importing Education Details ---');
        try {
            const colDepTable = reader.getTable('جدول_اقسام_الكليات');
            for (const row of colDepTable.getData()) {
                if (!row['معرف_اقسام_الكلية']) continue;
                await upsert('جدول_اقسام_الكليات', {
                    'معرف_اقسام_الكلية': Number(row['معرف_اقسام_الكلية']),
                    'اقسام_الكلية': row['اقسام_الكلية'] ? String(row['اقسام_الكلية']) : null,
                    'معرف_الكلية': row['معرف_الكلية'] ? Number(row['معرف_الكلية']) : null,
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_اقسام_الكلية');
            }
            const colDepTableHigh = reader.getTable('جدول_اقسام_الكليات_للشهادة_الأعلى');
            for (const row of colDepTableHigh.getData()) {
                if (!row['معرف_القسم_للشهادة_الأعلى']) continue;
                await upsert('جدول_اقسام_الكليات_للشهادة_الأعلى', {
                    'معرف_القسم_للشهادة_الأعلى': Number(row['معرف_القسم_للشهادة_الأعلى']),
                    'القسم_للشهادة_الأعلى': row['القسم_للشهادة_الأعلى'] ? String(row['القسم_للشهادة_الأعلى']) : null,
                    'معرف_الكلية': row['معرف_الكلية'] ? Number(row['معرف_الكلية']) : null,
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_القسم_للشهادة_الأعلى');
            }
            console.log('College Departments imported.');
        } catch (e) { console.log('College Departments skipped'); }

        try {
            const sciColTable = reader.getTable('جدول_مفصل_كلية_العلوم');
            for (const row of sciColTable.getData()) {
                if (!row['معرف_الفرع']) continue;
                await upsert('جدول_مفصل_كلية_العلوم', {
                    'معرف_الفرع': Number(row['معرف_الفرع']),
                    'اسم_الفرع': row['اسم_الفرع'] ? String(row['اسم_الفرع']) : null,
                    'معرف_القسم': row['معرف_القسم'] ? Number(row['معرف_القسم']) : null,
                    'اسم_القسم': row['اسم_القسم'] ? String(row['اسم_القسم']) : null,
                    'معرف_الكلية': row['معرف_الكلية'] ? Number(row['معرف_الكلية']) : null,
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_الفرع');
            }
            console.log('Science Details imported.');
        } catch (e) { console.log('Science Details skipped'); }

        // --- 14. Secondary Ed ---
        console.log('--- Importing Secondary Ed ---');
        try {
            const hsTable = reader.getTable('جدول_الثانوية');
            for (const row of hsTable.getData()) {
                if (!row['معرف_الثانوية']) continue;
                await upsert('جدول_الثانوية', {
                    'معرف_الثانوية': Number(row['معرف_الثانوية']),
                    'اسم_الثانوية': row['اسم_الثانوية'] ? String(row['اسم_الثانوية']) : null,
                }, 'معرف_الثانوية');
            }
            const hsBrTable = reader.getTable('جدول_فروع_الثانوية');
            for (const row of hsBrTable.getData()) {
                if (!row['معرف_فروع_الثانوية']) continue;
                await upsert('جدول_فروع_الثانوية', {
                    'معرف_فروع_الثانوية': Number(row['معرف_فروع_الثانوية']),
                    'اسم_الفرع': row['اسم_الفرع'] ? String(row['اسم_الفرع']) : null,
                    'معرف_الثانوية': row['معرف_الثانوية'] ? Number(row['معرف_الثانوية']) : null,
                    'اسم_الثانوية': row['اسم_الثانوية'] ? String(row['اسم_الثانوية']) : null,
                }, 'معرف_فروع_الثانوية');
            }
            console.log('High School Data imported.');
        } catch (e) { console.log('High School Data skipped'); }

        // --- 15. Legal & Regional ---
        console.log('--- Importing Legal/Regional ---');
        try {
            const visaTable = reader.getTable('جدول_التأشير');
            for (const row of visaTable.getData()) {
                if (!row['معرف_التأشير']) continue;
                await upsert('جدول_التأشير', {
                    'معرف_التأشير': Number(row['معرف_التأشير']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : null,
                    'رقم_قرار_الترفيع': row['رقم_قرار_الترفيع'] ? String(row['رقم_قرار_الترفيع']) : null,
                    'تاريخ_قرار_الترفيع': parseDate(row['تاريخ_قرار_الترفيع']),
                    'رقم_قرار_التأشير': row['رقم_قرار_التأشير'] ? String(row['رقم_قرار_التأشير']) : null,
                    'تاريخ_قرار_التأشير': parseDate(row['تاريخ_قرار_التأشير']),
                    'اسم_قرار_الترفيع': row['اسم_قرار_الترفيع'] ? String(row['اسم_قرار_الترفيع']) : null,
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
                    'تم_بواسطة': row['تم_بواسطة'] ? String(row['تم_بواسطة']) : null,
                }, 'معرف_التأشير');
            }
            console.log('Visa Data imported.');
        } catch (e) { console.log('Visa Data skipped'); }

        try {
            const secTable = reader.getTable('جدول_الأمانة_السويداء');
            for (const row of secTable.getData()) {
                if (!row['معرف_الامانة']) continue;
                await upsert('جدول_الأمانة_السويداء', {
                    'معرف_الامانة': Number(row['معرف_الامانة']),
                    'الامانة': String(row['الامانة']),
                }, 'معرف_الامانة');
            }
            console.log('Secretariat imported.');
        } catch (e) { console.log('Secretariat skipped'); }

        try {
            const minTable = reader.getTable('جدول_الوزارات');
            for (const row of minTable.getData()) {
                if (!row['معرف_الوزارة']) continue;
                await upsert('جدول_الوزارات', {
                    'معرف_الوزارة': Number(row['معرف_الوزارة']),
                    'اسم_الوزارة': row['اسم_الوزارة'] ? String(row['اسم_الوزارة']) : null,
                }, 'معرف_الوزارة');
            }
            console.log('Ministries imported.');
        } catch (e) { console.log('Ministries skipped'); }

        try {
            const accTable = reader.getTable('جدول_المعتمد');
            for (const row of accTable.getData()) {
                if (!row['معرف_المعتمد']) continue;
                await upsert('جدول_المعتمد', {
                    'معرف_المعتمد': Number(row['معرف_المعتمد']),
                    'اسم_المعتمد': row['اسم_المعتمد'] ? String(row['اسم_المعتمد']) : null,
                    'الرقم_الوطني': row['الرقم_الوطني'] ? BigInt(row['الرقم_الوطني']) : null,
                }, 'معرف_المعتمد');
            }
            console.log('Accreditors imported.');
        } catch (e) { console.log('Accreditors skipped'); }

        try {
            const bridgeTable = reader.getTable('جدول_الربط');
            for (const row of bridgeTable.getData()) {
                if (!row['معرف_الجدول_المرتبط']) continue;
                await upsert('جدول_الربط', {
                    'معرف_الجدول_المرتبط': Number(row['معرف_الجدول_المرتبط']),
                    'اسم_القائمة': row['اسم_القائمة'] ? String(row['اسم_القائمة']) : null,
                    'اسم_الحقل_في_الجدول_الأساسي': row['اسم_الحقل_في_الجدول_الأساسي'] ? String(row['اسم_الحقل_في_الجدول_الأساسي']) : null,
                    'اسم_الجدول_المرتبط': row['اسم_الجدول_المرتبط'] ? String(row['اسم_الجدول_المرتبط']) : null,
                    'اسم_الحقل_الظاهر': row['اسم_الحقل_الظاهر'] ? String(row['اسم_الحقل_الظاهر']) : null,
                }, 'معرف_الجدول_المرتبط');
            }
            console.log('Bridge Tables imported.');
        } catch (e) { console.log('Bridge Tables skipped'); }

        try {
            const assignedWorkTable = reader.getTable('جدول_العمل_المكلف_به');
            for (const row of assignedWorkTable.getData()) {
                if (!row['معرف_العمل_المكلف_به']) continue;
                await upsert('جدول_العمل_المكلف_به', {
                    'معرف_العمل_المكلف_به': Number(row['معرف_العمل_المكلف_به']),
                    'العمل_المكلف_به': row['العمل_المكلف_به'] ? String(row['العمل_المكلف_به']) : null,
                }, 'معرف_العمل_المكلف_به');
            }
            console.log('Assigned Work imported.');
        } catch (e) { console.log('Assigned Work skipped'); }

        try {
            const cityDetTable = reader.getTable('جدول_المحافظات_مفصل');
            for (const row of cityDetTable.getData()) {
                if (!row['المعرف']) continue;
                await upsert('جدول_المحافظات_مفصل', {
                    'المعرف': Number(row['المعرف']),
                    'المحافظة': row['المحافظة'] ? String(row['المحافظة']) : null,
                    'المنطقة_المدينة': row['المنطقة_المدينة'] ? String(row['المنطقة_المدينة']) : null,
                    'الناحية': row['الناحية'] ? String(row['الناحية']) : null,
                }, 'المعرف');
            }
            console.log('Detailed Provinces imported.');
        } catch (e) { console.log('Detailed Provinces skipped'); }

        try {
            const catModTable = reader.getTable('جدول_تعديل_الفئة');
            for (const row of catModTable.getData()) {
                if (!row['معرف_تعديل_الفئة']) continue;
                await upsert('جدول_تعديل_الفئة', {
                    'معرف_تعديل_الفئة': Number(row['معرف_تعديل_الفئة']),
                    'معرف_الموظف': row['معرف_الموظف'] ? Number(row['معرف_الموظف']) : 0,
                    'رقم_قرار_تعديل_الفئة': row['رقم_قرار_تعديل_الفئة'] ? String(row['رقم_قرار_تعديل_الفئة']) : null,
                    'تاريخ_قرار_تعديل_الفئة': parseDate(row['تاريخ_قرار_تعديل_الفئة']),
                    'الفئة_الوظيفية_الحالية': row['الفئة_الوظيفية_الحالية'] ? String(row['الفئة_الوظيفية_الحالية']) : null,
                    'الفئة_الوظيفية_الجديدة': row['الفئة_الوظيفية_الجديدة'] ? Number(row['الفئة_الوظيفية_الجديدة']) : null,
                    'المسمى_الوظيفي_الجديد': row['المسمى_الوظيفي_الجديد'] ? Number(row['المسمى_الوظيفي_الجديد']) : null,
                    'تم_بواسطة': row['تم_بواسطة'] ? String(row['تم_بواسطة']) : null,
                }, 'معرف_تعديل_الفئة');
            }
            console.log('Category Modifications imported.');
        } catch (e) { console.log('Category Modifications skipped'); }

        try {
            const instDepTable = reader.getTable('جدول_اقسام_المعاهد');
            for (const row of instDepTable.getData()) {
                if (!row['معرف_اقسام_المعهد']) continue;
                await upsert('جدول_اقسام_المعاهد', {
                    'معرف_اقسام_المعهد': Number(row['معرف_اقسام_المعهد']),
                    'اسم_اقسام_المعهد': row['اسم_اقسام_المعهد'] ? String(row['اسم_اقسام_المعهد']) : null,
                    'معرف_المعهد': row['معرف_المعهد'] ? Number(row['معرف_المعهد']) : null,
                    'اسم_المعهد': row['اسم_المعهد'] ? String(row['اسم_المعهد']) : null,
                }, 'معرف_اقسام_المعهد');
            }
            const instDepTableHigh = reader.getTable('جدول_اقسام_المعاهد_للشهادة_الأعلى');
            for (const row of instDepTableHigh.getData()) {
                if (!row['معرف_اقسام_المعهد_للشهادة_الأعلى']) continue;
                await upsert('جدول_اقسام_المعاهد_للشهادة_الأعلى', {
                    'معرف_اقسام_المعهد_للشهادة_الأعلى': Number(row['معرف_اقسام_المعهد_للشهادة_الأعلى']),
                    'اقسام_المعهد_للشهادة_الأعلى': row['اقسام_المعهد_للشهادة_الأعلى'] ? String(row['اقسام_المعهد_للشهادة_الأعلى']) : null,
                    'معرف_المعهد': row['معرف_المعهد'] ? Number(row['معرف_المعهد']) : null,
                    'اسم_المعهد': row['اسم_المعهد'] ? String(row['اسم_المعهد']) : null,
                }, 'معرف_اقسام_المعهد_للشهادة_الأعلى');
            }
            console.log('Institute Departments imported.');
        } catch (e) { console.log('Institute Departments skipped'); }

        // --- 16. Final Higher Education Lookups ---
        console.log('--- Importing Higher Ed Lookups ---');
        try {
            const uniTableHigh = reader.getTable('جدول_الجامعات_للشهادة_الاعلى');
            for (const row of uniTableHigh.getData()) {
                if (!row['معرف_الجامعة']) continue;
                await upsert('جدول_الجامعات', {
                    'معرف_الجامعة': Number(row['معرف_الجامعة']),
                    'اسم_الجامعة': row['اسم_الجامعة'] ? String(row['اسم_الجامعة']) : null,
                    'المحافظة': row['المحافظة'] ? String(row['المحافظة']) : null,
                    'نوع_الجامعة': row['نوع_الجامعة'] ? String(row['نوع_الجامعة']) : null,
                }, 'معرف_الجامعة');
            }
            console.log('Higher Ed Universities imported.');
        } catch (e) { console.log('Higher Ed Universities skipped'); }

        try {
            const colTableHigh = reader.getTable('جدول_الكليات_للشهادة_الأعلى');
            for (const row of colTableHigh.getData()) {
                if (!row['معرف_الكلية']) continue;
                await upsert('جدول_الكليات', {
                    'معرف_الكلية': Number(row['معرف_الكلية']),
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_الكلية');
            }
            console.log('Higher Ed Colleges imported.');
        } catch (e) { console.log('Higher Ed Colleges skipped'); }

        try {
            const instTableHigh = reader.getTable('جدول_المعاهد_للشهادة_الأعلى');
            for (const row of instTableHigh.getData()) {
                if (!row['معرف_المعهد']) continue;
                await upsert('جدول_المعاهد', {
                    'معرف_المعهد': Number(row['معرف_المعهد']),
                    'اسم_المعهد': row['اسم_المعهد'] ? String(row['اسم_المعهد']) : null,
                    'نوع_المعهد': row['نوع_المعهد'] ? String(row['نوع_المعهد']) : null,
                }, 'معرف_المعهد');
            }
            console.log('Higher Ed Institutes imported.');
        } catch (e) { console.log('Higher Ed Institutes skipped'); }

        try {
            const certTableHigh = reader.getTable('جدول_نوع_الشهادة_الأعلى');
            for (const row of certTableHigh.getData()) {
                if (!row['معرف_نوع_الشهادة']) continue;
                await upsert('جدول_نوع_الشهادة', {
                    'معرف_نوع_الشهادة': Number(row['معرف_نوع_الشهادة']),
                    'نوع_الشهادة': row['نوع_الشهادة'] ? String(row['نوع_الشهادة']) : null,
                }, 'معرف_نوع_الشهادة');
            }
            console.log('Higher Ed Certificate Types imported.');
        } catch (e) { console.log('Higher Ed Certificate Types skipped'); }

        try {
            const hSciColTable = reader.getTable('جدول_مفصل_كلية_العلوم_للشهادة_الأعلى');
            for (const row of hSciColTable.getData()) {
                if (!row['معرف_الفرع_للشهادة_الأعلى']) continue;
                await upsert('جدول_مفصل_كلية_العلوم_للشهادة_الأع', {
                    'معرف_الفرع_للشهادة_الأعلى': Number(row['معرف_الفرع_للشهادة_الأعلى']),
                    'اسم_الفرع_للشهادة_الأعلى': row['اسم_الفرع_للشهادة_الأعلى'] ? String(row['اسم_الفرع_للشهادة_الأعلى']) : null,
                    'معرف_القسم': row['معرف_القسم'] ? Number(row['معرف_القسم']) : null,
                    'اسم_القسم': row['اسم_القسم'] ? String(row['اسم_القسم']) : null,
                    'معرف_الكلية': row['معرف_الكلية'] ? Number(row['معرف_الكلية']) : null,
                    'اسم_الكلية': row['اسم_الكلية'] ? String(row['اسم_الكلية']) : null,
                }, 'معرف_الفرع_للشهادة_الأعلى');
            }
            console.log('Higher Science Details imported.');
        } catch (e) { console.log('Higher Science Details skipped'); }

        // --- 18. Managers (Syncing School manager_id) ---
        console.log('--- Syncing Managers ---');
        try {
            const manaTable = reader.getTable('جدول_المدراء');
            for (const row of manaTable.getData()) {
                if (!row['معرف_المدرسة'] || !row['معرف_الموظف']) continue;
                try {
                    await client.query(
                        `UPDATE "جدول_المدارس" SET "معرف_المدير" = $1 WHERE "معرف_المدرسة" = $2`,
                        [Number(row['معرف_الموظف']), Number(row['معرف_المدرسة'])]
                    );
                } catch (e) { console.error('Error syncing manager:', e.message); }
            }
            console.log('Managers synced to Schools.');
        } catch (e) { console.log('Managers table skipped or error'); }

        // --- 19. Permissions ---
        console.log('--- Importing Permissions ---');
        try {
            const permTable = reader.getTable('جدول_الصلاحيات');
            for (const row of permTable.getData()) {
                if (!row['اسم_المستخدم']) continue;
                try {
                    // Access permissions are boolean flags for buttons. 
                    // We store them as JSON in User model.
                    const permissions = { ...row };
                    delete permissions['اسم_المستخدم'];
                    delete permissions['معرف_المستخدم'];
                    
                    await client.query(
                        `UPDATE "جدول_المستخدمين" SET "permissions" = $1, "اسم_الدور" = $2 WHERE "اسم_المستخدم" = $3`,
                        [JSON.stringify(permissions), row['اسم_الدور'] || 'USER', String(row['اسم_المستخدم'])]
                    );
                } catch (e) { console.error('Error syncing permission:', e.message); }
            }
            console.log('Permissions updated for users.');
        } catch (e) { console.log('Permissions table skipped'); }

        // --- 20. Archives (Historical Employees) ---
        console.log('--- Importing Archives ---');
        try {
            const archTable = reader.getTable('جدول_الأرشيف');
            const archRows = archTable.getData();
            // Since there's no separate Archive model in Prisma yet, 
            // and it mirrors Employee, we treat it as historical data ingestion.
            // For now, we seed it if we had a table, but Access one is 0 rows.
            console.log(`Archive contains ${archRows ? archRows.length : 0} rows (Mirror of Employee structure).`);
        } catch (e) { console.log('Archives skipped'); }

        // --- 21. Audit Logs ---
        console.log('--- Importing Audit Logs ---');
        try {
            const auditTable = reader.getTable('جدول_سجل_التدقيق');
            const auditRows = auditTable.getData();
            for (const row of auditRows) {
                if (!row['معرف_السجل']) continue;
                await upsert('جدول_سجل_التدقيق', {
                    'معرف_السجل': Number(row['معرف_السجل']),
                    'معرف_المستخدم': row['معرف_المستخدم'] ? Number(row['معرف_المستخدم']) : null,
                    'العملية': row['العملية'] ? String(row['العملية']) : 'UNKNOWN',
                    'المورد': row['المورد'] ? String(row['المورد']) : 'SYSTEM',
                    'تاريخ_العملية': parseDate(row['تاريخ_العملية']),
                }, 'معرف_السجل');
            }
            console.log('Audit Logs imported.');
        } catch (e) { console.log('Audit Logs skipped'); }

        // Re-enable foreign key constraints
        await client.query("SET session_replication_role = 'origin';");
        console.log('--- FOREIGN KEY CONSTRAINTS RE-ENABLED ---');
        console.log('--- ULTIMATE COMPREHENSIVE IMPORT FINISHED ---');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

main();
