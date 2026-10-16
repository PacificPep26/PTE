import re
import json
import logging
from typing import List, Tuple, Set, Optional, Any
from models import QuestionData, ScoreResult

logger = logging.getLogger("writing")

# ── Rule-based Stemmer (offline, fast, no external dependencies) ──────────────
def _stem_word(w: str) -> str:
    w = w.lower().strip()
    if len(w) <= 3:
        return w
    for suffix in [
        'ation', 'ition', 'ution', 'sion', 'tion', 'ment', 'able', 'ible',
        'ness', 'ence', 'ance', 'ties', 'ting', 'ping', 'ning', 'ring',
        'ized', 'ised', 'ying', 'ally', 'fully', 'less', 'ship',
        'ing', 'ies', 'ied', 'ive', 'ful', 'ous', 'ers', 'est', 'ism', 'ist',
        'ed', 'es', 'ly', 'er', 'al', 's'
    ]:
        if w.endswith(suffix) and len(w) - len(suffix) >= 3:
            return w[:-len(suffix)]
    return w

_STOP_WORDS = set("""
a about above after again against all am an and any are aren't as at be because been before being below
between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each
few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers
herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more
most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same
shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them
themselves then there there's these they they'd they'll they're they've this those through to too under
until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's
which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've
also however although therefore furthermore moreover nevertheless whereas instead
one two three four five first second third many much also said says say
well even like make made used using use people time lecture discusses speaker talks topic
""".split())

def _extract_keywords(text: str, top_n: int = 7) -> List[str]:
    """Offline keyword & key-concept extractor for SWT passages and SST transcripts."""
    if not text:
        return []
    clean = re.sub(r'[^\w\s-]', ' ', text.lower())
    words = [w for w in clean.split() if len(w) > 3 and w not in _STOP_WORDS and not w.isdigit()]
    
    # Extract bigrams
    bigram_counts = {}
    tokens = clean.split()
    for i in range(len(tokens) - 1):
        w1, w2 = tokens[i], tokens[i+1]
        if (len(w1) > 2 and len(w2) > 2 and
            w1 not in _STOP_WORDS and w2 not in _STOP_WORDS and
            not w1.isdigit() and not w2.isdigit()):
            bg = f"{w1} {w2}"
            bigram_counts[bg] = bigram_counts.get(bg, 0) + 1
            
    word_counts = {}
    for w in words:
        word_counts[w] = word_counts.get(w, 0) + 1
        
    results = []
    # Add repeated bigrams first
    for bg, cnt in sorted(bigram_counts.items(), key=lambda x: x[1], reverse=True):
        if cnt >= 2 and len(results) < 3:
            results.append(bg)
            
    # Add top unigrams
    for w, cnt in sorted(word_counts.items(), key=lambda x: x[1], reverse=True):
        if len(results) >= top_n:
            break
        if not any(w in bg for bg in results):
            results.append(w)
            
    return results[:top_n]

def _get_target_keywords(q: QuestionData) -> List[str]:
    """Retrieve pre-compiled keywords from QuestionData, or extract if missing."""
    # 1. From correct_answer if JSON/dict with 'keywords'
    if q.correct_answer:
        ca = q.correct_answer
        if isinstance(ca, str):
            try:
                ca = json.loads(ca)
            except Exception:
                pass
        if isinstance(ca, dict) and "keywords" in ca and isinstance(ca["keywords"], list):
            kws = [str(k).strip() for k in ca["keywords"] if str(k).strip()]
            if kws:
                return kws
        elif isinstance(ca, list):
            kws = [str(k).strip() for k in ca if str(k).strip()]
            if kws:
                return kws

    # 2. From tips if contains 'Từ khóa gợi ý:'
    if q.tips and "Từ khóa gợi ý:" in q.tips:
        part = q.tips.split("Từ khóa gợi ý:")[1].split(".")[0]
        kws = [k.strip() for k in part.split(",") if k.strip()]
        if kws:
            return kws

    # 3. From suggested_answer
    if q.suggested_answer:
        extracted = _extract_keywords(q.suggested_answer, 7)
        if extracted:
            return extracted

    # 4. From content
    if q.content:
        return _extract_keywords(q.content, 7)

    return []

def _match_keywords(student_text: str, target_keywords: List[str]) -> Tuple[List[str], List[str], float]:
    """Matches student text against target keywords using stemming & phrase recognition."""
    if not student_text or not target_keywords:
        return [], target_keywords or [], 0.0

    clean_student = re.sub(r'[^\w\s-]', ' ', student_text.lower())
    student_tokens = clean_student.split()
    student_stems = set(_stem_word(w) for w in student_tokens)
    student_full_text = f" {clean_student} "

    matched = []
    missing = []

    for kw in target_keywords:
        kw_clean = kw.lower().strip()
        if " " not in kw_clean:
            kw_stem = _stem_word(kw_clean)
            if kw_stem in student_stems or any(kw_stem in s for s in student_stems):
                matched.append(kw)
            else:
                missing.append(kw)
        else:
            # Multi-word phrase: match exact phrase or all constituent word stems
            parts = kw_clean.split()
            part_stems = [_stem_word(p) for p in parts]
            if f" {kw_clean} " in student_full_text or all(ps in student_stems for ps in part_stems):
                matched.append(kw)
            else:
                missing.append(kw)

    ratio = len(matched) / len(target_keywords) if target_keywords else 0.0
    return matched, missing, ratio

