import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowRight,
  Radio,
  BookOpen,
  Users,
  Mic,
  Monitor,
  MoreVertical,
  Sparkles,
  Tv
} from 'lucide-react';
import { MosqueIcon, QuranRehalIcon, MinbarIcon } from '../icons/IslamicIcons';
import { EventDetailsSheet } from '../modals/EventDetailsSheet';
import { Activity } from '../../types';
import { toBengaliDigits, formatBanglaTime } from '../../utils/bengali';

interface LiveScheduleHubProps {
  nowActivity: Activity | null;
  nextActivity: Activity | null;
  todayTimeline: Activity[];
  upcomingList: Activity[];
  waqtInfo: {
    waqtName: string;
    activeKey: string;
    nextWaqt: string;
    remainingText: string;
  };
  onNavigate: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const LiveScheduleHub: React.FC<LiveScheduleHubProps> = ({
  nowActivity,
  nextActivity,
  todayTimeline,
  upcomingList,
  onNavigate,
  onOpenAddModal
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parseDateTime = (dateStr?: string, timeStr?: string): Date | null => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const timeParts = (timeStr || '00:00:00').split(':').map(Number);
    const h = timeParts[0] || 0;
    const min = timeParts[1] || 0;
    const s = timeParts[2] || 0;
    return new Date(y, m - 1, d, h, min, s);
  };

  const primaryNext = nextActivity || (todayTimeline.length > 0 ? todayTimeline[0] : upcomingList[0]) || null;

  // Real-time countdown calculation in Bengali
  const countdownText = (() => {
    if (!primaryNext) return '৪ঘণ্টা ১৫মি বাকি';
    const target = parseDateTime(primaryNext.date, primaryNext.start_time);
    if (!target) return '৪ঘণ্টা ১৫মি বাকি';

    const diffMs = target.getTime() - currentTime.getTime();
    if (diffMs <= 0) return 'এখন শুরু হচ্ছে';

    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);

    if (hours > 0) {
      return `${toBengaliDigits(hours)}ঘণ্টা ${toBengaliDigits(minutes)}মি বাকি`;
    }
    return `${toBengaliDigits(minutes)}মি বাকি`;
  })();

  // Mockup fallback items for Today to guarantee the exact 4 items from mockup in Bengali
  const defaultTodayItems = [
    {
      id: 't-1',
      time: 'সকাল ৯:০০',
      title: 'কোরআন হিফজ',
      subtitle: 'অনলাইন ক্লাস · ১ঘণ্টা',
      icon: BookOpen,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      isActive: false
    },
    {
      id: 't-2',
      time: 'দুপুর ২:৩০',
      title: 'কমিটি মিটিং',
      subtitle: 'মসজিদ কমিটি · ধানমন্ডি',
      icon: Users,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      isActive: false
    },
    {
      id: 't-3',
      time: 'বিকাল ৫:০০',
      title: 'বালাগাহ ও ফাসাহাহ',
      subtitle: 'ক্লাস #১২ · অনলাইন · ১ঘণ্টা ৩০মি',
      icon: BookOpen,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      isActive: true // Highlighted in mockup!
    },
    {
      id: 't-4',
      time: 'রাত ৮:০০',
      title: 'বিশেষ দ্বীনি লেকচার',
      subtitle: 'অনলাইন লাইভ প্রোগ্রাম',
      icon: Mic,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      isActive: false
    }
  ];

