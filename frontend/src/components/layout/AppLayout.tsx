import React, { useState } from 'react';
import {
  Bell,
  Calendar as CalendarIcon,
  LogOut,
  Plus,
  ShieldCheck,
  Search,
  Menu,
  X,
  ChevronRight,
  Home as HomeIcon,
  LayoutGrid,
  Settings,
  Sparkles
} from 'lucide-react';
import {
  MosqueIcon,
  QuranRehalIcon,
  CrescentStarIcon,
  RubElHizbIcon,
  HalqaCircleIcon,
  MihrabIcon,
  MinbarIcon
} from '../icons/IslamicIcons';
import { useAuth } from '../../context/AuthContext';
import { AddActivityModal } from '../modals/AddActivityModal';
import { QuickAddModal } from '../modals/QuickAddModal';
import { PwaInstallModal } from '../modals/PwaInstallModal';
import { NotificationCenterModal } from '../modals/NotificationCenterModal';
import { RecurringClassModal } from '../modals/RecurringClassModal';
import { ActivityType } from '../../types';
import { TadbeerLogo } from '../common/TadbeerLogo';

interface AppLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
  unreadCount?: number;
  onRefresh?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  onRefresh,
}) => {
  const { user, logout, isOwner } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<ActivityType>('PROGRAMME');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  const navTabs = [
    { id: 'dashboard', label: 'হোম', icon: HomeIcon, shortLabel: 'হোম' },
    { id: 'calendar', label: 'শিডিউল', icon: CalendarIcon, shortLabel: 'শিডিউল' },
    { id: 'classes', label: 'কোর্স ও ক্লাস', icon: QuranRehalIcon, shortLabel: 'ক্লাস' },
    { id: 'jumua', label: "জুমু'আ", icon: MosqueIcon, shortLabel: "জুমু'আ" },
    { id: 'programmes', label: 'কর্মসূচি', icon: HalqaCircleIcon, shortLabel: 'কর্মসূচি' },
    { id: 'contacts', label: 'ডিরেক্টরি', icon: MihrabIcon, shortLabel: 'ডিরেক্টরি' },
    { id: 'settings', label: 'সেটিংস', icon: Settings, shortLabel: 'সেটিংস' },
  ];

  // Complete tabs for mobile navigation drawer
  const allMobileTabs = [
    {
      id: 'dashboard',
      title: 'হোম ও ড্যাশবোর্ড',
      desc: 'সামগ্রিক টাইমলাইন, তাৎক্ষণিক সামারি ও আজকের শিডিউল',
      icon: HomeIcon,
      iconBg: 'bg-[#F2F6EC] border-[#D2DEC1] text-[#3E5514]',
      tag: 'মূল পাতা',
    },
    {
      id: 'calendar',
      title: 'দৈনিক শিডিউল ও ক্যালেন্ডার',
      desc: 'তারিখভিত্তিক ক্লাস, বৈঠক ও দৈনন্দিন অ্যাপয়েন্টমেন্ট',
      icon: CalendarIcon,
      iconBg: 'bg-[#FDF5ED] border-[#EAD7C7] text-[#6E3A0D]',
      tag: 'ক্যালেন্ডার',
    },
    {
      id: 'classes',
      title: 'কোর্স ও ক্লাসের রুটিন',
      desc: 'সিলেবাস, নিয়মিত ব্যাচ ও পুনরাবৃত্ত ক্লাস শিডিউল',
      icon: QuranRehalIcon,
      iconBg: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#1E7E56]',
      tag: 'অ্যাকাডেমিক',
    },
    {
      id: 'jumua',
      title: "জুমু'আ খুতবাহ ডায়েরি",
      desc: 'প্রতি শুক্রবারের নির্ধারিত মসজিদ, বিষয় ও খুতবাহ রেজিস্টার',
      icon: MosqueIcon,
      iconBg: 'bg-[#F2F6EC] border-[#D2DEC1] text-[#3E5514]',
      tag: "জুমু'আ",
    },
    {
      id: 'programmes',
      title: 'লেকচার ও মাহফিল',
      desc: 'দ্বীনি আলোচনা, সেমিনার ও দাওয়াহ ইভেন্ট',
      icon: MinbarIcon,
      iconBg: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]',
      tag: 'দাওয়াহ',
    },
    {
      id: 'contacts',
      title: 'ডিরেক্টরি ও মসজিদ তালিকা',
      desc: 'মুতাওয়াল্লী, আয়োজক ও মসজিদ যোগাযোগের বিবরণ',
      icon: MihrabIcon,
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
      tag: 'নেটওয়ার্ক',
    },
    {
      id: 'settings',
      title: 'সেটিংস ও টিম ম্যানেজমেন্ট',
      desc: 'প্রোফাইল, শিডিউল প্রেফারেন্স ও পারমিশন',
      icon: Settings,
      iconBg: 'bg-[#F2F6EC] border-[#D2DEC1] text-[#3E5514]',
      tag: 'কনফিগারেশন',
    },
  ];

  const handleMobileNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMoreOpen(false);
  };

  const handleQuickAddSelect = (actionKey: string, initialType?: ActivityType) => {
    if (actionKey === 'class') {
      setIsRecurringModalOpen(true);
    } else if (initialType) {
      setPreselectedType(initialType);
      setIsAddModalOpen(true);
    } else if (actionKey === 'note') {
      setIsAddModalOpen(true);
    } else if (actionKey === 'contact') {
      onSelectTab('contacts');
    }
  };

  const isMoreTabActive = ['classes', 'programmes', 'contacts'].includes(currentTab);

  return (
    <div className="min-h-screen text-[#16221E] flex flex-col antialiased bg-[#F4EFEB] selection:bg-[#3E5514]/20 selection:text-[#3E5514] font-bengali">
      {/* =========================================
          1. TOP APP BAR (WARM EDITORIAL BENTO HEADER)
         ========================================= */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 pt-3 pb-3 bg-[#F4EFEB]/85 backdrop-blur-xl border-b border-[#E7E2D8]/80">
        <div className="max-w-md md:max-w-7xl mx-auto flex items-center justify-between">
          {/* TadbeerGo Brand Logo & User Profile Header */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onSelectTab('dashboard')}
          >
            <TadbeerLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black font-sans tracking-tight text-[#3E5514]">
                  Tadbeer<span className="text-[#6E3A0D]">Go</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#586661] font-medium font-heading">
                <span>শায়খ মোখতার আহমাদ</span>
                <span>·</span>
                <span>স্কলার ও শিক্ষক</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#FAF7F2] px-2 py-1 rounded-full border border-[#E5DFD7] shadow-xs">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`text-[13px] font-semibold transition-all cursor-pointer relative px-3.5 py-1.5 rounded-full ${
                    isActive
                      ? 'text-[#3E5514] font-bold bg-white shadow-xs border border-[#DFD8CC]'
                      : 'text-[#586661] hover:text-[#16221E] hover:bg-black/[0.02]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3E5514]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Mockup Bell + MA Circle Avatar) */}
          <div className="flex items-center space-x-2.5">
            {/* Desktop Add Schedule Button - Chocolate Pill matching user reference */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden sm:flex items-center space-x-2 pl-4 pr-2.5 py-1.5 bg-[#6E3A0D] hover:bg-[#854610] text-white text-[12.5px] font-bold rounded-full shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>শিডিউল যোগ করুন</span>
              <span className="w-5 h-5 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0">
                <Plus size={12} className="stroke-[2.8]" />
              </span>
            </button>

            {/* Notification Bell with Red Dot */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="w-10 h-10 rounded-full bg-white border border-[#E5DFD7] hover:bg-[#FAF7F2] flex items-center justify-center text-[#16221E] transition cursor-pointer relative shadow-xs"
              title="বিজ্ঞপ্তি"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E28743]"></span>
            </button>

            {/* User Avatar Circle (MA) with Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full overflow-hidden bg-[#063F35] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs hover:ring-2 hover:ring-emerald-200 transition cursor-pointer border-2 border-[#00A878]/40"
                title="প্রোফাইল ও সেটিংস"
              >
                <img
                  src="/shaikh-avatar.jpg"
                  alt="শায়খ মোখতার আহমাদ"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; (e.currentTarget.parentElement as HTMLButtonElement).innerText='মা'; }}
                />
              </button>

              {/* Profile Dropdown with Fullscreen Click-Outside Backdrop */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl border border-[#E4EBE8] z-50 animate-in fade-in zoom-in-95 duration-100 bg-white">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#17211F] truncate">{user?.name || 'শায়খ মোখতার আহমাদ'}</p>
                    <p className="text-[10px] text-[#063F35] font-semibold flex items-center gap-1 mt-0.5 font-mono">
                      <ShieldCheck size={11} /> {isOwner ? 'স্কলার (মূল নিয়ন্ত্রণ)' : 'ব্যক্তিগত সহকারী (PS)'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsQuickAddOpen(true);
                    }}
                    className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#17211F] hover:bg-slate-50 rounded-lg transition cursor-pointer"
                  >
                    <Plus size={13} className="text-[#063F35]" />
                    <span>দ্রুত যোগ করুন</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsRecurringModalOpen(true);
                    }}
                    className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#063F35] hover:bg-[#E8F5F0] rounded-lg transition cursor-pointer"
                  >
                    <CalendarIcon size={13} className="text-[#00A878]" />
                    <span>পুনরাবৃত্ত ক্লাসের রুটিন</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsPwaModalOpen(true);
                    }}
                    className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#6F7D78] hover:bg-slate-50 rounded-lg transition cursor-pointer"
                  >
                    <Bell size={13} className="text-[#E8A317]" />
                    <span>📲 অ্যাপ ইনস্টল ও নোটিফিকেশন</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectTab('settings');
                    }}
                    className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-[#17211F] hover:bg-slate-50 rounded-lg transition cursor-pointer"
                  >
                    <Settings size={13} className="text-[#063F35]" />
                    <span>সেটিংস ও প্রোফাইল</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={logout}
                    className="w-full mt-1 flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>লগআউট</span>
                  </button>
                </div>
              </>
            )}
            </div>

            {/* Mobile Hamburger Menu Toggle Button - Dedicated for Mobile View */}
            <button
              onClick={() => setIsMobileMoreOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E5DFD7] hover:bg-white flex items-center justify-center text-[#3E5514] transition cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="মোবাইল মেনু খুলুন"
              aria-label="মোবাইল মেনু"
            >
              <Menu size={20} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          2. MAIN BODY VIEWPORT
         ========================================= */}
      <main className="flex-1 max-w-md md:max-w-7xl w-full mx-auto px-4 sm:px-8 py-2 sm:py-3 pb-28 md:pb-28">
        {children}
      </main>

      {/* =========================================
          3. PREMIUM NATIVE MOBILE BOTTOM DOCK (ALWAYS VISIBLE & FLOATING ON DESKTOP)
         ========================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E5DFD7] shadow-[0_-4px_24px_rgba(20,35,28,0.06)] safe-area-bottom md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:w-[480px] md:rounded-full md:border md:border-[#E5DFD7] md:shadow-[0_12px_40px_rgba(20,35,28,0.12)]">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto relative">

          {/* Tab: Home */}
          <button
            onClick={() => handleMobileNavClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'dashboard' ? 'text-[#3E5514] font-bold' : 'text-[#8A9893] font-medium'
            }`}
          >
            <HomeIcon size={20} strokeWidth={currentTab === 'dashboard' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10.5px] font-heading">হোম</span>
          </button>

          {/* Tab: Schedule */}
          <button
            onClick={() => handleMobileNavClick('calendar')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'calendar' ? 'text-[#3E5514] font-bold' : 'text-[#8A9893] font-medium'
            }`}
          >
            <CalendarIcon size={20} strokeWidth={currentTab === 'calendar' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10.5px] font-heading">শিডিউল</span>
          </button>

          {/* Center Elevated Floating Plus FAB - Rich Chocolate */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-12 h-12 rounded-full bg-[#6E3A0D] hover:bg-[#854610] text-white flex items-center justify-center shadow-lg shadow-[#6E3A0D]/30 -mt-5 ring-4 ring-[#FAF7F2] active:scale-95 transition-transform cursor-pointer"
            title="দ্রুত যোগ করুন"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </button>

          {/* Tab: Jumu'ah */}
          <button
            onClick={() => handleMobileNavClick('jumua')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'jumua' ? 'text-[#3E5514] font-bold' : 'text-[#8A9893] font-medium'
            }`}
          >
            <MosqueIcon size={20} strokeWidth={currentTab === 'jumua' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10.5px] font-heading">জুমু'আ</span>
          </button>

          {/* Tab: Menu */}
          <button
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              isMoreTabActive ? 'text-[#3E5514] font-bold' : 'text-[#8A9893] font-medium'
            }`}
          >
            <Menu size={20} strokeWidth={isMoreTabActive ? 2.4 : 1.8} />
            <span className="mt-1 text-[10.5px] font-heading">মেনু</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={handleQuickAddSelect}
      />

      {/* =========================================
          4. PREMIUM "MORE" SLIDE-UP SHEET
         ========================================= */}
      {isMobileMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsMobileMoreOpen(false)}
        >
          <div
            className="w-full bg-[#FCFAF6] rounded-t-[32px] sm:rounded-[32px] px-5 pt-3 pb-8 sm:pb-6 safe-area-bottom shadow-[0_-20px_50px_rgba(62,85,20,0.18)] sm:shadow-2xl border-t sm:border border-[#E6E0D6] animate-slide-up-mobile sm:animate-none font-bengali max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1.5 rounded-full bg-[#E0D8CA] mx-auto mt-1 mb-5" />

            {/* Sheet header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#EFECE6]">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#3E5514] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#6E3A0D]" />
                  <span>TadbeerGo · মোবাইল মেনু</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#16221E] font-heading mt-0.5">
                  মূল নেভিগেশন ও মডিউলসমূহ
                </h3>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6E0D6] text-[#586661] hover:text-[#16221E] flex items-center justify-center cursor-pointer hover:bg-[#F4EFEB] transition shadow-2xs"
              >
                <X size={15} />
              </button>
            </div>

            {/* Module list with tactile Bento items - Scrollable container */}
            <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
              {allMobileTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer group active:scale-[0.99] ${
                      isActive
                        ? 'bg-white border-[#3E5514] shadow-sm ring-1 ring-[#3E5514]/20'
                        : 'bg-white hover:bg-[#F2F6EC]/40 border-[#E6E0D6] hover:border-[#3E5514]/30 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${item.iconBg}`}
                      >
                        <Icon size={19} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-[13px] font-bold font-heading truncate ${
                            isActive ? 'text-[#3E5514]' : 'text-[#16221E]'
                          }`}>
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#F4EFEB] text-[#586661] border border-[#E6E0D6]/60">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#586661] mt-0.5 truncate font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-[#3E5514]' : 'text-[#A0ABA6]'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* User footer */}
            <div className="mt-5 pt-4 border-t border-[#EFECE6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/shaikh-avatar.jpg"
                  alt="শায়খ মোখতার আহমাদ"
                  className="w-10 h-10 rounded-full object-cover object-top border-2 border-white shadow-xs"
                />
                <div>
                  <p className="text-[13px] font-black text-[#16221E] font-heading">
                    {user?.name === 'Personal' ? 'শায়খ মোখতার আহমাদ' : (user?.name || 'শায়খ মোখতার আহমাদ')}
                  </p>
                  <p className="text-[11px] text-[#586661] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E7E56]"></span>
                    <span>স্কলার · মূল নিয়ন্ত্রণ</span>
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <LogOut size={12} />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* Floating PWA Mobile Install & Phone Alerts Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNavigateTab={onSelectTab}
      />

      {/* Recurring Class Schedule Modal */}
      <RecurringClassModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>

  );
};