def _evaluate_grammar(text: str) -> int:
    """Offline rule-based grammar scoring: 0-2 pts."""
    trimmed = text.strip()
    if not trimmed:
        return 0
    words = trimmed.split()
    if len(words) < 5:
        return 0

    score = 2
    # Starts with uppercase letter
    if not trimmed[0].isupper():
        score = min(score, 1)

    # Balanced quotes and parentheses
    if trimmed.count('(') != trimmed.count(')') or trimmed.count('"') % 2 != 0:
        score = min(score, 1)

    # Bad endings (ends with comma, preposition, semicolon)
    if re.search(r'[,;:\-]\s*$', trimmed) or re.search(r'\b(and|or|but|with|in|on|at|of|for|that|which)\s*[\.\?!]?$', trimmed, re.I):
        score = min(score, 1)

    # Blatant duplicate adjacent words ('the the', 'is is')
    for i in range(len(words) - 1):
        if words[i].lower() == words[i+1].lower() and words[i].lower() not in ('that', 'had'):
            score = min(score, 1)

    return score

def _evaluate_vocabulary(text: str, matched_kws: List[str]) -> int:
    """Offline vocabulary scoring: 0-2 pts based on diversity (TTR) and keyword usage."""
    words = [w.lower().strip() for w in re.sub(r'[^\w\s]', '', text).split() if w.strip()]
    if not words:
        return 0
    unique_words = set(words)
    ttr = len(unique_words) / len(words)

    # 2 pts: good diversity + keywords
    if ttr >= 0.65 and len(matched_kws) >= 2:
        return 2
    if ttr >= 0.45 or len(matched_kws) >= 1:
        return 1
    return 0


# ── SWT Scorer ───────────────────────────────────────────────────────────────
async def score_swt(q: QuestionData, text_answer: str) -> ScoreResult:
    """Summarize Written Text — official PTE Academic rubric:
    content 0-2, form 0-1, grammar 0-2, vocabulary 0-2 = total 0-7.
    Scored instantly and deterministically via keyword/key-point matching (0 Gemini tokens)."""
    student_text = (text_answer or "").strip()
    words = student_text.split()
    word_count = len(words)

    # Form check: must be exactly ONE sentence, 5-75 words
    # Check sentence count by looking for terminal punctuation followed by uppercase/space
    sentences = [s.strip() for s in re.split(r'[\.\?!]+\s+', student_text) if s.strip()]
    has_terminal = bool(re.search(r'[\.\?!]$', student_text))
    # Exactly one sentence ending with punctuation
    is_one_sentence = len(sentences) <= 1 and (has_terminal or len(sentences) == 1)
    form_ok = 5 <= word_count <= 75 and is_one_sentence

    form_score = 1 if form_ok else 0

    # Target keywords from question
    target_kws = _get_target_keywords(q)
    matched, missing, match_ratio = _match_keywords(student_text, target_kws)

    # Content score: 0-2
    # PTE official rule: if form=0, content is penalized to 0
    if not form_ok:
        content_score = 0
    elif match_ratio >= 0.50 or len(matched) >= 3:
        content_score = 2
    elif match_ratio >= 0.20 or len(matched) >= 1:
        content_score = 1
    else:
        content_score = 0

    # Grammar score: 0-2
    grammar_score = _evaluate_grammar(student_text)
    if not form_ok and word_count < 5:
        grammar_score = 0

    # Vocabulary score: 0-2
    vocab_score = _evaluate_vocabulary(student_text, matched)
    if not form_ok and word_count < 5:
        vocab_score = 0

    total_score = content_score + form_score + grammar_score + vocab_score

    # Feedback message
    feedback_lines = []
    if matched:
        feedback_lines.append(f"✅ Ý chính đã nắm bắt ({len(matched)}/{len(target_kws)}): {', '.join(matched)}")
    if missing:
        feedback_lines.append(f"⚠️ Ý chính cần bổ sung: {', '.join(missing)}")

    # Form notes
    if not (5 <= word_count <= 75):
        feedback_lines.append(f"📏 Độ dài chưa đạt: {word_count} từ (yêu cầu chuẩn 5–75 từ).")
    elif len(sentences) > 1:
        feedback_lines.append("📏 Lỗi hình thức: Bài viết có nhiều hơn 1 câu (SWT yêu cầu đúng 1 câu duy nhất).")
    else:
        feedback_lines.append(f"📏 Hình thức chuẩn: 1 câu duy nhất, {word_count} từ.")

    if total_score >= 6:
        feedback_lines.append("🎉 Bài tóm tắt xuất sắc, câu văn gãy gọn và bao quát trọn vẹn đoạn văn!")
    elif total_score >= 4:
        feedback_lines.append("👍 Tóm tắt khá tốt. Hãy chú ý bổ sung thêm các ý chính còn thiếu để đạt điểm tối đa.")
    else:
        feedback_lines.append("💡 Hãy đảm bảo viết đúng 1 câu từ 5–75 từ và lồng ghép đủ các từ khóa then chốt của bài.")

    feedback = "\n".join(feedback_lines)

    return ScoreResult(
        total_score=total_score,
        score_breakdown={
            "content": content_score,
            "content_max": 2,
            "form": form_score,
            "form_max": 1,
            "grammar": grammar_score,
            "grammar_max": 2,
            "vocabulary": vocab_score,
            "vocabulary_max": 2,
        },
        feedback=feedback
    )


