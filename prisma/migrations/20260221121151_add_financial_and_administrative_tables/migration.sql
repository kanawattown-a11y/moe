-- CreateTable
CREATE TABLE "جدول_المجمع_التربوي" (
    "معرف_المجمع" INTEGER NOT NULL,
    "اسم_المجمع" TEXT,

    CONSTRAINT "جدول_المجمع_التربوي_pkey" PRIMARY KEY ("معرف_المجمع")
);

-- CreateTable
CREATE TABLE "جدول_المسمى_الوظيفي_الحالي" (
    "معرف_المسمى_الوظيفي_الحالي" INTEGER NOT NULL,
    "المسمى_الوظيفي_الحالي" TEXT,

    CONSTRAINT "جدول_المسمى_الوظيفي_الحالي_pkey" PRIMARY KEY ("معرف_المسمى_الوظيفي_الحالي")
);

-- CreateTable
CREATE TABLE "جدول_الوضع_العائلي" (
    "معرف_الوضع_العائلي" INTEGER NOT NULL,
    "الوضع_العائلي" TEXT,

    CONSTRAINT "جدول_الوضع_العائلي_pkey" PRIMARY KEY ("معرف_الوضع_العائلي")
);

-- CreateTable
CREATE TABLE "جدول_الفئة_الوظيفية" (
    "معرف_الفئة_الوظيفية" INTEGER NOT NULL,
    "الفئة_الوظيفية" TEXT,

    CONSTRAINT "جدول_الفئة_الوظيفية_pkey" PRIMARY KEY ("معرف_الفئة_الوظيفية")
);

-- CreateTable
CREATE TABLE "جدول_نوع_التعيين" (
    "معرف_نوع_التعيين" INTEGER NOT NULL,
    "نوع_التعيين" TEXT,

    CONSTRAINT "جدول_نوع_التعيين_pkey" PRIMARY KEY ("معرف_نوع_التعيين")
);

-- CreateTable
CREATE TABLE "جدول_الحالة" (
    "معرف_الحالة" INTEGER NOT NULL,
    "الحالة" TEXT,

    CONSTRAINT "جدول_الحالة_pkey" PRIMARY KEY ("معرف_الحالة")
);

-- CreateTable
CREATE TABLE "جدول_المدينة" (
    "معرف_المدينة" INTEGER NOT NULL,
    "المدينة" TEXT,

    CONSTRAINT "جدول_المدينة_pkey" PRIMARY KEY ("معرف_المدينة")
);

-- CreateTable
CREATE TABLE "جدول_القرية_الحي" (
    "معرف_القرية_الحي" INTEGER NOT NULL,
    "القرية_الحي" TEXT,
    "معرف_المدينة" INTEGER,

    CONSTRAINT "جدول_القرية_الحي_pkey" PRIMARY KEY ("معرف_القرية_الحي")
);

-- CreateTable
CREATE TABLE "جدول_العمل_المكلف_به" (
    "معرف_العمل_المكلف_به" INTEGER NOT NULL,
    "العمل_المكلف_به" TEXT,

    CONSTRAINT "جدول_العمل_المكلف_به_pkey" PRIMARY KEY ("معرف_العمل_المكلف_به")
);

-- CreateTable
CREATE TABLE "جدول_الجامعات" (
    "معرف_الجامعة" INTEGER NOT NULL,
    "اسم_الجامعة" TEXT,
    "المحافظة" TEXT,
    "نوع_الجامعة" TEXT,

    CONSTRAINT "جدول_الجامعات_pkey" PRIMARY KEY ("معرف_الجامعة")
);

-- CreateTable
CREATE TABLE "جدول_الكليات" (
    "معرف_الكلية" INTEGER NOT NULL,
    "اسم_الكلية" TEXT,

    CONSTRAINT "جدول_الكليات_pkey" PRIMARY KEY ("معرف_الكلية")
);

-- CreateTable
CREATE TABLE "جدول_المعاهد" (
    "معرف_المعهد" INTEGER NOT NULL,
    "اسم_المعهد" TEXT,
    "نوع_المعهد" TEXT,

    CONSTRAINT "جدول_المعاهد_pkey" PRIMARY KEY ("معرف_المعهد")
);

-- CreateTable
CREATE TABLE "جدول_نوع_الشهادة" (
    "معرف_نوع_الشهادة" INTEGER NOT NULL,
    "نوع_الشهادة" TEXT,
    "الفئة_الوظيفية" TEXT,

    CONSTRAINT "جدول_نوع_الشهادة_pkey" PRIMARY KEY ("معرف_نوع_الشهادة")
);

