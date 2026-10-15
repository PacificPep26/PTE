import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { formatAuthError } from '../../utils/authErrors';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const DEFAULT_CLIENT_ID = '571666382924-lk2vss832i2ts8fiumebq5jchm6u8v1h.apps.googleusercontent.com';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function GoogleSignIn({
  onError,
  variant = 'login',
}: {
  onError: (msg: string) => void;
  variant?: 'login' | 'register';
}) {
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const divRef = useRef<HTMLDivElement>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || DEFAULT_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    setInitError(null);

    const callback = async (response: { credential: string }) => {
      try {
        await loginWithGoogle(response.credential);
        navigate('/dashboard');
      } catch (e: unknown) {
        onError(formatAuthError(e));
      }
    };

    const render = () => {
      const el = divRef.current;
      if (!el || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({ client_id: clientId, callback });
        window.google.accounts.id.renderButton(el, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 380,
          text: variant === 'register' ? 'signup_with' : 'signin_with',
          locale: 'vi',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
        setIsReady(true);
      } catch {
        const msg =
          'Google Sign-In chưa sẵn sàng. Kiểm tra Authorized JavaScript origins trong Google Cloud Console.';
        setInitError(msg);
        onError(msg);
      }
    };

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (window.google?.accounts?.id) render();
      else existing.addEventListener('load', render);
      return () => existing.removeEventListener('load', render);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = render;
    script.onerror = () => {
      const msg = 'Không tải được Google Sign-In script. Kiểm tra mạng hoặc trình duyệt.';
      setInitError(msg);
      onError(msg);
    };
    document.body.appendChild(script);
    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [clientId, loginWithGoogle, navigate, onError, variant]);

  return (
    <div className="w-full">
      <div className="flex min-h-[44px] justify-center items-center w-full relative">
        {/* Placeholder while GIS script downloads */}
        {!isReady && (
          <div className="w-full max-w-[380px] h-[44px] flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-xs shadow-sm">
            <GoogleIcon />
            <span>Tiếp tục với Google</span>
          </div>
        )}
        {/* Isolated DOM container exclusively for Google GIS. React NEVER puts children in this div */}
        <div
          ref={divRef}
          className={!isReady ? 'hidden' : 'w-full flex justify-center'}
        />
      </div>
      {initError && (
        <p className="mt-2 text-xs text-amber-700 text-center font-medium">
          {initError}
        </p>
      )}
    </div>
  );
}