# ── SST Scorer ───────────────────────────────────────────────────────────────
async def score_sst(q: QuestionData, text_answer: str) -> ScoreResult:
    """Summarize Spoken Text — official PTE Academic rubric:
    content 0-2, form 0-1, grammar 0-2, vocabulary 0-2 = total 0-7.
    Scored instantly and deterministically via keyword/key-point matching (0 Gemini tokens)."""
    student_text = (text_answer or "").strip()
    words = student_text.split()
    word_count = len(words)

    # Form check: 50-70 words = 1 pt. 40-49 or 71-90 words = 0 pt.
    form_ok = 50 <= word_count <= 70
    form_score = 1 if form_ok else 0

    # Target keywords from transcript or suggested answer
    target_kws = _get_target_keywords(q)
    matched, missing, match_ratio = _match_keywords(student_text, target_kws)

    # Content score: 0-2
    if match_ratio >= 0.50 or len(matched) >= 3:
        content_score = 2
    elif match_ratio >= 0.20 or len(matched) >= 1:
        content_score = 1
    else:
        content_score = 0

    # Grammar score: 0-2
    grammar_score = _evaluate_grammar(student_text)
    if word_count < 20:
        grammar_score = 0

    # Vocabulary score: 0-2
    vocab_score = _evaluate_vocabulary(student_text, matched)
    if word_count < 20:
        vocab_score = 0

    total_score = content_score + form_score + grammar_score + vocab_score

    # Feedback message
    feedback_lines = []
    if matched:
        feedback_lines.append(f"✅ Ý chính đã nắm bắt ({len(matched)}/{len(target_kws)}): {', '.join(matched)}")
    if missing:
        feedback_lines.append(f"⚠️ Ý chính cần bổ sung: {', '.join(missing)}")

    # Form note
    if form_ok:
        feedback_lines.append(f"📏 Độ dài chuẩn: {word_count} từ (chuẩn 50–70 từ).")
    else:
        feedback_lines.append(f"📏 Độ dài chưa chuẩn: {word_count} từ (yêu cầu chuẩn 50–70 từ).")

    if total_score >= 6:
        feedback_lines.append("🎉 Bài tóm tắt bài nghe xuất sắc, cấu trúc rõ ràng và bao quát đầy đủ ý bài giảng!")
    elif total_score >= 4:
        feedback_lines.append("👍 Tóm tắt khá tốt. Hãy chú ý kiểm soát độ dài trong khoảng 50–70 từ và bổ sung từ khóa còn thiếu.")
    else:
        feedback_lines.append("💡 Hãy luyện nghe và ghi lại các danh từ/ý chính quan trọng và viết trong khoảng 50–70 từ.")

    feedback = "\n".join(feedback_lines)

    return ScoreResult(
        total_score=total_score,
        score_breakdown={
            "content": content_score,
            "content_max": 2,
            "form": form_score,
            "form_max": 1,
            "grammar": grammar_score,
            "grammar_max": 2,
            "vocabulary": vocab_score,
            "vocabulary_max": 2,
        },
        feedback=feedback
    )