-- CreateTable
CREATE TABLE "جدول_المدارس" (
    "معرف_المدرسة" SERIAL NOT NULL,
    "الرقم الاحصائي" INTEGER,
    "معرف_المجمع" INTEGER,
    "المجمع" TEXT,
    "معرف_القرية_الحي" INTEGER,
    "القرية_الحي" TEXT,
    "معرف_المدينة" INTEGER,
    "اسم_المدرسة" TEXT,
    "هاتف المدرسة" TEXT,
    "نوع التعليم" TEXT,
    "مرحلة المدرسة" TEXT,
    "نوع المرحلة" TEXT,
    "معرف_المدير" INTEGER,
    "ملاحظات" TEXT,

    CONSTRAINT "جدول_المدارس_pkey" PRIMARY KEY ("معرف_المدرسة")
);

-- CreateTable
CREATE TABLE "جدول_الذاتيات" (
    "معرف_الموظف" SERIAL NOT NULL,
    "الرقم_الذاتي" TEXT,
    "الرمز_الوظيفي" TEXT,
    "معرف_المدرسة" INTEGER,
    "معرف_المجمع" INTEGER,
    "معرف_نوع_التعيين" INTEGER,
    "تاريخ_التعيين" TIMESTAMP(3),
    "معرف_الفئة_الوظيفية" INTEGER,
    "معرف_المسمى_الوظيفي_عند_التعيين" INTEGER,
    "معرف_المسمى_الوظيفي_الحالي" INTEGER,
    "معرف_الحالة" INTEGER,
    "الاسم" TEXT,
    "اسم_الأب" TEXT,
    "النسبة" TEXT,
    "اسم_الأم_الكامل" TEXT,
    "معرف_العمل_المكلف_به" INTEGER,
    "محل_الولادة" TEXT,
    "تاريخ_الولادة" TIMESTAMP(3),
    "الرقم_الوطني" TEXT,
    "الجنس" TEXT,
    "معرف_الوضع_العائلي" INTEGER,
    "عدد_الابناء" INTEGER,
    "المحافظة" TEXT,
    "معرف_المدينة" INTEGER,
    "معرف_القرية_الحي" INTEGER,
    "العنوان_مفصل_لمركز_السويداء" TEXT,
    "الموبايل" TEXT,
    "ملاحظات" TEXT,
    "الاسم_الثلاثي" TEXT,

    CONSTRAINT "جدول_الذاتيات_pkey" PRIMARY KEY ("معرف_الموظف")
);

-- CreateTable
CREATE TABLE "جدول_الاجازات" (
    "معرف_الإجازة" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "نوع_الاجازة" TEXT,
    "رقم_قرار_الاجازة" TEXT,
    "تاريخ_البداية" TIMESTAMP(3),
    "تاريخ_النهاية" TIMESTAMP(3),
    "المدة" INTEGER,
    "رقم_قرار_القطع" TEXT,
    "تاريخ_قرار_القطع" TIMESTAMP(3),
    "تاريخ_المباشرة" TIMESTAMP(3),
    "ملاحظات" TEXT,

    CONSTRAINT "جدول_الاجازات_pkey" PRIMARY KEY ("معرف_الإجازة")
);

-- CreateTable
CREATE TABLE "جدول_الترفيع" (
    "معرف_الترفيع" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "الأجر_قبل_الترفيع" DOUBLE PRECISION,
    "الأجر_بعد_الترفيع" DOUBLE PRECISION,
    "درجة_الكفاءة" DOUBLE PRECISION,
    "نسبة_العلاوة" DOUBLE PRECISION,
    "مقدار_العلاوة" DOUBLE PRECISION,
    "المدة" DOUBLE PRECISION,
    "ملاحظات" TEXT,
    "التاريخ_الحالي" TIMESTAMP(3),

    CONSTRAINT "جدول_الترفيع_pkey" PRIMARY KEY ("معرف_الترفيع")
);

-- CreateTable
CREATE TABLE "جدول_ندب_إيفاد_إعارة" (
    "معرف_الإجراء" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "نوع_الإجراء" TEXT,
    "رقم_القرار" TEXT,
    "تاريخ_القرار" TIMESTAMP(3),
    "الجهة" TEXT,
    "تاريخ_الانفكاك" TIMESTAMP(3),
    "تاريخ_المباشرة" TIMESTAMP(3),
    "رقم_قرار_الهاء" TEXT,
    "تاريخ_قرار_الهاء" TIMESTAMP(3),
    "ملاحظات" TEXT,

    CONSTRAINT "جدول_ندب_إيفاد_إعارة_pkey" PRIMARY KEY ("معرف_الإجراء")
);

