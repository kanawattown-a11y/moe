'use client';

import { useState } from 'react';
import { submitCustomForm } from './actions';
import { CheckCircle } from 'lucide-react';
import S3FileUpload from '@/components/S3FileUpload';

interface CustomFormField {
    id: number;
    column_name: string;
    data_type: string;
    display_name: string;
    ui_field_type: string;
    options: string | null;
    is_required: boolean;
    helper_text: string | null;
    depends_on_field?: string | null;
    dependency_operator?: string | null;
    dependency_value?: string | null;
    correct_answer?: string | null;
    points?: number | null;
}

interface CustomForm {
    id: number;
    title: string;
    description: string | null;
    is_quiz: boolean;
    header_color: string;
    button_color: string;
    fields: CustomFormField[];
}

const inputClasses = "w-full p-4 bg-gray-50 border-b-2 border-gray-200 focus:bg-gray-100 outline-none transition-all text-gray-900 rounded-t-xl";

// Render different input types securely
function renderField(field: CustomFormField, form: CustomForm, onChange: (val: string) => void) {
    if (field.ui_field_type === 'textarea') {
        return <textarea name={field.column_name} required={field.is_required} rows={4} className={inputClasses} placeholder="إجابتك..." onChange={e => onChange(e.target.value)} />;
    }

    if (field.ui_field_type === 'select') {
        const options = field.options ? field.options.split(',').map(o => o.trim()) : [];
        return (
            <select name={field.column_name} required={field.is_required} className={inputClasses} onChange={e => onChange(e.target.value)}>
                <option value="">-- اختر إجابة --</option>
                {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
        );
    }

    if (field.ui_field_type === 'radio') {
        const options = field.options ? field.options.split(',').map(o => o.trim()) : [];
        return (
            <div className="space-y-3 mt-4">
                {options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <input type="radio" name={field.column_name} value={opt} required={field.is_required} className="w-5 h-5 accent-dynamic" onChange={e => onChange(e.target.value)} />
                        <span className="text-gray-800 font-medium text-lg">{opt}</span>
                    </label>
                ))}
            </div>
        );
    }

    if (field.ui_field_type === 'checkbox') {
        return (
            <label className="flex items-center gap-3 mt-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input type="checkbox" name={field.column_name} className="w-6 h-6 rounded accent-dynamic" onChange={e => onChange(e.target.checked ? "نعم" : "لا")} />
                <span className="text-gray-800 font-medium text-lg">نعم / موافق</span>
            </label>
        );
    }

    if (field.ui_field_type === 'file') {
        return (
            <div className="mt-2">
                <S3FileUpload 
                    name={field.column_name}
                    folder="registrations"
                    onUploadComplete={(url) => onChange(url)}
                    label={field.display_name}
                    required={field.is_required}
                />
            </div>
        );
    }

    if (field.ui_field_type === 'grid') {
        let options = { rows: [], cols: [] };
        try { if (field.options) options = JSON.parse(field.options); } catch (e) {}
        
        return (
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-right" dir="rtl">
                    <thead>
                        <tr className="bg-gray-100/50">
                            <th className="p-3 text-gray-500 font-normal"></th>
                            {options.cols.map((col: string, i: number) => (
                                <th key={i} className="p-3 text-gray-700 font-bold text-center">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {options.rows.map((row: string, i: number) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                                <td className="p-3 font-bold text-gray-900">{row}</td>
                                {options.cols.map((col: string, j: number) => (
                                    <td key={j} className="p-3 text-center">
                                        <input 
                                            type="radio" 
                                            name={`${field.column_name}_${row}`} 
                                            value={col} 
                                            required={field.is_required}
                                            className="w-5 h-5 cursor-pointer accent-dynamic"
                                            onChange={(e) => {
                                                const hiddenInput = document.getElementById(`grid_hidden_${field.id}`) as HTMLInputElement;
                                                const currentData = hiddenInput.value ? JSON.parse(hiddenInput.value) : {};
                                                currentData[row] = e.target.value;
                                                const newData = JSON.stringify(currentData);
                                                hiddenInput.value = newData;
                                                onChange(newData);
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <input type="hidden" id={`grid_hidden_${field.id}`} name={field.column_name} value="" />
            </div>
        );
    }

    // Default fallback (text, number, date, etc)
    return (
        <input
            type={field.ui_field_type}
            name={field.column_name}
            required={field.is_required}
            className={inputClasses}
            style={{ borderBottomColor: (field as any).currentValue ? form.button_color : undefined }}
            placeholder={field.ui_field_type === 'text' ? "إجابتك..." : ""}
            onChange={e => onChange(e.target.value)}
        />
    );
}

// Helper to style accent colors in CSS
function useDynamicTheme(form: CustomForm) {
    return (
        <style dangerouslySetInnerHTML={{ __html: `
            .accent-dynamic { accent-color: ${form.button_color || '#9333ea'}; }
            .focus-dynamic:focus { border-color: ${form.button_color || '#9333ea'}; }
        `}} />
    );
}

export default function PublicForm({ form }: { form: CustomForm }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [quizScore, setQuizScore] = useState<{ earned: number, total: number } | null>(null);
    const [formState, setFormState] = useState<Record<string, string>>({});

    const handleFieldChange = (name: string, value: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const isVisible = (field: CustomFormField) => {
        if (!field.depends_on_field) return true;
        
        const parentValue = formState[field.depends_on_field] || '';
        const targetValue = field.dependency_value || '';
        
        if (field.dependency_operator === 'not_equals') {
            return parentValue !== targetValue;
        }
        return parentValue === targetValue;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const formData = new FormData(e.currentTarget);
        
        // Pass hidden fields array so backend ignores them during validation
        const hiddenFields = form.fields.filter(f => !isVisible(f)).map(f => f.column_name);
        formData.append('__hidden_fields', JSON.stringify(hiddenFields));

        const res = await submitCustomForm(form.id, null, formData);

        if (res?.message) {
            setErrorMsg(res.message);
            setIsSubmitting(false);
        } else if (res?.success) {
            if (form.is_quiz) {
                let totalMarks = 0;
                let earnedMarks = 0;
                form.fields.forEach(f => {
                    if (f.points && f.points > 0) {
                        totalMarks += f.points;
                        const userAns = formState[f.column_name];
                        if (userAns && f.correct_answer && userAns.trim() === f.correct_answer.trim()) {
                            earnedMarks += f.points;
                        }
                    }
                });
                setQuizScore({ earned: earnedMarks, total: totalMarks });
            }
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">تم تسجيل ردك بنجاح!</h2>
                
                {quizScore ? (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl inline-block mb-8">
                        <p className="text-blue-900 font-bold mb-2 text-xl">نتيجة التقييم التلقائي:</p>
                        <div className="text-4xl font-extrabold text-blue-600 tracking-tight">
                            {quizScore.earned} <span className="text-lg text-blue-400">/ {quizScore.total}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600 text-lg mb-8">شكراً لك على إرسال المعلومات. تم توثيق إجاباتك ضمن النظام.</p>
                )}
                
                <button onClick={() => window.location.reload()} className="text-purple-600 font-bold hover:underline">إرسال رد آخر</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {useDynamicTheme(form)}
            {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 font-bold text-lg">
                    {errorMsg}
                </div>
            )}

            {form.fields.map(field => {
                if (!isVisible(field)) return null;

                return (
                    <div key={field.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
                        <label className="block text-xl font-bold text-gray-900 mb-2">
                            {field.display_name} {field.is_required && <span className="text-red-500 font-bold">*</span>}
                        </label>

                        {field.helper_text && (
                            <div className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-50">
                                {field.helper_text}
                            </div>
                        )}

                        <div className="mt-4">
                            {renderField(field, form, (val: string) => handleFieldChange(field.column_name, val))}
                        </div>
                    </div>
                );
            })}

            <div className="flex justify-between items-center mt-8 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white py-4 px-10 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none"
                    style={{ backgroundColor: form.button_color || '#9333ea', boxShadow: `0 10px 15px -3px ${form.button_color}44` }}
                >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرد'}
                </button>
                <div className="text-sm font-bold text-gray-400">
                    <span className="text-purple-600 px-1">MOE</span> Forms Platform
                </div>
            </div>
        </form>
    );
}
