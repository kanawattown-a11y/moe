'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBar({ 
    placeholder = "ابحث...", 
    queryKey = "q" 
}: { 
    placeholder?: string, 
    queryKey?: string 
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get(queryKey) || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    useEffect(() => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearchTerm) {
                params.set(queryKey, debouncedSearchTerm);
            } else {
                params.delete(queryKey);
            }
            replace(`${pathname}?${params.toString()}`);
        });
    }, [debouncedSearchTerm, pathname, replace, queryKey]);

    return (
        <div className="relative flex-1 w-full max-w-xl">
            <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none">
                <Search size={20} className={isPending ? "text-accent animate-pulse" : "text-gray-400"} />
            </div>
            <input
                type="text"
                className="block w-full rounded-xl border-2 border-gray-200 py-3 pr-12 pl-4 text-gray-900 focus:border-accent focus:ring-accent sm:text-lg font-bold shadow-sm transition"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
}
