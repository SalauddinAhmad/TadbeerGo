import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Circle,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Mic,
  ArrowRight,
  Check,
  Video,
  Phone,
  Sparkles,
  Layers,
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import { MosqueIcon, QuranRehalIcon, MinbarIcon, MosqueCustomIllustration } from '../../components/icons/IslamicIcons';
import { DashboardData, Activity, Course } from '../../types';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EventDetailsSheet } from '../../components/modals/EventDetailsSheet';
import { CourseDetailModal } from '../../components/modals/CourseDetailModal';
import {
  toBengaliDigits,
  formatBanglaTime,
  formatBanglaDate,
  formatBengaliActivityTitle,
  formatBengaliTopic
} from '../../utils/bengali';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('সূরা আল-বাক্বারাহ');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Filter state for Today's plan
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'CLASS' | 'JUMUAH' | 'PROGRAMME'>('ALL');

  // Dynamic Waqt Tracker Calculation
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [waqtInfo, setWaqtInfo] = useState(() => calculateWaqt());

  // Interactive Checklist for Preparation
  const [prepChecklist, setPrepChecklist] = useState<Record<string, boolean>>({
    prep_1: true,
    prep_2: false,
    prep_3: false,
  });

  // Completed activities local toggle state for tactile feedback
  const [completedActivities, setCompletedActivities] = useState<Record<number, boolean>>({});

  function calculateWaqt() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < 270) {
      const diff = 270 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'তাহাজ্জুদ ওয়াক্ত',
        activeKey: 'TAHAJJUD',
        nextWaqt: 'ফজর ০৪:৩০ AM',
        remainingText: `${h > 0 ? toBengaliDigits(h) + 'ঘণ্টা ' : ''}${toBengaliDigits(m)}মি বাকি`,
      };
    } else if (currentMinutes < 342) {
      const diff = 342 - currentMinutes;
      return {
        waqtName: 'ফজর ওয়াক্ত',
        activeKey: 'FAJR',
        nextWaqt: 'সূর্যোদয় ০৫:৪২ AM',
        remainingText: `${toBengaliDigits(diff)}মি বাকি`,
      };
    } else if (currentMinutes < 795) {
      const diff = 795 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'ইশরাক ও চাশত',
        activeKey: 'ISHRAQ',
        nextWaqt: 'যোহর ০১:১৫ PM',
        remainingText: `${toBengaliDigits(h)}ঘণ্টা ${toBengaliDigits(m)}মি বাকি`,
      };
    } else if (currentMinutes < 975) {
      const diff = 975 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'যোহর ওয়াক্ত',
        activeKey: 'DHUHR',
        nextWaqt: 'আসর ০৪:১৫ PM',
        remainingText: `${toBengaliDigits(h)}ঘণ্টা ${toBengaliDigits(m)}মি বাকি`,
      };
    } else if (currentMinutes < 1098) {
      const diff = 1098 - currentMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'আসর ওয়াক্ত',
        activeKey: 'ASR',
        nextWaqt: 'মাগরিব ০৬:১৮ PM',
        remainingText: `${toBengaliDigits(h)}ঘণ্টা ${toBengaliDigits(m)}মি বাকি`,
      };
    } else if (currentMinutes < 1185) {
      const diff = 1185 - currentMinutes;
      return {
        waqtName: 'মাগরিব ওয়াক্ত',
        activeKey: 'MAGHRIB',
        nextWaqt: 'ইশা ০৭:৪৫ PM',
        remainingText: `${toBengaliDigits(diff)}মি বাকি`,
      };
    } else {
      const diff = (24 * 60 - currentMinutes) + 270;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return {
        waqtName: 'ইশা ওয়াক্ত',
        activeKey: 'ISHA',
        nextWaqt: 'ফজর ০৪:৩০ AM',
        remainingText: `${toBengaliDigits(h)}ঘণ্টা ${toBengaliDigits(m)}মি বাকি`,
      };
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setWaqtInfo(calculateWaqt());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, courseRes] = await Promise.all([
        api.get<DashboardData>('/dashboard'),
        api.get<{ courses: Course[] }>('/courses').catch(() => ({ courses: [] }))
      ]);
      setData(dashRes);
      setCourses(courseRes.courses || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Active Tab for Right Bento Schedule: 'TODAY' (default, primary) or 'TOMORROW' (next)
  const [scheduleViewTab, setScheduleViewTab] = useState<'TODAY' | 'TOMORROW'>('TODAY');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Default to today's index in week (starting Saturday = 0 in BD calendar)
  const defaultTodayIndex = useMemo(() => (new Date().getDay() + 1) % 7, []);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(defaultTodayIndex);

  // Generate 7-day week calendar strip starting from current week (Saturday)
  const weekDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
    // In Bangladesh / Islamic context, Saturday is the first day of week
    const diffToSat = (currentDayOfWeek + 1) % 7; 
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - diffToSat);

    const bDayNames = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(saturday);
      d.setDate(saturday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const dateStr = d.toISOString().split('T')[0];
      const isPast = dateStr < todayStr;
      const isTomorrow = dateStr === tomorrowStr;

      days.push({
        index: i,
        dateObj: d,
        dayName: bDayNames[i],
        dayNum: toBengaliDigits(d.getDate()),
        isToday,
        isPast,
        isTomorrow,
        dateStr
      });
    }
    return days;
  }, [todayStr, tomorrowStr]);

  // Today's activities from DB
  const rawTodayTimeline = data?.today_timeline || [];

  // Tomorrow's activities from DB upcoming
  const rawTomorrowTimeline = (data?.upcoming || []).filter(
    (item) => item.date === tomorrowStr
  );

  // Fallback realistic timeline for Today if DB is empty
  const fallbackToday = [
    {
      id: 77,
      user_id: 1,
      type: 'CLASS' as const,
      title: 'কোরআন হিফজ ও তাজবিদ পাঠদান',
      topic: 'সূরা আন-নিসা পারা ৫ তিলাওয়াত ও মাখরাজ',
      date: todayStr,
      start_time: '09:00:00',
      end_time: '10:00:00',
      location: 'অনলাইন স্টুডিও',
      status: 'CONFIRMED' as const,
      priority: 'HIGH' as const,
      preparation_required: false,
      travel_required: false,
      is_private: false,
    },
    {
      id: 78,
      user_id: 1,
      type: 'MEETING' as const,
      title: 'জাতীয় সীরাত সেমিনার আয়োজন প্রস্তুতি সভা',
      topic: 'আন্তর্জাতিক ইসলামিক কনফারেন্স প্রস্তুতি ও সমন্বয়',
      date: todayStr,
      start_time: '15:00:00',
      end_time: '16:30:00',
      location: 'কেন্দ্রীয় পরিষদ মিলনায়তন',
      status: 'CONFIRMED' as const,
      priority: 'MEDIUM' as const,
      preparation_required: true,
      travel_required: true,
      is_private: false,
    },
    {
      id: 79,
      user_id: 1,
      type: 'CLASS' as const,
      title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৪',
      topic: 'আয়াত ১২০-১২৯ ইবরাহিম (আ.)-এর দোয়া ও কাবাগৃহ নির্মাণ',
      date: todayStr,
      start_time: '21:00:00',
      end_time: '22:15:00',
      location: 'অনলাইন লাইভ স্টুডিও',
      status: 'CONFIRMED' as const,
      priority: 'HIGH' as const,
      preparation_required: true,
      travel_required: false,
      is_private: false,
    }
  ];

  // Fallback realistic timeline for Tomorrow if DB is empty
  const fallbackTomorrow = [
    {
      id: 80,
      user_id: 1,
      type: 'CLASS' as const,
      title: 'বালাগাত ও আরবি অলংকার শাস্ত্রের মূলনীতি',
      topic: 'ইলমুল মাআনী ও কুরআনিক অলংকার শাস্ত্রের প্রয়োগ',
      date: tomorrowStr,
      start_time: '10:30:00',
      end_time: '12:00:00',
      location: 'অনলাইন ক্লাসরুম',
      status: 'CONFIRMED' as const,
      priority: 'HIGH' as const,
      preparation_required: true,
      travel_required: false,
      is_private: false,
    },
    {
      id: 81,
      user_id: 1,
      type: 'PROGRAMME' as const,
      title: 'জাতীয় তাফসীরুল কুরআন ও সীরাত কনফারেন্স ২০২৬',
      topic: 'রাসূলুল্লাহ (ﷺ)-এর অনুপম জীবনদর্শন ও আদর্শ',
      date: tomorrowStr,
      start_time: '17:00:00',
      end_time: '19:30:00',
      location: 'সেন্ট্রাল সেমিনার হল, কাকরাইল, ঢাকা',
      status: 'CONFIRMED' as const,
      priority: 'HIGH' as const,
      preparation_required: true,
      travel_required: true,
      is_private: false,
    }
  ];

  const todayTimeline = rawTodayTimeline.length > 0 ? rawTodayTimeline : fallbackToday;
  const tomorrowTimeline = rawTomorrowTimeline.length > 0 ? rawTomorrowTimeline : fallbackTomorrow;

  // STRICT PRIORITY HIERARCHY:
  // 1. TODAY'S uncompleted activities take center stage (date === todayStr && !completedActivities[id])
  // 2. If all today's are completed (or none today), TOMORROW'S first uncompleted activity is shown next
  // 3. Fallback to future upcoming activity (date > todayStr)
  // 4. Any date that has already passed (date < todayStr) is STRICTLY PROHIBITED and filtered out!
  const uncompletedToday = todayTimeline.filter(
    (item) => item.date === todayStr && !completedActivities[item.id]
  );
  const uncompletedTomorrow = tomorrowTimeline.filter(
    (item) => item.date === tomorrowStr && !completedActivities[item.id]
  );

  let primaryUpcoming: any = null;
  let isTodayCommitment = true;

  if (uncompletedToday.length > 0) {
    primaryUpcoming = uncompletedToday[0];
    isTodayCommitment = true;
  } else if (todayTimeline.length > 0 && todayTimeline[0].date === todayStr && !completedActivities[todayTimeline[0].id]) {
    primaryUpcoming = todayTimeline[0];
    isTodayCommitment = true;
  } else if (uncompletedTomorrow.length > 0) {
    primaryUpcoming = uncompletedTomorrow[0];
    isTodayCommitment = false;
  } else if (tomorrowTimeline.length > 0) {
    primaryUpcoming = tomorrowTimeline[0];
    isTodayCommitment = false;
  } else if (data?.next && data.next.date >= todayStr) {
    primaryUpcoming = data.next;
    isTodayCommitment = data.next.date === todayStr;
  } else if (data?.upcoming && data.upcoming.length > 0) {
    const validFuture = data.upcoming.find((a) => a.date >= todayStr);
    if (validFuture) {
      primaryUpcoming = validFuture;
      isTodayCommitment = validFuture.date === todayStr;
    }
  }

  if (!primaryUpcoming && todayTimeline.length > 0) {
    primaryUpcoming = todayTimeline[0];
    isTodayCommitment = true;
  }

  // Active list to show in Right Bento based on scheduleViewTab
  const activeTimeline = scheduleViewTab === 'TODAY' ? todayTimeline : tomorrowTimeline;

  // Filter activities based on selection
  const filteredTimeline = activeTimeline.filter(item => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'CLASS') return item.type === 'CLASS';
    if (activityFilter === 'JUMUAH') return item.type === 'JUMUAH' || item.type === 'KHUTBAH';
    if (activityFilter === 'PROGRAMME') return item.type === 'PROGRAMME' || item.type === 'LECTURE';
    return true;
  });

  const effectiveTimeline = filteredTimeline;

  const handleToggleActivity = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTogglePrep = (key: string) => {
    setPrepChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-[#3E5514]" size={28} />
          <p className="text-xs text-[#586661] font-medium font-heading">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-bengali">
      {/* =========================================================================
          1. EDITORIAL GREETING & STATUS BAR (IMAGE 2 & 3 STYLE)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#16221E] font-heading tracking-tight">
            আসসালামু আলাইকুম
          </h1>
          <p className="text-xs sm:text-[13px] text-[#586661] mt-0.5 font-medium flex items-center gap-1.5">
            <span>আজকের দিনটি বরকতময় হোক</span>
            <span>·</span>
            <span className="font-semibold text-[#3E5514]">{formatBanglaDate(new Date().toISOString().split('T')[0])}</span>
          </p>
        </div>

        {/* Quick Insight Pills (Image 1 Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E6E0D6] shadow-xs text-xs font-semibold text-[#16221E]">
            <span className="w-2 h-2 rounded-full bg-[#3E5514]"></span>
            <span>ওয়াক্ত: {waqtInfo.waqtName}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E6E0D6] shadow-xs text-xs font-semibold text-[#16221E]">
            <BookOpen size={13} className="text-[#3E5514]" />
            <span>সেশন: {toBengaliDigits(effectiveTimeline.length)}টি</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PRIMARY BENTO DUO: HERO FOCUS (LEFT) + DAILY ACTIVITY & WEEK STRIP (RIGHT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── LEFT BENTO: HIGH-END PROFESSIONAL DARK FOREST HERO CARD (DEPTH & GLASS) ── */}
        <div className="lg:col-span-5 rounded-[32px] p-6 sm:p-7 bg-gradient-to-b from-[#142C1F] via-[#0E2218] to-[#0A1A12] border border-[#244835] text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] flex flex-col justify-between relative overflow-hidden group">
          {/* Top Edge Specular Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent pointer-events-none" />

          {/* Subtle Atmospheric Depth Lighting */}
          <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-[#6E3A0D]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Row: Tactile Waqt Glass Pill + Luminous Countdown */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] text-xs font-semibold text-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                <span>{waqtInfo.waqtName}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs font-bold text-emerald-300 font-bengali backdrop-blur-md shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                <Clock size={12} className="text-emerald-400" />
                <span>{waqtInfo.remainingText}</span>
              </div>
            </div>

            {/* Middle: Primary Commitment Headline & Details */}
            <div className="my-6 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]"></span>
                <span>
                  {isTodayCommitment
                    ? 'আজকের পরবর্তী প্রতিশ্রুতি · TODAY\'S FOCUS'
                    : 'আগামীকালের প্রধান সূচি · TOMORROW\'S FOCUS'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-[26px] font-black text-white font-heading leading-tight tracking-tight drop-shadow-sm">
                {formatBengaliActivityTitle(primaryUpcoming?.title)}
              </h2>

              <p className="text-xs sm:text-[13px] text-emerald-100/75 font-medium leading-relaxed">
                {formatBengaliTopic(primaryUpcoming?.topic || primaryUpcoming?.description)}
              </p>

              {/* Time & Venue Meta Box */}
              <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] backdrop-blur-md text-xs font-medium text-white/95 shadow-xs transition">
                  <Clock size={13} className="text-amber-400" />
                  <span>
                    {isTodayCommitment ? 'আজকে ' : 'আগামীকাল '}
                    {primaryUpcoming?.start_time ? formatBanglaTime(primaryUpcoming.start_time) : 'সকাল ৯:০০'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] backdrop-blur-md text-xs font-medium text-white/95 shadow-xs transition">
                  <MapPin size={13} className="text-emerald-400" />
                  <span className="truncate max-w-[200px]">{primaryUpcoming?.location || 'অনলাইন স্টুডিও (জুম)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tactile Action Buttons */}
          <div className="relative z-10 pt-5 mt-4 border-t border-white/[0.1] flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (primaryUpcoming) {
                  setSelectedEventData(primaryUpcoming);
                  setIsEventSheetOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-white to-[#F4F0E8] text-[#0A1A12] font-black text-xs shadow-[0_4px_14px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>বিবরণী দেখুন</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>

            {/* Signature Chocolate Button with Circular Arrow */}
            <button
              onClick={() => onNavigate('calendar')}
              className="inline-flex items-center gap-2.5 pl-4 pr-2 py-1.5 rounded-full bg-gradient-to-b from-[#783E10] to-[#5A2C08] hover:from-[#8B4813] hover:to-[#6B340A] text-white font-bold text-xs shadow-[0_4px_14px_rgba(90,44,8,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-amber-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>সম্পূর্ণ শিডিউল</span>
              <span className="w-6 h-6 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0 shadow-inner">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT BENTO: DAILY ACTIVITY & WEEK STRIP ── */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-7 flex flex-col justify-between bg-white border border-[#E6E0D6] shadow-sm">
          
          {/* Header Row: Title & Day Switcher (Today vs Tomorrow) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#16221E] font-heading">
                    {scheduleViewTab === 'TODAY' ? 'আজকের কর্মপরিকল্পনা' : 'আগামীকালের কর্মপরিকল্পনা'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F2F6EC] text-[#3E5514] border border-[#D2DEC1]">
                    {scheduleViewTab === 'TODAY' ? 'আজকের মূল সূচি' : 'আগামীকালের সূচি'}
                  </span>
                </div>
                <p className="text-xs text-[#586661] mt-0.5">
                  {scheduleViewTab === 'TODAY'
                    ? 'আজকের নির্ধারিত সেশন, ক্লাস ও বৈঠকের সময়সূচি'
                    : 'আগামীকাল রবিবার ৪ অক্টোবর নির্ধারিত সময়সূচি'}
                </p>
              </div>

              {/* Day Switcher Tab (Today vs Tomorrow) */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <div className="flex items-center p-1 bg-[#FAF7F2] rounded-2xl border border-[#E6E0D6] shadow-2xs">
                  <button
                    onClick={() => {
                      setScheduleViewTab('TODAY');
                      setSelectedDayOffset(defaultTodayIndex);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      scheduleViewTab === 'TODAY'
                        ? 'bg-[#3E5514] text-white shadow-xs'
                        : 'text-[#586661] hover:text-[#16221E]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${scheduleViewTab === 'TODAY' ? 'bg-emerald-300' : 'bg-[#3E5514]'}`}></span>
                    <span>আজকের সূচি</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${scheduleViewTab === 'TODAY' ? 'bg-white/20 text-white' : 'bg-[#EAE4D8] text-[#586661]'}`}>
                      {toBengaliDigits(todayTimeline.length)}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setScheduleViewTab('TOMORROW');
                      setSelectedDayOffset((defaultTodayIndex + 1) % 7);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      scheduleViewTab === 'TOMORROW'
                        ? 'bg-[#3E5514] text-white shadow-xs'
                        : 'text-[#586661] hover:text-[#16221E]'
                    }`}
                  >
                    <Clock size={11} />
                    <span>আগামীকাল</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${scheduleViewTab === 'TOMORROW' ? 'bg-white/20 text-white' : 'bg-[#EAE4D8] text-[#586661]'}`}>
                      {toBengaliDigits(tomorrowTimeline.length)}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills and Week Calendar Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <span className="text-xs font-bold text-[#8A9893] uppercase font-mono tracking-wider">
                {scheduleViewTab === 'TODAY' ? 'আজকের সময়সূচি তালিকা' : 'আগামীকালের সূচি তালিকা'}
              </span>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-full border border-[#E6E0D6] self-start sm:self-auto">
                <button
                  onClick={() => setActivityFilter('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activityFilter === 'ALL'
                      ? 'bg-[#3E5514] text-white shadow-xs'
                      : 'text-[#586661] hover:text-[#16221E]'
                  }`}
                >
                  সব
                </button>
                <button
                  onClick={() => setActivityFilter('CLASS')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activityFilter === 'CLASS'
                      ? 'bg-[#3E5514] text-white shadow-xs'
                      : 'text-[#586661] hover:text-[#16221E]'
                  }`}
                >
                  ক্লাস
                </button>
                <button
                  onClick={() => setActivityFilter('JUMUAH')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activityFilter === 'JUMUAH'
                      ? 'bg-[#3E5514] text-white shadow-xs'
                      : 'text-[#586661] hover:text-[#16221E]'
                  }`}
                >
                  জুমু'আ
                </button>
                <button
                  onClick={() => setActivityFilter('PROGRAMME')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activityFilter === 'PROGRAMME'
                      ? 'bg-[#3E5514] text-white shadow-xs'
                      : 'text-[#586661] hover:text-[#16221E]'
                  }`}
                >
                  প্রোগ্রাম
                </button>
              </div>
            </div>

            {/* ── WEEK CALENDAR STRIP (PAST DATES CLEARLY DISABLED & MARKED) ── */}
            <div className="pt-1 pb-2 border-b border-[#F0EBE3]">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {weekDays.map((day) => {
                  const isSelected = selectedDayOffset === day.index;
                  const isPast = day.isPast;

                  return (
                    <button
                      key={day.index}
                      onClick={() => {
                        if (isPast) return; // Do not allow selecting passed days
                        setSelectedDayOffset(day.index);
                        if (day.isToday) {
                          setScheduleViewTab('TODAY');
                        } else if (day.isTomorrow) {
                          setScheduleViewTab('TOMORROW');
                        }
                      }}
                      disabled={isPast}
                      title={isPast ? 'বিগত দিন (অতিক্রান্ত)' : `${day.dayName} ${day.dayNum}`}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition ${
                        isPast
                          ? 'bg-[#FAF8F5]/60 text-[#A0A8A4] opacity-40 cursor-not-allowed border border-transparent'
                          : isSelected
                          ? 'bg-[#3E5514] text-white shadow-sm font-bold cursor-pointer ring-2 ring-[#3E5514]/30'
                          : day.isToday
                          ? 'bg-[#F2F6EC] text-[#3E5514] font-bold border border-[#D2DEC1] cursor-pointer'
                          : day.isTomorrow
                          ? 'bg-[#FDF5ED] text-[#6E3A0D] font-bold border border-[#EAD7C7] cursor-pointer'
                          : 'bg-[#FAF7F2] text-[#586661] hover:bg-[#F3EFE9] cursor-pointer'
                      }`}
                    >
                      <span className={`text-[11px] font-heading ${
                        isPast ? 'text-[#B0B8B4]' : isSelected ? 'text-[#D2DEC1]' : 'text-[#8A9893]'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className="text-sm sm:text-base font-bold font-mono mt-0.5">
                        {day.dayNum}
                      </span>
                      {day.isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3E5514] mt-0.5"></span>
                      )}
                      {day.isTomorrow && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6E3A0D] mt-0.5"></span>
                      )}
                      {isPast && (
                        <span className="text-[9px] text-[#A0A8A4] scale-90">বিগত</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SCHEDULE LIST ROWS ── */}
            <div className="space-y-2.5 pt-1">
              {effectiveTimeline.map((item) => {
                const isCompleted = completedActivities[item.id] || item.status === 'COMPLETED';

                // Determine category icon and colors
                let icon = <BookOpen size={16} />;
                let iconBg = 'bg-[#F2F6EC] text-[#3E5514] border-[#D2DEC1]';
                if (item.type === 'JUMUAH' || item.type === 'KHUTBAH') {
                  icon = <MosqueIcon size={16} />;
                  iconBg = 'bg-[#FDF5ED] text-[#6E3A0D] border-[#EAD7C7]';
                } else if (item.type === 'PROGRAMME' || item.type === 'LECTURE') {
                  icon = <Mic size={16} />;
                  iconBg = 'bg-[#F2F6EC] text-[#3E5514] border-[#D2DEC1]';
                } else if (item.type === 'MEETING') {
                  icon = <Layers size={16} />;
                  iconBg = 'bg-[#FDF5ED] text-[#6E3A0D] border-[#EAD7C7]';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedEventData(item);
                      setIsEventSheetOpen(true);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isCompleted
                        ? 'bg-[#FAF8F5]/80 border-[#E8E2D8] opacity-65'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#D8CFBF] shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Squircle Category Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                        {icon}
                      </div>

                      {/* Title & Timing */}
                      <div className="min-w-0">
                        <h3 className={`text-sm font-bold font-heading truncate ${isCompleted ? 'line-through text-[#8A9893]' : 'text-[#16221E]'}`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#586661]">
                          <span className="font-semibold text-[#3E5514]">
                            {item.start_time ? formatBanglaTime(item.start_time) : 'সকাল ৯:০০'}
                          </span>
                          <span>·</span>
                          <span className="truncate max-w-[200px]">{item.location || 'অনলাইন সেশন'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Interactive Complete Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleToggleActivity(item.id, e)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer border ${
                          isCompleted
                            ? 'bg-[#3E5514] border-[#3E5514] text-white'
                            : 'border-[#D0C7B8] hover:border-[#3E5514] text-transparent hover:text-slate-400'
                        }`}
                        title={isCompleted ? 'সম্পন্ন হয়েছে' : 'সম্পন্ন মার্ক করুন'}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 mt-2 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#586661]">
            <span>
              {scheduleViewTab === 'TODAY'
                ? `আজকের মোট নির্ধারিত সেশন: ${toBengaliDigits(effectiveTimeline.length)}টি`
                : `আগামীকালের নির্ধারিত সেশন: ${toBengaliDigits(effectiveTimeline.length)}টি`}
            </span>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-[#3E5514] font-bold hover:underline cursor-pointer"
            >
              ক্যালেন্ডারে দেখুন →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SECONDARY BENTO TRIAD: JUMU'AH, COURSES & PREPARATION (IMAGE 1 & 3 STYLE)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* ── BENTO CARD 1: জুমু'আ স্পটলাইট (আসন্ন বা আজকের জুমু'আ) ── */}
        <div
          onClick={() => onNavigate('jumua')}
          className="bento-card p-5 bg-[#FDF5ED] border border-[#EAD7C7] shadow-sm hover:border-[#D4B59D] transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          {/* Custom Mosque Watermark in background */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-20">
            <MosqueCustomIllustration size={96} />
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E3A0D] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6E3A0D]" />
                {new Date().getDay() === 5 ? "আজ জুমু'আতুল মুবারক" : "আসন্ন জুমু'আ · ৯ অক্টোবর ২০২৬"}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#6E3A0D] text-white shadow-2xs">
                নিশ্চিত
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-[#6E3A0D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MosqueIcon size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#16221E] font-heading group-hover:text-[#6E3A0D] transition truncate">
                  {data?.upcoming_jumua?.mosque_name || 'বাইতুল আমান জামে মসজিদ'}
                </h3>
                <p className="text-xs text-[#586661] mt-0.5 truncate">
                  {data?.upcoming_jumua?.khutbah_topic || 'পারিবারিক শান্তি, দাম্পত্য বোঝাপড়া ও পিতা-মাতার হক'}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-[#EAD7C7] text-xs space-y-1">
              <div className="flex items-center justify-between text-[#586661]">
                <span>উপস্থিতি সময়:</span>
                <span className="font-bold text-[#16221E]">দুপুর ১২:০০ (খুতবার ৩০ মি. পূর্বে)</span>
              </div>
              <div className="flex items-center justify-between text-[#586661]">
                <span>স্থান:</span>
                <span className="font-medium text-[#16221E]">ধানমন্ডি, ঢাকা</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAD7C7] flex items-center justify-between text-xs text-[#6E3A0D] font-bold relative z-10">
            <span>খুতবাহ ডায়েরি পরিচালনা</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* ── BENTO CARD 2: চলমান কোর্স ও সিলেবাস ট্র্যাকিং ── */}
        <div
          onClick={() => onNavigate('classes')}
          className="bento-card p-5 bg-white border border-[#E6E0D6] shadow-sm hover:border-[#D6CEC2] transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8A9893] uppercase font-mono tracking-wider">
                চলমান কোর্স ও পাঠদান
              </span>
              <span className="text-xs text-[#3E5514] font-bold">
                {toBengaliDigits(courses.length || 2)}টি কোর্স
              </span>
            </div>

            {/* Course 1 Mini Widget */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#16221E]">
                <span className="truncate max-w-[170px]">সূরা আল-বাক্বারাহ তাফসির</span>
                <span className="font-mono text-[#3E5514]">৬৪%</span>
              </div>
              {/* Progress capsule */}
              <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EFE9DF]">
                <div className="bg-[#3E5514] h-full rounded-full transition-all duration-500" style={{ width: '64%' }}></div>
              </div>
              <p className="text-[11px] text-[#586661]">পরবর্তী দরস: আজ রাত ৯:০০</p>
            </div>

            {/* Course 2 Mini Widget */}
            <div className="space-y-1.5 pt-2 border-t border-[#F0EBE3]">
              <div className="flex items-center justify-between text-xs font-bold text-[#16221E]">
                <span className="truncate max-w-[170px]">বালাগাত ও আরবি অলংকার</span>
                <span className="font-mono text-[#6E3A0D]">৪৮%</span>
              </div>
              {/* Progress capsule */}
              <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EFE9DF]">
                <div className="bg-[#6E3A0D] h-full rounded-full transition-all duration-500" style={{ width: '48%' }}></div>
              </div>
              <p className="text-[11px] text-[#586661]">পরবর্তী ক্লাস: আগামীকাল সকাল ১০:৩০</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#3E5514] font-bold">
            <span>কোর্সের রুটিন ও সিলেবাস</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* ── BENTO CARD 3: দাওয়াহ ও লেকচার প্রস্তুতি ডকেট ── */}
        <div className="bento-card p-5 bg-white border border-[#E6E0D6] shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8A9893] uppercase font-mono tracking-wider">
                প্রস্তুতি ডকেট
              </span>
              <span className="text-xs text-[#6E3A0D] font-bold font-mono">
                {toBengaliDigits(Object.values(prepChecklist).filter(Boolean).length)}/{toBengaliDigits(3)}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[#16221E] font-heading line-clamp-1">
                সিরাতুন্নবী ﷺ বিশেষ আলোচনা ও সেমিনার
              </h3>
              <p className="text-[11px] text-[#586661] mt-0.5">
                সেন্ট্রাল সেমিনার হল · ৪ অক্টোবর (আগামীকাল)
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1">
              <div
                onClick={() => handleTogglePrep('prep_1')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE9] transition cursor-pointer border border-[#EFE9DF]"
              >
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                  prepChecklist.prep_1 ? 'bg-[#3E5514] border-[#3E5514] text-white' : 'border-[#C8BFB0]'
                }`}>
                  {prepChecklist.prep_1 && <Check size={11} className="stroke-[3]" />}
                </div>
                <span className={`text-xs ${prepChecklist.prep_1 ? 'line-through text-[#8A9893]' : 'text-[#16221E] font-medium'}`}>
                  হুদাইবিয়ার সন্ধি রেফারেন্স নোট প্রস্তুত
                </span>
              </div>

              <div
                onClick={() => handleTogglePrep('prep_2')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE9] transition cursor-pointer border border-[#EFE9DF]"
              >
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                  prepChecklist.prep_2 ? 'bg-[#3E5514] border-[#3E5514] text-white' : 'border-[#C8BFB0]'
                }`}>
                  {prepChecklist.prep_2 && <Check size={11} className="stroke-[3]" />}
                </div>
                <span className={`text-xs ${prepChecklist.prep_2 ? 'line-through text-[#8A9893]' : 'text-[#16221E] font-medium'}`}>
                  মাল্টিমিডিয়া প্রেজেন্টেশন স্লাইড যাচাই
                </span>
              </div>

              <div
                onClick={() => handleTogglePrep('prep_3')}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE9] transition cursor-pointer border border-[#EFE9DF]"
              >
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                  prepChecklist.prep_3 ? 'bg-[#3E5514] border-[#3E5514] text-white' : 'border-[#C8BFB0]'
                }`}>
                  {prepChecklist.prep_3 && <Check size={11} className="stroke-[3]" />}
                </div>
                <span className={`text-xs ${prepChecklist.prep_3 ? 'line-through text-[#8A9893]' : 'text-[#16221E] font-medium'}`}>
                  আয়োজক কমিটির সাথে সাউন্ড সমন্বয়
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-xs text-[#6E3A0D] font-bold">
            <button
              onClick={() => onNavigate('programmes')}
              className="text-[#6E3A0D] hover:underline cursor-pointer"
            >
              সকল প্রোগ্রাম দেখুন →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MODALS & SHEETS
         ========================================================================= */}
      {selectedEventData && (
        <EventDetailsSheet
          isOpen={isEventSheetOpen}
          onClose={() => setIsEventSheetOpen(false)}
          eventData={selectedEventData}
        />
      )}

      {isCourseModalOpen && (
        <CourseDetailModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          courseTitle={selectedCourseTitle}
        />
      )}
    </div>
  );
};
