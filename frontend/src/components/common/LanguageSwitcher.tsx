import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../../stores/languageStore';
import { clsx } from 'clsx';
import { LUX } from '../../theme/luxuryPalette';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'settings';
  className?: string;
}

export function LanguageSwitcher({ variant = 'pill', className }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage, t } = useTranslation();

  if (variant === 'settings') {
    return (
      <div className={clsx("flex flex-col sm:flex-row gap-3", className)}>
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={clsx(
            "flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all text-left",
            language === 'vi'
              ? "border-amber-400 bg-amber-500/10 text-brand-black shadow-sm"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🇻🇳</span>
            <div>
              <p className="font-bold text-sm">Tiếng Việt</p>
              <p className="text-xs text-gray-500">Giao diện tiếng Việt chuẩn</p>
            </div>
          </div>
          {language === 'vi' && <Check size={18} className="text-amber-500 stroke-[2.5]" />}
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={clsx(
            "flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all text-left",
            language === 'en'
              ? "border-amber-400 bg-amber-500/10 text-brand-black shadow-sm"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🇬🇧</span>
            <div>
              <p className="font-bold text-sm">English</p>
              <p className="text-xs text-gray-500">English user interface</p>
            </div>
          </div>
          {language === 'en' && <Check size={18} className="text-amber-500 stroke-[2.5]" />}
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
          "border-white/10 hover:border-amber-400/40 bg-white/5 hover:bg-white/10 text-white/90",
          className
        )}
        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      >
        <Globe size={13} className="text-amber-400" />
        <span>{language === 'vi' ? 'VI' : 'EN'}</span>
      </button>
    );
  }

  // Default 'pill' variant (e.g. for Sidebar or Header)
  return (
    <div
      className={clsx(
        "inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/10 shadow-inner",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
          language === 'vi'
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm font-extrabold"
            : "text-gray-400 hover:text-white"
        )}
      >
        <span>🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
          language === 'en'
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-sm font-extrabold"
            : "text-gray-400 hover:text-white"
        )}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
