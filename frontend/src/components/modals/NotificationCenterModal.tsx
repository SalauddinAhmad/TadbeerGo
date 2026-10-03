import React, { useState } from 'react';
import { X, Bell, Clock, Calendar, CheckCircle2, AlertCircle, BookOpen, Mic, MapPin, Sparkles } from 'lucide-react';
import { MosqueIcon, JumuaMosqueIcon, CourseBookIcon, DawahMicIcon } from '../icons/IslamicIcons';

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
      title: 'আগামীকালের লেকচারের প্রস্তুতি ও রেফারেন্স',
      description: 'সিরাতুন্নবী ﷺ বিশেষ লেকচার · সন্ধ্যা ০৭:৩০, উত্তরা মারকাজ। যাতায়াত: ৪৫ মিনিট (সন্ধ্যা ০৬:৩০ এর মধ্যে রওনা দিন)।',
      time: '১০ মিনিট পূর্বে',
      icon: DawahMicIcon,
      iconColor: 'text-[#D97706]',
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A]',
      actionLabel: 'প্রস্তুতি নোটস দেখুন',
      targetTab: 'programmes',
      unread: true
    },
    {
      id: 'n-2',
      category: 'CLASSES',
      title: 'ক্লাস শুরু হতে ৪ ঘণ্টা বাকি',
      description: 'বালাগাহ ও ফাসাহাহ · ক্লাস #১২ (অধ্যায় ৪ অলংকারশাস্ত্র উদাহরণ)। অনলাইন স্টুডিও ও জুম লাইভ।',
      time: '৪৫ মিনিট পূর্বে',
      icon: CourseBookIcon,
      iconColor: 'text-[#1E7E56]',
      iconBg: 'bg-[#EBF7F2] border-[#D1EBE1]',
      actionLabel: 'সেশনে সরাসরি যুক্ত হোন',
      targetTab: 'classes',
      unread: true
    },
    {
      id: 'n-3',
      category: 'JUMUAH',
      title: "জুমু'আ খুতবাহ নিশ্চিত হয়েছে",
      description: 'সোবহানবাগ জামে মসজিদ, ধানমন্ডি · শুক্রবার দুপুর ০১:১৫। বিষয়: অন্তরের পবিত্রতা ও সমকালীন বাস্তবতা।',
      time: '২ ঘণ্টা পূর্বে',
      icon: JumuaMosqueIcon,
      iconColor: 'text-[#065F46]',
      iconBg: 'bg-[#F0FDF4] border-[#BBF7D0]',
      actionLabel: 'খুতবাহ প্ল্যানার খুলুন',
      targetTab: 'jumua',
      unread: false
    },
    {
      id: 'n-4',
      category: 'PROGRAMMES',
      title: 'জাতীয় যুব সম্মেলন ২০২৬ নিশ্চিত হয়েছে',
      description: 'আয়োজক আব্দুল্লাহ তারিখ নিশ্চিত করেছেন: ২২ সেপ্টেম্বর, সন্ধ্যা ০৬:৩০, ইঞ্জিনিয়ার্স ইনস্টিটিউশন, ঢাকা।',
      time: 'গতকাল',
      icon: CheckCircle2,
      iconColor: 'text-[#0284C7]',
      iconBg: 'bg-[#F0F9FF] border-[#BAE6FD]',
      actionLabel: 'বিস্তারিত দেখুন',
      targetTab: 'programmes',
      unread: false
    }
  ];

  const filtered = activeFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-bengali"
    >
      <div
        className="w-full sm:max-w-lg bg-[#FBF9F5] rounded-t-[32px] sm:rounded-[32px] shadow-[0_30px_70px_-15px_rgba(62,85,20,0.2)] border border-[#E8E2D7] max-h-[92vh] flex flex-col animate-slide-up-mobile sm:animate-none overflow-hidden safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EFECE6] bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3E5514] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-[#F2F6EC]">
              <Bell size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F4EFEB] text-[#3E5514] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>স্মার্ট অ্যাসিস্ট্যান্ট সতর্কতা</span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-heading text-[#16221E] tracking-tight">
                বিজ্ঞপ্তি ও বার্তা কেন্দ্র
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4EFEB] hover:bg-[#EAE4DC] border border-[#E6E0D6] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition cursor-pointer active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Pills Bento Bar */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-b border-[#EFECE6] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'সকল বার্তা' },
            { id: 'REMINDERS', label: 'রিমাইন্ডার' },
            { id: 'CLASSES', label: 'কোর্স ক্লাস' },
            { id: 'JUMUAH', label: "জুমু'আ" },
            { id: 'PROGRAMMES', label: 'কর্মসূচি' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                activeFilter === tab.id
                  ? 'bg-[#3E5514] text-white shadow-xs'
                  : 'bg-white text-[#586661] border border-[#E8E2D8] hover:bg-[#F4EFEB] hover:text-[#16221E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto space-y-3 p-5 sm:p-6 flex-1 text-[#16221E]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8C9893] font-medium bg-white rounded-2xl border border-[#E8E2D8]">
              এই বিভাগে কোনো নতুন বিজ্ঞপ্তি বা বার্তা নেই।
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-[22px] border transition shadow-2xs ${
                    item.unread
                      ? 'bg-white border-[#3E5514]/40 ring-1 ring-[#3E5514]/10'
                      : 'bg-white/80 border-[#E8E2D8]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl ${item.iconBg} ${item.iconColor} border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-black text-[#16221E] font-heading truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[#8C9893] font-bold shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#586661] mt-1 leading-relaxed font-medium">
                        {item.description}
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateTab(item.targetTab);
                        }}
                        className="mt-2.5 text-xs font-black text-[#3E5514] hover:text-[#4D6819] flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
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

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#EFECE6] bg-white flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#F4EFEB] hover:bg-[#ECE5DC] border border-[#E6E0D6] rounded-full transition cursor-pointer active:scale-95"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
