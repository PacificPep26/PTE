import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';
import { formatAuthError } from '../../utils/authErrors';
import { GoogleSignIn } from '../../components/auth/GoogleSignIn';
import { BrandLogo } from '../../components/common/BrandLogo';

// ── Left Hero Panel (Minimalist PTE Study Style) ──────────────────────────────
function HeroLeftPanel() {
  return (
    <div
      className="hidden lg:flex w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden select-none"
      style={{
        background: 'linear-gradient(145deg, #FEE03F 0%, #FDC71A 60%, #F59E0B 100%)',
      }}
    >
      {/* Brand Emblem */}
      <div className="relative z-10">
        <BrandLogo theme="yellow" size="md" showSubtitle />
      </div>

      {/* Center Minimal Typography */}
      <div className="relative z-10 max-w-lg my-auto py-12">
        <h1 className="font-display font-black text-4xl xl:text-5xl text-gray-950 leading-[1.18] mb-5 tracking-tight">
          Luyện thi PTE
          <br />
          <span className="text-gray-900/90">Chấm điểm chuẩn AI.</span>
        </h1>
        <p className="text-gray-900/80 text-base leading-relaxed max-w-md font-medium">
          Hệ thống luyện thi thông minh, phản hồi phát âm theo thời gian thực và đề thi bám sát cấu trúc Pearson.
        </p>
      </div>

      {/* Bottom Footer info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-900/70 font-semibold pt-4">
        <span>Official PTE Academic Standard</span>
        <span>© PTE Study Platform</span>
      </div>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem('fly_remember_email');
    if (saved) setEmail(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const em = email.trim();
    if (!em) {
      setError('Vui lòng nhập Email hoặc Username.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }
    try {
      await login(em, password);
      if (rememberMe) {
        localStorage.setItem('fly_remember_email', em);
      } else {
        localStorage.removeItem('fly_remember_email');
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(formatAuthError(err));
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Banner */}
      <HeroLeftPanel />

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Mobile brand header (desktop hidden) */}
          <div className="lg:hidden mb-6 flex justify-center">
            <BrandLogo theme="light" size="md" />
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Log in
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-400 focus:ring-amber-400"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => window.alert('Vui lòng liên hệ quản trị viên qua Zalo/Email để lấy lại mật khẩu.')}
                className="text-gray-500 hover:text-gray-800 font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Main Yellow CTA Button (PTE Magic Style) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-gray-950 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:brightness-105 flex items-center justify-center gap-2 mt-2"
              style={{
                background: '#FDD52F',
              }}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">hoặc tiếp tục với</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <div>
            <GoogleSignIn variant="login" onError={setError} />
            <p className="text-[11px] text-gray-400 text-center mt-2.5">
              Chưa có tài khoản? Hệ thống sẽ tự động tạo tài khoản mới khi bạn đăng nhập bằng Google.
            </p>
          </div>

          {/* Footer Terms */}
          <p className="text-center text-[11px] text-gray-400 mt-8 leading-relaxed">
            By logging in, you agree to PTE Study's{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Register Page ──────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', fullName: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agree) {
      setError('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }
    const em = form.email.trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (!form.fullName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    try {
      await register(em, form.fullName.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(formatAuthError(err));
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <HeroLeftPanel />

      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Mobile brand header (desktop hidden) */}
          <div className="lg:hidden mb-6 flex justify-center">
            <BrandLogo theme="light" size="md" />
          </div>

          <div className="mb-6">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Sign up
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="name@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Re-enter password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 transition-all bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl p-3">
                {error}
              </div>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 accent-amber-400 mt-0.5"
              />
              <span>
                I agree to PTE Study's{' '}
                <Link to="/terms" className="underline font-bold text-gray-900">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline font-bold text-gray-900">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-gray-950 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:brightness-105 flex items-center justify-center gap-2 mt-2"
              style={{
                background: '#FDD52F',
              }}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          <div>
            <GoogleSignIn variant="register" onError={setError} />
          </div>
        </div>
      </div>
    </div>
  );
}
