import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Mic, PenTool, BookOpen, Headphones, Edit3, FileText, Flame, Trophy } from 'lucide-react';
import { usersApi } from '../api';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../stores/languageStore';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { MainLayout } from '../components/layout/Sidebar';
import { Button } from '../components/ui';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t, language } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState(user?.fullName || '');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: usersApi.getStats,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: usersApi.getLeaderboard,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { fullName: string }) => usersApi.updateProfile(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setUser({ ...user!, fullName: data.fullName });
      setEditing(false);
    },
  });

  const initials = (profile?.fullName || user?.fullName || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const skillLabels: Record<string, string> = {
    SPEAKING: 'Speaking',
    WRITING: 'Writing',
    READING: 'Reading',
    LISTENING: 'Listening',
  };

  const myRank = leaderboard?.findIndex((u: any) => u.id === (profile?.id || user?.id));
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <MainLayout>
      <div className="min-h-screen bg-brand-cream">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 h-14 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-display font-black text-lg">{t('profile.myProfile')}</h1>
          <Button variant="yellow" size="sm" onClick={() => setEditing(true)}>
            <Edit3 size={14} className="mr-1 inline" /> {t('common.edit')}
          </Button>
        </div>

        <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="card p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-yellow flex items-center justify-center font-display font-black text-2xl text-brand-black">
                    {initials}
                  </div>
                )}
                {myRank !== undefined && myRank >= 0 && (
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-black">
                    #{myRank + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">{t('auth.fullName')}</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="yellow" size="sm"
                        onClick={() => updateMutation.mutate({ fullName })}
                        loading={updateMutation.isPending}>
                        {t('common.save')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setFullName(profile?.fullName || ''); }}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-black text-xl text-gray-900">{profile?.fullName || user?.fullName}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{profile?.email || user?.email}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                        <Flame size={13} className="text-amber-500" /> {profile?.streakDays || 0} {language === 'vi' ? 'ngày streak' : 'days streak'}
                      </span>
                      {myRank !== undefined && myRank >= 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-orange-deep bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-md">
                          <Trophy size={13} className="text-brand-orange" /> {language === 'vi' ? `Top #${myRank + 1} bảng xếp hạng` : `Top #${myRank + 1} leaderboard`}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Score - Only show for normal users */}
              {!isAdminOrTeacher && (
                <div className="text-center flex-shrink-0">
                  <div className="bg-brand-black rounded-2xl px-6 py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('dashboard.avgScore')}</p>
                    <p className="font-display font-black text-4xl text-brand-yellow leading-none">
                      {Math.round(stats?.avgScore || 0)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">/ 90 {language === 'vi' ? 'điểm' : 'pts'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Selection Card */}
          <div className="card p-6">
            <h3 className="font-display font-black text-base mb-1">{t('profile.language')}</h3>
            <p className="text-xs text-gray-500 mb-4">{t('profile.selectLanguage')}</p>
            <LanguageSwitcher variant="settings" />
          </div>

          {/* Admin Info Section */}
          {isAdminOrTeacher && (
            <div className="card p-6">
              <h3 className="font-display font-black text-base mb-4">Thông tin Quản trị viên</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Tài khoản của bạn được cấp quyền <strong>{user?.role === 'admin' ? 'Quản trị viên tối cao (Admin)' : 'Giáo viên (Teacher)'}</strong>. 
                  Bạn có quyền truy cập vào Trang quản trị để quản lý câu hỏi, người dùng và các kỳ thi thử.
                </p>
                <Button variant="yellow" onClick={() => window.location.href = '/admin'}>
                  Truy cập Trang Quản Trị
                </Button>
              </div>
            </div>
          )}

          {/* Stats Grid - Only show for normal users */}
          {!isAdminOrTeacher && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tổng câu đã làm', value: stats?.totalAttempts || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Streak hiện tại', value: `${profile?.streakDays || 0} ngày`, icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((s) => (
                  <div key={s.label} className="card p-5 flex items-center gap-4">
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", s.bg)}>
                      <s.icon size={22} className={s.color} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
                      <p className="font-display font-black text-2xl text-gray-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-Skill Stats */}
              {stats?.skillStats && (
                <div className="card p-6">
                  <h3 className="font-display font-black text-base mb-4">Thống kê theo kỹ năng</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.skillStats).map(([skill, data]: [string, any]) => {
                      const avg = Math.round(data.avgScore || 0);
                      const pct = Math.round((avg / 90) * 100);
                      return (
                        <div key={skill}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-bold text-gray-700">{skillLabels[skill] || skill}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{data.count} câu</span>
                              <span className="text-sm font-black text-brand-orange">{avg}/90</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-yellow to-brand-orange rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Attempts */}
              {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <h3 className="font-display font-black text-sm">Lịch sử gần đây</h3>
                  </div>
                  {stats.recentAttempts.map((a: any) => {
                    const SkillIcon = a.skill === 'SPEAKING' ? Mic : a.skill === 'WRITING' ? PenTool : a.skill === 'READING' ? BookOpen : Headphones;
                    return (
                      <div key={a.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50">
                        <div className="w-8 h-8 bg-brand-gold-soft rounded-lg flex items-center justify-center text-brand-gold flex-shrink-0">
                          <SkillIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{a.questionCode}</p>
                          <p className="text-[10px] text-gray-400">{a.questionType?.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-brand-orange">{a.score || '-'}</p>
                          <p className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leaderboard */}
              {leaderboard && leaderboard.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-display font-black text-sm flex items-center gap-1.5">
                      <Trophy size={16} className="text-brand-gold" /> Bảng xếp hạng
                    </h3>
                    <span className="text-[10px] text-gray-400">Top {leaderboard.length} người dùng</span>
                  </div>
                  {leaderboard.slice(0, 10).map((u: any, idx: number) => {
                    const isMe = u.id === (profile?.id || user?.id);
                    return (
                      <div key={u.id} className={clsx(
                        'flex items-center gap-3 px-5 py-3 border-b border-gray-50',
                        isMe ? 'bg-brand-yellow-soft border-brand-yellow/30' : 'hover:bg-gray-50'
                      )}>
                        <span className={clsx(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0',
                          idx === 0 ? 'bg-amber-400 text-gray-950 font-extrabold shadow-sm' :
                          idx === 1 ? 'bg-slate-300 text-slate-800 font-bold' :
                          idx === 2 ? 'bg-amber-700 text-white font-bold' : 'bg-gray-100 text-gray-500'
                        )}>
                          #{idx + 1}
                        </span>
                        <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center text-brand-yellow text-xs font-black flex-shrink-0">
                          {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={clsx('text-sm font-bold truncate', isMe ? 'text-brand-orange' : 'text-gray-800')}>
                            {u.fullName} {isMe && '(bạn)'}
                          </p>
                          <p className="text-[10px] text-gray-400">{u.totalAttempts} câu · {u.streakDays} ngày streak</p>
                        </div>
                        <span className="font-display font-black text-brand-orange">{Math.round(u.averageScore || 0)}/90</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
