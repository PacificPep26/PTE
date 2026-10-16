import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../../stores/languageStore';
import { clsx } from 'clsx';

export function VietnamFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={clsx("rounded-[2px] shadow-xs overflow-hidden shrink-0 inline-block align-middle", className)}>
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,4 16.47,8.53 21.23,8.53 17.38,11.33 18.85,15.86 15,13.06 11.15,15.86 12.62,11.33 8.77,8.53 13.53,8.53"
        fill="#FFFF00"
      />
    </svg>
  );
}

export function UKFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={clsx("rounded-[2px] shadow-xs overflow-hidden shrink-0 inline-block align-middle", className)}>
      <clipPath id="uk-clip">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="uk-t-clip">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t-clip)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

interface LanguageSwitcherProps {
  variant?: 'pill' | 'compact' | 'settings';
  theme?: 'light' | 'dark';
  className?: string;
}

export function LanguageSwitcher({ variant = 'pill', theme = 'light', className }: LanguageSwitcherProps) {
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
              ? "border-amber-400 bg-amber-500/10 text-gray-950 shadow-sm ring-1 ring-amber-400/50"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          )}
        >
          <div className="flex items-center gap-3">
            <VietnamFlag className="w-7 h-5" />
            <div>
              <p className="font-bold text-sm text-gray-900">Tiếng Việt</p>
              <p className="text-xs text-gray-500">{t('profile.vietnameseDesc')}</p>
            </div>
          </div>
          {language === 'vi' && <Check size={18} className="text-amber-600 stroke-[2.5]" />}
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={clsx(
            "flex-1 flex items-center justify-between p-3.5 rounded-xl border transition-all text-left",
            language === 'en'
              ? "border-amber-400 bg-amber-500/10 text-gray-950 shadow-sm ring-1 ring-amber-400/50"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          )}
        >
          <div className="flex items-center gap-3">
            <UKFlag className="w-7 h-5" />
            <div>
              <p className="font-bold text-sm text-gray-900">English</p>
              <p className="text-xs text-gray-500">{t('profile.englishDesc')}</p>
            </div>
          </div>
          {language === 'en' && <Check size={18} className="text-amber-600 stroke-[2.5]" />}
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
          theme === 'dark'
            ? "border-white/10 hover:border-amber-400/40 bg-white/5 hover:bg-white/10 text-white/90"
            : "border-gray-200 hover:border-amber-400 bg-white hover:bg-gray-50 text-gray-700 shadow-xs",
          className
        )}
        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      >
        {language === 'vi' ? <VietnamFlag className="w-4 h-3" /> : <UKFlag className="w-4 h-3" />}
        <span>{language === 'vi' ? 'VI' : 'EN'}</span>
      </button>
    );
  }

  // Default 'pill' variant
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        "inline-flex items-center p-0.5 rounded-xl transition-colors",
        isDark
          ? "bg-white/[0.08] border border-white/10 shadow-inner"
          : "bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 shadow-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
          language === 'vi'
            ? isDark
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black shadow-sm"
              : "bg-white text-gray-950 font-black shadow-sm border border-amber-400/80 ring-1 ring-amber-400/30"
            : isDark
              ? "text-gray-300 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
        )}
      >
        <VietnamFlag className="w-4 h-3" />
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
          language === 'en'
            ? isDark
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black shadow-sm"
              : "bg-white text-gray-950 font-black shadow-sm border border-amber-400/80 ring-1 ring-amber-400/30"
            : isDark
              ? "text-gray-300 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
        )}
      >
        <UKFlag className="w-4 h-3" />
        <span>EN</span>
      </button>
    </div>
  );
}
