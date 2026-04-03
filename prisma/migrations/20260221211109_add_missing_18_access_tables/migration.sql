-- CreateTable
CREATE TABLE "جدول_اقسام_الكليات" (
    "معرف_اقسام_الكلية" SERIAL NOT NULL,
    "اقسام_الكلية" TEXT,
    "معرف_الكلية" INTEGER,
    "اسم_الكلية" TEXT,

    CONSTRAINT "جدول_اقسام_الكليات_pkey" PRIMARY KEY ("معرف_اقسام_الكلية")
);

-- CreateTable
CREATE TABLE "جدول_اقسام_المعاهد" (
    "معرف_اقسام_المعهد" SERIAL NOT NULL,
    "اسم_اقسام_المعهد" TEXT,
    "معرف_المعهد" INTEGER,
    "اسم_المعهد" TEXT,

    CONSTRAINT "جدول_اقسام_المعاهد_pkey" PRIMARY KEY ("معرف_اقسام_المعهد")
);

-- CreateTable
CREATE TABLE "جدول_مفصل_كلية_العلوم" (
    "معرف_الفرع" SERIAL NOT NULL,
    "اسم_الفرع" TEXT,
    "معرف_القسم" INTEGER,
    "اسم_القسم" TEXT,
    "معرف_الكلية" INTEGER,
    "اسم_الكلية" TEXT,

    CONSTRAINT "جدول_مفصل_كلية_العلوم_pkey" PRIMARY KEY ("معرف_الفرع")
);

-- CreateTable
CREATE TABLE "جدول_الثانوية" (
    "معرف_الثانوية" SERIAL NOT NULL,
    "اسم_الثانوية" TEXT,

    CONSTRAINT "جدول_الثانوية_pkey" PRIMARY KEY ("معرف_الثانوية")
);

-- CreateTable
CREATE TABLE "جدول_فروع_الثانوية" (
    "معرف_فروع_الثانوية" SERIAL NOT NULL,
    "اسم_الفرع" TEXT,
    "معرف_الثانوية" INTEGER,
    "اسم_الثانوية" TEXT,

    CONSTRAINT "جدول_فروع_الثانوية_pkey" PRIMARY KEY ("معرف_فروع_الثانوية")
);

-- CreateTable
CREATE TABLE "جدول_اقسام_الكليات_للشهادة_الأعلى" (
    "معرف_القسم_للشهادة_الأعلى" SERIAL NOT NULL,
    "القسم_للشهادة_الأعلى" TEXT,
    "معرف_الكلية" INTEGER,
    "اسم_الكلية" TEXT,

    CONSTRAINT "جدول_اقسام_الكليات_للشهادة_الأع_pkey" PRIMARY KEY ("معرف_القسم_للشهادة_الأعلى")
);

-- CreateTable
CREATE TABLE "جدول_مفصل_كلية_العلوم_للشهادة_الأعلى" (
    "معرف_الفرع_للشهادة_الأعلى" SERIAL NOT NULL,
    "اسم_الفرع_للشهادة_الأعلى" TEXT,
    "معرف_القسم" INTEGER,
    "اسم_القسم" TEXT,
    "معرف_الكلية" INTEGER,
    "اسم_الكلية" TEXT,

    CONSTRAINT "جدول_مفصل_كلية_العلوم_للشهادة_ا_pkey" PRIMARY KEY ("معرف_الفرع_للشهادة_الأعلى")
);

-- CreateTable
CREATE TABLE "جدول_اقسام_المعاهد_للشهادة_الأعلى" (
    "معرف_اقسام_المعهد_للشهادة_الأعلى" SERIAL NOT NULL,
    "اقسام_المعهد_للشهادة_الأعلى" TEXT,
    "معرف_المعهد" INTEGER,
    "اسم_المعهد" TEXT,

    CONSTRAINT "جدول_اقسام_المعاهد_للشهادة_الأع_pkey" PRIMARY KEY ("معرف_اقسام_المعهد_للشهادة_الأعلى")
);

-- CreateTable
CREATE TABLE "جدول_النصاب_الأسبوعي" (
    "معرف_النصاب" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "معرف_المجمع" INTEGER,
    "معرف_المدرسة" INTEGER,
    "عدد_الساعات" INTEGER,
    "الإضافي" BOOLEAN,

    CONSTRAINT "جدول_النصاب_الأسبوعي_pkey" PRIMARY KEY ("معرف_النصاب")
);

-- CreateTable
CREATE TABLE "جدول_النصاب_المرجعي" (
    "معرف_الفئة" INTEGER NOT NULL,
    "النصاب_الأسبوعي" INTEGER,

    CONSTRAINT "جدول_النصاب_المرجعي_pkey" PRIMARY KEY ("معرف_الفئة")
);

-- CreateTable
CREATE TABLE "جدول_التأشير" (
    "معرف_التأشير" SERIAL NOT NULL,
    "معرف_الموظف" INTEGER,
    "رقم_قرار_الترفيع" TEXT,
    "تاريخ_قرار_الترفيع" TIMESTAMP(3),
    "رقم_قرار_التأشير" TEXT,
    "تاريخ_قرار_التأشير" TIMESTAMP(3),
    "اسم_قرار_الترفيع" TEXT,
    "ملاحظات" TEXT,
    "تم_بواسطة" TEXT,

    CONSTRAINT "جدول_التأشير_pkey" PRIMARY KEY ("معرف_التأشير")
);

