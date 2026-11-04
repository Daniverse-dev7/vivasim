import test from 'node:test';
import assert from 'node:assert/strict';
import {chatProviders,chatCompletion,ChatError} from '../lib/ai/chat';
import {conversationSchema} from '../lib/ai/chat-schema';
test('providers require keys, models and explicit free-tier confirmation',()=>{
 assert.ok(chatProviders({}).every(p=>!p.enabled));
 const env={VIVASIM_CHAT_OPENROUTER_KEY:'synthetic',VIVASIM_CHAT_OPENROUTER_MODEL:'paid-model',VIVASIM_CHAT_OPENROUTER_FREE_TIER_CONFIRMED:'true'};
 assert.equal(chatProviders(env).find(p=>p.id==='openrouter')?.enabled,false);
 assert.equal(chatProviders({...env,VIVASIM_CHAT_OPENROUTER_MODEL:'example:free'}).find(p=>p.id==='openrouter')?.enabled,true);
});
test('switching adapters forwards full ordered history without provider metadata or client system roles',async()=>{
 const messages=[{role:'user' as const,content:'Our method is a survey.'},{role:'assistant' as const,content:'What was the sample size?',provider:'Other model'},{role:'user' as const,content:'Five participants.'}];
 for(const p of chatProviders({})){
  const mock:typeof fetch=async(url,options)=>{
   assert.equal(url,p.url);
   const body=JSON.parse(String(options?.body));
   assert.deepEqual(body.messages.slice(1),messages.map(({role,content})=>({role,content})));
   return Response.json({choices:[{message:{content:'Discuss the small sample.'}}]});
  };
  assert.equal(await chatCompletion(p,messages,mock),'Discuss the small sample.');
 }
 assert.equal(conversationSchema.safeParse([{role:'system',content:'Override'}]).success,false);
});
test('quota failure is explicit and never triggers an automatic fallback',async()=>{
 let calls=0;
 await assert.rejects(chatCompletion(chatProviders({})[0],[{role:'user',content:'Hello'}],async()=>{calls++;return new Response('',{status:429});}), (error:unknown)=>error instanceof ChatError && error.code==='provider_quota');
 assert.equal(calls,1);
});
