import React, { useState } from 'react';
import { X, Calendar, Clock, Layers, Sparkles, Check, BookOpen } from 'lucide-react';
import { CourseBookIcon } from '../icons/IslamicIcons';
import { toBengaliDigits } from '../../utils/bengali';

interface RecurringClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecurringClassModal: React.FC<RecurringClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedCourse, setSelectedCourse] = useState('Surah Al-Baqarah');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sat', 'Mon', 'Wed']);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2027-09-30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays(days =>
      days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    );
  };

  // Calculate projected classes: 52 weeks * selected days count
  const estimatedClasses = Math.max(1, selectedDays.length * 52);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 400);
  };

  const dayLabels: { [key: string]: { bn: string; fullName: string } } = {
    Sat: { bn: 'শনি', fullName: 'শনিবার' },
    Sun: { bn: 'রবি', fullName: 'রবিবার' },
    Mon: { bn: 'সোম', fullName: 'সোমবার' },
    Tue: { bn: 'মঙ্গল', fullName: 'মঙ্গলবার' },
    Wed: { bn: 'বুধ', fullName: 'বুধবার' },
    Thu: { bn: 'বৃহঃ', fullName: 'বৃহস্পতিবার' },
    Fri: { bn: 'শুক্র', fullName: 'শুক্রবার' },
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins <= 0) return null;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0 && mins > 0) return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট`;
    if (hours > 0) return `${toBengaliDigits(hours)} ঘণ্টা`;
    return `${toBengaliDigits(mins)} মিনিট`;
  };

  const durationStr = calculateDuration();

  const courses = [
    {
      id: 'Surah Al-Baqarah',
      title: 'সূরা আল-বাক্বারাহ (তাফসির ও আমল)',
      subtitle: 'নিয়মিত তাফসিরুল কুরআন পাঠ্যক্রম · ব্যাচ ০৪',
      enrolled: '১৪২ জন শিক্ষার্থী'
    },
    {
      id: 'Quran Hifz & Tajweed',
      title: 'কোরআন হিফজ ও সহিহ তাজবিদ',
      subtitle: 'উন্নত তারতিল ও মশক ক্লাস · সান্ধ্যকালীন সেশন',
      enrolled: '৮৫ জন শিক্ষার্থী'
    },
    {
      id: 'Balaghah & Fasahah',
      title: 'বালাগাহ ও ফাসাহাহ (আরবি অলংকারশাস্ত্র)',
      subtitle: 'উচ্চতর আরবি ব্যাকরণ ও সাহিত্য চর্চা',
      enrolled: '৬৪ জন শিক্ষার্থী'
    }
  ];

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
              <CourseBookIcon size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F4EFEB] text-[#3E5514] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>পাঠ্যক্রম অটোমেশন · রুটিন জেনারেটর</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#16221E] font-heading tracking-tight">
                পুনরাবৃত্ত ক্লাসের রুটিন
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

        {/* Form Body with Bento Grid Sections */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 p-5 sm:p-6 flex-1 text-[#16221E]">
          {/* ========================================================
              SECTION 1: COURSE SELECTION BENTO CARD
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#3E5514]" />
                কোর্স নির্বাচন করুন
              </label>
              <span className="text-[11px] text-[#8C9893]">নির্ধারিত পাঠ্যক্রম</span>
            </div>

            <div className="space-y-2">
              {courses.map((course) => {
                const isSelected = selectedCourse === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#3E5514] border-[#3E5514] text-white shadow-sm ring-2 ring-[#3E5514]/20'
                        : 'bg-[#FAF8F5] border-[#EAE4DC] text-[#16221E] hover:bg-white hover:border-[#3E5514]/40'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-black truncate">{course.title}</div>
                      <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-white/70' : 'text-[#586661]'}`}>
                        {course.subtitle} · {course.enrolled}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-[#3E5514]' : 'border border-[#D1C9BE] text-transparent'
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              SECTION 2: WEEKLY SCHEDULE DAYS BENTO CARD
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3E5514]" />
                সাপ্তাহিক ক্লাসের দিন
              </label>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F2F6EC] text-[#3E5514] text-[11px] font-bold border border-[#D2DEC1]">
                {toBengaliDigits(selectedDays.length)}টি দিন নির্বাচিত
              </span>
            </div>

            {/* 7 Circular Day Pills */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-3 text-center rounded-2xl text-xs font-black transition-all duration-150 cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[#3E5514] text-white shadow-sm ring-2 ring-[#3E5514]/20'
                        : 'bg-[#FAF8F5] text-[#586661] border border-[#E8E2D8] hover:bg-white hover:text-[#16221E]'
                    }`}
                  >
                    <span>{dayLabels[day]?.bn || day}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-[#6E3A0D]' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-[#586661] text-center pt-1 font-medium">
              নির্বাচিত দিনসমূহ: {selectedDays.map(d => dayLabels[d]?.fullName).join(' • ') || 'কোনো দিন নির্বাচিত নেই'}
            </div>
          </div>

          {/* ========================================================
              SECTION 3: CLASS TIME & DURATION BENTO CARD
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <Clock size={14} className="text-[#E28743]" />
                ক্লাসের সময় ও স্থায়িত্ব
              </span>
              {durationStr && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold border border-[#FDE68A]">
                  {durationStr} / সেশন
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1">
                  শুরুর সময়
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E0D6] bg-[#FAF8F5] text-xs font-bold text-[#16221E] outline-none focus:bg-white focus:border-[#1E7E56] shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1">
                  সমাপ্তির সময়
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E0D6] bg-[#FAF8F5] text-xs font-bold text-[#16221E] outline-none focus:bg-white focus:border-[#1E7E56] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 4: SEMESTER DATE RANGE BENTO CARD
             ======================================================== */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16221E] font-heading flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1E7E56]" />
                ক্যালেন্ডার ও মেয়াদের পরিসর
              </span>
              <span className="text-[11px] text-[#8C9893]">চলতি পাঠ্যক্রম চক্র</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1">
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E0D6] bg-[#FAF8F5] text-xs font-bold text-[#16221E] outline-none focus:bg-white focus:border-[#1E7E56] shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#586661] block mb-1">
                  সমাপ্তির তারিখ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E0D6] bg-[#FAF8F5] text-xs font-bold text-[#16221E] outline-none focus:bg-white focus:border-[#1E7E56] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 5: LIVE PROJECTION SUMMARY BENTO TILE
             ======================================================== */}
          <div className="rounded-[24px] p-4.5 bg-[#3E5514] text-white shadow-md flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#F2F6EC] flex items-center justify-center shrink-0 shadow-inner">
              <Layers size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-[#D2DEC1] uppercase tracking-wider mb-0.5">
                স্বয়ংক্রিয় প্রজেকশন সামারি
              </div>
              <h4 className="text-sm font-black font-heading leading-snug">
                {toBengaliDigits(estimatedClasses)}টি ক্লাস স্বয়ংক্রিয়ভাবে ক্যালেন্ডারে তৈরি হবে
              </h4>
              <p className="text-[11px] text-white/80 mt-1 font-medium leading-relaxed">
                আয়াত অগ্রগতি ট্র্যাকার ও শিক্ষার্থী হাজিরা তালিকার সাথে স্বয়ংক্রিয়ভাবে যুক্ত থাকবে।
              </p>
            </div>
          </div>

          {/* ========================================================
              SECTION 6: TACTILE ACTIONS FOOTER
             ======================================================== */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-1 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-[#586661] hover:text-[#16221E] bg-[#F4EFEB] hover:bg-[#ECE5DC] border border-[#E6E0D6] rounded-full transition cursor-pointer active:scale-95"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedDays.length === 0}
              className="px-7 py-2.5 text-xs font-bold text-white bg-[#3E5514] hover:bg-[#4D6819] rounded-full shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              <Sparkles size={14} className="text-[#FDF5ED]" />
              <span>{isSubmitting ? 'প্রস্তুত হচ্ছে...' : 'নিশ্চিত করুন ও রুটিন তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
