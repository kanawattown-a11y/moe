'use client';

import { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, X } from 'lucide-react';
import { getS3PresignedUrl } from '@/lib/s3-actions';

interface S3FileUploadProps {
    name: string;
    folder: string;
    accept?: string;
    label?: string;
    onUploadComplete?: (url: string) => void;
    required?: boolean;
}

export default function S3FileUpload({
    name,
    folder,
    accept = "*/*",
    label = "رفع الملف",
    onUploadComplete,
    required = false
}: S3FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [publicUrl, setPublicUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setPublicUrl("");
            setProgress(0);
            
            // Auto-start upload once file is selected
            uploadToFile(selectedFile);
        }
    };

    const uploadToFile = async (selectedFile: File) => {
        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // 1. Get Presigned URL
            const { uploadUrl, publicUrl: finalUrl } = await getS3PresignedUrl(
                selectedFile.name,
                selectedFile.type,
                folder
            );

            // 2. Upload directly to S3 using XHR (for progress tracking)
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", selectedFile.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setPublicUrl(finalUrl);
                    if (onUploadComplete) onUploadComplete(finalUrl);
                    setUploading(false);
                } else {
                    console.error("S3 Upload Failed", xhr.responseText);
                    setError("فشل الرفع إلى الخادم السحابي. يرجى التحقق من إعدادات CORS.");
                    setUploading(false);
                }
            };

            xhr.onerror = () => {
                setError("حدث خطأ في الاتصال أثناء الرفع.");
                setUploading(false);
            };

            xhr.send(selectedFile);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "فشل الحصول على رابط الرفع.");
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPublicUrl("");
        setProgress(0);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-3 font-cairo">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            
            <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                publicUrl ? 'border-emerald-200 bg-emerald-50' : 
                error ? 'border-red-200 bg-red-50' : 
                'border-gray-200 hover:border-primary/50 group'
            }`}>
                {!file ? (
                    <div className="flex flex-col items-center justify-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-600">اضغط للرفع أو اسحب الملف هنا</p>
                            <p className="text-xs text-gray-400 mt-1">يدعم الأحجام الكبيرة (حتى 1 جيجا فأكثر)</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${publicUrl ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                                {publicUrl ? <FileCheck size={20} /> : <Upload size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                                <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>

                        {!uploading && (
                            <button 
                                type="button" 
                                onClick={clearFile}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* HIDDEN INPUT */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                {/* HIDDEN URL INPUT FOR FORM SUBMISSION */}
                <input type="hidden" name={name} value={publicUrl} required={required} />
            </div>

            {/* PROGRESS BAR */}
            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-primary">جاري الرفع...</span>
                        <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className="bg-primary h-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {publicUrl && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <FileCheck size={14} />
                    <span>تم الرفع بنجاح! جاهز للحفظ.</span>
                </div>
            )}
        </div>
    );
}
