import { configured } from '@/lib/ai/provider';
export function GET() { return Response.json({ status: 'ok', ai: configured() ? 'configured-unverified' : 'not-configured', mode: 'foundation' }, { headers: { 'Cache-Control': 'no-store' } }); }
