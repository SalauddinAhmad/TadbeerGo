import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { RubElHizbIcon } from '../../components/icons/IslamicIcons';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
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

  const setDemoCredentials = (role: 'owner' | 'ps') => {
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
        <div className="flex flex-col items-center text-center mb-7">
          
          {/* Portrait Container with Crisp Double Ring */}
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#3E5514] via-[#4D6819] to-[#6E3A0D] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#3E5514]">
                <img
                  src="/shaikh-portrait.jpg"
                  alt="শায়খ মোখতার আহমাদ"
                  className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Verified Badge */}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#3E5514] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <CheckCircle2 size={15} strokeWidth={2.8} />
            </div>
          </div>

          {/* Product Brand Title */}
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-black tracking-tight font-sans text-[#3E5514]">
              Tadbeer<span className="text-[#6E3A0D]">Go</span>
            </h1>
          </div>

          {/* Scholar Subtitle Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF5ED] border border-[#EAD7C7] text-xs font-semibold text-[#586661]">
            <RubElHizbIcon size={12} className="text-[#6E3A0D]" />
            <span>শায়খ মোখতার আহমাদ</span>
            <span className="text-[#EAD7C7]">·</span>
            <span className="text-[#6E3A0D] font-bold">ডিজিটাল ডায়েরি</span>
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

          {/* Primary Submit Button - Chocolate Pill matching user reference */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 bg-[#6E3A0D] hover:bg-[#854610] text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? (
              <span>যাচাই করা হচ্ছে...</span>
            ) : (
              <>
                <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                <span className="w-6 h-6 rounded-full bg-[#8A603E] text-white flex items-center justify-center shrink-0">
                  <ArrowRight size={13} strokeWidth={2.5} />
                </span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-5 border-t border-[#F0EBE3] text-center">
          <p className="text-[11px] font-semibold text-[#8A9893] mb-2.5">
            দ্রুত ডেমো অ্যাকাউন্টে প্রবেশ করুন:
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('owner')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F2F6EC] border border-[#E6E0D6] text-[#3E5514] transition cursor-pointer"
            >
              👑 স্কলার (মালিক)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('ps')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#FDF5ED] border border-[#E6E0D6] text-[#6E3A0D] transition cursor-pointer"
            >
              📋 পিএস / সহকারী
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
