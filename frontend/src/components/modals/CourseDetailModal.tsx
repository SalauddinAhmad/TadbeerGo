import React, { useState } from 'react';
import { X, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, Video, FileText, ArrowRight } from 'lucide-react';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  courseTitle = 'Surah Al-Baqarah'
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLASSES' | 'NOTES' | 'RESOURCES'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-[#E4EBE8] max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4EBE8] font-bengali">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5F0] text-[#063F35] font-mono">
              কোর্স বিবরণ
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00A878] font-mono">
              ৬৪% সম্পন্ন
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#6F7D78] transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 py-3 flex-1 pr-0.5 font-bengali">
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-bold font-heading text-[#17211F] leading-tight">
              {courseTitle}
            </h2>
            <p className="text-xs text-[#6F7D78] mt-0.5 font-medium">
              তাফসির · অনুধাবন · বাস্তবায়ন
            </p>
          </div>

          {/* Progress Bar & Stats */}
          <div className="bg-[#F7F9F7] rounded-2xl p-3.5 border border-[#E4EBE8] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#17211F]">
              <span>পাঠ্যক্রম অগ্রগতি</span>
              <span className="font-mono text-[#00A878]">৭৫টির মধ্যে ৪৮টি ক্লাস সম্পন্ন (৬৪%)</span>
            </div>
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div className="bg-[#00A878] h-full rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>

          {/* Segmented Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { key: 'OVERVIEW', label: 'সারসংক্ষেপ' },
              { key: 'CLASSES', label: 'ক্লাসসমূহ' },
              { key: 'NOTES', label: 'নোটস' },
              { key: 'RESOURCES', label: 'রিসোর্স' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-[#063F35] shadow-xs'
                    : 'text-[#6F7D78] hover:text-[#17211F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Next Class Spotlight Card */}
              <div className="rounded-2xl p-4 bg-[#063F35] text-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-300/90 font-mono">
                  <span>পরবর্তী ক্লাস</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-white">আগামীকাল</span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading">ক্লাস #৪৯: আয়াত ৪২–৪৮</h3>
                  <p className="text-xs text-emerald-100/80 mt-0.5">অনলাইন স্টুডিও ও জুম লাইভ · সকাল ৯:০০ – ১০:৩০</p>
                </div>
                <button
                  onClick={() => window.open('https://zoom.us', '_blank')}
                  className="w-full py-2 rounded-full bg-white text-[#063F35] font-bold text-xs shadow-sm hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ক্লাসে যুক্ত হোন</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Lesson Progression */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F7F9F7] rounded-xl p-3 border border-[#E4EBE8]">
                  <span className="text-[10px] uppercase font-bold text-[#6F7D78] font-mono block">পূর্ববর্তী পাঠ</span>
                  <span className="text-xs font-bold text-[#17211F] mt-0.5 block">আয়াত ৩৫–৪১</span>
                  <span className="text-[10px] text-[#00A878] font-semibold mt-1 block">✓ সম্পন্ন</span>
                </div>
                <div className="bg-[#F7F9F7] rounded-xl p-3 border border-[#E4EBE8]">
                  <span className="text-[10px] uppercase font-bold text-[#6F7D78] font-mono block">পরবর্তী পাঠ</span>
                  <span className="text-xs font-bold text-[#17211F] mt-0.5 block">আয়াত ৪২–৪৮</span>
                  <span className="text-[10px] text-[#E8A317] font-semibold mt-1 block">নির্ধারিত</span>
                </div>
              </div>

              {/* Recent Classes History */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F7D78] font-mono">
                  সাম্প্রতিক ক্লাসের ইতিহাস
                </h4>
                <div className="space-y-2">
                  {[
                    { num: 'ক্লাস #৪৮', verses: 'আয়াত ৩৫–৪১', note: 'আয়াত ৩৭–৩৯ এর তাফসির ও শানে নুযুল নিয়ে বিস্তারিত আলোচনা।', status: 'সম্পন্ন' },
                    { num: 'ক্লাস #৪৭', verses: 'আয়াত ২৮–৩৪', note: 'আদম (আ.) এর সৃষ্টি ও ফেরেশতাদের আনুগত্য বিষয়ক বিশ্লেষণ।', status: 'সম্পন্ন' },
                    { num: 'ক্লাস #৪৬', verses: 'আয়াত ২২–২৭', note: 'মশার উদাহরণ এবং কোরআনের হেদায়েত লাভের পথ।', status: 'সম্পন্ন' }
                  ].map((cls, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-3 border border-[#E4EBE8] shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17211F] font-heading">{cls.num} • {cls.verses}</span>
                        <span className="text-[10px] font-bold text-[#00A878] bg-[#E8F5F0] px-2 py-0.5 rounded-full font-mono">
                          {cls.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6F7D78] leading-relaxed">
                        শিক্ষাদানের নোট: "{cls.note}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: CLASSES */}
          {activeTab === 'CLASSES' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-[#6F7D78]">
                <span>মোট ৭৫টি সিলেবাস মডিউল</span>
                <span className="font-bold text-[#063F35]">শিক্ষার্থী ব্যাচ ২০২৬</span>
              </div>
              <div className="space-y-2">
                {[49, 50, 51, 52].map(n => (
                  <div key={n} className="p-3 rounded-xl border border-[#E4EBE8] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#17211F]">ক্লাস #{n}</h4>
                      <p className="text-[10px] text-[#6F7D78]">সাপ্তাহিক শনি ও সোমবারের সেশন</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#E8A317] bg-amber-50 px-2.5 py-0.5 rounded-full">
                      নির্ধারিত
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: NOTES */}
          {activeTab === 'NOTES' && (
            <div className="space-y-2.5 text-xs text-[#6F7D78] animate-in fade-in duration-150">
              <div className="p-3 bg-[#F7F9F7] rounded-xl border border-[#E4EBE8]">
                <h4 className="font-bold text-[#17211F] mb-1">Scholar Lecture Notes</h4>
                <p>Focus on rhetoric nuances and contemporary applications for family structure in verse 35.</p>
              </div>
            </div>
          )}

          {/* Tab 4: RESOURCES */}
          {activeTab === 'RESOURCES' && (
            <div className="space-y-2 text-xs text-[#6F7D78] animate-in fade-in duration-150">
              <div className="p-3 bg-[#F7F9F7] rounded-xl border border-[#E4EBE8] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#17211F]">Tafsir Ibn Kathir PDF (Surah 2)</h4>
                  <p className="text-[10px] text-[#9AA6A2]">Arabic & Bengali Edition • 4.2 MB</p>
                </div>
                <ArrowRight size={14} className="text-[#063F35]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E4EBE8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#17211F] text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
