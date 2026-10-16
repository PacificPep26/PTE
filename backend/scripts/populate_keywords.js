const { Client } = require('pg');

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'also', 'however', 'although', 'therefore',
  'furthermore', 'moreover', 'nevertheless', 'whereas', 'instead', 'one', 'two', 'three', 'many',
  'much', 'said', 'says', 'say', 'show', 'shows', 'shown', 'suggest', 'suggests', 'found', 'according',
  'well', 'even', 'like', 'make', 'made', 'used', 'using', 'use', 'first', 'second', 'people', 'time',
  'since', 'lecture', 'discusses', 'speaker', 'talks', 'talked', 'topic', 'explains', 'main', 'points'
]);

function cleanWord(w) {
  return w.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
}

function extractKeywords(text, topN = 7) {
  if (!text) return [];

  // 1. Identify proper nouns / capitalized phrases (excluding sentence starts)
  const sentences = text.split(/(?<=[.?!])\s+/);
  const properCandidates = new Map();
  for (const s of sentences) {
    const tokens = s.trim().split(/\s+/);
    for (let i = 1; i < tokens.length; i++) {
      const raw = tokens[i].replace(/[^\w-]/g, '');
      if (raw.length > 2 && /^[A-Z][a-z]+$/.test(raw)) {
        const lower = raw.toLowerCase();
        if (!STOP_WORDS.has(lower)) {
          properCandidates.set(lower, (properCandidates.get(lower) || 0) + 1);
        }
      }
    }
  }

  // 2. Tokenize and count content words
  const words = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(cleanWord)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const wordCounts = new Map();
  for (const w of words) {
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  }

  // 3. Extract bigrams
  const bigramCounts = new Map();
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (w1.length > 2 && w2.length > 2 && w1 !== w2) {
      const bg = `${w1} ${w2}`;
      bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
    }
  }

  const results = [];
  function addKw(phrase) {
    const norm = phrase.toLowerCase().trim();
    if (!norm || results.includes(norm)) return;
    results.push(norm);
  }

  // Add repeated bigrams
  const sortedBigrams = [...bigramCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [bg, cnt] of sortedBigrams) {
    if (cnt >= 2 && results.length < 3) {
      addKw(bg);
    }
  }

  // Add proper nouns with frequency
  const sortedProper = [...properCandidates.entries()].sort((a, b) => b[1] - a[1]);
  for (const [prop, cnt] of sortedProper) {
    if (results.length < 5 && !results.some(r => r.includes(prop))) {
      addKw(prop);
    }
  }

  // Add top unigrams
  const sortedWords = [...wordCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [w, cnt] of sortedWords) {
    if (results.length >= topN) break;
    if (!results.some(r => r.includes(w))) {
      addKw(w);
    }
  }

  return results.slice(0, topN);
}

function synthesizeSwtSummary(content) {
  if (!content) return "";
  const rawSentences = content
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (rawSentences.length === 0) return content.slice(0, 100);
  if (rawSentences.length === 1) return rawSentences[0];

  const first = rawSentences[0].replace(/[.!?,]+$/, '');
  const second = rawSentences[1] ? rawSentences[1].replace(/[.!?,]+$/, '') : '';
  const last = rawSentences[rawSentences.length - 1].replace(/[.!?,]+$/, '');

  const lowerStart = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const firstWordCount = first.split(/\s+/).length;

  if (firstWordCount >= 35 && firstWordCount <= 65) {
    return first + '.';
  }

  let summary = "";
  if (firstWordCount < 25 && second) {
    summary = `${first}, which is further highlighted by the fact that ${lowerStart(second)}, ultimately suggesting that ${lowerStart(last)}.`;
  } else if (last && last !== first) {
    summary = `${first}, while ${lowerStart(last)}.`;
  } else {
    summary = `${first}.`;
  }

  const words = summary.split(/\s+/);
  if (words.length > 70) {
    summary = words.slice(0, 65).join(' ').replace(/[,;:]+$/, '') + '.';
  }
  return summary;
}

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:bOZauqoufGxaCTsdzeEFrRPbSWOUolsy@trolley.proxy.rlwy.net:27956/railway'
  });

  await client.connect();
  console.log('Connected to PostgreSQL...');

  // 1. Process SST questions (352)
  console.log('Processing SST questions...');
  const sstQuery = await client.query('SELECT id, code, "suggestedAnswer", "correctAnswer", tips FROM questions WHERE type = \'LISTENING_SUMMARIZE_SPOKEN_TEXT\'');
  let sstUpdated = 0;
  for (const q of sstQuery.rows) {
    const sourceText = q.suggestedAnswer || (q.correctAnswer && q.correctAnswer.transcript) || '';
    const keywords = extractKeywords(sourceText, 7);
    
    let ca = q.correctAnswer || {};
    if (typeof ca === 'string') {
      try { ca = JSON.parse(ca); } catch { ca = { sample: ca }; }
    }
    ca.keywords = keywords;

    const tipsText = `Từ khóa gợi ý: ${keywords.join(', ')}. Viết đoạn tóm tắt từ 50–70 từ thể hiện đầy đủ các ý chính này.`;

    await client.query(
      'UPDATE questions SET "correctAnswer" = $1, tips = $2 WHERE id = $3',
      [JSON.stringify(ca), tipsText, q.id]
    );
    sstUpdated++;
  }
  console.log(`Updated ${sstUpdated} SST questions with keywords & tips.`);

  // 2. Process SWT questions (222)
  console.log('Processing SWT questions...');
  const swtQuery = await client.query('SELECT id, code, content, "suggestedAnswer", "correctAnswer", tips FROM questions WHERE type = \'WRITING_SUMMARIZE_WRITTEN_TEXT\'');
  let swtUpdated = 0;
  for (const q of swtQuery.rows) {
    let suggested = q.suggestedAnswer;
    if (!suggested || suggested.trim().length === 0) {
      suggested = synthesizeSwtSummary(q.content);
    }

    const sourceText = (suggested + ' ' + (q.content || '')).trim();
    const keywords = extractKeywords(sourceText, 7);

    let ca = q.correctAnswer || {};
    if (typeof ca === 'string') {
      try { ca = JSON.parse(ca); } catch { ca = { sample: ca }; }
    }
    ca.keywords = keywords;

    const tipsText = `Từ khóa gợi ý: ${keywords.join(', ')}. Tóm tắt đoạn văn thành ĐÚNG 1 CÂU DUY NHẤT (5–75 từ) kết hợp các ý chính này.`;

    await client.query(
      'UPDATE questions SET "suggestedAnswer" = $1, "correctAnswer" = $2, tips = $3 WHERE id = $4',
      [suggested, JSON.stringify(ca), tipsText, q.id]
    );
    swtUpdated++;
  }
  console.log(`Updated ${swtUpdated} SWT questions with suggestedAnswer, keywords & tips.`);

  await client.end();
  console.log('Done!');
}

main().catch(console.error);
