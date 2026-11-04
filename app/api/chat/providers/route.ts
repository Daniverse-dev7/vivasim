import { chatProviders } from '@/lib/ai/chat';
export const dynamic = 'force-dynamic';
export function GET(){return Response.json({providers:chatProviders().map(({id,name,model,enabled})=>({id,name,model:enabled?model:'',enabled}))},{headers:{'Cache-Control':'no-store'}});}