-- CreateTable
CREATE TABLE "جدول_الوزارات" (
    "معرف_الوزارة" SERIAL NOT NULL,
    "اسم_الوزارة" TEXT,

    CONSTRAINT "جدول_الوزارات_pkey" PRIMARY KEY ("معرف_الوزارة")
);

-- CreateTable
CREATE TABLE "جدول_الدوائر" (
    "معرف_الدائرة" SERIAL NOT NULL,
    "الرقم_الاحصائي" TEXT,
    "اسم_الدائرة" TEXT,

    CONSTRAINT "جدول_الدوائر_pkey" PRIMARY KEY ("معرف_الدائرة")
);

-- CreateTable
CREATE TABLE "جدول_الشعب" (
    "معرف_الشعبة" SERIAL NOT NULL,
    "الرقم_الاحصائي" TEXT,
    "الدائرة" TEXT,
    "الشعبة" TEXT,
    "معرف_الدائرة" INTEGER,

    CONSTRAINT "جدول_الشعب_pkey" PRIMARY KEY ("معرف_الشعبة")
);

-- CreateTable
CREATE TABLE "جدول_المحافظات_مفصل" (
    "المعرف" SERIAL NOT NULL,
    "المحافظة" TEXT,
    "المنطقة_المدينة" TEXT,
    "الناحية" TEXT,

    CONSTRAINT "جدول_المحافظات_مفصل_pkey" PRIMARY KEY ("المعرف")
);

-- CreateTable
CREATE TABLE "جدول_الربط" (
    "معرف_الجدول_المرتبط" SERIAL NOT NULL,
    "اسم_القائمة" TEXT,
    "اسم_الحقل_في_الجدول_الأساسي" TEXT,
    "اسم_الجدول_المرتبط" TEXT,
    "اسم_الحقل_الظاهر" TEXT,

    CONSTRAINT "جدول_الربط_pkey" PRIMARY KEY ("معرف_الجدول_المرتبط")
);

-- AddForeignKey
ALTER TABLE "جدول_اقسام_الكليات" ADD CONSTRAINT "fk_col_dep_col" FOREIGN KEY ("معرف_الكلية") REFERENCES "جدول_الكليات"("معرف_الكلية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_اقسام_المعاهد" ADD CONSTRAINT "fk_ins_dep_ins" FOREIGN KEY ("معرف_المعهد") REFERENCES "جدول_المعاهد"("معرف_المعهد") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_مفصل_كلية_العلوم" ADD CONSTRAINT "fk_sci_col_dep" FOREIGN KEY ("معرف_القسم") REFERENCES "جدول_اقسام_الكليات"("معرف_اقسام_الكلية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_مفصل_كلية_العلوم" ADD CONSTRAINT "fk_sci_col_col" FOREIGN KEY ("معرف_الكلية") REFERENCES "جدول_الكليات"("معرف_الكلية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_فروع_الثانوية" ADD CONSTRAINT "fk_hi_sch_br_hs" FOREIGN KEY ("معرف_الثانوية") REFERENCES "جدول_الثانوية"("معرف_الثانوية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_اقسام_الكليات_للشهادة_الأعلى" ADD CONSTRAINT "fk_hcol_dep_col" FOREIGN KEY ("معرف_الكلية") REFERENCES "جدول_الكليات"("معرف_الكلية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_مفصل_كلية_العلوم_للشهادة_الأعلى" ADD CONSTRAINT "fk_hsci_col_dep" FOREIGN KEY ("معرف_القسم") REFERENCES "جدول_اقسام_الكليات_للشهادة_الأعلى"("معرف_القسم_للشهادة_الأعلى") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_مفصل_كلية_العلوم_للشهادة_الأعلى" ADD CONSTRAINT "fk_hsci_col_col" FOREIGN KEY ("معرف_الكلية") REFERENCES "جدول_الكليات"("معرف_الكلية") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_اقسام_المعاهد_للشهادة_الأعلى" ADD CONSTRAINT "fk_hins_dep_ins" FOREIGN KEY ("معرف_المعهد") REFERENCES "جدول_المعاهد"("معرف_المعهد") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_النصاب_الأسبوعي" ADD CONSTRAINT "fk_wk_qt_emp" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_النصاب_الأسبوعي" ADD CONSTRAINT "fk_wk_qt_cmp" FOREIGN KEY ("معرف_المجمع") REFERENCES "جدول_المجمع_التربوي"("معرف_المجمع") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_النصاب_الأسبوعي" ADD CONSTRAINT "fk_wk_qt_sch" FOREIGN KEY ("معرف_المدرسة") REFERENCES "جدول_المدارس"("معرف_المدرسة") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_النصاب_المرجعي" ADD CONSTRAINT "fk_ref_qt_jcat" FOREIGN KEY ("معرف_الفئة") REFERENCES "جدول_الفئة_الوظيفية"("معرف_الفئة_الوظيفية") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_التأشير" ADD CONSTRAINT "fk_vs_aud_emp" FOREIGN KEY ("معرف_الموظف") REFERENCES "جدول_الذاتيات"("معرف_الموظف") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "جدول_الشعب" ADD CONSTRAINT "fk_sec_dep" FOREIGN KEY ("معرف_الدائرة") REFERENCES "جدول_الدوائر"("معرف_الدائرة") ON DELETE SET NULL ON UPDATE CASCADE;
