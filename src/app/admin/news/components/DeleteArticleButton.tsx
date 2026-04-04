'use client';

import { deleteArticle } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteArticleButtonProps {
    id: number;
    title: string;
}

export default function DeleteArticleButton({ id, title }: DeleteArticleButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm(`هل أنت متأكد من حذف الخبر: "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            setIsDeleting(true);
            try {
                await deleteArticle(id);
            } catch (error) {
                console.error("Delete failed", error);
                alert("فشل الحذف. يرجى المحاولة لاحقاً.");
                setIsDeleting(false);
            }
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 font-bold hover:underline text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 flex items-center gap-1 disabled:opacity-50"
        >
            <Trash2 size={14} />
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
        </button>
    );
}
