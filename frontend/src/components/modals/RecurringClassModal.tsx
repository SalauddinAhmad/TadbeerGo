import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, Check, Layers, Sparkles } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('2027-01-01');
  const [endDate, setEndDate] = useState('2027-12-31');
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

  const dayLabels: { [key: string]: string } = {
    Sat: 'শনি',
    Sun: 'রবি',
    Mon: 'সোম',
    Tue: 'মঙ্গল',
    Wed: 'বুধ',
    Thu: 'বৃহঃ',
    Fri: 'শুক্র',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 font-bengali">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-[#E4EBE8] max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EBE8]">
          <div>
            <h3 className="text-base font-bold text-[#17211F] font-heading">
              পুনরাবৃত্ত ক্লাসের রুটিন
            </h3>
            <p className="text-xs text-[#6F7D78] mt-0.5">
              পুরো বছরের পাঠ্যক্রম ও ক্যালেন্ডার শিডিউল তৈরি করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#6F7D78] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-3 flex-1 pr-0.5">
          {/* Course Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211F] font-heading block">
              কোর্স নির্বাচন করুন
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-[#F7F9F7] text-xs font-semibold text-[#17211F] outline-none focus:border-[#063F35]"
            >
              <option value="Surah Al-Baqarah">সূরা আল-বাক্বারাহ (তাফসির ও আমল)</option>
              <option value="Quran Hifz & Tajweed">কোরআন হিফজ ও তাজবিদ (বয়স্ক ব্যাচ)</option>
              <option value="Balaghah & Fasahah">বালাগাহ ও ফাসাহাহ (আরবি অলংকারশাস্ত্র)</option>
            </select>
          </div>

          {/* Recurrence Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211F] font-heading block">
              সাপ্তাহিক ক্লাসের দিন ({toBengaliDigits(selectedDays.length)}টি নির্বাচিত)
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#063F35] text-white shadow-xs'
                        : 'bg-[#F7F9F7] text-[#6F7D78] border border-[#E4EBE8] hover:bg-slate-100'
                    }`}
                  >
                    {dayLabels[day] || day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6F7D78] block">শুরুর সময়</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE8] bg-[#F7F9F7] text-xs font-mono font-bold text-[#17211F] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6F7D78] block">শেষের সময়</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE8] bg-[#F7F9F7] text-xs font-mono font-bold text-[#17211F] outline-none"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6F7D78] block">শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE8] bg-[#F7F9F7] text-xs text-[#17211F] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6F7D78] block">সমাপ্তির তারিখ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE8] bg-[#F7F9F7] text-xs text-[#17211F] outline-none"
              />
            </div>
          </div>

          {/* Real-time Calculation Card */}
          <div className="rounded-2xl p-4 bg-[#E8F5F0] border border-[#00A878]/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#063F35] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#063F35] font-heading">
                {toBengaliDigits(estimatedClasses)}টি ক্লাস স্বয়ংক্রিয়ভাবে ক্যালেন্ডারে তৈরি হবে
              </h4>
              <p className="text-[11px] text-[#063F35]/80 mt-0.5">
                আয়াত অগ্রগতি ও হাজিরা তালিকার সাথে স্বয়ংক্রিয়ভাবে যুক্ত হবে
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || selectedDays.length === 0}
              className="flex-1 py-2.5 rounded-full bg-[#063F35] hover:bg-[#042F28] active:scale-95 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'তৈরি হচ্ছে...' : 'নিশ্চিত করুন ও রুটিন তৈরি করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#17211F] text-xs font-semibold transition cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