  // Map real database today timeline if available, otherwise use exact mockup defaults
  const displayTodayItems = todayTimeline.length > 0 ? todayTimeline.map((item, idx) => {
    const isNext = primaryNext?.id === item.id || idx === 0;
    const titleLower = item.title.toLowerCase();
    const isTv = titleLower.includes('tv') || titleLower.includes('টিভি') || titleLower.includes('সম্প্রচার');
    const isQna = titleLower.includes('q&a') || titleLower.includes('প্রশ্নোত্তর') || titleLower.includes('নসীহত');
    const isMeeting = item.type === 'MEETING' || titleLower.includes('meeting') || titleLower.includes('সভা') || titleLower.includes('মিটিং');
    const isJumua = item.type === 'JUMUAH' || titleLower.includes('খুতবাহ');
    const isClass = item.type === 'CLASS' || titleLower.includes('ক্লাস') || titleLower.includes('হিফজ');

    // Dynamic duration calculation
    let durationText = '';
    if (item.start_time && item.end_time) {
      const [sh, sm] = item.start_time.split(':').map(Number);
      const [eh, em] = item.end_time.split(':').map(Number);
      const diffMins = (eh * 60 + em) - (sh * 60 + sm);
      if (diffMins > 0) {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        if (h > 0 && m > 0) durationText = `${toBengaliDigits(h)}ঘণ্টা ${toBengaliDigits(m)}মি`;
        else if (h > 0) durationText = `${toBengaliDigits(h)}ঘণ্টা`;
        else durationText = `${toBengaliDigits(m)}মি`;
      }
    }

    const subtitleParts = [
      item.topic || (isTv ? 'টিভি লাইভ' : isQna ? 'প্রশ্নোত্তর পর্ব' : isMeeting ? 'সমন্বয় সভা' : isClass ? 'পাঠ্যক্রম' : 'দ্বীনি কর্মসূচি'),
      item.location ? (item.location.length > 25 ? item.location.slice(0, 25) + '...' : item.location) : 'অনলাইন',
      durationText
    ].filter(Boolean);

    let Icon: React.ElementType = BookOpen;
    let iconColor = 'text-emerald-700';
    let iconBg = 'bg-emerald-50';

    if (isTv) {
      Icon = Tv;
      iconColor = 'text-purple-600';
      iconBg = 'bg-purple-50';
    } else if (isQna) {
      Icon = Radio;
      iconColor = 'text-rose-600';
      iconBg = 'bg-rose-50';
    } else if (isMeeting) {
      Icon = Users;
      iconColor = 'text-amber-600';
      iconBg = 'bg-amber-50';
    } else if (isJumua) {
      Icon = MosqueIcon;
      iconColor = 'text-teal-700';
      iconBg = 'bg-teal-50';
    } else if (isClass) {
      Icon = BookOpen;
      iconColor = 'text-emerald-700';
      iconBg = 'bg-emerald-50';
    } else {
      Icon = Mic;
      iconColor = 'text-blue-600';
      iconBg = 'bg-blue-50';
    }

    return {
      id: String(item.id),
      time: formatBanglaTime(item.start_time),
      title: item.title,
      subtitle: subtitleParts.join(' · '),
      icon: Icon,
      iconColor,
      iconBg,
      isActive: isNext,
      rawActivity: item
    };
  }) : defaultTodayItems;

