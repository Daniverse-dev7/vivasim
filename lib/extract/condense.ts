import { MAX_CHARACTERS, MAX_WORDS, words } from './report';

// Extractive only: take an equal budget from each section, retaining source order.
// No external requests and no generated claims. Always preview before replacing a draft.
export function condenseReport(source: string) {
  const heading = /^\s*(?:#{1,6}\s*)?(?:\d+(?:\.\d+)*[.)]?\s+)?(?:abstract|introduction|background|problem statement|objectives?|aims?|literature review|methodology|methods?|implementation|design|evaluation|results?|discussion|limitations?|conclusions?|future work|recommendations?|references)\s*[:.]?\s*$/iu;
  const sections: string[] = [];
  let current: string[] = [];
  for (const line of source.split('\n')) {
    if (heading.test(line) && current.length) { sections.push(current.join('\n')); current = []; }
    current.push(line);
  }
  if (current.length) sections.push(current.join('\n'));
  const nonempty = sections.map(s => s.trim()).filter(Boolean);
  // Without headings, preserve excerpts from paragraphs throughout the report.
  const candidates = nonempty.length > 1 ? nonempty : source.split(/\n\s*\n/u).map(s => s.trim()).filter(Boolean);
  // Group unusually fragmented documents to keep heading/separator overhead bounded.
  const groupSize = Math.max(1, Math.ceil(candidates.length / 40));
  const groups: string[] = [];
  for (let i = 0; i < candidates.length; i += groupSize) groups.push(candidates.slice(i, i + groupSize).join('\n\n'));
  if (!groups.length) return { text: '', sections: 0 };
  const charBudget = Math.floor((MAX_CHARACTERS - groups.length * 2) / groups.length);
  const wordBudget = Math.floor(MAX_WORDS / groups.length);
  const excerpts = groups.map(group => {
    const matches = [...group.matchAll(/\S+/gu)];
    const end = matches[wordBudget]?.index ?? group.length;
    let excerpt = group.slice(0, Math.min(end, charBudget)).trimEnd();
    // Do not leave half of a Unicode surrogate pair at the cut boundary.
    excerpt = excerpt.replace(/[\uD800-\uDBFF]$/u, '');
    return excerpt;
  });
  const text = excerpts.join('\n\n');
  if (words(text).length > MAX_WORDS || text.length > MAX_CHARACTERS) throw new Error('Condensation exceeded report limits.');
  return { text, sections: groups.length };
}