-- CreateTable
CREATE TABLE "جدول_ترك_العمل" (
    "معرف_الإجراء" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "نوع_الاجراء" TEXT,
    "رقم_القرار" TEXT,
    "تاريخ_القرار" TIMESTAMP(3),
    "تاريخ_الانفكاك" TIMESTAMP(3),
    "النقل_إلى" TEXT,

    CONSTRAINT "جدول_ترك_العمل_pkey" PRIMARY KEY ("معرف_الإجراء")
);

-- CreateTable
CREATE TABLE "جدول_المؤهلات_العلمية" (
    "معرف_المؤهل" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "معرف_نوع_الشهادة" INTEGER,
    "معرف_الجامعة" INTEGER,
    "معرف_الكلية" INTEGER,
    "معرف_المعهد" INTEGER,
    "عام_الحصول_عليها" TEXT,
    "معرف_نوع_الشهادة_الأعلى" INTEGER,
    "معرف_الجامعة_للشهادة_الأعلى" INTEGER,
    "معرف_الكلية_للشهادة_الأعلى" INTEGER,

    CONSTRAINT "جدول_المؤهلات_العلمية_pkey" PRIMARY KEY ("معرف_المؤهل")
);

-- CreateTable
CREATE TABLE "جدول_المستخدمين" (
    "معرف_المستخدم" SERIAL NOT NULL,
    "اسم_المستخدم" TEXT NOT NULL,
    "كلمة_المرور" TEXT NOT NULL,
    "اسم_الدور" TEXT,
    "permissions" JSONB,
    "فعال" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "جدول_المستخدمين_pkey" PRIMARY KEY ("معرف_المستخدم")
);

-- CreateTable
CREATE TABLE "جدول_العمل_مفصل" (
    "معرف_المكتب" SERIAL NOT NULL,
    "الطابق" TEXT,
    "الجناح" TEXT,
    "العنوان" TEXT,
    "رقم_المكتب" INTEGER,
    "اسم_المكتب" TEXT,
    "معرف_الشعبة" INTEGER,
    "معرف_الدائرة" INTEGER,
    "هاتف_المكتب" INTEGER,

    CONSTRAINT "جدول_العمل_مفصل_pkey" PRIMARY KEY ("معرف_المكتب")
);

-- CreateTable
CREATE TABLE "جدول_الاخبار" (
    "معرف_المقال" SERIAL NOT NULL,
    "العنوان" TEXT NOT NULL,
    "الرابط_الدائم" TEXT NOT NULL,
    "المحتوى" TEXT NOT NULL,
    "مقتطف" TEXT,
    "رابط_الصورة" TEXT,
    "منشور" BOOLEAN NOT NULL DEFAULT false,
    "تاريخ_الإنشاء" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "تاريخ_التحديث" TIMESTAMP(3) NOT NULL,
    "معرف_الكاتب" INTEGER,

    CONSTRAINT "جدول_الاخبار_pkey" PRIMARY KEY ("معرف_المقال")
);

-- CreateTable
CREATE TABLE "جدول_تصنيفات_المكتبة" (
    "معرف_التصنيف" SERIAL NOT NULL,
    "اسم_التصنيف" TEXT NOT NULL,
    "الوصف" TEXT,

    CONSTRAINT "جدول_تصنيفات_المكتبة_pkey" PRIMARY KEY ("معرف_التصنيف")
);

-- CreateTable
CREATE TABLE "جدول_الكتب" (
    "معرف_الكتاب" SERIAL NOT NULL,
    "عنوان_الكتاب" TEXT NOT NULL,
    "المؤلف" TEXT,
    "نبذة" TEXT,
    "رابط_الملف" TEXT NOT NULL,
    "رابط_الغلاف" TEXT,
    "حجم_الملف" INTEGER,
    "عدد_الصفحات" INTEGER,
    "معرف_التصنيف" INTEGER,
    "معرف_الرافع" INTEGER,
    "تاريخ_الرفع" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "عام" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "جدول_الكتب_pkey" PRIMARY KEY ("معرف_الكتاب")
);

-- CreateTable
CREATE TABLE "جدول_أجر_بدء_التعيين" (
    "معرف_أجر_بدء_التعيين" SERIAL NOT NULL,
    "أجر_بدء_التعيين" DOUBLE PRECISION NOT NULL,
    "صفة_التعيين" TEXT,
    "معرف_الفئة_الوظيفية" INTEGER,
    "معرف_السقف" INTEGER,

    CONSTRAINT "جدول_أجر_بدء_التعيين_pkey" PRIMARY KEY ("معرف_أجر_بدء_التعيين")
);

