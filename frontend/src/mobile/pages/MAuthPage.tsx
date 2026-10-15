import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useTranslation } from "../../stores/languageStore";
import { LanguageSwitcher } from "../../components/common/LanguageSwitcher";
import { MButton, MInput } from "../ui";
import { BrandLogo } from "../../components/common/BrandLogo";
import { formatAuthError } from "../../utils/authErrors";
import { CheckCircle2, Fingerprint } from "lucide-react";

export function MLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { t, language } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanSuccess, setScanSuccess] = React.useState(false);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem("fly_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("fly_remember_email", email);
      } else {
        localStorage.removeItem("fly_remember_email");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  const hasBiometrics = localStorage.getItem("fly_biometrics_enabled") === "true";

  const handleBiometricLogin = () => {
    const token = localStorage.getItem("fly_biometric_token");
    const userStr = localStorage.getItem("fly_biometric_user");

    if (!token || !userStr) {
      alert("Không tìm thấy thông tin sinh trắc học đã lưu. Vui lòng đăng nhập bằng mật khẩu trước và kích hoạt Face ID trong Cài đặt.");
      return;
    }

    setIsScanning(true);
    setScanSuccess(false);

    // Simulate Face ID / Touch ID hardware scan on iOS
    setTimeout(() => {
      setScanSuccess(true);
      setTimeout(() => {
        const user = JSON.parse(userStr);
        localStorage.setItem("fly_edu_token", token);
        useAuthStore.setState({ user, token });
        setIsScanning(false);
        navigate("/dashboard", { replace: true });
      }, 800);
    }, 1200);
  };

  return (
    <div
      className="mobile-page-full flex flex-col relative"
      style={{ background: "linear-gradient(175deg, #fffdf8 0%, #fef9e7 60%, #fdf6d9 100%)" }}
    >
      {/* Biometric Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl motion-safe:animate-fade-in-up">
            <div className="flex justify-center py-1">
              {scanSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              ) : (
                <Fingerprint className="w-12 h-12 text-amber-500 animate-pulse" />
              )}
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">
              {scanSuccess ? "Xác thực thành công" : "Xác thực Face ID / Touch ID"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {scanSuccess
                ? "Đang đăng nhập vào hệ thống..."
                : "Vui lòng nhìn vào camera hoặc đặt ngón tay lên cảm biến để tiếp tục."}
            </p>
            {!scanSuccess && (
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="text-xs text-gray-400 font-bold hover:text-gray-600 underline pt-2"
              >
                Huỷ bỏ
              </button>
            )}
          </div>
        </div>
      )}

      {/* Language Switcher top bar */}
      <div className="flex justify-end px-6 pt-4">
        <LanguageSwitcher variant="pill" />
      </div>

      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
        <BrandLogo theme="light" size="lg" showSubtitle />
      </div>

      {/* Form */}
      <div className="px-6 pb-8">
        <div className="m-card-elevated rounded-3xl p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-gray-900">{t('auth.login')}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <MInput
              label={t('auth.email')}
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <MInput
              label={t('auth.password')}
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-xs text-gray-500"
                >
                  {showPwd ? (language === 'vi' ? "Ẩn" : "Hide") : (language === 'vi' ? "Hiện" : "Show")}
                </button>
              }
            />

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-xs text-gray-500 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                  style={{ accentColor: '#eab308' }}
                />
                {t('auth.rememberMe')}
              </label>
            </div>

            <div className="flex gap-2.5 mt-2">
              <MButton
                type="submit"
                variant="primary"
                loading={isLoading}
                className="flex-1"
              >
                {t('auth.login')}
              </MButton>
              
              {hasBiometrics && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-12 h-12 rounded-2xl border border-brand-gold/20 flex items-center justify-center bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all shadow-sm"
                  title="Đăng nhập sinh trắc học"
                >
                  <Fingerprint className="w-6 h-6 text-amber-700" />
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500">
            {t('auth.dontHaveAccount')}{" "}
            <Link to="/register" className="text-brand-gold font-bold">
              {t('auth.register')}
            </Link>
          </p>

          <div className="rounded-2xl bg-gray-50/80 px-4 py-3 text-center text-[11px] leading-relaxed text-gray-500">
            <p>
              {language === 'vi' ? 'Đọc ' : 'Read our '}
              <Link to="/privacy" className="font-semibold text-brand-gold">
                {language === 'vi' ? 'Chính sách quyền riêng tư' : 'Privacy Policy'}
              </Link>{" "}
              {language === 'vi' ? 'và ' : 'and '}
              <Link to="/terms" className="font-semibold text-brand-gold">
                {language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Service'}
              </Link>
              .
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          PTE Study • {language === 'vi' ? 'Đồng hành cùng bạn đến 79+' : 'Your path to 79+'}
        </p>
      </div>
    </div>
  );
}

export function MRegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const { t, language } = useTranslation();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError(language === 'vi' ? "Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật để tiếp tục." : "Please agree to Terms of Service and Privacy Policy.");
      return;
    }
    try {
      await register(email, fullName, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(formatAuthError(err));
    }
  };

  return (
    <div
      className="mobile-page-full flex flex-col"
      style={{ background: "linear-gradient(175deg, #fffdf8 0%, #fef9e7 60%, #fdf6d9 100%)" }}
    >
      {/* Language Switcher top bar */}
      <div className="flex justify-end px-6 pt-4">
        <LanguageSwitcher variant="pill" />
      </div>

      <div className="flex flex-col items-center px-6 pt-10 pb-6">
        <BrandLogo theme="light" size="lg" showSubtitle className="mb-3" />
        <h1 className="font-display font-black text-2xl text-gray-900 mb-1">{t('auth.register')}</h1>
        <p className="text-sm text-gray-500">{t('auth.registerSubtitle')}</p>
      </div>

      <div className="px-6 pb-8">
        <div className="m-card-elevated rounded-3xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <MInput
              label={t('auth.fullName')}
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <MInput
              label={t('auth.email')}
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <MInput
              label={t('auth.password')}
              type="password"
              placeholder={language === 'vi' ? "Tối thiểu 6 ký tự" : "At least 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            
            <div className="flex items-start gap-2.5 py-1">
              <input
                id="agree-checkbox"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold mt-0.5"
                style={{ accentColor: '#eab308' }}
                required
              />
              <label htmlFor="agree-checkbox" className="text-xs text-gray-500 leading-normal select-none">
                {language === 'vi' ? 'Tôi đồng ý với ' : 'I agree to '}
                <Link to="/terms" className="font-semibold text-brand-gold underline">
                  {language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Service'}
                </Link>{" "}
                {language === 'vi' ? 'và ' : 'and '}
                <Link to="/privacy" className="font-semibold text-brand-gold underline">
                  {language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}
                </Link>
                .
              </label>
            </div>

            <MButton type="submit" variant="primary" fullWidth loading={isLoading} className="mt-2">
              {t('auth.register')}
            </MButton>
          </form>

          <p className="text-center text-sm text-gray-500">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-brand-gold font-bold">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
