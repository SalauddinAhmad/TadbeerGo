import React, { useState } from 'react';
import { X, BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, Video, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { CourseBookIcon } from '../icons/IslamicIcons';
import { toBengaliDigits } from '../../utils/bengali';

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  isOpen,
  onClose,
  courseTitle = 'সূরা আল-বাক্বারাহ (তাফসির ও আমল)'
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLASSES' | 'NOTES' | 'RESOURCES'>('OVERVIEW');

  if (!isOpen) return null;

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
                <span>পাঠ্যক্রম ও সিলেবাস বিশ্লেষণ</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-heading text-[#16221E] tracking-tight">
                {courseTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4EFEB] hover:bg-[#EAE4DC] border border-[#E6E0D6] flex items-center justify-center text-[#586661] hover:text-[#16221E] transition cursor-pointer active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 p-5 sm:p-6 flex-1 text-[#16221E]">
          {/* Progress Bar & Stats Bento Card */}
          <div className="bg-white rounded-[24px] p-4.5 border border-[#E8E2D8] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#16221E]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3E5514]" />
                পাঠ্যক্রম অগ্রগতি ট্র্যাকার
              </span>
              <span className="text-[#3E5514] bg-[#F2F6EC] px-2.5 py-0.5 rounded-full text-[11px] font-black border border-[#D2DEC1]">
                {toBengaliDigits(75)}টির মধ্যে {toBengaliDigits(48)}টি সম্পন্ন ({toBengaliDigits(64)}%)
              </span>
            </div>
            <div className="w-full bg-[#FAF8F5] border border-[#E8E2D8] h-2.5 rounded-full overflow-hidden p-0.5">
              <div className="bg-[#3E5514] h-full rounded-full transition-all duration-500" style={{ width: '64%' }}></div>
            </div>
          </div>

          {/* Segmented Bento Tabs */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D8]">
            {[
              { key: 'OVERVIEW', label: 'সারসংক্ষেপ' },
              { key: 'CLASSES', label: 'ক্লাস তালিকা' },
              { key: 'NOTES', label: 'শায়খের নোটস' },
              { key: 'RESOURCES', label: 'রিসোর্স ও কিতাব' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#3E5514] text-white shadow-xs'
                    : 'text-[#586661] hover:text-[#16221E] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Next Class Spotlight Card */}
              <div className="rounded-[24px] p-5 bg-[#3E5514] text-white space-y-3.5 shadow-md">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#D2DEC1]">
                  <span className="uppercase tracking-wider">পরবর্তী নির্ধারিত ক্লাস</span>
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-white border border-white/10">
                    আগামীকাল
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black font-heading leading-tight">
                    ক্লাস #{toBengaliDigits(49)}: আয়াত ৪২–৪৮
                  </h3>
                  <p className="text-xs text-white/75 mt-1 font-medium">
                    অনলাইন স্টুডিও ও জুম লাইভ · সকাল ০৯:০০ – ১০:৩০
                  </p>
                </div>
                <button
                  onClick={() => window.open('https://zoom.us', '_blank')}
                  className="w-full py-2.5 rounded-full bg-white text-[#3E5514] font-black text-xs shadow-sm hover:bg-[#F2F6EC] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Video size={14} className="text-[#3E5514]" />
                  <span>ক্লাসে সরাসরি যুক্ত হোন</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Lesson Progression Bento Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-[22px] p-3.5 border border-[#E8E2D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#8C9893] block">পূর্ববর্তী পাঠ</span>
                  <span className="text-xs font-black text-[#16221E] mt-0.5 block font-heading">আয়াত ৩৫–৪১</span>
                  <span className="text-[11px] text-[#1E7E56] font-bold mt-1 inline-block">✓ সফলভাবে সম্পন্ন</span>
                </div>
                <div className="bg-white rounded-[22px] p-3.5 border border-[#E8E2D8] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#8C9893] block">পরবর্তী পাঠ</span>
                  <span className="text-xs font-black text-[#16221E] mt-0.5 block font-heading">আয়াত ৪২–৪৮</span>
                  <span className="text-[11px] text-[#E28743] font-bold mt-1 inline-block">● নির্ধারিত প্রস্তুতি</span>
                </div>
              </div>

              {/* Recent Classes History */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-[#16221E] font-heading">
                  সাম্প্রতিক ক্লাসের ইতিহাস ও শিক্ষাদান সারসংক্ষেপ
                </h4>
                <div className="space-y-2.5">
                  {[
                    { num: `ক্লাস #${toBengaliDigits(48)}`, verses: 'আয়াত ৩৫–৪১', note: 'আয়াত ৩৭–৩৯ এর তাফসির ও শানে নুযুল নিয়ে বিস্তারিত আলোচনা ও আরবি অলংকার বিশ্লেষণ।', status: 'সম্পন্ন' },
                    { num: `ক্লাস #${toBengaliDigits(47)}`, verses: 'আয়াত ২৮–৩৪', note: 'আদম (আ.) এর সৃষ্টি ও ফেরেশতাদের আনুগত্য বিষয়ক বিশ্লেষণ এবং আধুনিক প্রেক্ষাপটে শিক্ষা।', status: 'সম্পন্ন' },
                    { num: `ক্লাস #${toBengaliDigits(46)}`, verses: 'আয়াত ২২–২৭', note: 'মশার উপমা এবং কোরআনের হেদায়েত লাভের সার্বজনীন পথনির্দেশনা।', status: 'সম্পন্ন' }
                  ].map((cls, idx) => (
                    <div key={idx} className="bg-white rounded-[20px] p-3.5 border border-[#E8E2D8] shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#16221E] font-heading">{cls.num} • {cls.verses}</span>
                        <span className="text-[10px] font-bold text-[#1E7E56] bg-[#EBF7F2] px-2.5 py-0.5 rounded-full border border-[#D1EBE1]">
                          {cls.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#586661] leading-relaxed">
                        {cls.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: CLASSES */}
          {activeTab === 'CLASSES' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-[#586661] font-bold">
                <span>মোট {toBengaliDigits(75)}টি মডিউল</span>
                <span className="text-[#1E7E56]">শিক্ষার্থী ব্যাচ ২০২৬</span>
              </div>
              <div className="space-y-2">
                {[49, 50, 51, 52].map(n => (
                  <div key={n} className="p-3.5 rounded-2xl bg-white border border-[#E8E2D8] shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[#16221E] font-heading">ক্লাস #{toBengaliDigits(n)}</h4>
                      <p className="text-[11px] text-[#586661] mt-0.5">সাপ্তাহিক শনি ও সোমবারের সান্ধ্যকালীন সেশন</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1 rounded-full border border-[#FDE68A]">
                      নির্ধারিত
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: NOTES */}
          {activeTab === 'NOTES' && (
            <div className="space-y-3 text-xs text-[#586661] animate-in fade-in duration-150">
              <div className="p-4 bg-white rounded-2xl border border-[#E8E2D8] shadow-2xs space-y-1.5">
                <h4 className="font-black text-[#16221E] font-heading text-xs">শায়খের ব্যক্তিগত লেকচার নোটস ও তাফসির রেফারেন্স</h4>
                <p className="leading-relaxed">
                  ৩৫ নম্বর আয়াত থেকে সমকালীন পারিবারিক কাঠামো, দাম্পত্য সমঝোতা এবং শয়তানের বিভ্রান্তি নিরসনে কোরআনিক হেদায়াতের প্রায়োগিক দিকসমূহের ওপর বিশেষ আলোকপাত করা হয়েছে।
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: RESOURCES */}
          {activeTab === 'RESOURCES' && (
            <div className="space-y-2.5 text-xs text-[#586661] animate-in fade-in duration-150">
              <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D8] shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-black text-[#16221E] font-heading text-xs">তাফসিরে ইবনে কাসির (সূরা আল-বাক্বারাহ খণ্ড)</h4>
                  <p className="text-[11px] text-[#8C9893] mt-0.5">আরবি মূল ও বাংলা অনুবাদ সংস্করণ · ৪.২ মেগাবাইট</p>
                </div>
                <ArrowRight size={16} className="text-[#1E7E56]" />
              </div>
            </div>
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
