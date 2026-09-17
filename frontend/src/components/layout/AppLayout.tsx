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
  Settings
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

  // Secondary tabs for mobile "More" bottom sheet
  const secondaryTabs = [
    {
      id: 'classes',
      title: 'কোর্স ও ক্লাসের রুটিন',
      desc: 'সিলেবাস, ব্যাচ ও পুনরাবৃত্ত ক্লাস শিডিউল',
      icon: QuranRehalIcon,
    },
    {
      id: 'programmes',
      title: 'লেকচার ও মাহফিল',
      desc: 'দ্বীনি আলোচনা, সেমিনার ও দাওয়াহ ইভেন্ট',
      icon: MinbarIcon,
    },
    {
      id: 'contacts',
      title: 'ডিরেক্টরি ও মসজিদ তালিকা',
      desc: 'মুতাওয়াল্লী, আয়োজক ও মসজিদ যোগাযোগের বিবরণ',
      icon: MihrabIcon,
    },
    {
      id: 'settings',
      title: 'সেটিংস ও টিম ম্যানেজমেন্ট',
      desc: 'প্রোফাইল, শিডিউল প্রেফারেন্স, টিম মেম্বার ও পারমিশন',
      icon: Settings,
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
    <div className="min-h-screen text-[#17211F] flex flex-col antialiased bg-[#F7F9F7] selection:bg-emerald-500/20 selection:text-emerald-900 font-bengali">
      {/* =========================================
          1. TOP APP BAR (EXACT MATCH TO MOCKUP)
         ========================================= */}
      <header className="sticky top-0 z-40 px-4 sm:px-8 pt-3 pb-2.5 bg-[#F7F9F7]/90 backdrop-blur-xl">
        <div className="max-w-md md:max-w-7xl mx-auto flex items-center justify-between">
          {/* TadbeerGo Brand Logo & User Profile Header */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onSelectTab('dashboard')}
          >
            <TadbeerLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black font-sans tracking-tight text-[#063F35]">
                  Tadbeer<span className="text-[#00A878]">Go</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#6F7D78] font-medium font-heading">
                <span>শায়খ মোখতার আহমাদ</span>
                <span>·</span>
                <span>স্কলার ও শিক্ষক</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/80 px-2 py-1 rounded-full border border-[#E4EBE8] shadow-xs">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`text-[13px] font-semibold transition-all cursor-pointer relative px-3 py-1.5 rounded-full ${
                    isActive
                      ? 'text-[#063F35] font-bold bg-[#E8F5F0]'
                      : 'text-[#6F7D78] hover:text-[#17211F] hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00A878]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Mockup Bell + MA Circle Avatar) */}
          <div className="flex items-center space-x-2.5">
            {/* Desktop Add Schedule Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#063F35] hover:bg-[#042F28] text-white text-[12px] font-semibold rounded-full shadow-xs transition cursor-pointer"
            >
              <Plus size={13} className="stroke-[2.5]" />
              <span>শিডিউল যোগ করুন</span>
            </button>

            {/* Notification Bell with Red Dot */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="w-10 h-10 rounded-full bg-white border border-[#E4EBE8] hover:bg-slate-50 flex items-center justify-center text-[#17211F] transition cursor-pointer relative shadow-2xs"
              title="বিজ্ঞপ্তি"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D9534F]"></span>
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

              {/* Profile Dropdown */}
              {showProfileMenu && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
          2. MAIN BODY VIEWPORT
         ========================================= */}
      <main className="flex-1 max-w-md md:max-w-7xl w-full mx-auto px-4 sm:px-8 py-2 sm:py-3 pb-28 md:pb-12">
        {children}
      </main>

      {/* =========================================
          3. PREMIUM NATIVE MOBILE BOTTOM DOCK (EXACT MATCH TO MOCKUP)
         ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto relative">

          {/* Tab: Home */}
          <button
            onClick={() => handleMobileNavClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'dashboard' ? 'text-[#063F35] font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            <HomeIcon size={20} strokeWidth={currentTab === 'dashboard' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10px] font-heading">হোম</span>
          </button>

          {/* Tab: Schedule */}
          <button
            onClick={() => handleMobileNavClick('calendar')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'calendar' ? 'text-[#063F35] font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            <CalendarIcon size={20} strokeWidth={currentTab === 'calendar' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10px] font-heading">শিডিউল</span>
          </button>

          {/* Center Elevated Floating Plus FAB (Exact Match to Mockup) */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-12 h-12 rounded-full bg-[#063F35] text-white flex items-center justify-center shadow-lg -mt-5 ring-4 ring-white active:scale-95 transition-transform cursor-pointer"
            title="দ্রুত যোগ করুন"
          >
            <Plus size={22} className="stroke-[2.5]" />
          </button>

          {/* Tab: Jumu'ah */}
          <button
            onClick={() => handleMobileNavClick('jumua')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              currentTab === 'jumua' ? 'text-[#063F35] font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            <MosqueIcon size={20} strokeWidth={currentTab === 'jumua' ? 2.4 : 1.8} />
            <span className="mt-1 text-[10px] font-heading">জুমু'আ</span>
          </button>

          {/* Tab: More */}
          <button
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              isMoreTabActive ? 'text-[#063F35] font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            <LayoutGrid size={20} strokeWidth={isMoreTabActive ? 2.4 : 1.8} />
            <span className="mt-1 text-[10px] font-heading">অন্যান্য</span>
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
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in duration-150"
          onClick={() => setIsMobileMoreOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-[2rem] px-4 pt-2 pb-6 safe-area-bottom shadow-2xl animate-slide-up-mobile"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-9 h-1 rounded-full bg-slate-200 mx-auto mt-2 mb-5" />

            {/* Sheet header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-[#17211F]">অন্যান্য সেকশন ও মডিউল</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">সহায়ক টুলস ও ব্যবস্থাপনা</p>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Module list */}
            <div className="space-y-2">
              {secondaryTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`mob-sheet-btn ${isActive ? 'active' : 'inactive'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#E8F5F0] text-[#063F35]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={20} strokeWidth={1.8} />
                      </div>
                      <div className="text-left">
                        <h4 className={`text-[13px] font-bold ${isActive ? 'text-[#063F35]' : 'text-[#17211F]'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={15} className={isActive ? 'text-[#00A878]' : 'text-slate-300'} />
                  </button>
                );
              })}
            </div>

            {/* User footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#063F35] text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || 'মো'}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">{user?.name || 'শায়খ মোখতার আহমাদ'}</p>
                  <p className="text-[11px] text-slate-400">স্কলার · মূল নিয়ন্ত্রণ</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-500 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
              >
                <LogOut size={13} />
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
