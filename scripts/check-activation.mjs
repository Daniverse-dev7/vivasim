// Configuration-only check. Never reads secret files or prints credential values.
const providers = ['GROQ','GEMINI','CEREBRAS','OPENROUTER','HUGGINGFACE'];
const checks = providers.map(id => {
  const prefix = `VIVASIM_CHAT_${id}`;
  const missing = ['KEY','MODEL'].filter(field => !process.env[`${prefix}_${field}`]).map(field => `${prefix}_${field}`);
  if (process.env[`${prefix}_FREE_TIER_CONFIRMED`] !== 'true') missing.push(`${prefix}_FREE_TIER_CONFIRMED=true (only after verifying terms)`);
  const model = process.env[`${prefix}_MODEL`] || '';
  if (model.length > 200 || (id === 'OPENROUTER' && model && !model.endsWith(':free'))) missing.push('valid free-tier model selection');
  return {provider:id,configured:missing.length===0,missing};
});
const budgetMissing = ['VIVASIM_BUDGET_REDIS_URL','VIVASIM_BUDGET_REDIS_TOKEN'].filter(key=>!process.env[key]);
try {
  const url = new URL(process.env.VIVASIM_BUDGET_REDIS_URL || '');
  if (url.protocol !== 'https:' || url.username || url.password) budgetMissing.push('HTTPS Redis REST endpoint without embedded credentials');
} catch { if (!budgetMissing.includes('VIVASIM_BUDGET_REDIS_URL')) budgetMissing.push('valid Redis REST endpoint'); }
const attempts = Number(process.env.VIVASIM_AI_DAILY_ATTEMPTS ?? 100);
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10000) budgetMissing.push('VIVASIM_AI_DAILY_ATTEMPTS: integer from 1 to 10000');
const configured = checks.some(check=>check.configured) && budgetMissing.length===0;
console.log(JSON.stringify({configurationCompleteForAtLeastOneProvider:configured,providers:checks,budget:{configured:budgetMissing.length===0,missing:budgetMissing},liveVerificationPerformed:false,releaseReady:false,next:'Verify free-tier terms, outbound access, live synthetic conversations, quota switching, production abuse controls and hosting before release.'},null,2));
process.exitCode = configured ? 0 : 1;
