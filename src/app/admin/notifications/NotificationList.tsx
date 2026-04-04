'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Clock, Check } from 'lucide-react';
import { markAsRead, deleteNotification, markAllAsRead } from './actions';

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
        case 'warning': return <AlertTriangle className="text-orange-500" size={24} />;
        case 'error': return <XCircle className="text-rose-500" size={24} />;
        default: return <Info className="text-blue-500" size={24} />;
    }
};

export default function NotificationList({ notifications }: { notifications: any[] }) {
    
    return (
        <div className="space-y-4">
            <div className="flex justify-end px-4">
                <button 
                    onClick={() => markAllAsRead()}
                    className="text-primary text-sm font-bold flex items-center gap-2 hover:underline"
                >
                    <Check size={16} /> تحديد الكل كمقروء
                </button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {notifications.map((notif: any) => (
                        <motion.div
                            key={String(notif.id)}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-5 group shadow-sm ${
                                notif.is_read ? 'bg-white/60 border-gray-100 grayscale-[0.3]' : 'bg-white border-primary/20 shadow-xl shadow-primary/5'
                            }`}
                        >
                            <div className="mt-1 relative">
                                {getIcon(notif.type)}
                                {!notif.is_read && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                                <h3 className={`font-black tracking-tight ${notif.is_read ? 'text-gray-500' : 'text-gray-900'}`}>{notif.title}</h3>
                                <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>{notif.message}</p>
                                <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-gray-400">
                                    <Clock size={12} />
                                    <span>{new Date(notif.sent_at).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.is_read && (
                                    <button 
                                        onClick={() => markAsRead(notif.id)}
                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-full transition-colors tooltip"
                                        title="تحديد كمقروء"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-colors"
                                    title="حذف"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {notifications.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="text-gray-300" size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">لا توجد تنبيهات حالياً</h3>
                        <p className="text-sm text-gray-300 mt-2">سنخبرك بكل جديد فور حدوثه</p>
                    </div>
                )}
            </div>
        </div>
    );
}
