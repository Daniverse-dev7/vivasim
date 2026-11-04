// Pure functions: no network calls, personal-data collection, or AI claims.
export const DEFAULT_QUESTIONS = [
  "What problem does your project solve, and why does it matter?",
  "Which methodology did you use, and why was it appropriate?",
  "Describe one major technical design decision and its trade-offs.",
  "How did you evaluate your results, and what evidence supports your conclusions?",
  "What are your project's limitations and what would you improve next?"
];

export function cleanReport(value) {
  return String(value ?? "").replace(/\r/g, "").replace(/[ \t]+/g, " ").trim().slice(0, 80000);
}
export function reportKeywords(report) {
  const stop = new Set("about after again against along also among because before being below between could every first from have into itself more other over project report should since some than that their there these this those through under until using were which while with would your".split(" "));
  const freq = new Map();
  for (const word of cleanReport(report).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (!stop.has(word)) freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return [...freq].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,15).map(([word])=>word);
}
export function buildQuestions(report) {
  const lines = cleanReport(report).split(/\n+/).map(s=>s.trim()).filter(s=>s.length>=25 && s.length<=220);
  const topical = lines.filter(s=>/(method|implement|result|model|system|dataset|accuracy|design|evaluat|limitation)/i.test(s)).slice(0,5);
  return DEFAULT_QUESTIONS.map((base,index)=>topical[index] ? base + " Refer to your report: \"" + topical[index].slice(0,110) + (topical[index].length>110?"…":"") + "\"" : base);
}
export function gradeAnswer(answer, report, questionIndex) {
  const content = String(answer??"").trim();
  const words = content.match(/\b[\p{L}\p{N}-]+\b/gu) ?? [];
  const lower = content.toLowerCase();
  const keywords = reportKeywords(report);
  const matches = keywords.filter(k=>lower.includes(k)).length;
  const lengthComponent = Math.min(55, Math.round(words.length / 40 * 55));
  const groundingComponent = keywords.length ? Math.min(25, Math.round(matches/Math.min(4,keywords.length)*25)) : 0;
  const specificComponent = /\b(we|i|because|therefore|for example|such as|measured|tested|compared|implemented|designed)\b/i.test(content) ? 10 : 0;
  const humilityComponent = /\b(limitations?|trade.?offs?|however|although|uncertain|could improve)\b/i.test(content) ? 10 : 0;
  const score = words.length < 5 ? 0 : Math.min(100,lengthComponent+groundingComponent+specificComponent+humilityComponent);
  return {questionIndex,answer:content,score,wordCount:words.length,keywordMatches:matches};
}
export function summarize(results) {
  if (!results?.length) return {score:0,answered:0,verdict:"No answers yet"};
  const score=Math.round(results.reduce((s,r)=>s+r.score,0)/results.length);
  return {score,answered:results.length,verdict:score>=75?"Promising practice response":score>=45?"Needs more explanation":"Needs more preparation"};
}
