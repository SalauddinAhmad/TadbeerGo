import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { RubElHizbIcon } from '../../components/icons/IslamicIcons';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'ps'>('owner');
  const [email, setEmail] = useState('admin@mokhterahmad.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: 'owner' | 'ps') => {
    setSelectedRole(role);
    setError('');
    if (role === 'owner') {
      setEmail('admin@mokhterahmad.com');
      setPassword('password123');
    } else {
      setEmail('ps@mokhterahmad.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F4EFEB] font-bengali selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Background Soft Ambient Geometry */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Main Login Bento Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[32px] p-7 sm:p-9 bg-white border border-[#E6E0D6] shadow-[0_16px_48px_-12px_rgba(20,35,28,0.06)] text-[#16221E]">
        
        {/* =========================================================================
            SCHOLAR PORTRAIT & EDITORIAL HEADER
           ========================================================================= */}
        <div className="flex flex-col items-center text-center mb-6">
          
          {/* Portrait Container with Crisp Double Ring */}
          <div className="relative mb-3.5 group">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#3E5514] via-[#4D6819] to-[#6E3A0D] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#3E5514]">
                <img
                  src="/shaikh-portrait.jpg"
                  alt="শায়খ মোখতার আহমাদ"
                  className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Verified Badge */}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#3E5514] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <CheckCircle2 size={13} strokeWidth={2.8} />
            </div>
          </div>

          {/* Product Brand Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-black tracking-tight font-sans text-[#3E5514]">
              Tadbeer<span className="text-[#6E3A0D]">Go</span>
            </h1>
          </div>

          {/* Scholar Subtitle Badge */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF5ED] border border-[#EAD7C7] text-xs font-semibold text-[#586661]">
            <RubElHizbIcon size={11} className="text-[#6E3A0D]" />
            <span>শায়খ মোখতার আহমাদ</span>
            <span className="text-[#EAD7C7]">·</span>
            <span className="text-[#6E3A0D] font-bold">ব্যক্তিগত পোর্টাল</span>
          </div>
        </div>

        {/* =========================================================================
            SMART EXECUTIVE ROLE SELECTOR (REPLACES RAW EMOJIS)
           ========================================================================= */}
        <div className="mb-5 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-bold font-heading text-[#586661] px-1">
            <span>প্রবেশের প্রোফাইল বেছে নিন</span>
            <span className="text-[10px] text-[#3E5514] font-semibold bg-[#F2F6EC] px-2 py-0.5 rounded-full border border-[#D2DEC1]">
              ১-ক্লিক সুইচ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Option 1: Scholar / Principal */}
            <button
              type="button"
              onClick={() => handleSelectRole('owner')}
              className={`p-3 rounded-2xl border transition-all text-left cursor-pointer relative overflow-hidden group ${
                selectedRole === 'owner'
                  ? 'bg-gradient-to-br from-[#F4F8F0] to-[#EAF2E2] border-[#3E5514] shadow-sm ring-2 ring-[#3E5514]/20'
                  : 'bg-[#FAF7F2] hover:bg-[#F5EFE6] border-[#E8E2D7] text-[#586661]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition ${
                  selectedRole === 'owner'
                    ? 'bg-[#3E5514] text-white border-[#3E5514]'
                    : 'bg-white text-[#586661] border-[#E8E2D7]'
                }`}>
                  <UserCheck size={14} strokeWidth={2.5} />
                </div>
                <span className={`text-xs font-bold font-heading truncate ${
                  selectedRole === 'owner' ? 'text-[#1E310E]' : 'text-[#16221E]'
                }`}>
                  শায়খ মোখতার
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#7A8A84] truncate pl-0.5">
                প্রধান স্কলার ও মালিক
              </p>
              {selectedRole === 'owner' && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#3E5514] shadow-[0_0_6px_#3E5514]"></span>
              )}
            </button>

            {/* Option 2: Executive Secretary / PS */}
            <button
              type="button"
              onClick={() => handleSelectRole('ps')}
              className={`p-3 rounded-2xl border transition-all text-left cursor-pointer relative overflow-hidden group ${
                selectedRole === 'ps'
                  ? 'bg-gradient-to-br from-[#FDF6EF] to-[#F8ECE0] border-[#6E3A0D] shadow-sm ring-2 ring-[#6E3A0D]/20'
                  : 'bg-[#FAF7F2] hover:bg-[#F5EFE6] border-[#E8E2D7] text-[#586661]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition ${
                  selectedRole === 'ps'
                    ? 'bg-[#6E3A0D] text-white border-[#6E3A0D]'
                    : 'bg-white text-[#586661] border-[#E8E2D7]'
                }`}>
                  <Briefcase size={13} strokeWidth={2.5} />
                </div>
                <span className={`text-xs font-bold font-heading truncate ${
                  selectedRole === 'ps' ? 'text-[#4A2608]' : 'text-[#16221E]'
                }`}>
                  অফিস সচিব (পিএস)
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#7A8A84] truncate pl-0.5">
                শিডিউল ও সমন্বয়কারী
              </p>
              {selectedRole === 'ps' && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#6E3A0D] shadow-[0_0_6px_#6E3A0D]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-[#586661] px-1 font-heading">
              ইমেইল অ্যাড্রেস
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9893]">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E6E0D6] text-xs sm:text-sm text-[#16221E] font-medium outline-hidden focus:border-[#6E3A0D] focus:bg-white focus:ring-1 focus:ring-[#6E3A0D] transition placeholder:text-[#8A9893]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-[#586661] px-1 font-heading">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A9893]">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E6E0D6] text-xs sm:text-sm text-[#16221E] font-medium outline-hidden focus:border-[#6E3A0D] focus:bg-white focus:ring-1 focus:ring-[#6E3A0D] transition placeholder:text-[#8A9893]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A9893] hover:text-[#16221E] transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button - Styled to Match Active Role */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 bg-[#6E3A0D] hover:bg-[#854610] text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? (
              <span>যাচাই করা হচ্ছে...</span>
            ) : (
              <>
                <span>
                  {selectedRole === 'owner' ? 'শায়খ ড্যাশবোর্ডে প্রবেশ করুন' : 'পিএস পোর্টালে প্রবেশ করুন'}
                </span>
                <span className="w-6 h-6 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0">
                  <ArrowRight size={13} strokeWidth={2.5} />
                </span>
              </>
            )}
          </button>
        </form>

        {/* Executive Platform Security Assurance */}
        <div className="mt-6 pt-4 border-t border-[#F0EBE3] flex items-center justify-center gap-2 text-xs text-[#8A9893]">
          <ShieldCheck size={14} className="text-[#3E5514]" />
          <span>দ্বীনি কার্যক্রম ও ব্যক্তিগত শিডিউল সুরক্ষা প্ল্যাটফর্ম</span>
        </div>

      </div>
    </div>
  );
};
