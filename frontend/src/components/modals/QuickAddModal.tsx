import React from 'react';
import { X, Calendar, BookOpen, Mic, FileText, Users } from 'lucide-react';
import { MosqueIcon } from '../icons/IslamicIcons';
import { ActivityType } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string, initialType?: ActivityType) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const quickItems = [
    {
      id: 'event',
      title: 'ইভেন্ট',
      subtitle: 'ক্লাস বা মিটিং',
      icon: Calendar,
      type: 'MEETING' as ActivityType,
      bg: 'bg-emerald-50/70 hover:bg-emerald-100/70',
      iconColor: 'text-emerald-700',
      border: 'border-emerald-100/80'
    },
    {
      id: 'class',
      title: 'কোর্স ক্লাস',
      subtitle: 'পুনরাবৃত্ত রুটিন',
      icon: BookOpen,
      type: 'CLASS' as ActivityType,
      bg: 'bg-emerald-50/70 hover:bg-emerald-100/70',
      iconColor: 'text-emerald-700',
      border: 'border-emerald-100/80'
    },
    {
      id: 'jumua',
      title: "জুমু'আ",
      subtitle: 'খুতবাহ ও বয়ান',
      icon: MosqueIcon,
      type: 'JUMUAH' as ActivityType,
      bg: 'bg-emerald-50/70 hover:bg-emerald-100/70',
      iconColor: 'text-emerald-700',
      border: 'border-emerald-100/80'
    },
    {
      id: 'programme',
      title: 'কর্মসূচি',
      subtitle: 'লেকচার ও মাহফিল',
      icon: Mic,
      type: 'PROGRAMME' as ActivityType,
      bg: 'bg-sky-50/70 hover:bg-sky-100/70',
      iconColor: 'text-sky-700',
      border: 'border-sky-100/80'
    },
    {
      id: 'note',
      title: 'নোট',
      subtitle: 'জরুরি খসড়া',
      icon: FileText,
      type: undefined,
      bg: 'bg-amber-50/70 hover:bg-amber-100/70',
      iconColor: 'text-amber-700',
      border: 'border-amber-100/80'
    },
    {
      id: 'contact',
      title: 'যোগাযোগ',
      subtitle: 'আয়োজক বা মসজিদ',
      icon: Users,
      type: undefined,
      bg: 'bg-teal-50/70 hover:bg-teal-100/70',
      iconColor: 'text-teal-700',
      border: 'border-teal-100/80'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 font-bengali">
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">দ্রুত যোগ করুন</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 6-Card Grid (Exact Match to Mockup) */}
        <div className="grid grid-cols-3 gap-2.5 pb-2">
          {quickItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.id, item.type);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl ${item.bg} border ${item.border} transition-all active:scale-95 text-center cursor-pointer group`}
              >
                <div className="mb-2 transition-transform group-hover:scale-110">
                  <Icon size={22} className={item.iconColor} strokeWidth={2} />
                </div>
                <span className="text-xs font-bold text-slate-900 font-heading leading-tight">
                  {item.title}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
