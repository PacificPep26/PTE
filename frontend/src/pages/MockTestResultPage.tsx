import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Mic, PenTool, BookOpen, Headphones, RotateCcw, List, Home, AlertCircle, Clock } from 'lucide-react';
import { mockTestApi } from '../api';
import { Button } from '../components/ui';
import { BrandLogo } from '../components/common/BrandLogo';

const SECTION_CONFIG = [
  { key: 'speaking', label: 'Speaking', icon: Mic, iconColor: 'text-amber-600', bg: 'bg-amber-50', color: 'yellow' },
  { key: 'writing',  label: 'Writing',  icon: PenTool, iconColor: 'text-blue-600', bg: 'bg-blue-50', color: 'orange' },
  { key: 'reading',  label: 'Reading',  icon: BookOpen, iconColor: 'text-emerald-600', bg: 'bg-emerald-50', color: 'black' },
  { key: 'listening',label: 'Listening',icon: Headphones, iconColor: 'text-purple-600', bg: 'bg-purple-50', color: 'gradient' },
];

// PTE pass mark by component
const PASS_MARK = 65;

function ScoreGauge({ score, max = 90 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const isPassing = score >= PASS_MARK;
  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={isPassing ? '#F5C518' : '#f97316'}
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 42}`}
          strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-2xl text-gray-900">{Math.round(score)}</span>
        <span className="text-[10px] text-gray-400 font-bold">/ {max}</span>
      </div>
    </div>
  );
}

export default function MockTestResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['mock-attempt', attemptId],
    queryFn: () => mockTestApi.getAttempt(attemptId!),
    enabled: !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-gray-400 mx-auto mb-3" />
          <p className="font-bold text-gray-700">Không tìm thấy kết quả</p>
          <Button variant="yellow" className="mt-4" onClick={() => navigate('/mock-test')}>← Về Mock Test</Button>
        </div>
      </div>
    );
  }

  const total = Math.round(attempt.totalScore || 0);
  const isPassing = total >= PASS_MARK;
  const sections = attempt.sectionScores || { speaking: 0, writing: 0, reading: 0, listening: 0 };

  // Time taken
  let timeTaken = '';
  if (attempt.startedAt && attempt.completedAt) {
    const ms = new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime();
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    timeTaken = `${mins} phút ${secs} giây`;
  }

  const mockTestTitle = attempt.mockTest?.title || 'Mock Test';

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 h-14 flex items-center justify-between sticky top-0 z-30">
        <BrandLogo theme="light" size="sm" />
        <h1 className="font-display font-black text-base">Kết quả thi</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate('/mock-test')}>← Về danh sách</Button>
      </header>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-6">
        {/* Pass/Fail Banner */}
        <div className={clsx(
          'rounded-2xl px-7 py-6 flex items-center justify-between',
          isPassing ? 'bg-brand-black' : 'bg-gray-800'
        )}>
          <div>
            <div className={clsx(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-3',
              isPassing ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
            )}>
              {isPassing ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
            </div>
            <h2 className="font-display font-black text-2xl text-white mb-1">{mockTestTitle}</h2>
            <p className="text-sm text-gray-400">
              {isPassing
                ? 'Chúc mừng! Bạn đã đạt điểm chuẩn PTE Academic.'
                : `Cần ${PASS_MARK} điểm để đạt. Hãy luyện thêm và thử lại!`}
            </p>
            {timeTaken && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <Clock size={12} className="text-brand-gold" /> Thời gian làm bài: {timeTaken}
              </p>
            )}
          </div>
          <ScoreGauge score={total} />
        </div>

        {/* Section Scores */}
        <div className="card p-6">
          <h3 className="font-display font-black text-base mb-5">Điểm theo kỹ năng</h3>
          <div className="space-y-5">
            {SECTION_CONFIG.map(({ key, label, icon: Icon, iconColor, bg, color }) => {
              const score = Math.round(sections[key as keyof typeof sections] || 0);
              const pct = Math.round((score / 90) * 100);
              const pass = score >= PASS_MARK;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center", bg)}>
                        <Icon size={14} className={iconColor} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-[10px] font-black px-2 py-0.5 rounded',
                        pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      )}>
                        {pass ? 'Đạt' : 'Chưa đạt'}
                      </span>
                      <span className="font-display font-black text-lg text-gray-900">{score}<span className="text-xs text-gray-400 font-normal">/90</span></span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-700',
                        color === 'yellow' ? 'bg-brand-gold' :
                        color === 'orange' ? 'bg-amber-600' :
                        color === 'black' ? 'bg-brand-charcoal' :
                        'bg-gradient-to-r from-brand-gold to-brand-gold-bright'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{pct}%</span>
                    <span className="text-[10px] text-gray-400">Mục tiêu: {PASS_MARK}/90</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score breakdown summary */}
        <div className="grid grid-cols-2 gap-4">
          {SECTION_CONFIG.map(({ key, label, icon: Icon, iconColor, bg }) => {
            const score = Math.round(sections[key as keyof typeof sections] || 0);
            return (
              <div key={key} className="card p-4 flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                  <p className="font-display font-black text-xl text-gray-900">{score}<span className="text-xs text-gray-400 font-normal">/90</span></p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="yellow"
            className="flex-1 py-3"
            onClick={() => navigate(`/mock-test/${attempt.mockTestId}`)}
          >
            <RotateCcw size={15} className="mr-1.5 inline" /> Thi lại
          </Button>
          <Button
            variant="dark"
            className="flex-1 py-3"
            onClick={() => navigate('/mock-test')}
          >
            <List size={15} className="mr-1.5 inline" /> Danh sách đề
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-3"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={15} className="mr-1.5 inline" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
