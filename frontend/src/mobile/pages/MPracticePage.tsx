import { useNavigate } from "react-router-dom";
import { MobileHeader } from "../layout/MobileShell";
import { clsx } from "clsx";
import { Mic, PenTool, BookOpen, Headphones, Target } from "lucide-react";

const SKILLS = [
  {
    key: "speaking",
    label: "Speaking",
    icon: Mic,
    iconColor: "text-amber-600",
    desc: "Đọc to, lặp câu, mô tả hình, kể lại bài nghe",
    bg: "from-amber-50 to-yellow-50",
    iconBg: "bg-amber-100",
    border: "border-amber-200/60",
    types: 7,
  },
  {
    key: "writing",
    label: "Writing",
    icon: PenTool,
    iconColor: "text-blue-600",
    desc: "Tóm tắt văn bản, viết luận",
    bg: "from-blue-50 to-sky-50",
    iconBg: "bg-blue-100",
    border: "border-blue-200/60",
    types: 2,
  },
  {
    key: "reading",
    label: "Reading",
    icon: BookOpen,
    iconColor: "text-emerald-600",
    desc: "Điền vào chỗ trống, MCQ, sắp xếp đoạn văn",
    bg: "from-green-50 to-emerald-50",
    iconBg: "bg-emerald-100",
    border: "border-green-200/60",
    types: 5,
  },
  {
    key: "listening",
    label: "Listening",
    icon: Headphones,
    iconColor: "text-purple-600",
    desc: "Tóm tắt, điền từ, chọn câu đúng, viết chính tả",
    bg: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100",
    border: "border-purple-200/60",
    types: 8,
  },
];

export default function MPracticePage() {
  const navigate = useNavigate();

  return (
    <>
      <MobileHeader title="Luyện tập" subtitle="Chọn kỹ năng để bắt đầu" />

      <div className="px-4 space-y-3">
        {/* Banner */}
        <div
          className="rounded-2xl px-4 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold shrink-0">
            <Target size={22} />
          </div>
          <div>
            <p className="font-display font-black text-sm text-white">Luyện tập có mục tiêu</p>
            <p className="text-xs text-white/60 mt-0.5">AI chấm điểm tức thì theo chuẩn PTE</p>
          </div>
        </div>

        {/* Skill cards */}
        <div className="grid grid-cols-2 gap-3">
          {SKILLS.map((skill) => (
            <button
              key={skill.key}
              onClick={() => navigate(`/practice/${skill.key}`)}
              className={clsx(
                "rounded-2xl p-4 text-left border active:scale-[0.97] transition-all",
                `bg-gradient-to-br ${skill.bg}`,
                skill.border
              )}
            >
              <div
                className={clsx(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-3",
                  skill.iconBg
                )}
              >
                <skill.icon size={22} className={skill.iconColor} />
              </div>
              <p className="font-display font-black text-sm text-gray-900 mb-1">{skill.label}</p>
              <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{skill.desc}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2">{skill.types} dạng bài</p>
            </button>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </>
  );
}