  return (
    <div className="space-y-4">
      {/* =========================================================================
          1. IF AN ACTIVITY IS ACTIVELY LIVE (DYNAMIC ISLAND BANNER)
         ========================================================================= */}
      {nowActivity && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl px-4 py-3 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Radio size={18} className="text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider block opacity-90 leading-none">
                এখন চলছে
              </span>
              <h4 className="text-xs sm:text-sm font-bold truncate mt-0.5 font-heading">
                {nowActivity.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="shrink-0 px-3.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-full shadow-xs hover:bg-white/90 transition cursor-pointer flex items-center gap-1"
          >
            <span>যুক্ত হোন</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* =========================================
          2. NEXT COMMITMENT HERO CARD (EXACT MATCH TO MOCKUP PHONE 1)
         ========================================= */}
      <div className="rounded-[28px] overflow-hidden relative shadow-[0_12px_32px_-6px_rgba(6,63,53,0.35)] text-white p-5 sm:p-6 bg-gradient-to-br from-[#063F35] via-[#042F28] to-[#021F1B] border border-[#00A878]/30 font-bengali">
        {/* Subtle Islamic Mosque Arch Silhouette Watermark in Background */}
        <div className="absolute right-0 bottom-0 top-0 w-44 pointer-events-none opacity-[0.14] flex items-center justify-end pr-2">
          <svg viewBox="0 0 200 240" fill="currentColor" className="w-full h-full text-emerald-200">
            {/* Mosque dome silhouette */}
            <path d="M100 20 C100 20 120 70 160 90 L160 240 L40 240 L40 90 C80 70 100 20 100 20 Z" />
            <path d="M160 110 L190 120 L190 240 L160 240 Z" />
            <path d="M40 110 L10 120 L10 240 L40 240 Z" />
            <circle cx="100" cy="12" r="6" />
          </svg>
        </div>

        {/* Floating Circular Frosted Glass Book Icon (Exact Mockup) */}
        <div
          onClick={() => {
            setSelectedEventData(primaryNext);
            setIsEventSheetOpen(true);
          }}
          className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#00A878] shadow-inner hidden sm:flex cursor-pointer hover:scale-105 transition"
        >
          <BookOpen size={22} strokeWidth={2} />
        </div>

        {/* Top Row: NEXT COMMITMENT + Countdown Pill */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 font-heading">
            পরবর্তী কর্মসূচি
          </span>

          {/* Frosted Countdown Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium shadow-2xs font-bengali">
            <Clock size={12} className="text-[#00A878]" />
            <span>{countdownText}</span>
          </div>
        </div>

        {/* Main Time & Title */}
        <div className="relative z-10 mt-3 space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            {primaryNext ? formatBanglaTime(primaryNext.start_time) : 'বিকাল ৫:০০'}
          </div>
          <div className="text-base sm:text-lg font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <span>{primaryNext?.title || 'বালাগাহ ও ফাসাহাহ'}</span>
          </div>
          <div className="text-xs text-emerald-200/80 font-medium">
            {primaryNext?.topic || 'ক্লাস #১২'}
          </div>
        </div>

        {/* Metadata Chips: Online Class • 1h 30m */}
        <div className="relative z-10 mt-3.5 flex items-center gap-4 text-xs text-emerald-100/90 font-medium">
          <span className="flex items-center gap-1.5">
            <Monitor size={14} className="text-[#00A878]" />
            <span>{primaryNext?.location || 'অনলাইন ক্লাস'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#00A878]" />
            <span>১ঘণ্টা ৩০মি</span>
          </span>
        </div>

        {/* Prepare Subtext & Bottom Action Button */}
        <div className="relative z-10 mt-3 pt-3 border-t border-emerald-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-100/80 font-medium truncate">
            <BookOpen size={13} className="text-[#00A878] shrink-0" />
            <span className="truncate">প্রস্তুতি: অধ্যায় ৪ · বালাগাত উদাহরণ</span>
          </div>

          <button
            onClick={() => {
              setSelectedEventData(primaryNext);
              setIsEventSheetOpen(true);
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 active:scale-95 text-[#063F35] font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <span>সেশন দেখুন</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. TODAY'S SCHEDULE TIMELINE (EXACT MATCH TO MOCKUP PHONE 1)
         ========================================================================= */}
      <div className="space-y-2 pt-1 font-bengali">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            আজকের শিডিউল
          </h2>
          <span className="text-xs font-medium text-slate-400 font-heading">
            বৃহস্পতিবার, ১৭ সেপ্টেম্বর
          </span>
        </div>

        {/* Connected Vertical Timeline Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="relative">
            {/* Continuous Vertical Timeline Line — sits under the dots column */}
            <div className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-emerald-100 z-0"></div>

            <div className="space-y-1">
              {displayTodayItems.map((item) => {
                const Icon = item.icon as React.ElementType;
                return (
                  <div
                    key={item.id}
                    className="relative flex items-center gap-3 group cursor-pointer hover:bg-slate-50/70 px-2 py-2 -mx-2 rounded-xl transition"
                    onClick={() => {
                      if ('rawActivity' in item && (item as any).rawActivity) {
                        setSelectedEventData((item as any).rawActivity as Activity);
                        setIsEventSheetOpen(true);
                      } else {
                        onNavigate('calendar');
                      }
                    }}
                  >
                    {/* Timeline Node Dot — fixed position on the line */}
                    <div className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shrink-0 flex items-center justify-center">
                      {item.isActive && (
                        <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping"></div>
                      )}
                      {item.isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      )}
                    </div>

                    {/* Time Label */}
                    <div className="w-[58px] sm:w-[64px] shrink-0 text-left">
                      <span
                        className={`text-[11px] leading-tight font-heading block ${
                          item.isActive
                            ? 'font-black text-emerald-700'
                            : 'font-semibold text-slate-500'
                        }`}
                      >
                        {item.time}
                      </span>
                    </div>

                    {/* Event Icon Squircle */}
                    <div
                      className={`w-8 h-8 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-[12px] sm:text-xs truncate font-heading leading-tight ${
                          item.isActive
                            ? 'font-bold text-slate-900'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium leading-tight">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Right Arrow or Three Dots */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if ('rawActivity' in item && (item as any).rawActivity) {
                          setSelectedEventData((item as any).rawActivity as Activity);
                          setIsEventSheetOpen(true);
                        } else {
                          onNavigate('calendar');
                        }
                      }}
                      className="text-slate-200 hover:text-slate-500 p-1 transition cursor-pointer shrink-0"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Full Schedule Button (Mockup Exact Pill) */}
          <button
            onClick={() => onNavigate('calendar')}
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>সম্পূর্ণ শিডিউল দেখুন</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Interactive Event Details Sheet */}
      <EventDetailsSheet
        isOpen={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
        eventData={selectedEventData}
        onEdit={() => {
          setIsEventSheetOpen(false);
          onNavigate('calendar');
        }}
      />
    </div>
  );
};
