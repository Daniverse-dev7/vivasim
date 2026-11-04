import test from 'node:test';
import assert from 'node:assert/strict';
import { reserveAttempt } from '../lib/ai/budget';
const env: NodeJS.ProcessEnv = {NODE_ENV:'production',VIVASIM_BUDGET_REDIS_URL:'https://budget.example.test',VIVASIM_BUDGET_REDIS_TOKEN:'synthetic',VIVASIM_AI_DAILY_ATTEMPTS:'10'};
test('production budget fails closed without configuration or with invalid limits', async () => {
  assert.equal(await reserveAttempt({NODE_ENV:'production'}), false);
  assert.equal(await reserveAttempt({...env,VIVASIM_AI_DAILY_ATTEMPTS:'NaN'}), false);
  assert.equal(await reserveAttempt({...env,VIVASIM_BUDGET_REDIS_URL:'http://budget.test'}), false);
});
test('atomic reservations send no student data and permit only a confirmed grant', async () => {
  const mock: typeof fetch = async (_url, options) => {
    const command = JSON.parse(String(options?.body));
    assert.equal(command[0], 'EVAL');
    assert.match(command[3], /^vivasim:ai-attempts:\d{4}-\d{2}-\d{2}$/);
    assert.equal(command[4], '10');
    assert.equal(options?.redirect, 'error');
    return Response.json({result:1});
  };
  assert.equal(await reserveAttempt(env,mock),true);
  assert.equal(await reserveAttempt(env,async()=>Response.json({result:0})),false);
  assert.equal(await reserveAttempt(env,async()=>Response.json({error:'unavailable'})),false);
  assert.equal(await reserveAttempt(env,async()=>{throw new Error('offline');}),false);
});
