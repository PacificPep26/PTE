import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Check, Sparkles, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';
import { formatAuthError } from '../../utils/authErrors';
import { GoogleSignIn } from '../../components/auth/GoogleSignIn';
import { logoUrl } from '../../assets';

// ── Left Hero Panel (PTE Magic Style) ──────────────────────────────────────────
function HeroLeftPanel() {
  return (
    <div
      className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden select-none"
      style={{
        background: 'linear-gradient(145deg, #FEE03F 0%, #FDC71A 60%, #F59E0B 100%)',
      }}
    >
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Decorative Shapes */}
      <div className="absolute top-12 right-20 text-indigo-700/60 text-2xl font-black rotate-12">★</div>
      <div className="absolute bottom-24 left-10 text-rose-500/50 text-xl font-black -rotate-12">✦</div>
      <div className="absolute top-1/2 right-12 text-amber-800/40 text-lg font-black rotate-45">■</div>

      {/* Top Brand Pill */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 bg-black/90 text-white px-4 py-2 rounded-2xl shadow-lg border border-white/10">
          <div className="w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center font-black text-black text-xs">
            FLY
          </div>
          <div className="leading-tight">
            <span className="font-display font-black text-xs tracking-wider uppercase">FLY PTE</span>
            <span className="text-[10px] text-amber-300 block font-medium">AI Practice Platform</span>
          </div>
        </div>
      </div>

      {/* Center Copy */}
      <div className="relative z-10 max-w-md my-auto pt-6">
        <h1 className="font-display font-black text-3xl xl:text-4xl text-gray-950 leading-[1.2] mb-3 tracking-tight">
          Better Practice. Better Results.
          <br />
          <span className="text-gray-900">With FLY PTE Platform.</span>
        </h1>
        <p className="text-gray-800/90 text-sm leading-relaxed mb-8 font-medium">
          Join 100,000+ students who trust FLY PTE to achieve their dream Pearson Test of English scores for migration, study, or work abroad.
        </p>

        {/* Floating Cards (Student Result + Skills Breakdown) */}
        <div className="space-y-4">
          {/* Curved banner ribbon */}
          <div className="bg-black/90 text-amber-300 font-mono text-[11px] font-bold py-1.5 px-4 rounded-full w-fit shadow-md flex items-center gap-2 border border-amber-400/20">
            <span>★</span>
            <span className="tracking-wide">Achieve PTE 79+, the Smart Way · AI Scoring</span>
          </div>

          {/* Student Profile Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60 flex items-center justify-between max-w-sm hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 font-bold shadow-inner">
                <GraduationCap size={20} className="text-amber-800" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Alice Pham</p>
                <p className="text-[11px] text-gray-500 font-medium">Test Taker ID: PTE9582739</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">MOCK TEST 14 · 3 HOURS</p>
              </div>
            </div>
            <div className="text-center bg-amber-400/25 px-3 py-1.5 rounded-xl border border-amber-400/40">
              <span className="text-[9px] font-bold text-amber-900 uppercase block tracking-wider">Overall</span>
              <span className="font-display font-black text-2xl text-gray-950 leading-none">79+</span>
            </div>
          </div>

          {/* Skills Breakdown Widget */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60 max-w-sm space-y-2.5 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Skills Breakdown</span>
              <span className="text-[10px] font-bold text-gray-400">PTE Target 79</span>
            </div>

            {[
              { skill: 'Speaking',  score: 82, color: 'bg-amber-500' },
              { skill: 'Writing',   score: 79, color: 'bg-cyan-500' },
              { skill: 'Reading',   score: 78, color: 'bg-emerald-500' },
              { skill: 'Listening', score: 80, color: 'bg-blue-600' },
            ].map((s) => (
              <div key={s.skill} className="flex items-center text-xs gap-3">
                <span className="w-16 font-semibold text-gray-600 text-[11px]">{s.skill}</span>
                <span className="w-6 font-bold text-gray-900 text-[11px] tabular-nums">{s.score}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-700', s.color)}
                    style={{ width: `${(s.score / 90) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-900/70 font-semibold pt-4">
        <span>Official PTE Academic Standard</span>
        <span>© FLY Education Technology</span>
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
          {/* Top Logo & Back Button */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to homepage
            </Link>

            <img src={logoUrl} alt="FLY PTE" className="h-8 w-auto object-contain" />
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
              <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <div>
            <GoogleSignIn variant="login" onError={setError} />
          </div>

          {/* Footer Terms */}
          <p className="text-center text-[11px] text-gray-400 mt-8 leading-relaxed">
            By logging in, you agree to FLY PTE's{' '}
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
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to homepage
            </Link>

            <img src={logoUrl} alt="FLY PTE" className="h-8 w-auto object-contain" />
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
                I agree to FLY PTE's{' '}
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
