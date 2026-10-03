import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  Mic,
  Calendar as CalIcon,
  Clock,
  MapPin,
  X,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Grid3X3,
  ListFilter,
  ArrowRight,
  Compass,
  Check,
  CalendarDays,
  Flame,
  Layers
} from 'lucide-react';
import { MosqueIcon, MosqueCustomIllustration, QuranRehalIcon, MinbarIcon } from '../../components/icons/IslamicIcons';
import { api } from '../../api/client';
import { Activity } from '../../types';
import { EventDetailsSheet } from '../../components/modals/EventDetailsSheet';
import { toBengaliDigits, formatBanglaDate, formatBanglaTime, getLocalDateString } from '../../utils/bengali';

interface DayScheduleItem {
  id: string | number;
  time: string;
  endTime?: string;
  title: string;
  subtitle: string;
  location?: string;
  type: 'CLASS' | 'JUMUAH' | 'PROGRAMME' | 'MEETING' | 'LECTURE' | 'OTHER';
  status?: string;
  isActive?: boolean;
}

export const CalendarPage: React.FC = () => {
  // Default dynamically to current today date
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getLocalDateString(new Date()));
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 9, 1));
  const [viewMode, setViewMode] = useState<'GRID' | 'TIMELINE'>('GRID');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('ALL');
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Local interactive events state per date - Complete Creative October 2026
  const [localDayEvents, setLocalDayEvents] = useState<Record<string, DayScheduleItem[]>>({
    '2026-10-01': [
      {
        id: 'ev-oct-1-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:১৫',
        title: 'কোরআন হিফজ ও তাজবিদ পর্যালোচনা',
        subtitle: 'সূরা আন-নিসা মাখরাজ ও সিফাত নিরীক্ষণ',
        location: 'অনলাইন স্টুডিও ও জুম',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-oct-1-2',
        time: 'বিকাল ৩:৩০',
        endTime: '১৭:০০',
        title: 'মাসিক দ্বীনি পাঠ্যক্রম ও প্রকাশনা বৈঠক',
        subtitle: 'অনলাইন মাদরাসার ত্রৈমাসিক সিলেবাস পর্যালোচনা',
        location: 'আল-কুরআন একাডেমি কনফারেন্স রুম',
        type: 'MEETING',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-oct-1-3',
        time: 'রাত ৯:০০',
        endTime: '২২:১৫',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৩',
        subtitle: 'আয়াত ১২০-১২৯ ইবরাহিম (আ.)-এর দোয়া ও কাবাগৃহ',
        location: 'অনলাইন লাইভ স্টুডিও',
        type: 'CLASS',
        status: 'সম্পন্ন',
        isActive: false
      }
    ],
    '2026-10-02': [
      {
        id: 'ev-oct-2-1',
        time: 'দুপুর ১২:১৫',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ: সামাজিক সদাচার ও প্রতিবেশীর অধিকার",
        subtitle: 'সোবহানবাগ জামে মসজিদে জুমার বয়ান ও নামাজ',
        location: 'সোবহানবাগ জামে মসজিদ, ধানমন্ডি ২৭',
        type: 'JUMUAH',
        status: 'সম্পন্ন',
        isActive: false
      },
      {
        id: 'ev-oct-2-2',
        time: 'বিকাল ৫:৩০',
        endTime: '১৯:০০',
        title: 'পারিবারিক পরামর্শ ও উন্মুক্ত প্রশ্নোত্তর',
        subtitle: 'মসজিদ কমিটির শুভাকাঙ্ক্ষীদের সাথে উন্মুক্ত মজলিস',
        location: 'সোবহানবাগ মসজিদ লাইব্রেরি',
        type: 'PROGRAMME',
        status: 'সম্পন্ন',
        isActive: false
      }
    ],
    '2026-10-03': [
      {
        id: 'ev-oct-3-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ ও তাজবিদ পাঠদান',
        subtitle: 'নিয়মিত হিফজ শিক্ষার্থীদের ইয়াদ নিরীক্ষণ',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-3-2',
        time: 'বিকাল ৩:০০',
        endTime: '১৬:৩০',
        title: 'জাতীয় সীরাত সেমিনার আয়োজন প্রস্তুতি সভা',
        subtitle: 'আসন্ন সীরাত সেমিনারের অতিথি তালিকা ও প্রবন্ধ বাছাই',
        location: 'ইসলামিক রিসার্চ একাডেমি, ধানমন্ডি',
        type: 'MEETING',
        status: 'চলমান',
        isActive: true
      },
      {
        id: 'ev-oct-3-3',
        time: 'রাত ৯:০০',
        endTime: '২২:১৫',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৪',
        subtitle: 'আয়াত ১৩০-১৪১ তাহবীলুল কিবলা ও মধ্যমপন্থী উম্মাহ',
        location: 'অনলাইন স্টুডিও ও জুম লাইভ',
        type: 'CLASS',
        status: 'আসন্ন',
        isActive: false
      }
    ],
    '2026-10-04': [
      {
        id: 'ev-oct-4-1',
        time: 'সকাল ১০:৩০',
        endTime: '১২:০০',
        title: 'বালাগাত ও আরবি অলংকার শাস্ত্রের মূলনীতি',
        subtitle: 'ইলমুল মাআনী ও বয়ান শাস্ত্রের প্রয়োগিক দরস',
        location: 'উচ্চতর আরবি একাডেমি, ঢাকা',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-4-2',
        time: 'বিকাল ৫:০০',
        endTime: '১৯:৩০',
        title: 'জাতীয় তাফসীরুল কুরআন ও সীরাত কনফারেন্স ২০২৬',
        subtitle: 'সমকালীন পৃথিবীতে নববী জীবনাদর্শের প্রাসঙ্গিকতা',
        location: 'সেন্ট্রাল সেমিনার অডিটোরিয়াম, কাকরাইল',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-05': [
      {
        id: 'ev-oct-5-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ ও তাজবিদ',
        subtitle: 'হৃদয়ে কুরআন ধারণের বৈজ্ঞানিক পদ্ধতি',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-5-2',
        time: 'রাত ৯:০০',
        endTime: '২২:০০',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৫',
        subtitle: 'সবর ও সালাতের মাধ্যমে আল্লাহর সাহায্য প্রার্থনা',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-06': [
      {
        id: 'ev-oct-6-1',
        time: 'সকাল ১১:০০',
        endTime: '১৩:০০',
        title: 'উচ্চতর গবেষণা পরিষদ কারিকুলাম চূড়ান্তকরণ সভা',
        subtitle: 'আধুনিক যুগের ফিকহি গবেষণা নীতিমালা ও প্রকাশনা',
        location: 'গবেষণা ভবন, ধানমন্ডি',
        type: 'MEETING',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-6-2',
        time: 'সন্ধ্যা ৬:৩০',
        endTime: '২০:০০',
        title: 'উচ্চতর হাদিস পাঠদান: মিশকাতুল মাসাবীহ',
        subtitle: 'সনদ ও মতনের সূক্ষ্ম পার্থক্য বিশ্লেষণ',
        location: 'হলকা স্টুডিও, লালমাটিয়া',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-07': [
      {
        id: 'ev-oct-7-1',
        time: 'সকাল ৯:০০',
        endTime: '১০:০০',
        title: 'কোরআন হিফজ ও তাজবিদ',
        subtitle: 'ইখফা ও গুন্নাহর প্রায়োগিক উচ্চারণ',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-7-2',
        time: 'সন্ধ্যা ৭:০০',
        endTime: '২০:১৫',
        title: 'প্যান ভিশন টিভি সরাসরি সম্প্রচার: সমকালীন জিজ্ঞাসা',
        subtitle: 'আধুনিক অর্থব্যবস্থায় সুদমুক্ত জীবন ও প্রশ্নের জবাব',
        location: 'প্যান ভিশন টিভি স্টুডিও, বাংলামোটর',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-7-3',
        time: 'রাত ৯:০০',
        endTime: '২২:০০',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #১৬',
        subtitle: 'পরীক্ষার মাঝে ধৈর্য ও শহীদের মর্যাদা',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-08': [
      {
        id: 'ev-oct-8-1',
        time: 'সকাল ১০:০০',
        endTime: '১১:৩০',
        title: 'বালাগাত ও ফাসাহাহ শাস্ত্রের উন্নত ক্লাস',
        subtitle: 'ইলমুল বাদি ও অলংকারের সৌন্দর্য ও কুরআনিক ব্যবহার',
        location: 'অনলাইন স্টুডিও',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-8-2',
        time: 'রাত ৯:৩০',
        endTime: '২২:৩০',
        title: "আগামীকালের জুমু'আ খুতবাহর নোট ও রেফারেন্স চূড়ান্তকরণ",
        subtitle: 'বাইতুল আমান জামে মসজিদে বয়ানের হাদিস সাজানো',
        location: 'ব্যক্তিগত লাইব্রেরি কক্ষ',
        type: 'MEETING',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-09': [
      {
        id: 'ev-oct-9-1',
        time: 'দুপুর ১২:০০',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ: পারিবারিক শান্তি ও পিতা-মাতার হক",
        subtitle: 'বাইতুল আমান জামে মসজিদে জুমার পূর্ব বয়ান ও সালাত',
        location: 'বাইতুল আমান জামে মসজিদ, ধানমন্ডি',
        type: 'JUMUAH',
        status: 'নিশ্চিত',
        isActive: true
      },
      {
        id: 'ev-oct-9-2',
        time: 'বিকাল ৫:৩০',
        endTime: '১৯:৩০',
        title: 'তরুণ সমাজের মুখোমুখি: ক্যারিয়ার ও নৈতিকতার দ্বৈরথ',
        subtitle: 'আধুনিক পেশাগত জীবনে ইসলামি মূল্যবোধ সেমিনার',
        location: 'ইঞ্জিনিয়ার্স ইনস্টিটিউশন মিলনায়তন, রমনা',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-15': [
      {
        id: 'ev-oct-15-1',
        time: 'দুপুর ২:০০',
        endTime: '২১:৩০',
        title: 'চট্টগ্রাম সফর: ঐতিহাসিক বাৎসরিক সীরাতুন্নবী (সা.) মহাসমাবেশ',
        subtitle: 'জমিয়াতুল ফালাহ ময়দানে প্রধান অতিথি হিসেবে ভাষণ',
        location: 'জমিয়াতুল ফালাহ জাতীয় মসজিদ ময়দান, চট্টগ্রাম',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-16': [
      {
        id: 'ev-oct-16-1',
        time: 'দুপুর ১২:০০',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ: ডিজিটাল যুগে সন্তানের লালন-পালন ও আত্মশুদ্ধি",
        subtitle: 'গুলশান সোসাইটি জামে মসজিদে জুমার খুতবাহ ও নামাজ',
        location: 'গুলশান সোসাইটি জামে মসজিদ, গুলশান ২, ঢাকা',
        type: 'JUMUAH',
        status: 'নিশ্চিত',
        isActive: true
      }
    ],
    '2026-10-23': [
      {
        id: 'ev-oct-23-1',
        time: 'দুপুর ১২:১৫',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ: অর্থনৈতিক সুবিচার, ব্যবসায়িক সততা ও হালাল জীবিকা",
        subtitle: 'উত্তরা সেক্টর ৭ জামে মসজিদে খুতবাহ ও জুমার জামাত',
        location: 'উত্তরা সেক্টর ৭ জামে মসজিদ, উত্তরা',
        type: 'JUMUAH',
        status: 'নিশ্চিত',
        isActive: true
      }
    ],
    '2026-10-28': [
      {
        id: 'ev-oct-28-1',
        time: 'বিকাল ৪:০০',
        endTime: '২০:০০',
        title: 'ইয়ুথ ইসলামিক লিডারশিপ ও নৈতিক জাগরণ কনভেনশন',
        subtitle: 'আইসিসিবি (ICCB) বসুন্ধরায় সারা দেশের তরুণদের সমাবেশ',
        location: 'আইসিসিবি হল ৪, বসুন্ধরা আবাসিক এলাকা, ঢাকা',
        type: 'PROGRAMME',
        status: 'নিশ্চিত',
        isActive: false
      }
    ],
    '2026-10-30': [
      {
        id: 'ev-oct-30-1',
        time: 'সকাল ১১:৪৫',
        endTime: '১৪:০০',
        title: "জুমু'আ খুতবাহ: আখেরাতমুখী জীবনদর্শন ও তাকওয়ার প্রভাব",
        subtitle: 'বায়তুল মোকাররম জাতীয় মসজিদে অতিথি খতীব হিসেবে খুতবাহ',
        location: 'বায়তুল মোকাররম জাতীয় মসজিদ, পল্টন, ঢাকা',
        type: 'JUMUAH',
        status: 'নিশ্চিত',
        isActive: true
      }
    ],
    '2026-10-31': [
      {
        id: 'ev-oct-31-1',
        time: 'সকাল ১১:০০',
        endTime: '১৩:০০',
        title: 'অক্টোবর মাসের কাজের সমাপ্তি ও নভেম্বর কর্মপরিকল্পনা',
        subtitle: 'পিএস ও একাডেমিক রিসার্চ টিমের সাথে মাসিক মূল্যায়ন',
        location: 'ব্যক্তিগত কার্যালয়, লালমাটিয়া',
        type: 'MEETING',
        status: 'নিশ্চিত',
        isActive: false
      },
      {
        id: 'ev-oct-31-2',
        time: 'রাত ৯:০০',
        endTime: '২২:৩০',
        title: 'তাফসিরুল কুরআন ধারাবাহিক দরস: সূরা আল-বাকারাহ #২২',
        subtitle: 'সূরা আল-বাকারাহ সমাপ্তি সেশন ও দোয়া',
        location: 'অনলাইন স্টুডিও ও জুম লাইভ',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ]
  });

  // Modal states
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DayScheduleItem | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTime, setFormTime] = useState('সকাল ৯:০০');
  const [formEndTime, setFormEndTime] = useState('১০:৩০');
  const [formLocation, setFormLocation] = useState('অনলাইন স্টুডিও');
  const [formType, setFormType] = useState<'CLASS' | 'JUMUAH' | 'PROGRAMME' | 'MEETING' | 'LECTURE' | 'OTHER'>('CLASS');
  const [formStatus, setFormStatus] = useState('নিশ্চিত');

  // Month information
  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const curYear = currentMonthDate.getFullYear();
  const curMonthIndex = currentMonthDate.getMonth();
  const curMonthNameBn = monthNamesBn[curMonthIndex];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(curYear, curMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(curYear, curMonthIndex + 1, 1));
  };

  // Dynamically compute the 7-day week containing selectedDateStr
  const weekDays = useMemo(() => {
    const baseDate = new Date(selectedDateStr + 'T00:00:00');
    const dayOfWeek = isNaN(baseDate.getTime()) ? new Date().getDay() : baseDate.getDay();
    const diffToSat = (dayOfWeek + 1) % 7;
    const startOfWeek = new Date(isNaN(baseDate.getTime()) ? new Date() : baseDate);
    startOfWeek.setDate(startOfWeek.getDate() - diffToSat);

    const bNames = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = getLocalDateString(d);
      const count = (events.filter((a) => a.date === dStr).length) || (localDayEvents[dStr]?.length || 0);
      days.push({
        dayName: bNames[i],
        dayNum: d.getDate(),
        dayNumBn: toBengaliDigits(d.getDate()),
        dateStr: dStr,
        isFriday: i === 6,
        count
      });
    }
    return days;
  }, [selectedDateStr, events, localDayEvents]);

  // Compute 7-Column Monthly Calendar Grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(curYear, curMonthIndex, 1);
    const firstDaySatIndex = (firstDay.getDay() + 1) % 7;
    const totalDays = new Date(curYear, curMonthIndex + 1, 0).getDate();
    const prevMonthTotalDays = new Date(curYear, curMonthIndex, 0).getDate();

interface CalendarCell {
  dayNum: number;
  dayNumBn: string;
  dateStr: string;
  isCurrentMonth: boolean;
  isFriday: boolean;
  hasJumuah?: boolean;
  count: number;
}

    const cells: CalendarCell[] = [];

    // Padding from previous month
    for (let i = firstDaySatIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const prevDate = new Date(curYear, curMonthIndex - 1, dNum);
      const dStr = getLocalDateString(prevDate);
      const count = (events.filter((a) => a.date === dStr).length) || (localDayEvents[dStr]?.length || 0);
      cells.push({
        dayNum: dNum,
        dayNumBn: toBengaliDigits(dNum),
        dateStr: dStr,
        isCurrentMonth: false,
        isFriday: cells.length % 7 === 6,
        count
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(curYear, curMonthIndex, d);
      const dStr = getLocalDateString(curDate);
      const count = (events.filter((a) => a.date === dStr).length) || (localDayEvents[dStr]?.length || 0);
      const isFriday = cells.length % 7 === 6;
      const cellDayEvents = localDayEvents[dStr] || events.filter((a) => a.date === dStr);
      const hasJumuah = isFriday || Boolean(cellDayEvents?.some((e: any) => e.type === 'JUMUAH'));

      cells.push({
        dayNum: d,
        dayNumBn: toBengaliDigits(d),
        dateStr: dStr,
        isCurrentMonth: true,
        isFriday,
        hasJumuah,
        count
      });
    }

    // Trailing padding to complete grid (35 or 42 cells)
    const totalCellsNeeded = cells.length > 35 ? 42 : 35;
    const remaining = totalCellsNeeded - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(curYear, curMonthIndex + 1, d);
      const dStr = getLocalDateString(nextDate);
      const count = (events.filter((a) => a.date === dStr).length) || (localDayEvents[dStr]?.length || 0);
      cells.push({
        dayNum: d,
        dayNumBn: toBengaliDigits(d),
        dateStr: dStr,
        isCurrentMonth: false,
        isFriday: cells.length % 7 === 6,
        count
      });
    }

    return cells;
  }, [curYear, curMonthIndex, events, localDayEvents]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/activities');
      const list = res?.activities || (Array.isArray(res) ? res : []);
      setEvents(list);
    } catch (err) {
      console.error('Failed to fetch schedule activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Compute current day items (merging API activities with local interactive items)
  const currentDayEvents: DayScheduleItem[] = useMemo(() => {
    const apiForDay = events
      .filter((a) => a.date === selectedDateStr)
      .map((a) => ({
        id: a.id,
        time: a.start_time ? formatBanglaTime(a.start_time) : 'সকাল ৯:০০',
        endTime: a.end_time ? formatBanglaTime(a.end_time) : undefined,
        title: a.title,
        subtitle: a.topic || a.description || a.location || 'নির্ধারিত কর্মসূচি',
        location: a.location || 'স্থান অনির্ধারিত',
        type: (a.type as any) || 'OTHER',
        status: a.status === 'COMPLETED' ? 'সম্পন্ন' : a.status === 'CONFIRMED' ? 'নিশ্চিত' : 'আসন্ন',
        isActive: false
      }));

    if (apiForDay.length > 0) {
      return apiForDay;
    }

    return localDayEvents[selectedDateStr] || [
      {
        id: `def-${selectedDateStr}-1`,
        time: 'সকাল ১০:০০',
        endTime: '১১:০০',
        title: 'দ্বীনি পাঠ্যক্রম ও মুতালাআ',
        subtitle: 'ব্যক্তিগত অধ্যয়ন, গবেষণা ও কিতাব প্রস্তুতি',
        location: 'ব্যক্তিগত পাঠাগার ও গবেষণা সেল',
        type: 'CLASS',
        status: 'নিশ্চিত',
        isActive: false
      }
    ];
  }, [selectedDateStr, events, localDayEvents]);

  // Filter items by category and search
  const filteredEvents = useMemo(() => {
    return currentDayEvents.filter((ev) => {
      if (selectedFilterType !== 'ALL') {
        if (selectedFilterType === 'CLASS' && ev.type !== 'CLASS') return false;
        if (selectedFilterType === 'JUMUAH' && ev.type !== 'JUMUAH') return false;
        if (selectedFilterType === 'PROGRAMME' && ev.type !== 'PROGRAMME' && ev.type !== 'LECTURE') return false;
        if (selectedFilterType === 'MEETING' && ev.type !== 'MEETING') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchSub = ev.subtitle.toLowerCase().includes(q);
        const matchLoc = (ev.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchLoc) return false;
      }
      return true;
    });
  }, [currentDayEvents, selectedFilterType, searchQuery]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'CLASS':
        return {
          icon: BookOpen,
          color: 'text-[#1C2C0B]',
          bg: 'bg-[#FAF7F2] border-[#E8E2D7]',
          badgeBg: 'bg-[#FAF7F2] text-[#1C2C0B] border-[#D8CFC0]',
          label: 'তাফসির ও ক্লাস'
        };
      case 'JUMUAH':
        return {
          icon: MosqueIcon,
          color: 'text-[#3E5514]',
          bg: 'bg-[#F2F6EC] border-[#D2DEC1]',
          badgeBg: 'bg-[#F2F6EC] text-[#3E5514] border-[#D2DEC1]',
          label: "জুমু'আ খুতবাহ"
        };
      case 'PROGRAMME':
      case 'LECTURE':
        return {
          icon: Mic,
          color: 'text-[#6E3A0D]',
          bg: 'bg-[#FDF5ED] border-[#F3DFC9]',
          badgeBg: 'bg-[#FDF5ED] text-[#6E3A0D] border-[#F3DFC9]',
          label: 'দাওয়াহ কর্মসূচি'
        };
      case 'MEETING':
        return {
          icon: Users,
          color: 'text-[#8A603E]',
          bg: 'bg-[#F9F5F0] border-[#E8E0D5]',
          badgeBg: 'bg-[#F9F5F0] text-[#8A603E] border-[#E8E0D5]',
          label: 'পরামর্শ বৈঠক'
        };
      default:
        return {
          icon: CalIcon,
          color: 'text-[#4D6819]',
          bg: 'bg-[#F4EFEB] border-[#E6E0D6]',
          badgeBg: 'bg-[#F4EFEB] text-[#4D6819] border-[#E6E0D6]',
          label: 'বিশেষ কর্মসূচি'
        };
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: DayScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle);
    setFormTime(item.time);
    setFormEndTime(item.endTime || '১০:৩০');
    setFormLocation(item.location || 'অনলাইন স্টুডিও');
    setFormType(item.type);
    setFormStatus(item.status || 'নিশ্চিত');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (typeof editingItem.id === 'number') {
      try {
        await api.put(`/activities/${editingItem.id}`, {
          title: formTitle,
          topic: formSubtitle,
          location: formLocation,
          status: formStatus === 'সম্পন্ন' ? 'COMPLETED' : 'CONFIRMED'
        });
      } catch (err) {
        console.warn('API update failed, updating local state:', err);
      }
    }

    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      const updated = existing.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formTitle,
              subtitle: formSubtitle,
              time: formTime,
              endTime: formEndTime,
              location: formLocation,
              type: formType,
              status: formStatus
            }
          : item
      );
      return { ...prev, [selectedDateStr]: updated };
    });

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Delete / Cancel Event
  const handleDeleteEvent = async (item: DayScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(`"${item.title}" কর্মসূচিটি মুছে ফেলতে চান?`);
    if (!confirmed) return;

    if (typeof item.id === 'number') {
      try {
        await api.delete(`/activities/${item.id}`);
      } catch (err) {
        console.warn('API delete failed, updating local state:', err);
      }
    }

    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      const filtered = existing.filter((it) => it.id !== item.id);
      return { ...prev, [selectedDateStr]: filtered };
    });

    setEvents((prev) => prev.filter((it) => it.id !== item.id));
    if (selectedEventData?.id === item.id) {
      setIsEventSheetOpen(false);
    }
  };

  // Add New Event for Selected Day
  const handleCreateNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItem: DayScheduleItem = {
      id: `new-${Date.now()}`,
      time: formTime,
      endTime: formEndTime,
      title: formTitle,
      subtitle: formSubtitle || 'বিশেষ শিডিউল',
      location: formLocation,
      type: formType,
      status: formStatus,
      isActive: false
    };

    try {
      const res = await api.post<any>('/activities', {
        title: formTitle,
        topic: formSubtitle,
        date: selectedDateStr,
        start_time: '10:00:00',
        end_time: '11:30:00',
        location: formLocation,
        type: formType,
        status: 'CONFIRMED'
      });
      if (res?.activity?.id) {
        newItem.id = res.activity.id;
      }
    } catch (err) {
      console.warn('API post failed, adding to local state:', err);
    }

    setLocalDayEvents((prev) => {
      const existing = prev[selectedDateStr] || currentDayEvents;
      return { ...prev, [selectedDateStr]: [...existing, newItem] };
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormSubtitle('');
  };

  // Total events in current month
  const totalMonthEventsCount = useMemo(() => {
    return Object.entries(localDayEvents).reduce((acc, [dStr, evs]) => {
      if (dStr.startsWith(`${curYear}-${String(curMonthIndex + 1).padStart(2, '0')}`)) {
        return acc + evs.length;
      }
      return acc;
    }, 0) || 39;
  }, [localDayEvents, curYear, curMonthIndex]);

  // Prestigious upcoming spotlights (strictly today, tomorrow, and future - no past dates)
  const upcomingSpotlights = useMemo(() => {
    const list = [
      {
        day: '০৩',
        month: 'অক্টো',
        dateStr: '2026-10-03',
        icon: BookOpen,
        color: 'text-[#1C2C0B]',
        bg: 'bg-[#FAF7F2]',
        border: 'border-[#E8E2D7]',
        badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        title: 'আজকের দরস: তাফসিরুল কুরআন ধারাবাহিক দরস #১৪',
        subtitle: 'রাত ৯:০০ · অনলাইন স্টুডিও ও জুম লাইভ',
        status: 'আজকে',
        badge: 'আজকের দরস'
      },
      {
        day: '০৪',
        month: 'অক্টো',
        dateStr: '2026-10-04',
        icon: Mic,
        color: 'text-[#6E3A0D]',
        bg: 'bg-[#FDF5ED]',
        border: 'border-[#F3DFC9]',
        badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200',
        title: 'জাতীয় তাফসীরুল কুরআন ও সীরাত কনফারেন্স',
        subtitle: 'বিকাল ৫:০০ · সেন্ট্রাল সেমিনার হল, কাকরাইল',
        status: 'আগামীকাল',
        badge: 'মহাসম্মেলন'
      },
      {
        day: '০৯',
        month: 'অক্টো',
        dateStr: '2026-10-09',
        icon: MosqueIcon,
        color: 'text-[#3E5514]',
        bg: 'bg-[#F2F6EC]',
        border: 'border-[#D2DEC1]',
        badgeBg: 'bg-[#F2F6EC] text-[#3E5514]',
        title: "জুমু'আ খুতবাহ: হালাল উপার্জন ও আর্থিক সততা",
        subtitle: 'দুপুর ১২:০০ · বাইতুল আমান জামে মসজিদ, ধানমন্ডি',
        status: 'নিশ্চিত',
        badge: "জুমু'আ"
      },
      {
        day: '১৫',
        month: 'অক্টো',
        dateStr: '2026-10-15',
        icon: Users,
        color: 'text-[#6E3A0D]',
        bg: 'bg-[#FDF5ED]',
        border: 'border-[#F3DFC9]',
        badgeBg: 'bg-rose-50 text-rose-800 border border-rose-200',
        title: 'চট্টগ্রাম সফর: ঐতিহাসিক সীরাতুন্নবী মহাসমাবেশ',
        subtitle: 'দুপুর ২:০০ · জমিয়াতুল ফালাহ জাতীয় মসজিদ ময়দান',
        status: 'জরুরি সফর',
        badge: 'ভিআইপি সফর'
      },
      {
        day: '১৬',
        month: 'অক্টো',
        dateStr: '2026-10-16',
        icon: MosqueIcon,
        color: 'text-[#3E5514]',
        bg: 'bg-[#F2F6EC]',
        border: 'border-[#D2DEC1]',
        badgeBg: 'bg-[#F2F6EC] text-[#3E5514]',
        title: "জুমু'আ খুতবাহ: ডিজিটাল যুগে সন্তানের লালন-পালন",
        subtitle: 'দুপুর ১২:০০ · গুলশান সোসাইটি জামে মসজিদ',
        status: 'নিশ্চিত',
        badge: "জুমু'আ"
      },
      {
        day: '২৮',
        month: 'অক্টো',
        dateStr: '2026-10-28',
        icon: Mic,
        color: 'text-[#6E3A0D]',
        bg: 'bg-[#FDF5ED]',
        border: 'border-[#F3DFC9]',
        badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200',
        title: 'ইয়ুথ ইসলামিক লিডারশিপ কনভেনশন ২০২৬',
        subtitle: 'বিকাল ৪:০০ · আইসিসিবি (ICCB) বসুন্ধরা, ঢাকা',
        status: 'মহাসমাবেশ',
        badge: 'যুব সম্মেলন'
      },
      {
        day: '৩০',
        month: 'অক্টো',
        dateStr: '2026-10-30',
        icon: MosqueIcon,
        color: 'text-[#3E5514]',
        bg: 'bg-[#F2F6EC]',
        border: 'border-[#D2DEC1]',
        badgeBg: 'bg-[#F2F6EC] text-[#3E5514]',
        title: "জুমু'আ খুতবাহ: আখেরাতমুখী জীবনদর্শন ও তাকওয়া",
        subtitle: 'সকাল ১১:৪৫ · বায়তুল মোকাররম জাতীয় মসজিদ, ঢাকা',
        status: 'নিশ্চিত',
        badge: "জাতীয় জুমু'আ"
      }
    ];

    return list.filter(item => item.dateStr >= todayStr);
  }, [todayStr]);

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto font-bengali">
      {/* =========================================================================
          1. EXECUTIVE CALENDAR CONTROL CENTER HERO BANNER
         ========================================================================= */}
      <div className="rounded-[28px] sm:rounded-[34px] p-6 sm:p-8 bg-gradient-to-br from-[#0F1E16] via-[#162A1F] to-[#0A1610] text-white border border-[#274433] shadow-[0_14px_40px_-8px_rgba(15,30,22,0.4)] relative overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#6E3A0D]/30 blur-3xl pointer-events-none" />

        {/* Background Mosque Watermark */}
        <div className="absolute -right-6 -bottom-10 pointer-events-none opacity-10 text-emerald-200">
          <MosqueCustomIllustration size={230} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            {/* Top Row Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/95 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#E08A28] shadow-[0_0_8px_rgba(224,138,40,0.8)] animate-pulse"></span>
                <span>রবিউস সানি ১৪৪৮ হিজরি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                <CalIcon size={12} className="text-emerald-300" />
                <span>{curMonthNameBn} {toBengaliDigits(curYear)}</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-white tracking-tight drop-shadow-sm">
              দ্বীনি শিডিউল ও কেন্দ্রীয় ক্যালেন্ডার
            </h1>
            <p className="text-xs sm:text-[13px] text-emerald-100/75 max-w-xl leading-relaxed">
              শায়খ মোখতার আহমাদের দরস, জুমু'আ খুতবাহ, দাওয়াহ সেমিনার ও গবেষণা বৈঠকের সর্বাধুনিক ডিজিটাল ডায়েরি
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Grid vs Timeline */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-white text-[#0F1E16] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Grid3X3 size={13} />
                <span>মাসিক গ্রিড</span>
              </button>
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'TIMELINE'
                    ? 'bg-white text-[#0F1E16] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ListFilter size={13} />
                <span>টাইমলাইন</span>
              </button>
            </div>

            {/* Add Event Button in signature chocolate */}
            <button
              onClick={() => {
                setFormTitle('');
                setFormSubtitle('');
                setFormTime('সকাল ১০:০০');
                setFormEndTime('১১:৩০');
                setFormLocation('অনলাইন স্টুডিও');
                setFormType('CLASS');
                setFormStatus('নিশ্চিত');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6E3A0D] hover:bg-[#854610] text-white font-bold text-xs shadow-md border border-amber-600/30 transition active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ নতুন কর্মসূচি</span>
            </button>
          </div>
        </div>

        {/* Month Navigation & Stats Row */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
              title="পূর্ববর্তী মাস"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-white px-2">
              {curMonthNameBn} {toBengaliDigits(curYear)}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
              title="পরবর্তী মাস"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => {
                setCurrentMonthDate(new Date(2026, 9, 1));
                setSelectedDateStr('2026-10-01');
              }}
              className="ml-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-white/90 transition cursor-pointer"
            >
              অক্টোবর ২০২৬-এ যান
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/85">
              মোট: <span className="font-bold text-amber-300 font-bengali">{toBengaliDigits(totalMonthEventsCount)}</span>টি কর্মসূচি
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/85">
              জুমু'আ: <span className="font-bold text-emerald-300 font-bengali">৫</span>টি নিশ্চিত
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH & CATEGORY FILTER TOOLBAR (IN WARM LINEN & CHOCOLATE)
         ========================================================================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E2D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Instant Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="কর্মসূচির নাম, বিষয়বস্তু বা স্থান দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#FAF8F5] rounded-xl border border-[#E6E0D6] text-xs text-[#16221E] placeholder:text-[#586661]/60 outline-none focus:bg-white focus:border-[#6E3A0D] transition"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#586661]" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'সকল কর্মসূচি' },
            { id: 'CLASS', label: 'তাফসির ও ক্লাস' },
            { id: 'JUMUAH', label: "জুমু'আ খুতবাহ" },
            { id: 'PROGRAMME', label: 'দাওয়াহ সেমিনার' },
            { id: 'MEETING', label: 'পরামর্শ বৈঠক' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterType(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedFilterType === cat.id
                  ? 'bg-[#6E3A0D] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E6E0D6] text-[#586661] hover:bg-[#F2ECE1] hover:text-[#16221E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. FULL MONTHLY MATRIX GRID (SHOWS WHEN VIEWMODE === 'GRID')
         ========================================================================= */}
      {viewMode === 'GRID' && (
        <div className="bg-white rounded-[26px] sm:rounded-[30px] p-4 sm:p-6 border border-[#E8E2D7] shadow-xs space-y-4">
          {/* Header Row: Month Name & Legend */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#3E5514]" />
              <h2 className="text-base sm:text-lg font-bold text-[#16221E] font-heading">
                {curMonthNameBn} {toBengaliDigits(curYear)} — পূর্ণাঙ্গ মাসিক ক্যালেন্ডার
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-[#586661]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1C2C0B]"></span> ক্লাস
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E5514]"></span> জুমু'আ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6E3A0D]"></span> কনফারেন্স
              </span>
            </div>
          </div>

          {/* 7-Day Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-[#586661] pb-2 border-b border-[#EFECE6]">
            {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'].map((day, idx) => (
              <div
                key={day}
                className={`py-1 rounded-lg ${
                  idx === 6 ? 'text-[#3E5514] font-black bg-[#F2F6EC]' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 7-Column Grid Matrix */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              const isSelected = selectedDateStr === cell.dateStr;
              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl flex flex-col justify-between items-start transition-all cursor-pointer relative text-left group ${
                    isSelected
                      ? 'bg-[#1C2C0B] text-white shadow-md ring-2 ring-[#E08A28] scale-[1.02] z-10'
                      : !cell.isCurrentMonth
                      ? 'bg-[#FBF9F5]/60 text-slate-300 border border-transparent'
                      : cell.isFriday
                      ? 'bg-[#F4F8EE] border border-[#D5E2C4] text-[#16221E] hover:border-[#3E5514]'
                      : 'bg-[#FAF8F5] border border-[#E8E2D7] text-[#16221E] hover:bg-white hover:border-[#6E3A0D]/40'
                  }`}
                >
                  {/* Top: Day Number & Jumu'ah indicator */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold font-bengali ${
                        isSelected
                          ? 'text-white'
                          : cell.isFriday
                          ? 'text-[#3E5514] font-black'
                          : cell.isCurrentMonth
                          ? 'text-[#16221E]'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumBn}
                    </span>

                    {cell.isFriday && cell.isCurrentMonth && (
                      <span
                        className={`text-[9px] px-1 rounded-sm font-bold flex items-center gap-0.5 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#E3EED5] text-[#3E5514]'
                        }`}
                      >
                        জুমু'আ
                      </span>
                    )}
                  </div>

                  {/* Middle / Bottom: Event count & visual indicators */}
                  {cell.count > 0 && cell.isCurrentMonth && (
                    <div className="w-full mt-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-amber-300'
                              : cell.isFriday
                              ? 'bg-[#3E5514]'
                              : 'bg-[#6E3A0D]'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold font-bengali ${
                            isSelected ? 'text-emerald-200' : 'text-[#586661]'
                          }`}
                        >
                          {toBengaliDigits(cell.count)}টি
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. HORIZONTAL WEEK SELECTOR STRIP (FOR FAST DAY SWITCHING)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8E2D7] shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {weekDays.map((item) => {
            const isActive = selectedDateStr === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C2C0B] text-white shadow-sm font-bold scale-[1.02]'
                    : item.isFriday
                    ? 'bg-[#F4F8EE] text-[#3E5514] border border-[#D5E2C4] hover:bg-[#E8F1DC]'
                    : 'text-[#586661] hover:bg-[#FAF8F5]'
                }`}
              >
                <span
                  className={`text-[11px] font-bold ${
                    isActive ? 'text-amber-300' : item.isFriday ? 'text-[#3E5514]' : 'text-[#586661]'
                  }`}
                >
                  {item.dayName}
                </span>
                <span className="text-sm sm:text-base font-bold mt-0.5 font-bengali">
                  {item.dayNumBn}
                </span>
                {item.count > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isActive ? 'bg-amber-300' : item.isFriday ? 'bg-[#3E5514]' : 'bg-[#6E3A0D]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. SELECTED DAY'S EXECUTIVE SMART TIMELINE
         ========================================================================= */}
      <div className="space-y-4">
        {/* Selected Date Spotlight Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#6E3A0D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6E3A0D]"></span>
              <span>নির্বাচিত দিনের সময়সূচি</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#16221E] font-heading">
              {formatBanglaDate(selectedDateStr)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2D7] text-xs font-bold text-[#586661] font-bengali">
              {toBengaliDigits(filteredEvents.length)}টি কর্মসূচি
            </span>
            <button
              onClick={() => {
                setFormTitle('');
                setFormSubtitle('');
                setFormTime('সকাল ১০:০০');
                setFormEndTime('১১:৩০');
                setFormLocation('অনলাইন স্টুডিও');
                setFormType('CLASS');
                setFormStatus('নিশ্চিত');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C2C0B] hover:bg-[#2E4610] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Continuous Smart Vertical Timeline */}
        <div className="relative pl-5 sm:pl-7 border-l-2 border-[#D8CFC0] ml-3 sm:ml-4 space-y-4 pt-1 pb-1">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const { icon: Icon, color, bg, badgeBg, label } = getIconForType(ev.type);

              return (
                <div key={ev.id} className="relative group">
                  {/* Luminous Node on Timeline Track */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[35px] top-4 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                      ev.status === 'সম্পন্ন'
                        ? 'bg-emerald-600 ring-2 ring-emerald-200'
                        : ev.type === 'JUMUAH'
                        ? 'bg-[#3E5514] ring-2 ring-emerald-300'
                        : 'bg-[#6E3A0D] ring-2 ring-amber-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>

                  {/* Tactile Event Card */}
                  <div
                    onClick={() => {
                      setSelectedEventData({
                        ...ev,
                        date: selectedDateStr,
                        start_time: ev.time,
                        end_time: ev.endTime,
                        category: ev.type,
                        status: ev.status
                      });
                      setIsEventSheetOpen(true);
                    }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D7] shadow-xs hover:border-[#6E3A0D]/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Icon & Meta Details */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 border shadow-2xs`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Time & Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E6E0D6] text-[11px] font-bold text-[#16221E]">
                            <Clock size={11} className="text-[#6E3A0D]" />
                            <span>
                              {ev.time} {ev.endTime ? `— ${ev.endTime}` : ''}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                            {label}
                          </span>

                          {ev.status && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ev.status === 'সম্পন্ন'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-[#F2F6EC] text-[#3E5514] border border-[#D2DEC1]'
                              }`}
                            >
                              {ev.status}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold text-[#16221E] font-heading leading-tight truncate">
                          {ev.title}
                        </h3>

                        {/* Subtitle & Location */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#586661]">
                          <p className="truncate max-w-md">{ev.subtitle}</p>
                          {ev.location && (
                            <span className="inline-flex items-center gap-1 text-[#3E5514] font-medium">
                              <MapPin size={11} />
                              <span className="truncate max-w-[180px]">{ev.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Tactile Actions */}
                    <div
                      className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE6] w-full sm:w-auto justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setSelectedEventData({
                            ...ev,
                            date: selectedDateStr,
                            start_time: ev.time,
                            end_time: ev.endTime,
                            category: ev.type,
                            status: ev.status
                          });
                          setIsEventSheetOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#16221E] text-xs font-bold transition cursor-pointer"
                      >
                        বিবরণী
                      </button>
                      <button
                        onClick={(e) => handleOpenEdit(ev, e)}
                        className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#16221E] flex items-center justify-center transition cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteEvent(ev, e)}
                        className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-rose-600 flex items-center justify-center transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#E8E2D7] space-y-3">
              <CalIcon size={32} className="mx-auto text-slate-300" />
              <p className="text-xs sm:text-sm text-[#586661] font-medium">
                এই দিনে কোনো কর্মসূচি নির্ধারিত নেই।
              </p>
              <button
                onClick={() => {
                  setFormTitle('');
                  setFormSubtitle('');
                  setFormTime('সকাল ১০:০০');
                  setFormEndTime('১১:৩০');
                  setFormLocation('অনলাইন স্টুডিও');
                  setFormType('CLASS');
                  setFormStatus('নিশ্চিত');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-[#6E3A0D] hover:bg-[#854610] text-white text-xs font-bold rounded-full inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition"
              >
                <Plus size={14} />
                <span>+ নতুন কর্মসূচি যোগ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          6. VIP UPCOMING HIGHLIGHTS & TOUR SPOTLIGHTS
         ========================================================================= */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#16221E] font-heading">
              আসন্ন বিশেষ সফর ও জাতীয় মহাসমাবেশ
            </h2>
            <p className="text-xs text-[#586661]">
              গুরুত্বপূর্ণ দাওয়াহ কনফারেন্স, জাতীয় জুমু'আ ও বিশেষ সফরসূচি
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {upcomingSpotlights.map((up) => {
            const Icon = up.icon;
            return (
              <div
                key={up.title}
                onClick={() => setSelectedDateStr(up.dateStr)}
                className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-xs hover:border-[#6E3A0D]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Date Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D7] flex flex-col items-center justify-center shrink-0 group-hover:border-[#6E3A0D]/40 transition">
                    <span className="text-sm font-black text-[#16221E] leading-none font-bengali">
                      {up.day}
                    </span>
                    <span className="text-[10px] text-[#586661] font-bold mt-0.5 leading-none">
                      {up.month}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${up.badgeBg}`}>
                    {up.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#16221E] font-heading line-clamp-1 group-hover:text-[#6E3A0D] transition">
                    {up.title}
                  </h4>
                  <p className="text-[11px] text-[#586661] line-clamp-1">
                    {up.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#6E3A0D] font-bold">
                  <span>তারিখ দেখুন</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          7. MODAL: ADD SCHEDULE ITEM (LUXURY LINEN & CHOCOLATE)
         ========================================================================= */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-bengali"
        >
          <form
            onSubmit={handleCreateNewEvent}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#FAF8F5] rounded-t-[32px] sm:rounded-[32px] shadow-[0_30px_70px_-15px_rgba(28,44,11,0.3)] border border-[#E8E2D7] max-h-[92vh] flex flex-col animate-slide-up-mobile sm:animate-none overflow-hidden safe-area-bottom"
          >
            {/* Grab Handle */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-2.5 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6] bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#6E3A0D] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-[#FDF5ED]">
                  <Plus size={20} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#6E3A0D] text-[10px] font-bold mb-0.5 border border-[#E8E2D7]">
                    {formatBanglaDate(selectedDateStr)}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#16221E] font-heading tracking-tight">
                    নতুন কর্মসূচি যোগ করুন
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E6E0D6] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3.5 p-5 sm:p-6 flex-1 text-[#16221E]">
              {/* Title & Subtitle */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                    কর্মসূচির শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সূরা আন-নূর তাফসির দরস"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                    বিষয়বস্তু বা বিবরণ
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: আয়াত ৩০-৩৫ আলোচনা ও প্রশ্নোত্তর"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] outline-none"
                  />
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#16221E] font-heading block">
                  সময়সূচি
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#586661] block mb-1">
                      শুরুর সময়
                    </label>
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#586661] block mb-1">
                      সমাপ্তির সময়
                    </label>
                    <input
                      type="text"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Status */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#16221E] font-heading block mb-1">
                      কর্মসূচির ধরণ
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs border border-[#E6E0D6] rounded-xl bg-[#FAF8F5] text-[#16221E] font-bold outline-none focus:bg-white focus:border-[#6E3A0D]"
                    >
                      <option value="CLASS">কোর্স ক্লাস</option>
                      <option value="JUMUAH">জুমু'আ খুতবাহ</option>
                      <option value="PROGRAMME">দাওয়াহ কর্মসূচি</option>
                      <option value="MEETING">পরামর্শ বৈঠক</option>
                      <option value="OTHER">অন্যান্য বিষয়</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#16221E] font-heading block mb-1">
                      স্ট্যাটাস
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-[#E6E0D6] rounded-xl bg-[#FAF8F5] text-[#16221E] font-bold outline-none focus:bg-white focus:border-[#6E3A0D]"
                    >
                      <option value="নিশ্চিত">নিশ্চিত</option>
                      <option value="চলমান">চলমান</option>
                      <option value="আসন্ন">আসন্ন</option>
                      <option value="সম্পন্ন">সম্পন্ন</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs">
                <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                  স্থান বা মাধ্যম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অনলাইন স্টুডিও বা মসজিদের নাম"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 px-6 py-3.5 border-t border-[#EFECE6] bg-white">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E6E0D6] rounded-full transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-[#6E3A0D] hover:bg-[#854610] rounded-full cursor-pointer shadow-md transition active:scale-95"
              >
                যোগ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          8. MODAL: EDIT SCHEDULE ITEM (LUXURY LINEN & CHOCOLATE)
         ========================================================================= */}
      {isEditModalOpen && editingItem && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-bengali"
        >
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#FAF8F5] rounded-t-[32px] sm:rounded-[32px] shadow-[0_30px_70px_-15px_rgba(28,44,11,0.3)] border border-[#E8E2D7] max-h-[92vh] flex flex-col animate-slide-up-mobile sm:animate-none overflow-hidden safe-area-bottom"
          >
            {/* Grab Handle */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-2.5 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFECE6] bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1C2C0B] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-[#F2F6EC]">
                  <Edit3 size={18} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#3E5514] text-[10px] font-bold mb-0.5 border border-[#E8E2D7]">
                    {formatBanglaDate(selectedDateStr)}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#16221E] font-heading tracking-tight">
                    কর্মসূচি সম্পাদনা
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E6E0D6] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3.5 p-5 sm:p-6 flex-1 text-[#16221E]">
              {/* Title & Subtitle */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                    কর্মসূচির শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                    বিষয়বস্তু বা বিবরণ
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] outline-none"
                  />
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#16221E] font-heading block">
                  সময়সূচি
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#586661] block mb-1">
                      শুরুর সময়
                    </label>
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#586661] block mb-1">
                      সমাপ্তির সময়
                    </label>
                    <input
                      type="text"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Status */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#16221E] font-heading block mb-1">
                      কর্মসূচির ধরণ
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs border border-[#E6E0D6] rounded-xl bg-[#FAF8F5] text-[#16221E] font-bold outline-none focus:bg-white focus:border-[#6E3A0D]"
                    >
                      <option value="CLASS">কোর্স ক্লাস</option>
                      <option value="JUMUAH">জুমু'আ খুতবাহ</option>
                      <option value="PROGRAMME">দাওয়াহ কর্মসূচি</option>
                      <option value="MEETING">পরামর্শ বৈঠক</option>
                      <option value="OTHER">অন্যান্য বিষয়</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#16221E] font-heading block mb-1">
                      বর্তমান স্ট্যাটাস
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-[#E6E0D6] rounded-xl bg-[#FAF8F5] text-[#16221E] font-bold outline-none focus:bg-white focus:border-[#6E3A0D]"
                    >
                      <option value="নিশ্চিত">নিশ্চিত</option>
                      <option value="চলমান">চলমান</option>
                      <option value="আসন্ন">আসন্ন</option>
                      <option value="সম্পন্ন">সম্পন্ন</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E2D7] shadow-2xs">
                <label className="text-xs font-bold text-[#16221E] font-heading block mb-1.5">
                  স্থান বা মাধ্যম
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E6E0D6] rounded-xl focus:bg-white focus:border-[#6E3A0D] text-[#16221E] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#EFECE6] bg-white">
              <button
                type="button"
                onClick={() => handleDeleteEvent(editingItem)}
                className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <Trash2 size={13} />
                <span>মুছে ফেলুন</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E6E0D6] rounded-full transition cursor-pointer active:scale-95"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-[#1C2C0B] hover:bg-[#2E4610] rounded-full cursor-pointer shadow-md transition active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          9. EVENT DETAILS BOTTOM SHEET
         ========================================================================= */}
      <EventDetailsSheet
        isOpen={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
        eventData={selectedEventData}
        onEdit={(data) => {
          if (data) handleOpenEdit(data);
        }}
        onDelete={(data) => {
          if (data) handleDeleteEvent(data);
        }}
      />
    </div>
  );
};
