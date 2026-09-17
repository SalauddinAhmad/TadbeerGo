import React, { useState } from 'react';
import { X, Bell, Clock, Calendar, CheckCircle2, AlertCircle, BookOpen, Mic, MapPin } from 'lucide-react';
import { MosqueIcon } from '../icons/IslamicIcons';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'REMINDERS' | 'CLASSES' | 'JUMUAH' | 'PROGRAMMES'>('ALL');

  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n-1',
      category: 'REMINDERS',
      title: 'আগামীকালের লেকচারের প্রস্তুতি প্রয়োজন',
      description: 'সিরাতুন্নবী ﷺ বিশেষ লেকচার · সন্ধ্যা ৭:৩০, উত্তরা ইসলামিক সেন্টার। যাতায়াত: ৪৫ মিনিট (সন্ধ্যা ৬:৩০ এর মধ্যে রওনা দিন)।',
      time: '১০ মিনিট পূর্বে',
      icon: Mic,
      iconColor: 'text-[#E8A317]',
      iconBg: 'bg-amber-50',
      actionLabel: 'প্রস্তুতি দেখুন',
      targetTab: 'programmes',
      unread: true
    },
    {
      id: 'n-2',
      category: 'CLASSES',
      title: 'ক্লাস শুরু হতে ৪ ঘণ্টা বাকি',
      description: 'বালাগাহ ও ফাসাহাহ · ক্লাস #১২ (অধ্যায় ৪ অলংকারশাস্ত্র উদাহরণ)। অনলাইন স্টুডিও ও জুম লাইভ।',
      time: '৪৫ মিনিট পূর্বে',
      icon: BookOpen,
      iconColor: 'text-[#00A878]',
      iconBg: 'bg-[#E8F5F0]',
      actionLabel: 'সেশনে যুক্ত হোন',
      targetTab: 'classes',
      unread: true
    },
    {
      id: 'n-3',
      category: 'JUMUAH',
      title: "জুমু'আ খুতবাহ নিশ্চিত হয়েছে",
      description: 'বাইতুল আমান জামে মসজিদ, ধানমন্ডি · শুক্রবার দুপুর ১:১৫। বিষয়: অন্তরের পবিত্রতা ও আত্মশুদ্ধি।',
      time: '২ ঘণ্টা পূর্বে',
      icon: MosqueIcon,
      iconColor: 'text-[#063F35]',
      iconBg: 'bg-[#E8F5F0]',
      actionLabel: 'প্ল্যানার খুলুন',
      targetTab: 'jumua',
      unread: false
    },
    {
      id: 'n-4',
      category: 'PROGRAMMES',
      title: 'ইয়ুথ কনফারেন্স ২০২৬ নিশ্চিত হয়েছে',
      description: 'আয়োজক আব্দুল্লাহ তারিখ নিশ্চিত করেছেন: ২২ সেপ্টেম্বর, সন্ধ্যা ৬:৩০, মিরপুর, ঢাকা।',
      time: 'গতকাল',
      icon: CheckCircle2,
      iconColor: 'text-[#3978D6]',
      iconBg: 'bg-blue-50',
      actionLabel: 'বিস্তারিত দেখুন',
      targetTab: 'programmes',
      unread: false
    }
  ];

  const filtered = activeFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 font-bengali">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-[#E4EBE8] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EBE8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F5F0] text-[#063F35] flex items-center justify-center">
              <Bell size={16} />
            </div>
            <h3 className="text-base font-bold text-[#17211F] font-heading">বিজ্ঞপ্তি ও বার্তা কেন্দ্র</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#6F7D78] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'সকল' },
            { id: 'REMINDERS', label: 'রিমাইন্ডার' },
            { id: 'CLASSES', label: 'ক্লাস' },
            { id: 'JUMUAH', label: "জুমু'আ" },
            { id: 'PROGRAMMES', label: 'কর্মসূচি' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#063F35] text-white shadow-xs'
                  : 'bg-slate-100 text-[#6F7D78] hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto space-y-2.5 py-1 flex-1 pr-0.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9AA6A2]">
              এই বিভাগে কোনো নতুন বিজ্ঞপ্তি নেই।
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    item.unread
                      ? 'bg-white border-[#00A878]/30 shadow-xs'
                      : 'bg-slate-50/60 border-[#E4EBE8]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                      <Icon size={17} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#17211F] font-heading truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[#9AA6A2] font-mono shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#6F7D78] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab(item.targetTab);
                        }}
                        className="mt-2 text-xs font-bold text-[#063F35] hover:text-[#00A878] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
