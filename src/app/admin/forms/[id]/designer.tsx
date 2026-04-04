'use client';

import { useState } from 'react';
import { addFieldToForm, removeFieldFromForm, updateFormSettings } from './actions';
import { Plus, Trash2, ArrowRight, Settings, AlignLeft, CheckSquare, List, Hash, Calendar, Type, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import Select from 'react-select';

interface AvailableColumn {
    name: string;
    type: string;
    label: string;
    isRequired: boolean;
}

interface CustomFormField {
    id: number;
    column_name: string;
    data_type: string;
    display_name: string;
    ui_field_type: string;
    options: string | null;
    is_required: boolean;
    helper_text: string | null;
    depends_on_field: string | null;
    dependency_operator: string | null;
    dependency_value: string | null;
    correct_answer: string | null;
    points: number | null;
}

interface CustomForm {
    id: number;
    title: string;
    description: string | null;
    slug: string;
    target_table: string;
    is_quiz: boolean;
    header_color: string;
    button_color: string;
    fields: CustomFormField[];
}

const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white";

export default function FormDesigner({ form, tableName, availableColumns = [] }: { form: CustomForm, tableName: string, availableColumns?: AvailableColumn[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [addingType, setAddingType] = useState('text'); // UI selector
    const [dbType, setDbType] = useState('String');
    const [selectedColumn, setSelectedColumn] = useState<AvailableColumn | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Form settings state
    const [formTitle, setFormTitle] = useState(form.title);
    const [formDesc, setFormDesc] = useState(form.description || '');
    const [headerColor, setHeaderColor] = useState(form.header_color || '#9333ea');
    const [buttonColor, setButtonColor] = useState(form.button_color || '#9333ea');

    const handleAddField = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const formData = new FormData(e.currentTarget);
        formData.append('formId', form.id.toString());
        
        if (addingType === 'grid') {
            const rows = formData.get('gridRows')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];
            const cols = formData.get('gridCols')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [];
            formData.set('options', JSON.stringify({ rows, cols }));
        }

        if (selectedColumn) {
            formData.append('dbColumnName', selectedColumn.name);
        } else {
            setErrorMsg('يجب اختيار حقل قاعدة البيانات');
            setIsSubmitting(false);
            return;
        }

        const res = await addFieldToForm(null, formData);
        if (res?.message) {
            setErrorMsg(res.message);
        } else {
            setIsAdding(false);
            setSelectedColumn(null);
            (e.target as HTMLFormElement).reset();
        }
        setIsSubmitting(false);
    };

    const getIconForInput = (type: string) => {
        switch (type) {
            case 'text': return <Type size={18} className="text-blue-500" />;
            case 'textarea': return <AlignLeft size={18} className="text-gray-500" />;
            case 'number': return <Hash size={18} className="text-green-500" />;
            case 'date': return <Calendar size={18} className="text-orange-500" />;
            case 'select': case 'radio': return <List size={18} className="text-purple-500" />;
            case 'checkbox': return <CheckSquare size={18} className="text-indigo-500" />;
            case 'grid': return <LayoutGrid size={18} className="text-teal-500" />;
            default: return <Settings size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">مصمم النموذج: {form.title}</h1>
                    <p className="text-gray-500 mt-1">
                        الجدول المستهدف: <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{tableName}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <a href={`/forms/${form.slug}`} target="_blank" rel="noreferrer" className="bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition shadow-sm">
                        معاينة الحفظ
                    </a>
                    <Link href="/admin/forms" className="bg-gray-800 text-white font-bold py-2 px-4 rounded-xl hover:bg-gray-700 transition flex items-center gap-2 shadow-sm">
                        <ArrowRight size={18} /> عودة للنماذج
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="text-purple-600" />
                        <h2 className="font-bold text-xl text-gray-800">تخصيص الهوية البصرية للنموذج</h2>
                    </div>
                    <button 
                        onClick={async () => {
                            setIsSavingSettings(true);
                            await updateFormSettings(form.id, { 
                                title: formTitle, 
                                description: formDesc, 
                                headerColor, 
                                buttonColor 
                            });
                            setIsSavingSettings(false);
                            alert('تم حفظ الإعدادات بنجاح');
                        }}
                        disabled={isSavingSettings}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
                    >
                        {isSavingSettings ? 'جاري الحفظ...' : 'حفظ التغييرات الجمالية'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">عنوان النموذج</label>
                        <input value={formTitle} onChange={e => setFormTitle(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">لون الشريط العلوي (Theme)</label>
                        <div className="flex gap-2">
                            <input type="color" value={headerColor} onChange={e => setHeaderColor(e.target.value)} className="w-12 h-10 rounded border border-gray-200 p-1 cursor-pointer" />
                            <input value={headerColor} onChange={e => setHeaderColor(e.target.value)} className={inputClasses} placeholder="#9333ea" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">لون أزرار التنفيذ (Button)</label>
                        <div className="flex gap-2">
                            <input type="color" value={buttonColor} onChange={e => setButtonColor(e.target.value)} className="w-12 h-10 rounded border border-gray-200 p-1 cursor-pointer" />
                            <input value={buttonColor} onChange={e => setButtonColor(e.target.value)} className={inputClasses} placeholder="#9333ea" />
                        </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">رسالة الترحيب / الوصف</label>
                        <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className={inputClasses} placeholder="اكتب وصفاً أو ترحيباً يظهر في بداية النموذج..." />
                    </div>
                </div>
            </div>

            {/* List of current fields */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-lg">حقول النموذج المضافة ({form.fields.length})</h2>
                </div>

                <div className="p-4 space-y-3">
                    {form.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition group bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                                    {index + 1}
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {getIconForInput(field.ui_field_type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        {field.display_name}
                                        {field.is_required && <span className="text-xs text-red-500 bg-red-50 px-2 rounded-full">إجباري</span>}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                        العمود: {field.column_name} ({field.data_type}) | نوع الإدخال: {field.ui_field_type}
                                    </p>
                                    {field.depends_on_field && (
                                        <p className="text-xs font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-100">
                                            الشرط: لا يظهر إلا إذا كان ({field.depends_on_field}) {field.dependency_operator === 'equals' ? 'يساوي' : 'لا يساوي'} "{field.dependency_value}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={async () => await removeFieldFromForm(field.id, form.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="حذف الحقل"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {form.fields.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            لم تقم بإضافة أي حقول لهذا النموذج بعد.
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Field UI */}
            {isAdding ? (
                <div className="bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <Plus className="text-purple-500" /> إضافة حقل جديد
                        </h2>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-700 font-bold bg-gray-100 px-3 py-1 rounded-lg">إلغاء</button>
                    </div>

                    <form onSubmit={handleAddField} className="p-6 space-y-6">
                        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg font-bold border border-red-200">{errorMsg}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم العمود البرمجي في قاعدة البيانات <span className="text-red-500">*</span></label>
                                <Select
                                    options={availableColumns}
                                    getOptionLabel={(option) => `${option.label} (${option.name})`}
                                    getOptionValue={(option) => option.name}
                                    value={selectedColumn}
                                    onChange={(val) => {
                                        setSelectedColumn(val as AvailableColumn);
                                        if (val) {
                                            setDbType(val.type);
                                        }
                                    }}
                                    placeholder="ابحث عن الحقل..."
                                    className="font-cairo text-gray-900"
                                    isClearable
                                />
                                <p className="text-xs text-gray-500 mt-1">اختر الحقل المراد ربطه من هذا الجدول.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">قيمة الإدخال (UI Type) <span className="text-red-500">*</span></label>
                                <select
                                    name="inputType"
                                    required
                                    className={inputClasses}
                                    value={addingType}
                                    onChange={(e) => setAddingType(e.target.value)}
                                >
                                    <option value="text">نص قصير (Text)</option>
                                    <option value="textarea">نص طويل (Textarea)</option>
                                    <option value="number">رقم (Number)</option>
                                    <option value="date">تاريخ (Date)</option>
                                    <option value="select">قائمة منسدلة (Select)</option>
                                    <option value="radio">خيارات متعددة (Radio)</option>
                                    <option value="file">رفع ملف (File Upload)</option>
                                    <option value="checkbox">مربع اختيار (Checkbox)</option>
                                    <option value="grid">شبكات تقييم (Grid Matrix)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">نوع البيانات في القاعدة (Prisma Type) <span className="text-red-500">*</span></label>
                                <select
                                    name="dbColumnType"
                                    required
                                    className={inputClasses}
                                    value={dbType}
                                    onChange={(e) => setDbType(e.target.value)}
                                >
                                    <option value="String">نص (String)</option>
                                    <option value="Int">رقم صحيح (Int)</option>
                                    <option value="Float">رقم عشري (Float)</option>
                                    <option value="DateTime">تاريخ ووقت (DateTime)</option>
                                    <option value="Boolean">منطقي (Boolean)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 w-full hover:bg-white transition">
                                    <input type="checkbox" name="isRequired" defaultChecked={selectedColumn?.isRequired} value="true" className="w-5 h-5 accent-purple-600 rounded" />
                                    <span className="font-bold text-gray-700">هذا الحقل إجباري (Required)</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم المعروض للمستخدمين (سؤال الاستبيان) <span className="text-red-500">*</span></label>
                                <input type="text" name="label" required className={inputClasses} placeholder="مثال: يرجى إدخال اسمك الكامل..." />
                            </div>

                            {(addingType === 'select' || addingType === 'radio') && (
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <label className="block text-sm font-bold text-purple-900 mb-2">خيارات القائمة (مفصولة بفاصلة , ) <span className="text-red-500">*</span></label>
                                    <textarea name="options" className={inputClasses} required={addingType === 'select' || addingType === 'radio'} rows={2} placeholder="مثال: متزوج, أعزب, مطلق" />
                                </div>
                            )}

                            {addingType === 'grid' && (
                                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-teal-900 mb-2">أسئلة الشبكة (الأسطر) - مفصولة بفاصلة <span className="text-red-500">*</span></label>
                                        <textarea name="gridRows" className={inputClasses} required rows={2} placeholder="مثال: جودة الخدمة, سرعة الرد, تعامل الموظف" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-teal-900 mb-2">خيارات التقييم (الأعمدة) - مفصولة بفاصلة <span className="text-red-500">*</span></label>
                                        <textarea name="gridCols" className={inputClasses} required rows={2} placeholder="مثال: ممتاز, جيد جداً, ضعيف" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">نص مساعد (Helper Text)</label>
                                <input type="text" name="helperText" className={inputClasses} placeholder="معلومة إضافية للتوضيح للمستخدم أسفل الحقل..." />
                            </div>
                        </div>

                        {/* Conditional Logic UI */}
                        <div className="bg-blue-50/40 p-6 rounded-xl border border-blue-100 space-y-4 mb-6">
                            <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2">شروط إظهار الحقل (اختياري)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">إظهار الحقل اعتماداً على إجابة السؤال:</label>
                                    <select name="dependsOnColumn" className={inputClasses}>
                                        <option value="">-- بدون شرط (يظهر دائماً) --</option>
                                        {form.fields.map(f => (
                                            <option key={f.id} value={f.column_name}>{f.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">حالة المطابقة:</label>
                                    <select name="dependsOnOperator" className={inputClasses} defaultValue="equals">
                                        <option value="equals">يساوي (==)</option>
                                        <option value="not_equals">لا يساوي (!=)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">القيمة المطلوبة للإظهار (نص):</label>
                                    <input type="text" name="dependsOnValue" className={inputClasses} placeholder="مثال: نعم , موافق" />
                                </div>
                            </div>
                            <p className="text-xs text-blue-600">سيظل هذا الحقل مخفياً عن المستخدم ولن يظهر إلا إذا كانت إجابة السؤال السابق مطابقة للقيمة المدخلة هنا.</p>
                        </div>

                        {(form as any).is_quiz && (
                            <div className="bg-green-50/40 p-6 rounded-xl border border-green-100 space-y-4 mb-6">
                                <h3 className="font-bold text-green-900 border-b border-green-100 pb-2">إعدادات الاختبار والتقييم</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">الإجابة الصحيحة (للمطابقة الدقيقة):</label>
                                        <input type="text" name="correctAnswer" className={inputClasses} placeholder="أدخل الإجابة المطابقة..." />
                                        <p className="text-xs text-green-700 mt-1">يجب أن تُطابق قيمة الخيارات بدقة.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">النقاط المستحقة للطالب:</label>
                                        <input type="number" name="points" defaultValue="0" min="0" className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition shadow-lg mt-4 disabled:opacity-70">
                            {isSubmitting ? 'جاري الحفظ...' : 'إضافة الحقل للنموذج'}
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:bg-purple-50 hover:border-purple-400 hover:text-purple-600 transition flex items-center justify-center gap-2"
                >
                    <Plus size={24} /> إضافة حقل جديد (سؤال)
                </button>
            )}
        </div>
    );
}
