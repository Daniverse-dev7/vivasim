export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_WORDS = 8000;
export const MAX_CHARACTERS = 80000;
export function words(text: string) { return text.trim().split(/\s+/u).filter(Boolean); }
export function inspectReport(text: string) {
  const definitions = [['Problem statement', /problem statement|\bintroduction\b/iu], ['Objectives', /objectives?|\baims?\b/iu], ['Methodology', /methodology|\bmethods?\b/iu], ['Evaluation', /evaluation|\bresults?\b/iu], ['Limitations', /limitations?/iu], ['Future work', /future work|recommendations?/iu]] as const;
  return definitions.map(([name, pattern]) => ({ name, found: pattern.test(text) }));
}
export function trimReport(text: string) {
  const tokens = words(text);
  const result = tokens.slice(0, MAX_WORDS).join(' ').slice(0, MAX_CHARACTERS);
  return { text: result, removed: Math.max(0, tokens.length - words(result).length) };
}
export async function extractReport(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('Choose a file smaller than 10 MB, or paste the relevant sections.');
  const ext = file.name.split('.').pop()?.toLowerCase();
  let text = '';
  if (ext === 'txt' || ext === 'md') text = await file.text();
  else if (ext === 'docx') {
    const mammoth = await import('mammoth');
    text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  } else if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    try {
      const doc = await task.promise;
      if (doc.numPages > 200) throw new Error('Choose a PDF with 200 pages or fewer, or paste the relevant sections.');
      for (let i = 1; i <= doc.numPages; i++) {
        const content = await (await doc.getPage(i)).getTextContent();
        text += content.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
      }
    } finally { await task.destroy(); }
  } else throw new Error('Use PDF, DOCX, TXT or MD, or paste your report.');
  text = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
  if (text.length < 30 || (text.match(/�/g)?.length ?? 0) > text.length / 20) throw new Error('We could not find readable text. This file may be scanned or garbled. Paste text from an accessible copy instead.');
  return text;
}
