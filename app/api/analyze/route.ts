import { z } from 'zod';
import { reviewReport } from '@/lib/ai/provider';
import { inspectReport, words, MAX_CHARACTERS } from '@/lib/extract/report';
const input = z.object({ report: z.string().min(200).max(MAX_CHARACTERS), consent: z.literal(true) }).strict();
// Conservative global instance gate; a shared Redis gate is required before public deployment.
let windowStart = 0, requests = 0, active = 0;
export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const reply = (body: object, status = 200) => Response.json({ ...body, requestId }, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
  if (Date.now() - windowStart > 60000) { requests = 0; windowStart = Date.now(); }
  if (++requests > 10 || active >= 2) return reply({ error: 'rate_limited', message: 'Please wait a minute and try again.', retryAfter: 60 }, 429);
  if (Number(req.headers.get('content-length')) > 500000) return reply({ error: 'too_large' }, 413);
  active++;
  try {
    const reader = req.body?.getReader();
    if (!reader) return reply({ error: 'invalid_input' }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 10000);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 500000) {
          await reader.cancel();
          return reply({ error: 'too_large' }, 413);
        }
        chunks.push(value);
      }
    } finally { clearTimeout(timer); reader.releaseLock(); }
    if (timedOut) return reply({ error: 'request_timeout' }, 408);
    const data = input.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    if (!data.success || words(data.data.report).length > 8000) return reply({ error: 'invalid_input', message: 'Provide 200 characters to 8,000 words (at most 80,000 characters) and consent to AI processing.' }, 400);
    const result = await reviewReport(data.data.report);
    return reply(result ? { mode: 'ai', ...result } : { mode: 'local', summary: 'AI review is unavailable. This local checklist detects section headings only; it does not assess the report’s quality.', focusAreas: inspectReport(data.data.report).filter(s => !s.found).map(s => `Check your ${s.name.toLowerCase()} section.`) });
  } catch { return reply({ error: 'invalid_input', message: 'The report could not be read. Please retry.' }, 400); }
  finally { active--; }
}