-- CreateTable
CREATE TABLE "جدول_سقف_الأجر" (
    "معرف_السقف" SERIAL NOT NULL,
    "السقف" DOUBLE PRECISION NOT NULL,
    "معرف_الفئة_الوظيفية" INTEGER,

    CONSTRAINT "جدول_سقف_الأجر_pkey" PRIMARY KEY ("معرف_السقف")
);

-- CreateTable
CREATE TABLE "جدول_الملاك" (
    "معرف_الملاك" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER NOT NULL,
    "نمط_التعيين" TEXT,
    "رقم_قرار_التعيين" TEXT,
    "تاريخ_قرار_التعيين" TIMESTAMP(3),
    "ملاحظات" TEXT,
    "تم_بواسطة" TEXT,

    CONSTRAINT "جدول_الملاك_pkey" PRIMARY KEY ("معرف_الملاك")
);

-- CreateTable
CREATE TABLE "جدول_المعتمد" (
    "معرف_المعتمد" SERIAL NOT NULL,
    "اسم_المعتمد" TEXT NOT NULL,
    "الرقم_الوطني" BIGINT,

    CONSTRAINT "جدول_المعتمد_pkey" PRIMARY KEY ("معرف_المعتمد")
);

-- CreateTable
CREATE TABLE "جدول_الأمانة_السويداء" (
    "معرف_الامانة" SERIAL NOT NULL,
    "الامانة" TEXT NOT NULL,

    CONSTRAINT "جدول_الأمانة_السويداء_pkey" PRIMARY KEY ("معرف_الامانة")
);

-- CreateTable
CREATE TABLE "جدول_تعديل_الفئة" (
    "معرف_تعديل_الفئة" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER NOT NULL,
    "رقم_قرار_تعديل_الفئة" TEXT,
    "تاريخ_قرار_تعديل_الفئة" TIMESTAMP(3),
    "الفئة_الوظيفية_الحالية" TEXT,
    "الفئة_الوظيفية_الجديدة" INTEGER,
    "المسمى_الوظيفي_الجديد" INTEGER,
    "تم_بواسطة" TEXT,

    CONSTRAINT "جدول_تعديل_الفئة_pkey" PRIMARY KEY ("معرف_تعديل_الفئة")
);

-- CreateIndex
CREATE UNIQUE INDEX "جدول_المستخدمين_اسم_المستخدم_key" ON "جدول_المستخدمين"("اسم_المستخدم");

-- CreateIndex
CREATE UNIQUE INDEX "جدول_الاخبار_الرابط_الدائم_key" ON "جدول_الاخبار"("الرابط_الدائم");

