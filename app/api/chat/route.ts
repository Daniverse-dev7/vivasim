import { z } from 'zod';
import { ChatError,chatProviders,chatCompletion,conversationSchema,providerIds,readBounded } from '@/lib/ai/chat';
import { reserveAttempt } from '@/lib/ai/budget';
const schema=z.object({provider:z.enum(providerIds),consent:z.literal(true),messages:conversationSchema.refine(m=>m.length>0 && m[m.length-1].role==='user' && m.every((v,i)=>v.role===(i%2===0?'user':'assistant')))}).strict();
let active=0, count=0, windowStart=0;
export async function POST(req:Request){
  const reply=(data:object,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
  if(Date.now()-windowStart>60000){count=0;windowStart=Date.now();}
  if(++count>20 || active>=2)return reply({code:'app_limit',message:'VivaSim is busy. Wait a minute before retrying. Switching providers does not reset this limit.'},429);
  active++;
  try{
    const parsed=schema.safeParse(await readBounded(req));
    if(!parsed.success)return reply({code:'invalid_input',message:'Check consent and conversation limits (80 messages, 100,000 characters total).'},400);
    const provider=chatProviders().find(p=>p.id===parsed.data.provider)!;
    if(!provider.enabled)return reply({code:'not_configured',message:'This provider is not enabled. Choose an available provider.'},503);
    if(!await reserveAttempt())return reply({code:'app_budget',message:'VivaSim’s shared AI allowance is unavailable or exhausted. Switching providers cannot bypass it. Your chat is saved; try later or use local practice.'},429);
    const content=await chatCompletion(provider,parsed.data.messages);
    return reply({content,provider:provider.name,model:provider.model});
  }catch(error){if(error instanceof ChatError)return reply({code:error.code,message:error.message},error.status);return reply({code:'request_failed',message:'The request could not finish. Retry or switch providers; your conversation is kept.'},502);}
  finally{active--;}
}
