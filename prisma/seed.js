const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

// Connection string
const connectionString = "postgresql://postgres:password@127.0.0.1:5432/moe_db?schema=public";

const client = new Client({
    connectionString: connectionString,
});

async function main() {
    // Use the local copy of the database
    const dbPath = path.join(__dirname, 'moe.accdb');
    console.log('Reading Access DB from:', dbPath);

    if (!fs.existsSync(dbPath)) {
        console.error('Database file not found at:', dbPath);
        process.exit(1);
    }

    const buffer = fs.readFileSync(dbPath);
    const reader = new MdbReader(buffer);

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Helper for upsert
        const upsert = async (tableName, rowData, pk) => {
            const columns = Object.keys(rowData).map(c => `"${c}"`); // Quote columns
            const values = Object.values(rowData);
            const placeholders = values.map((_, i) => `$${i + 1}`);

            // Construct SET clause for update
            const updateSet = Object.keys(rowData).map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

            const query = `
                INSERT INTO "${tableName}" (${columns.join(', ')})
                VALUES (${placeholders.join(', ')})
                ON CONFLICT ("${pk}")
                DO UPDATE SET ${updateSet};
             `;

            try {
                await client.query(query, values);
            } catch (err) {
                console.error(`Error upserting into ${tableName} for PK ${rowData[pk]}:`, err.message);
            }
        };

        // --- 1. Users ---
        console.log('--- Importing Users ---');
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
                    'الاسم': row['الاسم'] ? String(row['الاسم']) : null,
                    'النسبة': row['النسبة'] ? String(row['النسبة']) : null,
                    'اسم_الأب': row['اسم_الأب'] ? String(row['اسم_الأب']) : null,
                    'معرف_المدرسة': row['معرف_المدرسة'] ? Number(row['معرف_المدرسة']) : null,
                    'معرف_المجمع': row['معرف_المجمع'] ? Number(row['معرف_المجمع']) : null,
                    'معرف_نوع_التعيين': row['معرف_نوع_التعيين'] ? Number(row['معرف_نوع_التعيين']) : null,
                    'تاريخ_التعيين': parseDate(row['تاريخ_التعيين']),
                    'معرف_الفئة_الوظيفية': row['معرف_الفئة_الوظيفية'] ? Number(row['معرف_الفئة_الوظيفية']) : null,
                    'معرف_المسمى_الوظيفي_عند_التعيين': row['معرف_المسمى_الوظيفي_عند_التعيين'] ? Number(row['معرف_المسمى_الوظيفي_عند_التعيين']) : null,
                    'معرف_المسمى_الوظيفي_الحالي': row['معرف_المسمى_الوظيفي_الحالي'] ? Number(row['معرف_المسمى_الوظيفي_الحالي']) : null,
                    'معرف_الحالة': row['معرف_الحالة'] ? Number(row['معرف_الحالة']) : null,
                    'معرف_الوضع_العائلي': row['معرف_الوضع_العائلي'] ? Number(row['معرف_الوضع_العائلي']) : null,
                    'معرف_المدينة': row['معرف_المدينة'] ? Number(row['معرف_المدينة']) : null,
                    'معرف_القرية_الحي': row['معرف_القرية_الحي'] ? Number(row['معرف_القرية_الحي']) : null,
                    'الموبايل': row['الموبايل'] ? String(row['الموبايل']) : null,
                    'الرقم_الوطني': row['الرقم_الوطني'] ? String(row['الرقم_الوطني']) : null,
                    'اسم_الأم_الكامل': row['اسم_الأم_الكامل'] ? String(row['اسم_الأم_الكامل']) : null,
                    'محل_الولادة': row['محل_الولادة'] ? String(row['محل_الولادة']) : null,
                    'تاريخ_الولادة': parseDate(row['تاريخ_الولادة']),
                    'الجنس': row['الجنس'] ? String(row['الجنس']) : null,
                    'عدد_الابناء': row['عدد_الابناء'] ? Number(row['عدد_الابناء']) : null,
                    'المحافظة': row['المحافظة'] ? String(row['المحافظة']) : null,
                    'العنوان_مفصل_لمركز_السويداء': row['العنوان_مفصل_لمركز_السويداء'] ? String(row['العنوان_مفصل_لمركز_السويداء']) : null,
                    'ملاحظات': row['ملاحظات'] ? String(row['ملاحظات']) : null,
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
        const parseDate = (d) => {
            if (!d) return null;
            const date = new Date(d);
            return isNaN(date.getTime()) ? null : date;
        };

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


    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

main();