-- AddForeignKey
ALTER TABLE "جدول_القرية_الحي" ADD CONSTRAINT "جدول_القرية_الحي_معرف_المدينة_fkey" FOREIGN KEY ("معرف_المدينة") REFERENCES "جدول_المدينة"("معرف_المدينة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_المدارس" ADD CONSTRAINT "جدول_المدارس_معرف_المجمع_fkey" FOREIGN KEY ("معرف_المجمع") REFERENCES "جدول_المجمع_التربوي"("معرف_المجمع") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_المدارس" ADD CONSTRAINT "جدول_المدارس_معرف_القرية_الحي_fkey" FOREIGN KEY ("معرف_القرية_الحي") REFERENCES "جدول_القرية_الحي"("معرف_القرية_الحي") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_المدارس" ADD CONSTRAINT "جدول_المدارس_معرف_المدينة_fkey" FOREIGN KEY ("معرف_المدينة") REFERENCES "جدول_المدينة"("معرف_المدينة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_المدرسة_fkey" FOREIGN KEY ("معرف_المدرسة") REFERENCES "جدول_المدارس"("معرف_المدرسة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_المجمع_fkey" FOREIGN KEY ("معرف_المجمع") REFERENCES "جدول_المجمع_التربوي"("معرف_المجمع") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_نوع_التعيين_fkey" FOREIGN KEY ("معرف_نوع_التعيين") REFERENCES "جدول_نوع_التعيين"("معرف_نوع_التعيين") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_الفئة_الوظيف_fkey" FOREIGN KEY ("معرف_الفئة_الوظيفية") REFERENCES "جدول_الفئة_الوظيفية"("معرف_الفئة_الوظيفية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "fk_emp_appt_job" FOREIGN KEY ("معرف_المسمى_الوظيفي_عند_التعيين") REFERENCES "جدول_المسمى_الوظيفي_الحالي"("معرف_المسمى_الوظيفي_الحالي") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "fk_emp_curr_job" FOREIGN KEY ("معرف_المسمى_الوظيفي_الحالي") REFERENCES "جدول_المسمى_الوظيفي_الحالي"("معرف_المسمى_الوظيفي_الحالي") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_الحالة_fkey" FOREIGN KEY ("معرف_الحالة") REFERENCES "جدول_الحالة"("معرف_الحالة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_العمل_المكلف_fkey" FOREIGN KEY ("معرف_العمل_المكلف_به") REFERENCES "جدول_العمل_المكلف_به"("معرف_العمل_المكلف_به") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_الوضع_العائل_fkey" FOREIGN KEY ("معرف_الوضع_العائلي") REFERENCES "جدول_الوضع_العائلي"("معرف_الوضع_العائلي") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_المدينة_fkey" FOREIGN KEY ("معرف_المدينة") REFERENCES "جدول_المدينة"("معرف_المدينة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الذاتيات" ADD CONSTRAINT "جدول_الذاتيات_معرف_القرية_الحي_fkey" FOREIGN KEY ("معرف_القرية_الحي") REFERENCES "جدول_القرية_الحي"("معرف_القرية_الحي") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الاجازات" ADD CONSTRAINT "جدول_الاجازات_معرف_الموظف_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الترفيع" ADD CONSTRAINT "جدول_الترفيع_معرف_الموظف_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_ندب_إيفاد_إعارة" ADD CONSTRAINT "جدول_ندب_إيفاد_إعارة_معرف_الموظ_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_ترك_العمل" ADD CONSTRAINT "جدول_ترك_العمل_معرف_الموظف_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_المؤهلات_العلمية" ADD CONSTRAINT "جدول_المؤهلات_العلمية_معرف_المو_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_المؤهلات_العلمية" ADD CONSTRAINT "جدول_المؤهلات_العلمية_معرف_نوع__fkey" FOREIGN KEY ("معرف_نوع_الشهادة") REFERENCES "جدول_نوع_الشهادة"("معرف_نوع_الشهادة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الاخبار" ADD CONSTRAINT "جدول_الاخبار_معرف_الكاتب_fkey" FOREIGN KEY ("معرف_الكاتب") REFERENCES "جدول_المستخدمين"("معرف_المستخدم") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الكتب" ADD CONSTRAINT "جدول_الكتب_معرف_التصنيف_fkey" FOREIGN KEY ("معرف_التصنيف") REFERENCES "جدول_تصنيفات_المكتبة"("معرف_التصنيف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الكتب" ADD CONSTRAINT "جدول_الكتب_معرف_الرافع_fkey" FOREIGN KEY ("معرف_الرافع") REFERENCES "جدول_المستخدمين"("معرف_المستخدم") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_أجر_بدء_التعيين" ADD CONSTRAINT "جدول_أجر_بدء_التعيين_معرف_الفئة__fkey" FOREIGN KEY ("معرف_الفئة_الوظيفية") REFERENCES "جدول_الفئة_الوظيفية"("معرف_الفئة_الوظيفية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_أجر_بدء_التعيين" ADD CONSTRAINT "جدول_أجر_بدء_التعيين_معرف_السقف_fkey" FOREIGN KEY ("معرف_السقف") REFERENCES "جدول_سقف_الأجر"("معرف_السقف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_سقف_الأجر" ADD CONSTRAINT "جدول_سقف_الأجر_معرف_الفئة_الوظي_fkey" FOREIGN KEY ("معرف_الفئة_الوظيفية") REFERENCES "جدول_الفئة_الوظيفية"("معرف_الفئة_الوظيفية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الملاك" ADD CONSTRAINT "جدول_الملاك_معرف_الموظف_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_تعديل_الفئة" ADD CONSTRAINT "جدول_تعديل_الفئة_معرف_الموظف_fkey" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_تعديل_الفئة" ADD CONSTRAINT "جدول_تعديل_الفئة_الفئة_الوظيفية_fkey" FOREIGN KEY ("الفئة_الوظيفية_الجديدة") REFERENCES "جدول_الفئة_الوظيفية"("معرف_الفئة_الوظيفية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_تعديل_الفئة" ADD CONSTRAINT "جدول_تعديل_الفئة_المسمى_الوظيفي_fkey" FOREIGN KEY ("المسمى_الوظيفي_الجديد") REFERENCES "جدول_المسمى_الوظيفي_الحالي"("معرف_المسمى_الوظيفي_الحالي") ON DELETE SET NULL ON UPDATE CASCADE;
