import React, { useEffect, useState } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Mic,
  ArrowRight
} from 'lucide-react';
import { MosqueIcon, QuranRehalIcon } from '../../components/icons/IslamicIcons';
import { DashboardData, Activity } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LiveScheduleHub } from '../../components/dashboard/LiveScheduleHub';
import { EventDetailsSheet } from '../../components/modals/EventDetailsSheet';
import { CourseDetailModal } from '../../components/modals/CourseDetailModal';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('Surah Al-Baqarah');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Dynamic Prayer Waqt Tracker Calculation
  const [waqtInfo, setWaqtInfo] = useState(() => calculateWaqt());

  function calculateWaqt() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < 270) {
      const diff = 270 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'তাহাজ্জুদ',
        activeKey: 'TAHAJJUD',
        nextWaqt: 'ফজর ০৪:৩০ AM',
        remainingText: `${h > 0 ? h + 'h ' : ''}${m}m`,
      };
    } else if (currentMinutes < 342) {
      const diff = 342 - currentMinutes;
      return {
        waqtName: 'ফজর ওয়াক্ত',
        activeKey: 'FAJR',
        nextWaqt: 'সূর্যোদয় ০৫:৪২ AM',
        remainingText: `${diff}m left`,
      };
    } else if (currentMinutes < 795) {
      const diff = 795 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'ইশরাক / চাশত',
        activeKey: 'ISHRAQ',
        nextWaqt: 'যোহর ০১:১৫ PM',
        remainingText: `${h}h ${m}m`,
      };
    } else if (currentMinutes < 975) {
      const diff = 975 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'যোহর ওয়াক্ত',
        activeKey: 'DHUHR',
        nextWaqt: 'আসর ০৪:১৫ PM',
        remainingText: `${h}h ${m}m`,
      };
    } else if (currentMinutes < 1098) {
      const diff = 1098 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'আসর ওয়াক্ত',
        activeKey: 'ASR',
        nextWaqt: 'মাগরিব ০৬:১৮ PM',
        remainingText: `${h}h ${m}m`,
      };
    } else if (currentMinutes < 1185) {
      const diff = 1185 - currentMinutes;
      return {
        waqtName: 'মাগরিব ওয়াক্ত',
        activeKey: 'MAGHRIB',
        nextWaqt: 'ইশা ০৭:৪৫ PM',
        remainingText: `${diff}m left`,
      };
    } else {
      const diff = (24 * 60 - currentMinutes) + 270;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'ইশা ওয়াক্ত',
        activeKey: 'ISHA',
        nextWaqt: 'ফজর ০৪:৩০ AM',
        remainingText: `${h}h ${m}m`,
      };
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setWaqtInfo(calculateWaqt());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get<DashboardData>('/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-emerald-800" size={28} />
          <p className="text-xs text-slate-500 font-medium">Loading Assistant...</p>
        </div>
      </div>
    );
  }

  const todayList = data?.today_timeline || [];
  const upcomingList = data?.upcoming || [];

  return (
    <div className="space-y-5 pb-8">
      {/* =========================================================================
          1. PRIMARY HUB: NEXT COMMITMENT + TODAY'S SCHEDULE TIMELINE
         ========================================================================= */}
      <LiveScheduleHub
        nowActivity={data?.now || null}
        nextActivity={data?.next || null}
        todayTimeline={todayList}
        upcomingList={upcomingList}
        waqtInfo={waqtInfo}
        onNavigate={onNavigate}
        onOpenAddModal={() => {}}
      />

      {/* =========================================================================
          2. THIS FRIDAY (EXACT MATCH TO MOCKUP PHONE 1)
         ========================================================================= */}
      <div className="space-y-2 font-bengali">
        <div
          onClick={() => onNavigate('jumua')}
          className="flex items-center justify-between px-1 cursor-pointer group"
        >
          <h3 className="text-base font-bold text-slate-900 font-heading">
            এই শুক্রবার
          </h3>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition" />
        </div>

        {/* Friday Jumu'ah Card */}
        <div
          onClick={() => {
            setSelectedEventData({
              title: "জুমু'আ খুতবাহ ও নামাজ",
              topic: 'বাইতুল আমান জামে মসজিদ',
              location: 'ধানমন্ডি, ঢাকা',
              start_time: '13:15:00',
              date: '2026-09-18',
              category: 'JUMUAH',
              status: 'CONFIRMED',
              notes: 'খুতবাহর ৩০ মিনিট পূর্বে উপস্থিত হয়ে মসজিদ কমিটির সাথে আলোচনা সম্পন্ন করতে হবে।'
            });
            setIsEventSheetOpen(true);
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-sm hover:border-emerald-200 transition cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Mint Green Mosque Squircle Icon */}
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <MosqueIcon size={22} />
            </div>

            {/* Title & Details */}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 font-heading truncate">
                বাইতুল আমান জামে মসজিদ
              </h4>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                জুমু'আ খুতবাহ ও নামাজ · দুপুর ১:১৫
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-slate-400" />
                <span>ধানমন্ডি, ঢাকা</span>
              </p>
            </div>
          </div>

          {/* Confirmed Pill Badge */}
          <div className="shrink-0">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs font-heading">
              নিশ্চিত
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. ACTIVE COURSES (EXACT MATCH TO MOCKUP PHONE 1)
         ========================================================================= */}
      <div className="space-y-2 font-bengali">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            চলমান কোর্সসমূহ
          </h3>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer font-heading"
          >
            সব দেখুন
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Course 1: Surah Al-Baqarah */}
          <div
            onClick={() => {
              setSelectedCourseTitle('সূরা আল-বাক্বারাহ');
              setIsCourseModalOpen(true);
            }}
            className="bg-white rounded-2xl p-3.5 border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-sm hover:border-emerald-200 transition cursor-pointer space-y-2.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                <BookOpen size={16} strokeWidth={2} />
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                  সূরা আল-বাক্বারাহ
                </h4>
                <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                  ৬৪%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div>
                <span className="block text-[9px] text-slate-400">পরবর্তী ক্লাস</span>
                <span className="text-slate-600 font-semibold">আগামীকাল · সকাল ৯:০০</span>
              </div>
              <ChevronRight size={12} className="text-slate-300" />
            </div>
          </div>

          {/* Course 2: Quran Hifz */}
          <div
            onClick={() => {
              setSelectedCourseTitle('কোরআন হিফজ ও তাজবিদ');
              setIsCourseModalOpen(true);
            }}
            className="bg-white rounded-2xl p-3.5 border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-sm hover:border-blue-200 transition cursor-pointer space-y-2.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shadow-2xs">
                <BookOpen size={16} strokeWidth={2} />
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                  কোরআন হিফজ
                </h4>
                <div className="text-xs font-bold text-blue-700 font-mono mt-0.5">
                  ৪৮%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div>
                <span className="block text-[9px] text-slate-400">পরবর্তী ক্লাস</span>
                <span className="text-slate-600 font-semibold">আজ · সন্ধ্যা ৭:৩০</span>
              </div>
              <ChevronRight size={12} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. PREPARATION (EXACT MATCH TO MOCKUP PHONE 1)
         ========================================================================= */}
      <div className="space-y-2 font-bengali">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            প্রস্তুতি
          </h3>
          <button
            onClick={() => onNavigate('programmes')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer font-heading"
          >
            সব দেখুন
          </button>
        </div>

        {/* Preparation Card */}
        <div
          onClick={() => {
            setSelectedEventData({
              title: 'সিরাতুন্নবী ﷺ বিশেষ আলোচনা ও সেমিনার',
              topic: 'হুদাইবিয়ার সন্ধি ও নেতৃত্ব বিকাশের অনুপম শিক্ষা',
              location: 'উত্তরা ইসলামিক সেন্টার',
              start_time: '19:30:00',
              date: '2026-09-20',
              category: 'LECTURE',
              status: 'CONFIRMED',
              notes: 'মাল্টিমিডিয়া সাউন্ড চেক করার জন্য সেশনের ৪৫ মিনিট পূর্বে উপস্থিত থাকুন।'
            });
            setIsEventSheetOpen(true);
          }}
          className="bg-white rounded-2xl p-3.5 border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-sm hover:border-amber-200 transition cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Amber Mic Squircle Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Mic size={20} strokeWidth={2} />
            </div>

            {/* Title & Timing */}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading truncate">
                সিরাতুন্নবী ﷺ বিশেষ লেকচার
              </h4>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                শনিবার, ২০ সেপ্টেম্বর · সন্ধ্যা ৭:৩০
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs font-heading">
              ৩টি কাজ বাকি
            </span>
            <ChevronRight size={14} className="text-slate-300" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. INSPIRATIONAL QUOTE BANNER (EXACT MATCH TO MOCKUP INSET)
         ========================================= */}
      <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-r from-[#0e3824] via-[#0c3120] to-[#082216] text-white shadow-sm border border-emerald-800/30 font-bengali">
        {/* Subtle Mosque Silhouette Watermark */}
        <div className="absolute right-0 bottom-0 top-0 w-32 pointer-events-none opacity-[0.15] flex items-center justify-end pr-1">
          <svg viewBox="0 0 160 140" fill="currentColor" className="w-full h-full text-emerald-200">
            <path d="M80 10 C80 10 95 40 120 50 L120 140 L40 140 L40 50 C65 40 80 10 80 10 Z" />
            <circle cx="80" cy="6" r="4" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-emerald-50 font-heading italic tracking-wide">
              "উত্তম পরিকল্পনাই অর্থপূর্ণ জীবনের সোপান"
            </p>
            <div className="w-16 h-0.5 bg-amber-400/60 rounded-full mt-1"></div>
          </div>
        </div>
      </div>

      {/* Interactive Course Detail Modal */}
      <CourseDetailModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseTitle={selectedCourseTitle}
      />

      {/* Interactive Event Details Sheet */}
      <EventDetailsSheet
        isOpen={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
        eventData={selectedEventData}
        onEdit={(event) => {
          setIsEventSheetOpen(false);
          onNavigate('calendar');
        }}
        onDelete={(event) => {
          setIsEventSheetOpen(false);
          onNavigate('calendar');
        }}
      />
    </div>
  );
};
