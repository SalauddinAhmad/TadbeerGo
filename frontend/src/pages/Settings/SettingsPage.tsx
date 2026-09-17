import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Clock,
  Lock,
  Smartphone,
  Download,
  Save,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  Calendar,
  Sliders,
  Check,
  Globe,
  Database,
  Moon,
  Volume2,
  MessageSquare,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { toBengaliDigits } from '../../utils/bengali';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  role_name: string;
  role_display: string;
  role_description: string;
  role_id: number;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

export const SettingsPage: React.FC = () => {
  const { user, isOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'assistant' | 'backup' | 'team'>('profile');

  // Profile Form States
  const [name, setName] = useState(user?.name || 'শায়খ মোখতার আহমাদ');
  const [title, setTitle] = useState('ইসলামিক স্কলার, গবেষক ও শিক্ষাবিদ');
  const [email, setEmail] = useState(user?.email || 'admin@mokhterahmad.com');
  const [phone, setPhone] = useState('+৮৮০১৮১৯২৩৪৫৬৭');
  const [primaryLocation, setPrimaryLocation] = useState('ধানমন্ডি ২৭, ঢাকা');
  const [bio, setBio] = useState('দ্বীনি শিক্ষা বিস্তার, আরবি ভাষা ও সাহিত্য, তাফসিরুল কুরআন এবং সমকালীন সামাজিক সচেতনতা সৃষ্টিতে নিবেদিত।');

  // Schedule & Assistant Preferences
  const [jumuaReminderTime, setJumuaReminderTime] = useState('24h');
  const [morningBriefingTime, setMorningBriefingTime] = useState('07:30');
  const [travelBufferMins, setTravelBufferMins] = useState('60');
  const [autoSaveContacts, setAutoSaveContacts] = useState(true);
  const [ibadahProtectedHours, setIbadahProtectedHours] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [psBookingApproval, setPsBookingApproval] = useState(true);

  // Status feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // === TEAM MANAGEMENT STATE ===
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamError, setTeamError] = useState('');
  const [teamSuccess, setTeamSuccess] = useState('');

  // Form state for add/edit
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRoleId, setFRoleId] = useState<number>(2);
  const [fPassword, setFPassword] = useState('');
  const [fShowPassword, setFShowPassword] = useState(false);
  const [fSaving, setFSaving] = useState(false);

  const fetchTeam = async () => {
    setTeamLoading(true);
    try {
      const data = await api.get<{ users: TeamMember[]; roles: Role[] }>('/users');
      setTeamMembers(data.users);
      setRoles(data.roles);
    } catch {
      setTeamError('টিম ডাটা লোড করা যায়নি।');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') fetchTeam();
  }, [activeTab]);

  const openAddModal = () => {
    setEditingMember(null);
    setFName(''); setFEmail(''); setFPhone(''); setFRoleId(2); setFPassword('');
    setTeamError('');
    setShowAddModal(true);
  };

  const openEditModal = (m: TeamMember) => {
    setEditingMember(m);
    setFName(m.name); setFEmail(m.email); setFPhone(m.phone || '');
    setFRoleId(m.role_id); setFPassword('');
    setTeamError('');
    setShowAddModal(true);
  };

  const handleTeamSave = async () => {
    setTeamError('');
    setFSaving(true);
    try {
      if (editingMember) {
        await api.put(`/users/${editingMember.id}`, {
          name: fName, email: fEmail, phone: fPhone,
          role_id: fRoleId,
          ...(fPassword ? { new_password: fPassword } : {})
        });
        setTeamSuccess(`${fName}-এর তথ্য আপডেট করা হয়েছে।`);
      } else {
        if (!fPassword) { setTeamError('নতুন সদস্যের জন্য পাসওয়ার্ড আবশ্যক।'); setFSaving(false); return; }
        await api.post('/users', { name: fName, email: fEmail, phone: fPhone, role_id: fRoleId, password: fPassword });
        setTeamSuccess(`${fName} টিমে যুক্ত হয়েছেন!`);
      }
      setShowAddModal(false);
      fetchTeam();
      setTimeout(() => setTeamSuccess(''), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'সংরক্ষণ করা যায়নি।');
    } finally {
      setFSaving(false);
    }
  };

  const handleDeactivate = async (m: TeamMember) => {
    if (!window.confirm(`${m.name}-কে নিষ্ক্রিয় করতে চান?`)) return;
    try {
      await api.delete(`/users/${m.id}`);
      setTeamSuccess(`${m.name} নিষ্ক্রিয় করা হয়েছে।`);
      fetchTeam();
      setTimeout(() => setTeamSuccess(''), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'নিষ্ক্রিয় করা যায়নি।');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        user: { name, title, email, phone, primaryLocation },
        preferences: {
          jumuaReminderTime,
          morningBriefingTime,
          travelBufferMins,
          autoSaveContacts,
          ibadahProtectedHours,
        },
        app: 'TadbeerGo'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TadbeerGo_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-24 font-bengali">
      {/* =========================================================================
          1. PREMIUM HERO PROFILE CARD
         ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#063F35] via-[#042F28] to-[#021F1B] border border-[#00A878]/20 text-white p-6 sm:p-8 shadow-2xl mb-6">
        {/* Decorative blurred orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#00A878]/10 rounded-full blur-2xl pointer-events-none" />
        {/* Arabic Star watermark */}
        <div className="absolute right-4 top-4 bottom-4 w-56 pointer-events-none opacity-[0.05]">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-white">
            <polygon points="50,0 61,35 97,35 68,57 79,91 50,70 21,91 32,57 3,35 39,35" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Portrait */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-2 ring-[#00A878]/60 shadow-2xl bg-emerald-950">
              <img src="/shaikh-portrait.jpg" alt="শায়খ মোখতার আহমাদ"
                className="w-full h-full object-cover object-top hover:scale-105 transition duration-700" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#00A878] text-white flex items-center justify-center border-2 border-[#063F35] shadow">
              <CheckCircle2 size={15} strokeWidth={2.5} />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-emerald-300 tracking-wide uppercase">
              <Sparkles size={10} />
              {isOwner ? 'Scholar · Full Control' : 'Personal Secretary'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">{name}</h1>
            <p className="text-sm text-emerald-200/80 font-medium">{title}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[11px] text-emerald-300/70 pt-1">
              <span className="flex items-center gap-1"><MapPin size={11} className="text-[#00A878]" />{primaryLocation}</span>
              <span className="flex items-center gap-1"><Phone size={11} className="text-[#00A878]" />{toBengaliDigits(phone)}</span>
              <span className="flex items-center gap-1"><Mail size={11} className="text-[#00A878]" />{email}</span>
            </div>
          </div>

          {/* Stat pills */}
          <div className="hidden sm:flex flex-col gap-2 shrink-0">
            {[['৩টি', 'সক্রিয় কোর্স'], ['১০০%', 'অটো-সিঙ্ক']].map(([v, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur border border-white/15 px-4 py-2.5 rounded-2xl text-center">
                <div className="text-base font-black text-white">{v}</div>
                <div className="text-[10px] text-emerald-200/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN LAYOUT — Sidebar Tabs + Content
         ========================================================================= */}

      {/* Mobile horizontal scroll tabs — OUTSIDE flex so they stack on top */}
      <div className="sm:hidden flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 w-full">
        {([
          { id: 'profile',   label: 'প্রোফাইল',  icon: User },
          { id: 'schedule',  label: 'শিডিউল',     icon: Calendar },
          { id: 'assistant', label: 'পিএস',        icon: Shield },
          { id: 'backup',    label: 'ব্যাকআপ',     icon: Database },
          ...(isOwner ? [{ id: 'team', label: 'টিম', icon: Users }] : []),
        ] as Array<{id: string; label: string; icon: React.ElementType}>).map(tab => {
          const TIcon = tab.icon;
          const active = activeTab === (tab.id as any);
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 cursor-pointer transition ${
                active ? 'bg-[#063F35] text-white shadow-md' : 'bg-white border border-[#E4EBE8] text-[#17211F]/60'
              }`}>
              <TIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop: sidebar + content  |  Mobile: just content (full width) */}
      <div className="flex gap-5 items-start">

        {/* ---- VERTICAL TAB SIDEBAR (desktop only) ---- */}
        <nav className="hidden sm:flex flex-col gap-1.5 w-52 shrink-0">
          {([
            { id: 'profile',   label: 'প্রোফাইল',        sub: 'ব্যক্তিগত তথ্য',      icon: User },
            { id: 'schedule',  label: 'শিডিউল',           sub: 'খুতবাহ প্রেফারেন্স',  icon: Calendar },
            { id: 'assistant', label: 'পিএস অ্যাক্সেস',  sub: 'পারমিশন নিয়ন্ত্রণ',  icon: Shield },
            { id: 'backup',    label: 'ব্যাকআপ',          sub: 'ডাটা এক্সপোর্ট',     icon: Database },
            ...(isOwner ? [{ id: 'team', label: 'টিম', sub: 'সদস্য ও রোল', icon: Users }] : []),
          ] as Array<{id: string; label: string; sub: string; icon: React.ElementType}>).map(tab => {
            const TIcon = tab.icon;
            const active = activeTab === (tab.id as any);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#063F35] text-white shadow-lg shadow-emerald-900/20'
                    : 'bg-white border border-[#E8EFEd] text-[#17211F]/70 hover:border-[#00A878]/30 hover:bg-[#F0FAF6] hover:text-[#063F35]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  active ? 'bg-white/15' : 'bg-[#063F35]/8 group-hover:bg-[#00A878]/15'
                }`}>
                  <TIcon size={17} strokeWidth={active ? 2.5 : 2} />
                </div>
                <div>
                  <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-[#17211F]'}`}>{tab.label}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 ${active ? 'text-emerald-200/80' : 'text-[#17211F]/40'}`}>{tab.sub}</p>
                </div>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00A878]" />}
              </button>
            );
          })}
        </nav>

        {/* ---- CONTENT AREA (full width mobile, flex-1 desktop) ---- */}
        <div className="flex-1 min-w-0 w-full space-y-4">

        {/* =========================================================================
            3. TAB CONTENT FORMS
           ========================================================================= */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* TAB 1: PROFILE & PERSONAL INFO */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EBE8] shadow-xs space-y-6">
            <div className="border-b border-[#E4EBE8] pb-4">
              <h2 className="text-lg font-bold text-[#17211F] flex items-center gap-2">
                <User size={18} className="text-[#00A878]" />
                <span>শায়খের ব্যক্তিগত পরিচিতি তথ্য</span>
              </h2>
              <p className="text-xs text-[#17211F]/60 mt-1">
                এই তথ্যগুলো আপনার অফিশিয়াল শিডিউল কপি, খুতবাহ সূচি এবং যোগাযোগের হেডারে সমন্বিত হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  পূর্ণ নাম (শায়খ)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  পদবী ও পরিচয়
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  অফিসিয়াল ফোন / হোয়াটসঅ্যাপ
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  মূল কার্যালয় / অধ্যয়ন কক্ষের ঠিকানা
                </label>
                <input
                  type="text"
                  value={primaryLocation}
                  onChange={(e) => setPrimaryLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#17211F] mb-1.5">
                  সংক্ষিপ্ত পরিচয় ও লক্ষ্য
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-[#E4EBE8] rounded-xl text-xs font-semibold text-[#17211F] focus:outline-none focus:border-[#00A878] focus:bg-white transition resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE & KHUTBAH PREFERENCES */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EBE8] shadow-xs space-y-6">
            <div className="border-b border-[#E4EBE8] pb-4">
              <h2 className="text-lg font-bold text-[#17211F] flex items-center gap-2">
                <Calendar size={18} className="text-[#00A878]" />
                <span>শিডিউলিং ও খুতবাহ ব্যবস্থাপনা সেটিংস</span>
              </h2>
              <p className="text-xs text-[#17211F]/60 mt-1">
                দৈনিক কার্যক্রম ও খুতবাহর স্বয়ংক্রিয় রিমাইন্ডার এবং বিশ্রামের বাফার কনফিগার করুন।
              </p>
            </div>

            <div className="space-y-4">
              {/* Jumua Reminder Interval */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8] gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#17211F]">জুমু'আ খুতবাহ নোটিফিকেশন লিড-টাইম</h4>
                  <p className="text-[11px] text-[#17211F]/60 mt-0.5">খুতবাহ ও ভ্রমণের কতক্ষণ পূর্বে চূড়ান্ত রিমাইন্ডার দেওয়া হবে</p>
                </div>
                <select
                  value={jumuaReminderTime}
                  onChange={(e) => setJumuaReminderTime(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#E4EBE8] rounded-xl text-xs font-bold text-[#063F35] focus:outline-none focus:border-[#00A878] cursor-pointer"
                >
                  <option value="24h">২৪ ঘণ্টা পূর্বে (বৃহস্পতিবার দুপুর)</option>
                  <option value="morning">শুক্রবার সকাল ৮:০০ টায়</option>
                  <option value="3h">৩ ঘণ্টা পূর্বে</option>
                  <option value="2h">২ ঘণ্টা পূর্বে</option>
                </select>
              </div>

              {/* Travel Buffer Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8] gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#17211F]">ভ্রমণ ও বিশ্রাম বাফার টাইম</h4>
                  <p className="text-[11px] text-[#17211F]/60 mt-0.5">পরপর দুটি দূরবর্তী প্রোগ্রামের মাঝে ন্যূনতম কত সময় বিরতি রাখা বাধ্যতামূলক</p>
                </div>
                <select
                  value={travelBufferMins}
                  onChange={(e) => setTravelBufferMins(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#E4EBE8] rounded-xl text-xs font-bold text-[#063F35] focus:outline-none focus:border-[#00A878] cursor-pointer"
                >
                  <option value="45">৪৫ মিনিট বাফার</option>
                  <option value="60">১ ঘণ্টা বাফার (প্রস্তাবিত)</option>
                  <option value="90">১ ঘণ্টা ৩০ মিনিট বাফার</option>
                  <option value="120">২ ঘণ্টা বাফার</option>
                </select>
              </div>

              {/* Protected Ibadah & Research Hours Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8]">
                <div>
                  <h4 className="text-xs font-bold text-[#17211F]">মাগরিব-এশা ইবাদত ও মুতালায়া সংরক্ষিত সময়</h4>
                  <p className="text-[11px] text-[#17211F]/60 mt-0.5">এই সময়ে বাইরের কোনো মিটিং বা কর্মসূচি বুকিং ব্লক করে সতর্কবার্তা দেখাবে</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ibadahProtectedHours}
                    onChange={(e) => setIbadahProtectedHours(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A878]"></div>
                </label>
              </div>

              {/* Auto-save contacts toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8]">
                <div>
                  <h4 className="text-xs font-bold text-[#17211F]">ইনপুট ফর্ম থেকে স্বয়ংক্রিয় ডিরেক্টরি সংরক্ষণ (Auto-Save)</h4>
                  <p className="text-[11px] text-[#17211F]/60 mt-0.5">খুতবাহ, কর্মসূচি বা মিটিং ইনপুট করার সময় মোবাইল নম্বর ডিরেক্টরিতে অটো-সিঙ্ক হবে</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveContacts}
                    onChange={(e) => setAutoSaveContacts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A878]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSISTANT & PS PERMISSIONS */}
        {activeTab === 'assistant' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EBE8] shadow-xs space-y-6">
            <div className="border-b border-[#E4EBE8] pb-4">
              <h2 className="text-lg font-bold text-[#17211F] flex items-center gap-2">
                <Shield size={18} className="text-[#00A878]" />
                <span>ব্যক্তিগত সহকারী (PS) ডেলিগেশন ও নিরাপত্তা</span>
              </h2>
              <p className="text-xs text-[#17211F]/60 mt-1">
                আপনার পিএস বা টিম সদস্যদের দায়িত্ব ও শিডিউল সমন্বয়ের অনুমতি নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <div className="space-y-4">
              {/* PS Account Info Card */}
              <div className="p-4 rounded-2xl bg-[#E8F5F0]/60 border border-[#00A878]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#063F35] text-white flex items-center justify-center font-bold text-xs">
                    PS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#17211F]">Personal Secretary (ব্যক্তিগত সহকারী)</h4>
                    <p className="text-[11px] text-[#063F35] font-medium font-sans">ps@mokhterahmad.com</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#063F35] text-white shadow-2xs">
                  সক্রিয় ডেলিগেশন
                </span>
              </div>

              {/* Direct Booking vs Approval Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8]">
                <div>
                  <h4 className="text-xs font-bold text-[#17211F]">পিএস এর নতুন কর্মসূচি বুকিংয়ে চূড়ান্ত অনুমোদন আবশ্যক</h4>
                  <p className="text-[11px] text-[#17211F]/60 mt-0.5">চালু থাকলে পিএস এর এন্ট্রি করা শিডিউল আপনার অনুমোদনের পর ক্যালেন্ডারে নিশ্চিত হবে</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={psBookingApproval}
                    onChange={(e) => setPsBookingApproval(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A878]"></div>
                </label>
              </div>

              {/* Password & Security Section */}
              <div className="p-4 rounded-2xl bg-[#F7F9F7] border border-[#E4EBE8] space-y-3">
                <h4 className="text-xs font-bold text-[#17211F] flex items-center gap-1.5">
                  <Lock size={14} className="text-[#063F35]" />
                  <span>অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    type="password"
                    placeholder="বর্তমান পাসওয়ার্ড"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E4EBE8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A878]"
                  />
                  <input
                    type="password"
                    placeholder="নতুন নিরাপদ পাসওয়ার্ড"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E4EBE8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#00A878]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA BACKUP & EXPORT */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EBE8] shadow-xs space-y-6">
            <div className="border-b border-[#E4EBE8] pb-4">
              <h2 className="text-lg font-bold text-[#17211F] flex items-center gap-2">
                <Database size={18} className="text-[#00A878]" />
                <span>ডাটা ব্যাকআপ ও এক্সপোর্ট</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E4EBE8] bg-[#F7F9F7] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F0] text-[#00A878] flex items-center justify-center">
                  <Download size={20} />
                </div>
                <h4 className="text-xs font-bold text-[#17211F]">সম্পূর্ণ ডাটা ব্যাকআপ (JSON)</h4>
                <p className="text-[11px] text-[#17211F]/60">
                  সকল অ্যাক্টিভিটি, কোর্স, প্রোগ্রাম এবং যোগাযোগ সহ সম্পূর্ণ ডাটা।
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>{isExporting ? 'ব্যাকআপ তৈরি হচ্ছে...' : 'ব্যাকআপ ডাউনলোড করুন'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-[#E4EBE8] bg-[#F7F9F7] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F0] text-[#00A878] flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <h4 className="text-xs font-bold text-[#17211F]">ক্যালেন্ডার সাবস্ক্রিপশন (iCal / Google)</h4>
                <p className="text-[11px] text-[#17211F]/60">
                  আপনার আইফোন, গুগল ক্যালেন্ডার বা আউটলুকে সরাসরি লাইভ শিডিউল সিঙ্ক লিঙ্ক।
                </p>
                <button
                  type="button"
                  onClick={() => alert('iCal সিঙ্ক লিঙ্ক আপনার ডিভাইসের ক্যালেন্ডার অ্যাপে যুক্ত করা হয়েছে।')}
                  className="w-full py-2.5 bg-white border border-[#E4EBE8] hover:bg-[#E8F5F0] text-[#063F35] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Globe size={14} />
                  <span>ক্যালেন্ডার লিঙ্ক কপি করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. BOTTOM SAVE ACTION BAR (hidden on team tab)
           ========================================================================= */}
        {activeTab !== 'team' && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E4EBE8] shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#063F35] font-semibold">
              {savedSuccess ? (
                <span className="flex items-center gap-1.5 text-[#00A878]">
                  <Check size={16} className="stroke-[3]" />
                  <span>শায়খের সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
                </span>
              ) : (
                <span>পরিবর্তন সম্পন্ন করার পর সংরক্ষণ করুন</span>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <Save size={14} />
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        )}
      </form>

      {/* =========================================================================
          5. TEAM MANAGEMENT PANEL (outside form - handles own save logic)
         ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17211F] flex items-center gap-2">
                <Users size={17} className="text-[#063F35]" />
                টিম ম্যানেজমেন্ট
              </h2>
              <p className="text-xs text-[#17211F]/50 mt-0.5">অ্যাডমিন, সম্পাদক ও পিএস — যুক্ত করুন, এডিট করুন এবং পারমিশন নিয়ন্ত্রণ করুন।</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#063F35] hover:bg-[#042F28] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>নতুন সদস্য যুক্ত করুন</span>
            </button>
          </div>

          {/* Success/Error toast */}
          {teamSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              <CheckCircle2 size={15} />
              {teamSuccess}
            </div>
          )}
          {teamError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              <X size={15} />
              {teamError}
            </div>
          )}

          {/* Role Permission Reference Cards (5 roles) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: 'owner', label: 'স্কলার / মালিক', color: 'from-[#063F35] to-[#00A878]', badge: 'পূর্ণ নিয়ন্ত্রণ', icon: ShieldCheck },
              { name: 'admin', label: 'অ্যাডমিন (Admin)', color: 'from-amber-600 to-amber-500', badge: 'ব্যবস্থাপনা', icon: ShieldCheck },
              { name: 'ps_admin', label: 'ব্যক্তিগত সহকারী (PS)', color: 'from-blue-700 to-blue-500', badge: 'অপারেশনাল', icon: Shield },
              { name: 'editor', label: 'সম্পাদক (Editor)', color: 'from-violet-700 to-violet-500', badge: 'কন্টেন্ট', icon: Edit3 },
              { name: 'viewer', label: 'দর্শক (Viewer)', color: 'from-slate-600 to-slate-400', badge: 'শুধু দেখা', icon: Eye },
            ].map(r => {
              const RIcon = r.icon;
              const count = teamMembers.filter(m => m.role_name === r.name).length;
              return (
                <div key={r.name} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${r.color} text-white p-4 shadow-sm`}>
                  <div className="flex items-start justify-between mb-3">
                    <RIcon size={18} strokeWidth={2} />
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{r.badge}</span>
                  </div>
                  <p className="text-xs font-bold leading-tight">{r.label}</p>
                  <p className="text-[11px] opacity-80 mt-1">{toBengaliDigits(count.toString())} জন সক্রিয়</p>
                </div>
              );
            })}
          </div>

          {/* Members List */}
          <div className="bg-white rounded-3xl border border-[#E4EBE8] shadow-xs overflow-hidden">
            {teamLoading ? (
              <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">টিম সদস্য লোড হচ্ছে...</span>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">কোনো সদস্য পাওয়া যায়নি।</div>
            ) : (
              <div className="divide-y divide-[#F0F4F2]">
                {teamMembers.map((m) => {
                  const isOwnerUser = m.role_name === 'owner';
                  const initials = m.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

                  const roleBadgeColor: Record<string, string> = {
                    owner: 'bg-emerald-100 text-emerald-800',
                    admin: 'bg-amber-100 text-amber-800',
                    ps_admin: 'bg-blue-100 text-blue-800',
                    editor: 'bg-violet-100 text-violet-800',
                    viewer: 'bg-slate-100 text-slate-600',
                  };

                  const statusColor = m.status === 'ACTIVE' || m.status === 'active'
                    ? 'bg-emerald-400'
                    : 'bg-slate-300';

                  return (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9FCFB] transition">
                      {/* Avatar */}
                      <div className="relative w-10 h-10 rounded-full bg-[#063F35] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <span>{initials}</span>
                        )}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[#17211F] truncate">{m.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeColor[m.role_name] || 'bg-slate-100 text-slate-600'}`}>
                            {m.role_display}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#17211F]/50 truncate mt-0.5">{m.email}</p>
                        {m.phone && (
                          <p className="text-[11px] text-[#17211F]/40 truncate">{m.phone}</p>
                        )}
                      </div>

                      {/* Last Login */}
                      <div className="hidden sm:block text-right shrink-0">
                        <p className="text-[10px] text-slate-400">শেষ লগইন</p>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString('bn-BD') : '—'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 rounded-xl text-[#063F35] hover:bg-[#E8F5F0] transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit3 size={14} />
                        </button>
                        {!isOwnerUser && (
                          <button
                            onClick={() => handleDeactivate(m)}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 transition cursor-pointer"
                            title="নিষ্ক্রিয় করুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Permissions Reference Table (5 roles) */}
          <div className="bg-white rounded-3xl border border-[#E4EBE8] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F4F2]">
              <h3 className="text-sm font-bold text-[#17211F] flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#063F35]" />
                পারমিশন রেফারেন্স
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F9FCFB]">
                    <th className="text-left px-5 py-3 text-[#17211F]/60 font-semibold">পারমিশন</th>
                    <th className="text-center px-3 py-3 text-emerald-700 font-bold">মালিক</th>
                    <th className="text-center px-3 py-3 text-amber-700 font-bold">অ্যাডমিন</th>
                    <th className="text-center px-3 py-3 text-blue-700 font-bold">পিএস</th>
                    <th className="text-center px-3 py-3 text-violet-700 font-bold">সম্পাদক</th>
                    <th className="text-center px-3 py-3 text-slate-500 font-bold">দর্শক</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F2]">
                  {[
                    ['ব্যক্তিগত তথ্য দেখুন', true, true, false, false, false],
                    ['শিডিউল এডিট করুন', true, true, true, false, false],
                    ['কোর্স / ক্লাস পরিচালনা', true, true, true, true, false],
                    ['প্রোগ্রাম পরিচালনা', true, true, true, true, false],
                    ['পরিচিতি পরিচালনা', true, true, true, true, false],
                    ["জুমু'আ বুকিং", true, true, true, false, false],
                    ['ডাটা মুছুন (Delete)', true, true, false, false, false],
                    ['টিম পরিচালনা (User Mgmt)', true, false, false, false, false],
                    ['ডাটা এক্সপোর্ট', true, true, true, false, false],
                  ].map(([label, ...vals]) => (
                    <tr key={String(label)} className="hover:bg-[#F9FCFB]">
                      <td className="px-5 py-2.5 text-[#17211F]/70 font-medium">{label}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="text-center px-3 py-2.5">
                          {v ? (
                            <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                          ) : (
                            <span className="block w-3 h-0.5 bg-slate-200 mx-auto rounded-full" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>{/* end flex-1 content */}
    </div>{/* end flex gap-5 sidebar layout */}

      {/* =========================================================================
          6. ADD / EDIT MEMBER MODAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F4F2]">
              <div>
                <h3 className="text-base font-bold text-[#17211F]">
                  {editingMember ? `${editingMember.name} — এডিট করুন` : 'নতুন টিম সদস্য'}
                </h3>
                <p className="text-xs text-[#17211F]/50 mt-0.5">অ্যাকাউন্ট তথ্য ও পারমিশন নির্ধারণ করুন</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {teamError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <X size={13} /> {teamError}
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className="text-xs font-bold text-[#17211F] mb-1.5 block">ভূমিকা (Role)</label>
                <div className="relative">
                  <select
                    value={fRoleId}
                    onChange={e => setFRoleId(Number(e.target.value))}
                    disabled={editingMember?.role_name === 'owner'}
                    className="w-full appearance-none px-4 py-3 text-xs font-semibold text-[#17211F] bg-[#F9FCFB] border border-[#E4EBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 cursor-pointer disabled:opacity-60"
                  >
                    {roles.filter(r => r.name !== 'owner' || editingMember?.role_name === 'owner').map(r => (
                      <option key={r.id} value={r.id}>{r.display_name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {roles.find(r => r.id === fRoleId) && (
                  <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                    {roles.find(r => r.id === fRoleId)?.description}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-[#17211F] mb-1.5 block">পূর্ণ নাম</label>
                <input
                  type="text"
                  value={fName}
                  onChange={e => setFName(e.target.value)}
                  placeholder="যেমন: আব্দুল করিম"
                  className="w-full px-4 py-3 text-xs text-[#17211F] bg-[#F9FCFB] border border-[#E4EBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A878]/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-[#17211F] mb-1.5 block">ইমেইল ঠিকানা (লগইন ID)</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={fEmail}
                    onChange={e => setFEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-4 py-3 text-xs text-[#17211F] bg-[#F9FCFB] border border-[#E4EBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A878]/30"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-[#17211F] mb-1.5 block">মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={fPhone}
                    onChange={e => setFPhone(e.target.value)}
                    placeholder="+৮৮০১XXXXXXXXX"
                    className="w-full pl-9 pr-4 py-3 text-xs text-[#17211F] bg-[#F9FCFB] border border-[#E4EBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A878]/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-[#17211F] mb-1.5 block">
                  {editingMember ? 'নতুন পাসওয়ার্ড (পরিবর্তন না করলে ফাঁকা রাখুন)' : 'পাসওয়ার্ড'}
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={fShowPassword ? 'text' : 'password'}
                    value={fPassword}
                    onChange={e => setFPassword(e.target.value)}
                    placeholder={editingMember ? '••••••••' : 'কমপক্ষে ৮ অক্ষর'}
                    className="w-full pl-9 pr-10 py-3 text-xs text-[#17211F] bg-[#F9FCFB] border border-[#E4EBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A878]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setFShowPassword(!fShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {fShowPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F0F4F2] bg-[#F9FCFB]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#17211F]/60 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleTeamSave}
                disabled={fSaving || !fName || !fEmail}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#063F35] hover:bg-[#042F28] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {fSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>{editingMember ? 'আপডেট করুন' : 'যুক্ত করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
  );
};

export default SettingsPage;