# ── Essay Scorer ─────────────────────────────────────────────────────────────
async def score_essay(q: QuestionData, text_answer: str) -> ScoreResult:
    """Write Essay — official PTE Academic rubric: content 0-3, form 0-2, structure 0-2, grammar 0-2,
    linguistic range 0-2, vocabulary 0-2, spelling 0-2 = total 0-15."""
    word_count = len((text_answer or "").split())
    paragraphs = len([p for p in (text_answer or "").split("\n\n") if p.strip()])
    form_ok = 200 <= word_count <= 300

    # Try Gemini if configured; fallback gracefully to offline scoring if exhausted
    try:
        from core.gemini_engine import call_gemini
        prompt = f"""You are a PTE Academic examiner scoring a "Write Essay" response.

ESSAY PROMPT: "{q.content}"
STUDENT ESSAY ({word_count} words, {paragraphs} paragraphs):
---
{text_answer}
---

Score using the OFFICIAL PTE Academic rubric. Return ONLY valid JSON — no explanation outside the JSON:

{{
  "content": <0-3: addresses prompt with relevant ideas and supporting details. 3=fully developed, 2=mostly relevant, 1=partial, 0=off-topic>,
  "form": <0-2: word count 200-300 words. 2=within range, 1=slightly outside, 0=far outside. form_ok={form_ok}>,
  "structure": <0-2: organization, flow, logical structure (development, structure and coherence). 2=clear cohesion, 1=basic structure, 0=incoherent>,
  "grammar": <0-2: accuracy and control. 2=rare errors, 1=some errors, 0=frequent errors>,
  "linguistic": <0-2: variety and precision of language use (general linguistic range). 2=sophisticated varied expressions, 1=adequate range, 0=very poor>,
  "vocabulary": <0-2: breadth and appropriateness of word choice. 2=precise and varied, 1=adequate, 0=very limited>,
  "spelling": <0-2: accuracy and consistency. 2=no errors, 1=minor errors, 0=frequent errors>,
  "totalScore": <sum of all 7 criteria, max 15>,
  "feedback": "<2-3 sentences: specific strengths and what to improve>"
}}"""

        result = await call_gemini(prompt, ["content", "form", "structure", "grammar", "linguistic", "vocabulary", "spelling"])
        if result.score_breakdown and result.total_score > 0:
            result.score_breakdown["content_max"] = 3
            result.score_breakdown["form_max"] = 2
            result.score_breakdown["structure_max"] = 2
            result.score_breakdown["grammar_max"] = 2
            result.score_breakdown["linguistic_max"] = 2
            result.score_breakdown["vocabulary_max"] = 2
            result.score_breakdown["spelling_max"] = 2
            return result
    except Exception as e:
        logger.warning(f"Gemini essay scoring unavailable: {e}. Using offline rubric evaluation.")

    # Offline Rubric Fallback for Essay
    f_score = 2 if 200 <= word_count <= 300 else (1 if 150 <= word_count <= 380 else 0)
    s_score = 2 if paragraphs >= 3 else (1 if paragraphs >= 2 else 0)
    g_score = _evaluate_grammar(text_answer or "")
    words = [w.lower() for w in re.sub(r'[^\w\s]', '', text_answer or "").split() if w]
    ttr = len(set(words)) / len(words) if words else 0
    v_score = 2 if ttr >= 0.55 else (1 if ttr >= 0.40 else 0)
    l_score = v_score
    sp_score = 2
    c_score = 2 if word_count >= 180 else (1 if word_count >= 80 else 0)
    total = c_score + f_score + s_score + g_score + l_score + v_score + sp_score

    return ScoreResult(
        total_score=total,
        score_breakdown={
            "content": c_score, "content_max": 3,
            "form": f_score, "form_max": 2,
            "structure": s_score, "structure_max": 2,
            "grammar": g_score, "grammar_max": 2,
            "linguistic": l_score, "linguistic_max": 2,
            "vocabulary": v_score, "vocabulary_max": 2,
            "spelling": sp_score, "spelling_max": 2,
        },
        feedback=f"Bài viết đạt {word_count} từ ({paragraphs} đoạn). Bố cục và từ vựng ổn định. Hãy chú ý mở rộng thêm lập luận và ví dụ dẫn chứng cụ thể."
    )


async def generate_sst_model_answer(transcript: str) -> str:
    """Tạo model answer chuẩn cho SST từ transcript của bài nghe."""
    try:
        from core.gemini_engine import _gemini_client, _FLASH, _get_config
        prompt = f"""You are a PTE Academic expert. Write a PERFECT "Summarize Spoken Text" model answer based on the transcript below.

Requirements:
- Exactly ONE complete sentence
- Between 50 and 70 words
- Cover all main ideas from the lecture
- Use formal academic English

TRANSCRIPT:
\"\"\"{transcript[:2000]}\"\"\"

Return ONLY the model answer sentence."""

        response = _gemini_client.models.generate_content(
            model=_FLASH, contents=prompt, config=_get_config(temperature=0.3)
        )
        return (response.text or "").strip()
    except Exception:
        # Fallback to extractive summary if Gemini is offline
        sentences = [s.strip() for s in transcript.split('.') if len(s.strip()) > 20]
        if sentences:
            return f"The lecture discusses {sentences[0].lower()}, emphasizing that {sentences[-1].lower()}."
        return transcript[:100]
