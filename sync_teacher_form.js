const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'teacher-registration';
    
    console.log('SYNC START: ' + slug);

    // Upsert the form
    const form = await prisma.customForm.upsert({
        where: { slug: slug },
        update: {
            is_active: true,
            title: "نموذج تسجيل مدرس جديد",
            description: "يرجى تعبئة كافة البيانات الشخصية ورفع صورة واضحة للوجه للمراجعة من قبل الإدارة.",
            target_table: "Employee",
            header_color: "#9333ea",
            button_color: "#9333ea"
        },
        create: {
            title: "نموذج تسجيل مدرس جديد",
            description: "يرجى تعبئة كافة البيانات الشخصية ورفع صورة واضحة للوجه للمراجعة من قبل الإدارة.",
            slug: slug,
            target_table: "Employee",
            is_active: true,
            header_color: "#9333ea",
            button_color: "#9333ea"
        }
    });

    console.log('Form Ready (ID: ' + form.id + ')');

    // Clean old fields to avoid duplication or confusion in sync
    await prisma.customFormField.deleteMany({
        where: { form_id: form.id }
    });

    // Create the standard fields
    const fields = [
        { column_name: 'first_name', display_name: 'الاسم الأول', data_type: 'String', ui_field_type: 'text', is_required: true, order: 1 },
        { column_name: 'father_name', display_name: 'اسم الأب', data_type: 'String', ui_field_type: 'text', is_required: true, order: 2 },
        { column_name: 'last_name', display_name: 'النسبة/العائلة', data_type: 'String', ui_field_type: 'text', is_required: true, order: 3 },
        { column_name: 'national_id', display_name: 'الرقم الوطني', data_type: 'String', ui_field_type: 'number', is_required: true, order: 4 },
        { column_name: 'mobile', display_name: 'رقم الموبايل', data_type: 'String', ui_field_type: 'tel', is_required: true, order: 5 },
        { column_name: 'birth_date', display_name: 'تاريخ الولادة', data_type: 'DateTime', ui_field_type: 'date', is_required: true, order: 6 },
        { column_name: 'gender', display_name: 'الجنس', data_type: 'String', ui_field_type: 'select', options: 'ذكر,أنثى', is_required: true, order: 7 },
        { column_name: 'profile_picture_url', display_name: 'الصورة الشخصية', data_type: 'String', ui_field_type: 'file', is_required: true, order: 8 }
    ];

    for (const f of fields) {
        await prisma.customFormField.create({
            data: {
                ...f,
                form_id: form.id
            }
        });
    }

    console.log('Fields Sync Task COMPLETED successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
