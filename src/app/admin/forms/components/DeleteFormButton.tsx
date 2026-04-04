'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteForm } from '../actions';
import { toast } from 'react-hot-toast';

export default function DeleteFormButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا النموذج نهائياً؟')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteForm(id);
        } catch (error) {
            alert('حدث خطأ أثناء محاولة الحذف');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition ${isDeleting ? 'text-gray-400' : 'text-red-500 hover:bg-red-50'}`}
            title="حذف النموذج"
        >
            <Trash2 size={18} />
        </button>
    );
}
