// A global daily provider-attempt budget; no reports, answers or IP addresses are stored.
// Every retry and fallback must reserve separately. Production fails closed.
export async function reserveAttempt(env: NodeJS.ProcessEnv = process.env, request: typeof fetch = fetch): Promise<boolean> {
  const endpoint = env.VIVASIM_BUDGET_REDIS_URL;
  const token = env.VIVASIM_BUDGET_REDIS_TOKEN;
  const limit = Number(env.VIVASIM_AI_DAILY_ATTEMPTS ?? '100');
  if (!endpoint || !token) return env.NODE_ENV !== 'production';
  if (!Number.isInteger(limit) || limit < 1 || limit > 10000) return false;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const key = `vivasim:ai-attempts:${new Date().toISOString().slice(0,10)}`;
    const script = "local n=tonumber(redis.call('GET',KEYS[1]) or '0'); if n>=tonumber(ARGV[1]) then return 0 end; n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],172800) end; return 1";
    const response = await request(url, {method:'POST',redirect:'error',signal:AbortSignal.timeout(3000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'1',key,String(limit)])});
    if (!response.ok) return false;
    const data = await response.json();
    return !data.error && data.result === 1;
  } catch { return false; }
}
